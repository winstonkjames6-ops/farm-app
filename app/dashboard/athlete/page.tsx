'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Types ──────────────────────────────────────────────────────────────────────

type NextSession = {
  trainerName: string
  trainerInitials: string
  sport: string
  dateLabel: string
  format: string
}

type RecentSession = {
  id: string
  dateLabel: string
  trainerName: string
  sport: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AthletePage() {
  const [firstName, setFirstName] = useState('')
  const [nextSession, setNextSession] = useState<NextSession | null>(null)
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

      const { data: bookings, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, format, session_time, status, trainers!trainer_id(profiles(name))')
        .eq('athlete_id', athleteId)
        .order('session_time', { ascending: false })

      if (bookingErr) {
        console.error('[athlete home] bookings fetch:', bookingErr.message)
        setLoadError(bookingErr.message)
        return
      }
      if (!bookings) return

      const now = new Date().toISOString()
      const rows = bookings as any[]

      // Soonest future booking (not cancelled)
      const upcomingRows = rows
        .filter(b => b.session_time > now && b.status !== 'cancelled')
        .sort((a, b) => a.session_time.localeCompare(b.session_time))

      if (upcomingRows.length > 0) {
        const b = upcomingRows[0]
        const dt = new Date(b.session_time)
        const trainerName: string = b.trainers?.profiles?.name ?? 'Trainer'
        const dateLabel =
          dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
          ' · ' +
          dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        setNextSession({
          trainerName,
          trainerInitials: getInitials(trainerName),
          sport: athleteSport,
          dateLabel,
          format: b.format === 'Remote Video' ? 'Remote' : (b.format ?? 'In-Person'),
        })
      }

      // Most recent past bookings (up to 3)
      const pastRows = rows
        .filter(b => b.session_time < now)
        .sort((a, b) => b.session_time.localeCompare(a.session_time))
        .slice(0, 3)

      setRecentSessions(pastRows.map(b => ({
        id: b.id,
        dateLabel: new Date(b.session_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        trainerName: b.trainers?.profiles?.name ?? 'Trainer',
        sport: athleteSport,
      })))
    }
    load()
  }, [])

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  }

  const sectionLabel: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: T.ink3,
    marginBottom: '16px',
    display: 'block',
  }

  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {loadError && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: '#DC2626' }}>
            Error loading data: {loadError}
          </div>
        )}

        {/* Section 1 — Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '32px', color: T.ink, margin: '0 0 6px', lineHeight: 1.1 }}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, margin: 0 }}>
            Here&apos;s what&apos;s coming up
          </p>
        </div>

        {/* Section 2 — Next session card */}
        <div style={glassCard}>
          <span style={sectionLabel}>NEXT SESSION</span>

          {nextSession ? (
            <>
              {/* Trainer row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '999px', background: T.cyanLight, border: `2px solid ${T.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.cyan, flexShrink: 0 }}>
                  {nextSession.trainerInitials}
                </div>
                <div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink, lineHeight: 1.2 }}>{nextSession.trainerName}</div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{nextSession.sport} Trainer</div>
                </div>
              </div>

              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: T.ink2 }}>
                <IconCalendar size={14} />
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}>{nextSession.dateLabel}</span>
              </div>

              {/* Type badge */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'inline-block', background: 'rgba(0,188,200,0.1)', color: '#00BCC8', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 12px', borderRadius: '999px' }}>
                  {nextSession.format}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  href="/dashboard/athlete/messages"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#00BCC8', color: '#FFFFFF', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', textDecoration: 'none', borderRadius: '10px', minHeight: '44px' }}
                >
                  View details
                </Link>
                <Link
                  href="/dashboard/athlete/messages"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#00BCC8', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', textDecoration: 'none', borderRadius: '10px', minHeight: '44px', border: '1.5px solid #00BCC8' }}
                >
                  Message trainer
                </Link>
              </div>
            </>
          ) : (
            <div style={{ padding: '16px 0 4px', textAlign: 'center', color: T.ink3, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              No upcoming sessions
            </div>
          )}
        </div>

        {/* Section 3 — Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[
            { value: '12', label: 'Sessions'    },
            { value: '—',  label: 'Avg Rating'  },
            { value: '3',  label: 'Weeks active' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '16px',
                padding: '16px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '28px', color: '#00BCC8', lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Section 4 — Recent sessions */}
        <div style={{ ...glassCard, marginBottom: 0 }}>
          <span style={sectionLabel}>RECENT SESSIONS</span>
          {recentSessions.length === 0 ? (
            <div style={{ padding: '8px 0 4px', textAlign: 'center', color: T.ink3, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              No past sessions
            </div>
          ) : (
            recentSessions.map((session, i) => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < recentSessions.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  minHeight: '44px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, width: '48px', flexShrink: 0 }}>{session.dateLabel}</span>
                  <div>
                    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 500, color: T.ink }}>{session.trainerName}</div>
                    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{session.sport}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
