'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

import { T } from '@/lib/theme'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { AppearanceSection } from '@/components/profile/AppearanceSection'
import { ActivityList } from '@/components/profile/ActivityList'
import { getProfileCardTokens, resolveThemeSetting } from '@/components/profile/theme'
import type { ActivityItem, BackgroundMode, ThemeSetting } from '@/components/profile/types'

const BANNER_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BANNER_MAX_BYTES = 5 * 1024 * 1024 // matches the banners bucket's own file_size_limit
const BANNER_EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// ── Types ──────────────────────────────────────────────────────────────────────

type BookingItem = {
  id: string
  sessionTime: string
  dateLabel: string
  timeLabel: string
  trainerName: string
  trainerInitials: string
  sport: string
  format: string
  status: string
  isUpcoming: boolean
  specialty: string | null
}

type FilterKey = 'All' | 'Upcoming' | 'Past'

interface MessageRow {
  id: string
  body: string
  sent_at: string
  senderName: string | null
}

const ATHLETE_TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'trainer', label: 'Trainer' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function computeAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconCalendar = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconVideo = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
)

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.ink, marginBottom: '12px' }}>
      {children}
    </div>
  )
}

// ── Filter pills ─────────────────────────────────────────────────────────────────

function FilterPills({ active, onSelect }: { active: FilterKey; onSelect: (f: FilterKey) => void }) {
  const filters: FilterKey[] = ['All', 'Upcoming', 'Past']
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {filters.map((f) => {
        const isActive = f === active
        return (
          <button
            key={f}
            onClick={() => onSelect(f)}
            style={{ padding: '8px 16px', borderRadius: T.radius.full, background: isActive ? T.cyan : '#FFFFFF', border: `1px solid ${isActive ? T.cyan : T.border}`, color: isActive ? '#FFFFFF' : T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer', minHeight: '40px', whiteSpace: 'nowrap' }}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}

// ── Next session banner ─────────────────────────────────────────────────────────

function NextSessionBanner({ session }: { session: BookingItem | null }) {
  if (!session) {
    return (
      <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '24px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3 }}>
          No upcoming sessions
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: T.radius.full, background: T.cyanLight, border: `2px solid ${T.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.cyan, flexShrink: 0 }}>
        {session.trainerInitials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: T.ink3, textTransform: 'uppercase', marginBottom: '2px' }}>
          Next Session
        </div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '16px', color: T.ink }}>{session.trainerName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}>
          <IconCalendar size={13} />
          {session.dateLabel} &middot; {session.timeLabel}
          <span style={{ marginLeft: '4px', padding: '2px 8px', background: T.cyanDim, color: T.cyan, borderRadius: T.radius.full, fontSize: '11px', fontWeight: 600 }}>{session.format}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <Link
          href="/dashboard/athlete/messages"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.cyan, color: '#FFFFFF', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '13px', textDecoration: 'none', borderRadius: T.radius.sm, minHeight: '40px', padding: '0 16px' }}
        >
          Message trainer
        </Link>
      </div>
    </motion.div>
  )
}

// ── Session card ─────────────────────────────────────────────────────────────────

function SessionCard({ booking, index }: { booking: BookingItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: T.radius.md, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ position: 'relative', height: '88px', background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3 }}>
        {booking.format === 'Remote' ? <IconVideo size={20} /> : <IconCalendar size={20} />}
        <span style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 10px', borderRadius: T.radius.full, background: booking.isUpcoming ? T.cyan : '#FFFFFF', border: `1px solid ${booking.isUpcoming ? T.cyan : T.border}`, color: booking.isUpcoming ? '#FFFFFF' : T.ink2, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {booking.isUpcoming ? 'Upcoming' : booking.status === 'cancelled' ? 'Cancelled' : 'Past'}
        </span>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>
          {booking.sport ? `${booking.sport} · ` : ''}{booking.dateLabel} &middot; {booking.timeLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 26, height: 26, borderRadius: T.radius.full, background: T.cyanLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', color: T.cyan, flexShrink: 0 }}>
            {booking.trainerInitials}
          </div>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: T.ink }}>{booking.trainerName}</span>
        </div>

        {booking.isUpcoming && (
          <Link
            href="/dashboard/athlete/messages"
            style={{ width: '100%', height: '38px', background: T.cyan, color: '#FFFFFF', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '13px', textDecoration: 'none', borderRadius: T.radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}
          >
            Message trainer
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AthletePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [name, setName] = useState('')
  const [sport, setSport] = useState('')
  const [dob, setDob] = useState<string | null>(null)
  const [skillLevel, setSkillLevel] = useState<string | null>(null)
  const [position, setPosition] = useState<string | null>(null)
  const [parentName, setParentName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemeSetting>('light')
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('full')
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All')
  const [activeTab, setActiveTab] = useState('activity')
  const [clipsSubmitted, setClipsSubmitted] = useState(0)
  const [awaitingReview, setAwaitingReview] = useState(0)
  const [feedbackReady, setFeedbackReady] = useState(0)
  const [profileLoading, setProfileLoading] = useState(true)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const bannerFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfileLoading(false); return }
      setUserId(user.id)

      supabase
        .from('profiles')
        .select('avatar_url, banner_image_url, verified, theme_preference, background_mode')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setAvatarUrl(data?.avatar_url ?? null)
          setBannerImageUrl(data?.banner_image_url ?? null)
          setVerified(data?.verified ?? false)
          setThemePreference((data?.theme_preference as ThemeSetting) ?? 'light')
          setBackgroundMode((data?.background_mode as BackgroundMode) ?? 'full')
        })

      supabase
        .from('posts')
        .select('id, feedback_requested, comments(count)')
        .eq('author_id', user.id)
        .eq('author_type', 'athlete')
        .then(({ data, error }) => {
          if (error) {
            console.error('[athlete home] posts fetch:', error.message)
            return
          }
          if (!data) return
          setClipsSubmitted(data.length)
          let awaiting = 0
          let ready = 0
          for (const post of data as any[]) {
            const commentCount = post.comments?.[0]?.count ?? 0
            if (post.feedback_requested) {
              if (commentCount > 0) ready++
              else awaiting++
            }
          }
          setAwaitingReview(awaiting)
          setFeedbackReady(ready)
        })

      const { data: athleteRow, error: athleteErr } = await supabase
        .from('athletes')
        .select('id, name, dob, sport, skill_level, position, parent_id')
        .eq('profile_id', user.id)
        .single()

      if (athleteErr) {
        console.error('[athlete home] athletes fetch:', athleteErr.message)
        setLoadError(athleteErr.message)
        setProfileLoading(false)
        return
      }
      if (!athleteRow) { setProfileLoading(false); return }

      const athleteId = (athleteRow as any).id
      const athleteName: string = (athleteRow as any).name ?? ''
      const athleteSport: string = (athleteRow as any).sport ?? ''

      setFirstName(athleteName.split(' ')[0] ?? '')
      setName(athleteName)
      setSport(athleteSport)
      setDob((athleteRow as any).dob ?? null)
      setSkillLevel((athleteRow as any).skill_level ?? null)
      setPosition((athleteRow as any).position ?? null)

      if ((athleteRow as any).parent_id) {
        const { data: parentProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', (athleteRow as any).parent_id)
          .single()
        if (parentProfile) setParentName((parentProfile as any).name ?? null)
      }

      const { data: rows, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, format, session_time, status, trainers!trainer_id(specialty, profiles(name))')
        .eq('athlete_id', athleteId)
        .order('session_time', { ascending: false })

      if (bookingErr) {
        console.error('[athlete home] bookings fetch:', bookingErr.message)
        setLoadError(bookingErr.message)
        setProfileLoading(false)
        return
      }
      if (!rows) { setProfileLoading(false); return }

      const now = new Date().toISOString()

      const mapped: BookingItem[] = (rows as any[]).map((b) => {
        const dt = new Date(b.session_time)
        const trainerName: string = b.trainers?.profiles?.name ?? 'Trainer'
        return {
          id: b.id,
          sessionTime: b.session_time,
          dateLabel: dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          timeLabel: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          trainerName,
          trainerInitials: getInitials(trainerName),
          sport: athleteSport,
          format: b.format === 'Remote Video' ? 'Remote' : 'In-Person',
          status: b.status ?? 'confirmed',
          isUpcoming: b.session_time > now && b.status !== 'cancelled',
          specialty: b.trainers?.specialty ?? null,
        }
      })

      setBookings(mapped)

      const { data: messageData } = await supabase
        .from('messages')
        .select('id, sender_id, body, sent_at')
        .eq('recipient_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10)

      const senderIds = Array.from(new Set((messageData ?? []).map((m) => m.sender_id)))
      let senderNames: Record<string, string> = {}
      if (senderIds.length > 0) {
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', senderIds)
        senderNames = Object.fromEntries((senderProfiles ?? []).map((p) => [p.id, p.name]))
      }

      setMessages(
        (messageData ?? []).map((m) => ({
          id: m.id,
          body: m.body,
          sent_at: m.sent_at,
          senderName: senderNames[m.sender_id] ?? null,
        }))
      )

      setProfileLoading(false)
    }
    load()
  }, [])

  async function handleSaveAppearance(updates: { theme_preference?: ThemeSetting; background_mode?: BackgroundMode }) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
    if (error) throw new Error(error.message)
    if (updates.theme_preference) setThemePreference(updates.theme_preference)
    if (updates.background_mode) setBackgroundMode(updates.background_mode)
  }

  function handleBannerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBannerError('')

    if (!userId) {
      setBannerError('Not authenticated. Please refresh and try again.')
      return
    }
    if (!BANNER_ALLOWED_TYPES.includes(file.type)) {
      setBannerError('Please upload a JPEG, PNG, or WEBP image.')
      return
    }
    if (file.size > BANNER_MAX_BYTES) {
      setBannerError('Image must be under 5MB.')
      return
    }

    uploadBanner(file)
  }

  async function uploadBanner(file: File) {
    if (!userId) return
    setBannerUploading(true)
    const supabase = createClient()
    const extension = BANNER_EXTENSION_BY_TYPE[file.type] ?? 'jpg'
    const path = `${userId}/${Date.now()}.${extension}`

    const { error: uploadErr } = await supabase.storage.from('banners').upload(path, file, { contentType: file.type })
    if (uploadErr) {
      setBannerError(uploadErr.message)
      setBannerUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(path)
    const { error: updateErr } = await supabase.from('profiles').update({ banner_image_url: publicUrl }).eq('id', userId)
    if (updateErr) {
      setBannerError(updateErr.message)
      setBannerUploading(false)
      return
    }

    setBannerImageUrl(publicUrl)
    setBannerUploading(false)
  }

  const upcoming = bookings.filter((b) => b.isUpcoming).sort((a, b) => a.sessionTime.localeCompare(b.sessionTime))
  const past = bookings.filter((b) => !b.isUpcoming && b.sessionTime < new Date().toISOString())
  const sessionsCompleted = bookings.filter((b) => b.status === 'completed').length

  const nextSession = upcoming[0] ?? null

  const visible = activeFilter === 'All' ? [...upcoming, ...past]
    : activeFilter === 'Upcoming' ? upcoming
    : past

  const initials = name ? getInitials(name) : '?'
  const age = dob ? computeAge(dob) : null
  const isMinor = age !== null && age < 18

  const cardTokens = getProfileCardTokens(themePreference)
  const currentTrainer = bookings[0] ?? null

  const activityItems: ActivityItem[] = [
    ...bookings.map((b) => ({
      id: `b-${b.id}`,
      title: `Session with ${b.trainerName}`,
      subtitle: [b.specialty, b.status].filter(Boolean).join(' · '),
      timestamp: b.sessionTime,
    })),
    ...messages.map((m) => ({
      id: `m-${m.id}`,
      title: `Message from ${m.senderName ?? 'trainer'}`,
      subtitle: m.body.slice(0, 64),
      timestamp: m.sent_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

  const sessionItems: ActivityItem[] = bookings.map((b) => ({
    id: `s-${b.id}`,
    title: `Session with ${b.trainerName}`,
    subtitle: b.specialty ?? undefined,
    meta: b.status,
    timestamp: b.sessionTime,
  }))

  let tabContent: React.ReactNode
  if (activeTab === 'sessions') {
    tabContent = <ActivityList items={sessionItems} tokens={cardTokens} emptyLabel="No sessions booked yet" />
  } else if (activeTab === 'trainer') {
    tabContent = currentTrainer ? (
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '999px', flexShrink: 0,
            background: cardTokens.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: cardTokens.cyan,
          }}>{currentTrainer.trainerName ? getInitials(currentTrainer.trainerName) : '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: cardTokens.ink }}>
              {currentTrainer.trainerName ?? 'Trainer'}
            </div>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: cardTokens.ink3, marginTop: '2px' }}>
              {currentTrainer.specialty ? `${currentTrainer.specialty} Trainer` : 'Trainer'}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: cardTokens.ink3 }}>
        No trainer yet
      </div>
    )
  } else {
    tabContent = <ActivityList items={activityItems} tokens={cardTokens} emptyLabel="No recent activity" />
  }

  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px 80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {loadError && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: T.radius.sm, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.dangerDark }}>
            Error loading data: {loadError}
          </div>
        )}

        <DashboardHero
          name={firstName}
          subtitle={nextSession ? `Next session ${nextSession.dateLabel} with ${nextSession.trainerName}` : 'No upcoming sessions'}
          bannerImage={bannerImageUrl ?? '/dashboard/hero-banner.jpg'}
          avatarUrl={avatarUrl}
          avatarInitials={firstName ? firstName[0]?.toUpperCase() ?? '' : ''}
          tiles={[
            { value: String(clipsSubmitted), label: 'Clips Submitted' },
            { value: String(awaitingReview), label: 'Awaiting Review' },
            { value: String(feedbackReady), label: 'Feedback Ready' },
            { value: String(sessionsCompleted), label: 'Sessions Completed' },
          ]}
        />

        <NextSessionBanner session={nextSession} />

        <FilterPills active={activeFilter} onSelect={setActiveFilter} />

        <div>
          <SectionLabel>Your Sessions</SectionLabel>
          {visible.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: T.ink3, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              {bookings.length === 0 ? 'No sessions yet' : 'No sessions in this filter'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((booking, i) => (
                <SessionCard key={booking.id} booking={booking} index={i} />
              ))}
            </div>
          )}
        </div>

        <div>
          <ProfileCard
            themePreference={resolveThemeSetting(themePreference)}
            backgroundMode={backgroundMode}
            bannerImageUrl={bannerImageUrl}
            avatarUrl={avatarUrl}
            name={name || (profileLoading ? '' : 'Unknown')}
            verified={verified}
            verifiedLabel="Verified Athlete"
            minor={isMinor}
            metaLine={[sport, position, skillLevel].filter(Boolean).join(' · ')}
            stats={[
              { value: String(bookings.length), label: 'Sessions' },
              { value: bookings.length > 0 ? new Date(bookings[bookings.length - 1].sessionTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—', label: 'Since' },
            ]}
            contactRows={[]}
            tabs={ATHLETE_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabContent={tabContent}
            onEditProfile={() => document.getElementById('athlete-appearance')?.scrollIntoView({ behavior: 'smooth' })}
            onOpenSettings={() => document.getElementById('athlete-appearance')?.scrollIntoView({ behavior: 'smooth' })}
            profileLabel="My profile"
            hideIdentity
          />

          {age !== null && age >= 13 && (
            <div style={{ marginTop: '16px', background: cardTokens.card, border: `1px solid ${cardTokens.border}`, borderRadius: '14px', padding: '24px' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: cardTokens.ink3, marginBottom: '16px' }}>
                Banner image
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '200px', height: '75px', borderRadius: '10px', overflow: 'hidden', background: cardTokens.surface2, flexShrink: 0 }}>
                  {bannerImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bannerImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: cardTokens.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                      No banner set
                    </div>
                  )}
                  {bannerUploading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
                        <Loader2 size={22} color={T.cyan} />
                      </motion.div>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={bannerFileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerFileChange} style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={bannerUploading}
                    style={{ height: '40px', padding: '0 18px', background: T.cyan, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: bannerUploading ? 'default' : 'pointer', opacity: bannerUploading ? 0.7 : 1 }}
                  >{bannerUploading ? 'Uploading…' : bannerImageUrl ? 'Change banner' : 'Upload banner'}</button>
                  {bannerError && (
                    <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '8px' }}>{bannerError}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div id="athlete-appearance" style={{ marginTop: '16px', scrollMarginTop: '24px' }}>
            <AppearanceSection
              themePreference={themePreference}
              backgroundMode={backgroundMode}
              hasBannerImage={!!bannerImageUrl}
              onSave={handleSaveAppearance}
            />
          </div>

          <div style={{ marginTop: '16px', fontSize: '12px', color: T.ink3, textAlign: 'center', lineHeight: 1.6 }}>
            Profile managed by your parent · Contact {parentName || 'your parent'} to make changes
          </div>
        </div>

      </div>
    </div>
  )
}
