'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

import { T } from '@/lib/theme'
import { notifyWaitlistOfOpening } from '@/lib/waitlist'

// ── Types ──────────────────────────────────────────────────────────────────────

type UpcomingSession = {
  id: string
  trainerId: string | null
  sessionTimeRaw: string
  date: string
  trainer: string
  sport: string
  time: string
  format: string
}

type PastSession = {
  id: string
  date: string
  trainer: string
  sport: string
  time: string
  format: string
}

// ── Sport badge ────────────────────────────────────────────────────────────────

function SportBadge({ sport }: { sport: string }) {
  return (
    <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.06)', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '11px', padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
      {sport}
    </span>
  )
}

// ── Shared card style ──────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: '16px',
  padding: '20px',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: T.ink3,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([])
  const [past, setPast] = useState<PastSession[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: athleteRow, error: athleteErr } = await supabase
        .from('athletes')
        .select('id, sport')
        .eq('profile_id', user.id)
        .single()

      if (athleteErr) {
        console.error('[sessions] athletes fetch:', athleteErr.message)
        setLoadError(athleteErr.message)
        return
      }
      if (!athleteRow) return

      const athleteId = (athleteRow as any).id
      const sport: string = (athleteRow as any).sport ?? ''

      const { data: bookings, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, format, session_time, status, trainer_id, trainers!trainer_id(profiles(name))')
        .eq('athlete_id', athleteId)
        .order('session_time', { ascending: false })

      if (bookingErr) {
        console.error('[sessions] bookings fetch:', bookingErr.message)
        setLoadError(bookingErr.message)
        return
      }
      if (!bookings) return

      const now = new Date().toISOString()
      const rows = bookings as any[]

      const upcomingRows = rows
        .filter(b => b.session_time > now && b.status !== 'cancelled')
        .sort((a, b) => a.session_time.localeCompare(b.session_time))

      const pastRows = rows
        .filter(b => b.session_time <= now && b.status !== 'cancelled')
        .sort((a, b) => b.session_time.localeCompare(a.session_time))

      setUpcoming(upcomingRows.map(b => {
        const dt = new Date(b.session_time)
        return {
          id: b.id,
          trainerId: b.trainer_id ?? null,
          sessionTimeRaw: b.session_time,
          date: dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          trainer: b.trainers?.profiles?.name ?? 'Trainer',
          sport,
          time: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          format: b.format === 'Remote Video' ? 'Remote' : (b.format ?? 'In-Person'),
        }
      }))

      setPast(pastRows.map(b => {
        const dt = new Date(b.session_time)
        return {
          id: b.id,
          date: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          trainer: b.trainers?.profiles?.name ?? 'Trainer',
          sport,
          time: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          format: b.format === 'Remote Video' ? 'Remote' : (b.format ?? 'In-Person'),
        }
      }))
    }
    load()
  }, [])

  async function cancelSession(id: string) {
    const cancelled = upcoming.find((s) => s.id === id)
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
    if (error) {
      console.error('[sessions] cancel booking:', error.message)
      return
    }
    setUpcoming((prev) => prev.filter((s) => s.id !== id))
    if (cancelled?.trainerId) {
      notifyWaitlistOfOpening(cancelled.trainerId, cancelled.sessionTimeRaw)
    }
  }

  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {loadError && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: '#DC2626' }}>
            Error loading sessions: {loadError}
          </div>
        )}

        {/* Section 1 — Upcoming sessions */}
        <div style={glassCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={sectionLabel}>UPCOMING SESSIONS</span>
            <span style={{ background: 'rgba(0,188,200,0.1)', color: '#00BCC8', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              {upcoming.length}
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ padding: '24px 0 8px', textAlign: 'center', color: T.ink3, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              No upcoming sessions
            </div>
          ) : (
            upcoming.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 0',
                  borderBottom: i < upcoming.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  minHeight: '44px',
                }}
              >
                {/* Date + trainer */}
                <div style={{ flex: '0 0 130px', minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.ink, lineHeight: 1.2 }}>{s.date}</div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, marginTop: '2px' }}>{s.trainer}</div>
                </div>

                {/* Sport badge */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <SportBadge sport={s.sport} />
                </div>

                {/* Time + format */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{s.time}</div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3, marginTop: '2px' }}>{s.format}</div>
                </div>

                {/* Actions */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <Link
                    href="/dashboard/athlete/messages"
                    style={{ background: T.cyan, color: '#FFFFFF', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.06)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
                  >
                    Join session
                  </Link>
                  <button
                    onClick={() => cancelSession(s.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', padding: '2px 0' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = T.cyan }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = T.ink3 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section 2 — Past sessions */}
        <div style={{ ...glassCard, marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={sectionLabel}>PAST SESSIONS</span>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{past.length} total</span>
          </div>

          {past.length === 0 ? (
            <div style={{ padding: '24px 0 8px', textAlign: 'center', color: T.ink3, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              No past sessions
            </div>
          ) : (
            past.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 0',
                  borderBottom: i < past.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  minHeight: '44px',
                }}
              >
                {/* Date + trainer */}
                <div style={{ flex: '0 0 130px', minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.ink, lineHeight: 1.2 }}>{s.date}</div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, marginTop: '2px' }}>{s.trainer}</div>
                </div>

                {/* Sport badge */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <SportBadge sport={s.sport} />
                </div>

                {/* Time + format */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{s.time}</div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3, marginTop: '2px' }}>{s.format}</div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
