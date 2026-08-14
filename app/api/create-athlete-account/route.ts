import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

const USERNAME_RE = /^[a-z0-9]+$/
const PIN_RE = /^\d{4,6}$/

// Stopgap rate limit against a compromised/spammy parent account, not anonymous abuse
// (this route already requires an authenticated session). In-memory, so it resets on
// cold start and doesn't share state across multiple serverless instances — that's an
// intentional scope decision, not an oversight; a durable store would be needed for that.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const creationTimestamps = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const timestamps = (creationTimestamps.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )
  if (timestamps.length >= RATE_LIMIT_MAX) {
    creationTimestamps.set(userId, timestamps)
    return true
  }
  timestamps.push(now)
  creationTimestamps.set(userId, timestamps)
  return false
}

// Cleanup for any failure after createUser() succeeds. The profiles row is
// deleted first because profiles.id references auth.users(id) with no
// ON DELETE CASCADE — deleting the auth user while that row still exists
// would fail on the foreign key.
async function cleanupAuthUser(admin: AdminClient, userId: string) {
  await admin.from('profiles').delete().eq('id', userId)
  await admin.auth.admin.deleteUser(userId)
}

export async function POST(request: NextRequest) {
  // Step 1: verify the session belongs to an authenticated parent
  const supabase = await createClient()
  const { data: { user: parentUser } } = await supabase.auth.getUser()
  if (!parentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isRateLimited(parentUser.id)) {
    return NextResponse.json(
      { error: 'Too many athlete accounts created recently. Please try again later.' },
      { status: 429 },
    )
  }

  let newUserId: string | undefined
  let admin: AdminClient | undefined

  try {
    // Step 2: read body
    const body = await request.json()
    const {
      firstName, lastName, dob, sport, skillLevel,
      position, goals, sessionFormat, username, pin,
    } = body

    // Step 3: validate dob — this route is the under-13 path (parent-created,
    // username + PIN, synthetic email). Athletes 13+ create their own account
    // via invite code at app/onboarding/athlete, so reject anyone 13 or older
    // here. UTC-based to mirror compute_athlete_is_minor's
    // `dob > (current_date - interval 'N years')` comparison.
    if (typeof dob !== 'string' || dob.trim() === '') {
      return NextResponse.json(
        { error: 'Date of birth is required.' },
        { status: 400 },
      )
    }
    const birthDate = new Date(dob)
    if (Number.isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Date of birth is not a valid date.' },
        { status: 400 },
      )
    }
    const now = new Date()
    const thirteenYearsAgoUTC = new Date(Date.UTC(now.getUTCFullYear() - 13, now.getUTCMonth(), now.getUTCDate()))
    if (birthDate.getTime() <= thirteenYearsAgoUTC.getTime()) {
      return NextResponse.json(
        { error: 'Athletes 13 and older set up their own account with an invite code.' },
        { status: 400 },
      )
    }

    // Step 4: validate username and pin
    const cleanUsername = (username ?? '').trim().toLowerCase()
    if (!cleanUsername || !USERNAME_RE.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username must be lowercase letters and numbers only, with no spaces or symbols.' },
        { status: 400 },
      )
    }
    if (!PIN_RE.test(String(pin ?? ''))) {
      return NextResponse.json(
        { error: 'PIN must be 4 to 6 digits.' },
        { status: 400 },
      )
    }

    admin = createAdminClient()

    // Step 5: check username uniqueness
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ error: 'That username is taken.' }, { status: 400 })
    }

    // Step 6: build synthetic email
    const syntheticEmail = `${cleanUsername}@athlete.farmapp.internal`

    // Step 7: create auth user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password: String(pin),
      email_confirm: true,
    })
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Failed to create auth user.' },
        { status: 400 },
      )
    }
    newUserId = authData.user.id

    // Step 8: update the profiles row the handle_new_user() trigger already
    // inserted for this auth user — not an insert, the row is guaranteed to exist.
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        role: 'athlete',
        name: `${firstName} ${lastName}`.trim(),
        username: cleanUsername,
      })
      .eq('id', newUserId)
    if (profileError) {
      await cleanupAuthUser(admin, newUserId)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Step 9: insert into athletes. The handle_new_user() trigger only auto-creates
    // an athletes row when raw_user_meta_data.role is 'athlete' at createUser() time;
    // this route never sets that metadata, so the trigger takes no athletes action
    // here and this insert cannot collide with it.
    const { error: athleteError } = await admin.from('athletes').insert({
      parent_id: parentUser.id,
      profile_id: newUserId,
      name: `${firstName} ${lastName}`.trim(),
      dob: dob || null,
      sport,
      skill_level: skillLevel,
      position: position || null,
      goals: goals || null,
      session_format: sessionFormat || null,
    })
    if (athleteError) {
      await cleanupAuthUser(admin, newUserId)
      return NextResponse.json({ error: athleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('create-athlete-account error:', error)
    if (newUserId && admin) {
      await cleanupAuthUser(admin, newUserId)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 },
    )
  }
}
