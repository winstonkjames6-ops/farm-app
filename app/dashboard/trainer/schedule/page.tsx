'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

type SessionType = 'IN-PERSON' | 'REMOTE'
type SessionStatus = 'confirmed' | 'pending' | 'declined'

type Session = {
  id: string
  childName: string
  parentName: string
  parentInitials: string
  parentProfileId: string
  sport: string
  type: SessionType
  day: string
  time: string
  location: string
  isToday: boolean
  status: SessionStatus
}

type AvailabilitySlot = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

const FULL_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_MAP: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  cyanDim: 'rgba(0,188,200,0.06)',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  glass: 'rgba(0,0,0,0.04)',
  border: 'rgba(0,0,0,0.08)',
  card: '#FFFFFF',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: '#111827', textTransform: 'uppercase', marginBottom: '12px' }}>
      {children}
    </div>
  )
}

// ── ScheduleView ───────────────────────────────────────────────────────────────

function ScheduleView() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])

  // Availability form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [avFormDay, setAvFormDay] = useState('Mon')
  const [avFormStart, setAvFormStart] = useState('')
  const [avFormEnd, setAvFormEnd] = useState('')
  const [avFormError, setAvFormError] = useState('')
  const [avSaving, setAvSaving] = useState(false)
  const [avDeleteErrors, setAvDeleteErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: trainerRow } = await supabase
        .from('trainers')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!trainerRow) return

      setTrainerId(trainerRow.id)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, format, session_time, status, parent_id, athletes!athlete_id(name, sport), profiles!parent_id(name)')
        .eq('trainer_id', trainerRow.id)
      if (!bookings) return

      const JS_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const today = new Date()

      const mapped: Session[] = (bookings as any[]).filter((b) => b.status !== 'declined' && b.status !== 'completed').map((b) => {
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
          day: JS_DAYS[dt.getDay()],
          time: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          location: type === 'REMOTE' ? 'Video Call' : 'In Person',
          isToday: dt.toDateString() === today.toDateString(),
          status: (b.status === 'confirmed' ? 'confirmed' : b.status === 'declined' ? 'declined' : 'pending') as SessionStatus,
        }
      })

      setSessions(mapped)

      const { data: avData } = await supabase
        .from('availability')
        .select('id, day_of_week, start_time, end_time')
        .eq('trainer_id', trainerRow.id)
        .order('day_of_week')
      setAvailabilitySlots(avData ?? [])
    }
    fetchData()
  }, [])

  const [actionErrors, setActionErrors] = useState<Record<string, string>>({})

  async function confirmSession(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', id)
    if (error) {
      setActionErrors((prev) => ({ ...prev, [id]: 'Failed to confirm. Try again.' }))
      return
    }
    setActionErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'confirmed' } : s))
  }

  async function declineSession(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'declined' })
      .eq('id', id)
    if (error) {
      setActionErrors((prev) => ({ ...prev, [id]: 'Failed to decline. Try again.' }))
      return
    }
    setActionErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  async function addAvailability() {
    if (!trainerId) return
    if (!avFormStart || !avFormEnd) {
      setAvFormError('Please set both start and end times.')
      return
    }
    if (avFormStart >= avFormEnd) {
      setAvFormError('Start time must be before end time.')
      return
    }
    setAvFormError('')
    setAvSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('availability')
      .insert({ trainer_id: trainerId, day_of_week: DAY_MAP[avFormDay], start_time: avFormStart, end_time: avFormEnd })
      .select('id, day_of_week, start_time, end_time')
      .single()
    setAvSaving(false)
    if (error) {
      setAvFormError('Failed to save. Try again.')
      return
    }
    setAvailabilitySlots((prev) => [...prev, data])
    setShowAddForm(false)
    setAvFormStart('')
    setAvFormEnd('')
  }

  async function deleteAvailability(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)
    if (error) {
      setAvDeleteErrors((prev) => ({ ...prev, [id]: 'Failed to delete. Try again.' }))
      return
    }
    setAvDeleteErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
    setAvailabilitySlots((prev) => prev.filter((s) => s.id !== id))
  }

  const sessionsByDay: Record<string, Session[]> = {}
  FULL_WEEK.forEach((day) => {
    sessionsByDay[day] = sessions.filter((s) => s.day === day)
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '28px', color: T.ink }}>
            Jun 23 – Jun 29
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginTop: '4px' }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} this week
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FULL_WEEK.map((day) => {
            const daySessions = sessionsByDay[day] || []
            return (
              <div key={day} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: daySessions.length > 0 ? '16px' : '0' }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink }}>{day}</span>
                  <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3 }}>
                    {daySessions.length > 0 ? `${daySessions.length} session${daySessions.length > 1 ? 's' : ''}` : 'Available'}
                  </span>
                </div>

                {daySessions.length > 0 ? (
                  <div>
                    {daySessions.map((session, i) => (
                      <div key={session.id}>
                        {i > 0 && <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '12px 0' }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          {/* Name + sport */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: T.ink }}>{session.childName}</div>
                              {session.status === 'pending' && (
                                <span style={{ background: 'rgba(245,158,11,0.12)', color: '#D97706', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '10px', letterSpacing: '0.06em', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                                  PENDING
                                </span>
                              )}
                            </div>
                            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{session.sport}</div>
                          </div>

                          {/* Time */}
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink, flexShrink: 0 }}>{session.time}</div>

                          {/* Type badge */}
                          <span style={{
                            padding: '3px 10px',
                            background: session.type === 'IN-PERSON' ? 'rgba(0,188,200,0.1)' : 'rgba(99,102,241,0.1)',
                            color: session.type === 'IN-PERSON' ? T.cyan : '#6366F1',
                            border: session.type === 'IN-PERSON' ? '1px solid rgba(0,188,200,0.2)' : '1px solid rgba(99,102,241,0.2)',
                            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
                            letterSpacing: '0.08em', borderRadius: '6px', flexShrink: 0,
                          }}>
                            {session.type}
                          </span>

                          {/* Actions */}
                          {session.status === 'pending' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => confirmSession(session.id)}
                                  style={{ background: T.cyan, color: '#FFFFFF', border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 700 }}
                                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.06)' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => declineSession(session.id)}
                                  style={{ background: 'none', border: '1px solid rgba(0,0,0,0.12)', color: T.ink2, cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.26)' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)' }}
                                >
                                  Decline
                                </button>
                              </div>
                              {actionErrors[session.id] && (
                                <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px' }}>
                                  {actionErrors[session.id]}
                                </span>
                              )}
                              <Link
                                href={`/dashboard/trainer/messages?withId=${session.parentProfileId}`}
                                style={{ color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', textDecoration: 'none' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = T.cyan }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = T.ink3 }}
                              >
                                Message parent
                              </Link>
                            </div>
                          ) : (
                            <Link
                              href={`/dashboard/trainer/messages?withId=${session.parentProfileId}`}
                              style={{ background: 'none', border: '1px solid rgba(0,0,0,0.10)', color: T.ink2, padding: '6px 12px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,0,0.24)' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,0,0.10)' }}
                            >
                              Message parent
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => { setAvFormDay(day); setShowAddForm(true) }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', border: '1px dashed rgba(0,0,0,0.10)', borderRadius: '10px', fontSize: '13px', color: T.ink3, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", transition: 'border-color 0.15s, color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.cyanBorder; e.currentTarget.style.color = T.cyan }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'; e.currentTarget.style.color = T.ink3 }}
                  >
                    + Add availability
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Availability management ─────────────────────────────────────────── */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: T.ink, textTransform: 'uppercase' }}>
              My Availability
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                style={{ background: 'none', border: `1px solid ${T.cyanBorder}`, color: T.cyan, cursor: 'pointer', padding: '5px 14px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 600 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.cyanDim }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
              >
                + Add slot
              </button>
            )}
          </div>

          {/* Existing slots */}
          {availabilitySlots.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: showAddForm ? '16px' : '0' }}>
              {availabilitySlots.map((slot) => (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: T.cyanDim, border: `1px solid ${T.cyanBorder}`, borderRadius: '10px' }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink, minWidth: '36px' }}>
                    {DAY_LABELS[slot.day_of_week]}
                  </span>
                  <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, flex: 1 }}>
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </span>
                  {avDeleteErrors[slot.id] && (
                    <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px' }}>
                      {avDeleteErrors[slot.id]}
                    </span>
                  )}
                  <button
                    onClick={() => deleteAvailability(slot.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontFamily: "'Hanken Grotesk', sans-serif" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = T.ink3 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {showAddForm && (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>Day</label>
                  <select
                    value={avFormDay}
                    onChange={(e) => setAvFormDay(e.target.value)}
                    style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, cursor: 'pointer', outline: 'none', minWidth: '90px' }}
                  >
                    {ALL_DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>Start</label>
                  <input
                    type="time"
                    value={avFormStart}
                    onChange={(e) => setAvFormStart(e.target.value)}
                    style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>End</label>
                  <input
                    type="time"
                    value={avFormEnd}
                    onChange={(e) => setAvFormEnd(e.target.value)}
                    style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
                  />
                </div>
              </div>

              {avFormError && (
                <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px' }}>
                  {avFormError}
                </span>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={addAvailability}
                  disabled={avSaving}
                  style={{ background: T.cyan, color: '#FFFFFF', border: 'none', cursor: avSaving ? 'default' : 'pointer', padding: '8px 18px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, opacity: avSaving ? 0.7 : 1 }}
                  onMouseEnter={(e) => { if (!avSaving) e.currentTarget.style.filter = 'brightness(1.06)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
                >
                  {avSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setAvFormError(''); setAvFormStart(''); setAvFormEnd('') }}
                  style={{ background: 'none', border: `1px solid ${T.border}`, color: T.ink2, cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.22)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {availabilitySlots.length === 0 && !showAddForm && (
            <div style={{ textAlign: 'center', padding: '20px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}>
              No availability set yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerSchedulePage() {
  return <ScheduleView />
}
