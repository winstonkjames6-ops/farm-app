'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { getAthleteColor } from '@/lib/athleteColors'

// ── Types ──────────────────────────────────────────────────────────────────────

interface AthleteOption {
  id: string
  name: string
  color: string
}

interface BookingRow {
  id: string
  session_time: string
  status: string
  format: string | null
  athleteId: string | null
  athleteName: string
  trainerName: string
  hasFeedback: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const FORMAT_MAP: Record<string, string> = {
  in_person: 'In-Person',
  'in-person': 'In-Person',
  online: 'Remote Video',
  remote: 'Remote Video',
  remote_video: 'Remote Video',
  video: 'Remote Video',
}

function normalizeFormat(format: string | null): string {
  if (!format) return '—'
  return FORMAT_MAP[format.toLowerCase()] ?? format
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function formatSessionDate(sessionTime: string): string {
  const dt = new Date(sessionTime)
  return `${DAY_NAMES[dt.getDay()].slice(0, 3)}, ${MONTH_NAMES[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`
}

function formatSessionTime(sessionTime: string): string {
  const dt = new Date(sessionTime)
  let hours = dt.getHours()
  const minutes = dt.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minuteStr = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`
  return `${hours}${minuteStr} ${ampm}`
}

function buildMonthCells(year: number, month: number): (Date | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0 .. Sun=6
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function statusPillStyle(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'confirmed':
      return { bg: 'rgba(0,188,200,0.12)', color: '#00838C', label: 'Confirmed' }
    case 'pending':
      return { bg: 'rgba(245,158,11,0.14)', color: '#B45309', label: 'Pending' }
    case 'cancelled':
      return { bg: 'rgba(239,68,68,0.12)', color: '#B91C1C', label: 'Cancelled' }
    case 'declined':
      return { bg: 'rgba(239,68,68,0.12)', color: '#B91C1C', label: 'Declined' }
    case 'completed':
      return { bg: 'rgba(107,114,128,0.14)', color: '#4B5563', label: 'Completed' }
    default:
      return { bg: 'rgba(107,114,128,0.14)', color: '#4B5563', label: status }
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ParentCalendarPage() {
  const today = new Date()
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [athletes, setAthletes] = useState<AthleteOption[]>([])
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [athleteFilter, setAthleteFilter] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: athleteData } = await supabase
        .from('athletes')
        .select('id, name')
        .eq('parent_id', user.id)

      const athleteOptions: AthleteOption[] = (athleteData ?? []).map((a) => ({
        id: a.id as string,
        name: a.name as string,
        color: getAthleteColor(a.id as string),
      }))
      setAthletes(athleteOptions)
      const nameById = Object.fromEntries(athleteOptions.map((a) => [a.id, a.name]))

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, session_time, status, format, athlete_id, trainers!trainer_id(specialty, profiles(name))')
        .eq('parent_id', user.id)
        .order('session_time', { ascending: true })

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('booking_id')
        .eq('parent_id', user.id)

      const feedbackBookingIds = new Set((reviewData ?? []).map((r) => r.booking_id as string))

      setBookings(
        (bookingData ?? []).map((b: any) => ({
          id: b.id,
          session_time: b.session_time,
          status: b.status,
          format: b.format,
          athleteId: b.athlete_id ?? null,
          athleteName: b.athlete_id ? (nameById[b.athlete_id] ?? 'Athlete') : 'Athlete',
          trainerName: b.trainers?.profiles?.name ?? 'Trainer',
          hasFeedback: feedbackBookingIds.has(b.id),
        }))
      )

      setLoading(false)
    }
    load()
  }, [])

  const colorByAthleteId = useMemo(
    () => Object.fromEntries(athletes.map((a) => [a.id, a.color])),
    [athletes]
  )

  const monthCells = useMemo(
    () => buildMonthCells(monthCursor.getFullYear(), monthCursor.getMonth()),
    [monthCursor]
  )

  const dotsByDate = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const b of bookings) {
      if (!b.athleteId) continue
      const key = dateKey(new Date(b.session_time))
      if (!map[key]) map[key] = new Set()
      map[key].add(b.athleteId)
    }
    return map
  }, [bookings])

  const now = Date.now()
  const filteredSorted = useMemo(() => {
    let list = bookings.filter((b) =>
      tab === 'upcoming' ? new Date(b.session_time).getTime() >= now : new Date(b.session_time).getTime() < now
    )
    if (athleteFilter) list = list.filter((b) => b.athleteId === athleteFilter)
    list = [...list].sort((a, b) => {
      const ta = new Date(a.session_time).getTime()
      const tb = new Date(b.session_time).getTime()
      return tab === 'upcoming' ? ta - tb : tb - ta
    })
    return list
  }, [bookings, tab, athleteFilter, now])

  function goMonth(delta: number) {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          background: '#FFFFFF', borderRadius: '20px',
          border: `1px solid ${T.border}`, overflow: 'hidden',
        }}>

          {/* Month header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 20px 4px',
          }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '20px', color: T.ink,
            }}>{MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => goMonth(-1)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`,
                  background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.ink2,
                }}
              ><ChevronLeft size={16} /></button>
              <button
                onClick={() => goMonth(1)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`,
                  background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.ink2,
                }}
              ><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '12px 12px 0' }}>
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} style={{
                textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px',
                fontWeight: 600, color: T.ink3, textTransform: 'uppercase' as const, letterSpacing: '.04em',
                padding: '4px 0',
              }}>{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px 16px', gap: '2px' }}>
            {monthCells.map((cellDate, i) => {
              if (!cellDate) return <div key={i} />
              const key = dateKey(cellDate)
              const isToday = key === dateKey(today)
              const athleteIds = Array.from(dotsByDate[key] ?? [])
              return (
                <div key={i} style={{
                  minHeight: '52px', borderRadius: '10px',
                  background: isToday ? 'rgba(0,188,200,0.08)' : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 2px', gap: '4px',
                }}>
                  <span style={{
                    fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px',
                    fontWeight: isToday ? 700 : 500, color: isToday ? T.cyan : T.ink,
                  }}>{cellDate.getDate()}</span>
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '6px' }}>
                    {athleteIds.slice(0, 4).map((id) => (
                      <span key={id} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: colorByAthleteId[id] ?? T.cyan, flexShrink: 0,
                      }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Upcoming / Past tabs */}
          <div style={{ display: 'flex', gap: '8px', padding: '0 20px 14px', borderTop: `1px solid ${T.border}`, marginTop: '4px', paddingTop: '16px' }}>
            {(['upcoming', 'past'] as const).map((t) => {
              const sel = t === tab
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    height: '36px', padding: '0 18px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
                    background: sel ? T.cyan : T.surface2,
                    color: sel ? '#FFFFFF' : T.ink2,
                    textTransform: 'capitalize' as const,
                  }}
                >{t}</button>
              )
            })}
          </div>

          {/* Athlete filter chips */}
          {athletes.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', padding: '0 20px 16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setAthleteFilter(null)}
                style={{
                  height: '32px', padding: '0 14px', borderRadius: '999px', cursor: 'pointer',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 600,
                  border: athleteFilter === null ? `1.5px solid ${T.cyan}` : `1px solid ${T.border}`,
                  background: athleteFilter === null ? 'rgba(0,188,200,0.08)' : 'transparent',
                  color: athleteFilter === null ? T.cyan : T.ink2,
                }}
              >All</button>
              {athletes.map((a) => {
                const sel = athleteFilter === a.id
                return (
                  <button
                    key={a.id}
                    onClick={() => setAthleteFilter(a.id)}
                    style={{
                      height: '32px', padding: '0 14px', borderRadius: '999px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 600,
                      border: sel ? `1.5px solid ${a.color}` : `1px solid ${T.border}`,
                      background: sel ? `${a.color}14` : 'transparent',
                      color: sel ? a.color : T.ink2,
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                    {a.name}
                  </button>
                )
              })}
            </div>
          )}

          {/* Session list */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            {loading ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                Loading sessions…
              </div>
            ) : filteredSorted.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                No {tab} sessions{athleteFilter ? ' for this athlete' : ''}
              </div>
            ) : (
              filteredSorted.map((b, i) => {
                const pill = statusPillStyle(b.status)
                const barColor = b.athleteId ? (colorByAthleteId[b.athleteId] ?? T.cyan) : T.border
                const clickable = tab === 'past' && b.hasFeedback

                const rowInner = (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 20px 14px 0',
                    borderBottom: i < filteredSorted.length - 1 ? `1px solid ${T.border}` : 'none',
                  }}>
                    <span style={{ width: '4px', height: '36px', borderRadius: '3px', background: barColor, flexShrink: 0, marginLeft: '20px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink }}>
                          {formatSessionDate(b.session_time)}
                        </span>
                        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                          {formatSessionTime(b.session_time)}
                        </span>
                      </div>
                      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', color: T.ink2, marginTop: '2px' }}>
                        {b.athleteName} · {b.trainerName} · {normalizeFormat(b.format)}
                      </div>
                    </div>
                    <span style={{
                      flexShrink: 0, padding: '4px 10px', borderRadius: '999px',
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
                      letterSpacing: '.05em', textTransform: 'uppercase' as const,
                      background: pill.bg, color: pill.color,
                    }}>{pill.label}</span>
                  </div>
                )

                return clickable ? (
                  <Link key={b.id} href={`/review?bookingId=${b.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    {rowInner}
                  </Link>
                ) : (
                  <div key={b.id}>{rowInner}</div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
