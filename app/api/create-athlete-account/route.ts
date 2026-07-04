import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const USERNAME_RE = /^[a-z0-9]+$/
const PIN_RE = /^\d{4,6}$/

export async function POST(request: NextRequest) {
  console.log('SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY, 'length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0)

  // Step 1: verify the session belongs to an authenticated parent
  const supabase = await createClient()
  const { data: { user: parentUser } } = await supabase.auth.getUser()
  if (!parentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Step 2: read body
    const body = await request.json()
    const {
      firstName, lastName, dob, sport, skillLevel,
      position, goals, sessionFormat, username, pin,
    } = body

    // Step 3: validate username and pin
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

    const admin = createAdminClient()

    // Step 4: check username uniqueness
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ error: 'That username is taken.' }, { status: 400 })
    }

    // Step 5: build synthetic email
    const syntheticEmail = `${cleanUsername}@athlete.farmapp.internal`

    // Step 6: create auth user
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
    const newUserId = authData.user.id

    // Step 7: insert into profiles
    const { error: profileError } = await admin.from('profiles').insert({
      id: newUserId,
      role: 'athlete',
      name: `${firstName} ${lastName}`.trim(),
      username: cleanUsername,
    })
    if (profileError) {
      await admin.auth.admin.deleteUser(newUserId)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Step 8: insert into athletes
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
      await admin.from('profiles').delete().eq('id', newUserId)
      await admin.auth.admin.deleteUser(newUserId)
      return NextResponse.json({ error: athleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('create-athlete-account error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 },
    )
  }
}
