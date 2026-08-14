'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

import { T } from '@/lib/theme'
import { DashboardHero } from '@/components/dashboard/DashboardHero'

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
}

type FilterKey = 'All' | 'Upcoming' | 'Past'

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
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
  const [firstName, setFirstName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All')
  const [clipsSubmitted, setClipsSubmitted] = useState(0)
  const [awaitingReview, setAwaitingReview] = useState(0)
  const [feedbackReady, setFeedbackReady] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      supabase
        .from('profiles')
        .select('avatar_url, banner_image_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setAvatarUrl(data?.avatar_url ?? null)
          setBannerImageUrl(data?.banner_image_url ?? null)
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
        .select('id, name, sport')
        .eq('profile_id', user.id)
        .single()

      if (athleteErr) {
        console.error('[athlete home] athletes fetch:', athleteErr.message)
        setLoadError(athleteErr.message)
        return
      }
      if (!athleteRow) return

      const athleteId = (athleteRow as any).id
      const athleteName: string = (athleteRow as any).name ?? ''
      const athleteSport: string = (athleteRow as any).sport ?? ''

      setFirstName(athleteName.split(' ')[0] ?? '')

      const { data: rows, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, format, session_time, status, trainers!trainer_id(profiles(name))')
        .eq('athlete_id', athleteId)
        .order('session_time', { ascending: false })

      if (bookingErr) {
        console.error('[athlete home] bookings fetch:', bookingErr.message)
        setLoadError(bookingErr.message)
        return
      }
      if (!rows) return

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
        }
      })

      setBookings(mapped)
    }
    load()
  }, [])

  const upcoming = bookings.filter((b) => b.isUpcoming).sort((a, b) => a.sessionTime.localeCompare(b.sessionTime))
  const past = bookings.filter((b) => !b.isUpcoming && b.sessionTime < new Date().toISOString())
  const sessionsCompleted = bookings.filter((b) => b.status === 'completed').length

  const nextSession = upcoming[0] ?? null

  const visible = activeFilter === 'All' ? [...upcoming, ...past]
    : activeFilter === 'Upcoming' ? upcoming
    : past

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

      </div>
    </div>
  )
}
