'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { DashboardHero } from '@/components/dashboard/DashboardHero'

// ── Types ──────────────────────────────────────────────────────────────────────

type SessionType = 'IN-PERSON' | 'REMOTE'

type Session = {
  id: string
  childName: string
  parentName: string
  parentInitials: string
  parentProfileId: string
  sport: string
  type: SessionType
  sessionTime: string
  time: string
  location: string
  status: string
  rate: number | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOfDay(d) - startOfDay(today)) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 0) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function formatFullDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const IconVideo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
)

const IconMessageCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconCheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconStarSmall = () => (
  <svg
    style={{ width: 'clamp(12px, 2.211cqw, 21px)', height: 'clamp(12px, 2.211cqw, 21px)' }}
    viewBox="0 0 24 24"
    fill={T.cyan}
    stroke="none"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
  </svg>
)

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children, seeAllHref }: { children: React.ReactNode; seeAllHref?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: T.ink, textTransform: 'uppercase' }}>
        {children}
      </div>
      {seeAllHref && (
        <Link href={seeAllHref} style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 600, color: T.cyan, textDecoration: 'none' }}>
          See all &gt;
        </Link>
      )}
    </div>
  )
}

// ── Sport filter pills ──────────────────────────────────────────────────────────

function SportPills({ sports, activeSport, onSelect }: { sports: string[]; activeSport: string; onSelect: (s: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' as const }}>
      {['All', ...sports].map((sport) => {
        const isActive = sport === activeSport
        return (
          <button
            key={sport}
            onClick={() => onSelect(sport)}
            style={{ padding: '8px 16px', borderRadius: T.radius.full, background: isActive ? T.cyan : '#FFFFFF', border: `1px solid ${isActive ? T.cyan : T.border}`, color: isActive ? '#FFFFFF' : T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer', flexShrink: 0, minHeight: '40px', whiteSpace: 'nowrap' }}
          >
            {sport}
          </button>
        )
      })}
    </div>
  )
}

// ── Pending review card ──────────────────────────────────────────────────────────

function PendingCard({ session, index, onMarkComplete }: { session: Session; index: number; onMarkComplete: (id: string) => Promise<void> }) {
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  async function handleComplete() {
    setCompleting(true)
    setCompleteError(null)
    try {
      await onMarkComplete(session.id)
    } catch {
      setCompleteError('Failed to save. Try again.')
    } finally {
      setCompleting(false)
    }
  }

  const dayLabel = formatDayLabel(session.sessionTime)
  const isUrgent = dayLabel === 'Today'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: T.radius.md, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ position: 'relative', height: '96px', background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3 }}>
        {session.type === 'REMOTE' ? <IconVideo /> : <IconMapPin />}
        <span style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 10px', borderRadius: T.radius.full, background: isUrgent ? T.cyan : '#FFFFFF', border: `1px solid ${isUrgent ? T.cyan : T.border}`, color: isUrgent ? '#FFFFFF' : T.ink2, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {dayLabel}
        </span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink, letterSpacing: '0.01em' }}>{session.childName}</div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{session.sport}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px' }}>
            {session.type === 'REMOTE' ? <IconVideo /> : <IconMapPin />}
            {formatFullDate(session.sessionTime)} &middot; {session.time}
          </div>
          <Link
            href={`/dashboard/trainer/messages?withId=${session.parentProfileId}`}
            style={{ width: '32px', height: '32px', borderRadius: T.radius.full, background: 'transparent', border: `1px solid ${T.border}`, color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <IconMessageCircle />
          </Link>
        </div>

        <button
          onClick={handleComplete}
          disabled={completing}
          style={{ width: '100%', height: '44px', background: T.cyan, border: 'none', color: '#FFFFFF', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', borderRadius: T.radius.sm, cursor: completing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: completing ? 0.7 : 1, marginTop: 'auto' }}
        >
          <IconCheckCircle />
          {completing ? 'SAVING...' : 'MARK COMPLETE'}
        </button>
        {completeError && (
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.danger }}>
            {completeError}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Completed row ────────────────────────────────────────────────────────────────

function CompletedRow({ session }: { session: Session }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <span style={{ color: T.success, flexShrink: 0, display: 'flex' }}>
          <IconCheckCircle />
        </span>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: T.ink }}>{session.childName}</span>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}> &middot; {session.sport}</span>
        </div>
      </div>
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3, flexShrink: 0 }}>
        {formatFullDate(session.sessionTime)}
      </div>
    </div>
  )
}

// ── HomeView ───────────────────────────────────────────────────────────────────

function HomeView({
  sessions,
  onMarkComplete,
  trainerFirstName,
  avatarUrl,
  sessionsThisWeek,
  sessionsToday,
  totalEarnings,
  avgRating,
  certificationApproved,
}: {
  sessions: Session[]
  onMarkComplete: (id: string) => Promise<void>
  trainerFirstName: string
  avatarUrl: string | null
  sessionsThisWeek: number
  sessionsToday: number
  totalEarnings: number
  avgRating: number | null
  certificationApproved: boolean
}) {
  const router = useRouter()
  const [activeSport, setActiveSport] = useState('All')

  const pending = sessions.filter((s) => s.status !== 'completed')
  const completed = sessions.filter((s) => s.status === 'completed')

  const sports = Array.from(new Set(sessions.map((s) => s.sport).filter(Boolean))).sort()

  const filteredPending = pending
    .filter((s) => activeSport === 'All' || s.sport === activeSport)
    .sort((a, b) => a.sessionTime.localeCompare(b.sessionTime))
  const filteredCompleted = completed
    .filter((s) => activeSport === 'All' || s.sport === activeSport)
    .sort((a, b) => b.sessionTime.localeCompare(a.sessionTime))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px 80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <DashboardHero
          name={trainerFirstName}
          subtitle={pending.length === 0 ? 'No sessions waiting for review' : `${pending.length} session${pending.length === 1 ? '' : 's'} waiting for review`}
          bannerImage="/dashboard/hero-banner.jpg"
          avatarUrl={avatarUrl}
          avatarInitials={trainerFirstName ? trainerFirstName[0]?.toUpperCase() ?? '' : ''}
          badge={{ label: 'Certified Trainer', show: certificationApproved }}
          tiles={[
            { value: String(sessionsThisWeek), label: 'Sessions This Week' },
            { value: String(sessionsToday), label: 'Sessions Today' },
            { value: `$${totalEarnings}`, label: 'Total Earnings' },
            { value: avgRating != null ? avgRating.toFixed(1) : '—', label: 'Avg Rating', icon: <IconStarSmall /> },
          ]}
        />

        {sports.length > 0 && (
          <SportPills sports={sports} activeSport={activeSport} onSelect={setActiveSport} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionLabel>Pending Reviews</SectionLabel>
          {filteredPending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
              No sessions pending
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPending.map((session, i) => (
                <PendingCard key={session.id} session={session} index={i} onMarkComplete={onMarkComplete} />
              ))}
            </div>
          )}

          <SectionLabel>Completed</SectionLabel>
          {filteredCompleted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
              No completed sessions yet
            </div>
          ) : (
            <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '4px 16px' }}>
              {filteredCompleted.map((session) => (
                <CompletedRow key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerHomePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [trainerFirstName, setTrainerFirstName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [certificationApproved, setCertificationApproved] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.name) setTrainerFirstName(data.name.split(' ')[0])
          setAvatarUrl(data?.avatar_url ?? null)
        })

      const { data: trainerRow } = await supabase
        .from('trainers')
        .select('id, certification_status')
        .eq('profile_id', user.id)
        .single()
      if (!trainerRow) return

      setCertificationApproved(trainerRow.certification_status === 'approved')

      supabase
        .from('reviews')
        .select('rating')
        .eq('trainer_id', trainerRow.id)
        .then(({ data }) => {
          if (!data || data.length === 0) return
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
          setAvgRating(avg)
        })

      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, format, session_time, status, rate, parent_id, athletes!athlete_id(name, sport), profiles!parent_id(name)')
        .eq('trainer_id', trainerRow.id)
      if (!bookings) return

      const mapped: Session[] = (bookings as any[]).map((b) => {
        const dt = new Date(b.session_time)
        const type: SessionType = b.format === 'Remote Video' ? 'REMOTE' : 'IN-PERSON'
        const parentName: string = b.profiles?.name ?? 'Unknown'
        const parentInitials = parentName.split(' ').map((n: string) => n[0] ?? '').join('').slice(0, 2).toUpperCase()
        return {
          id: b.id,
          childName: b.athletes?.name ?? 'Unknown',
          parentName,
          parentInitials,
          parentProfileId: b.parent_id ?? '',
          sport: b.athletes?.sport ?? '',
          type,
          sessionTime: b.session_time,
          time: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          location: type === 'REMOTE' ? 'Video Call' : 'In Person',
          status: b.status ?? 'pending',
          rate: b.rate ?? null,
        }
      })

      setSessions(mapped)
    }
    fetchData()
  }, [])

  async function handleMarkComplete(sessionId: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', sessionId)
    if (error) throw error
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status: 'completed' } : s))
  }

  const now = new Date()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 7)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate() + 1)

  const activeSessions = sessions.filter((s) => s.status !== 'cancelled')
  const sessionsThisWeek = activeSessions.filter((s) => {
    const t = new Date(s.sessionTime).getTime()
    return t >= startOfWeek.getTime() && t < endOfWeek.getTime()
  }).length
  const sessionsToday = activeSessions.filter((s) => {
    const t = new Date(s.sessionTime).getTime()
    return t >= startOfToday.getTime() && t < endOfToday.getTime()
  }).length
  const totalEarnings = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.rate ?? 0), 0)

  return (
    <HomeView
      sessions={sessions}
      onMarkComplete={handleMarkComplete}
      trainerFirstName={trainerFirstName}
      avatarUrl={avatarUrl}
      sessionsThisWeek={sessionsThisWeek}
      sessionsToday={sessionsToday}
      totalEarnings={totalEarnings}
      avgRating={avgRating}
      certificationApproved={certificationApproved}
    />
  )
}
