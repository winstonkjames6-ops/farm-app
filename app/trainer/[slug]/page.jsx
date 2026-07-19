'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { generateSlotsForPreset, buildSlotISO } from '@/lib/scheduling'

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function formatTime12h(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function isSameLocalDate(dateObj, isoDateStr) {
  const [y, m, d] = isoDateStr.split('-').map(Number)
  return dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function TrainerProfile({ params: { slug } }) {
  const [trainer, setTrainer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('In-Person')
  const [activePreset, setActivePreset] = useState(null)
  const [exceptions, setExceptions] = useState([])
  const [existingBookings, setExistingBookings] = useState([])

  // Per-athlete rate override preview (trainer_athlete_rates) — null when none applies.
  const [overrideRate, setOverrideRate] = useState(null)

  // Caps how far out the picker offers dates — max_advance_days=3 means only
  // tomorrow..+3 days show up, never the full 5-day window past that point.
  const DATES = useMemo(() => {
    const result = []
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const maxAdvanceDays = trainer?.max_advance_days ?? null
    const d = new Date()
    d.setDate(d.getDate() + 1)
    let daysFromToday = 1
    while (result.length < 5) {
      if (maxAdvanceDays != null && daysFromToday > maxAdvanceDays) break
      result.push({
        day: DAYS[d.getDay()],
        num: String(d.getDate()),
        isoDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      })
      d.setDate(d.getDate() + 1)
      daysFromToday++
    }
    return result
  }, [trainer?.max_advance_days])

  const exceptionByDate = useMemo(() => {
    const map = {}
    exceptions.forEach(e => { map[e.exception_date] = e.status })
    return map
  }, [exceptions])

  const daySlots = useMemo(() => {
    if (!activePreset) return []
    const iso = DATES[selectedDate]?.isoDate
    if (!iso) return []
    // A blocked exception on this exact date wins regardless of the preset's days.
    if (exceptionByDate[iso] === 'blocked') return []
    const dow = new Date(iso + 'T00:00:00').getDay()
    // A standing day off blocks this weekday everywhere, regardless of the preset's days.
    if ((trainer?.standing_days_off ?? []).includes(dow)) return []
    if (!activePreset.days.includes(dow)) return []

    // Once this date already has max_sessions_per_day non-cancelled bookings,
    // the day is full — hide every slot rather than imply specific times are free.
    const maxSessionsPerDay = trainer?.max_sessions_per_day ?? null
    if (maxSessionsPerDay != null) {
      const bookedCountForDate = existingBookings.filter(b => isSameLocalDate(new Date(b.session_time), iso)).length
      if (bookedCountForDate >= maxSessionsPerDay) return []
    }

    const minNoticeHours = trainer?.min_notice_hours ?? 0
    const noticeCutoff = Date.now() + minNoticeHours * 60 * 60 * 1000
    return generateSlotsForPreset(activePreset)
      .map(start_time => ({ start_time }))
      .filter(slot => new Date(buildSlotISO(iso, slot.start_time)).getTime() >= noticeCutoff)
  }, [activePreset, exceptionByDate, selectedDate, DATES, existingBookings, trainer?.max_sessions_per_day, trainer?.min_notice_hours, trainer?.standing_days_off])

  const bookedSet = useMemo(() => new Set(existingBookings.map(b => new Date(b.session_time).getTime())), [existingBookings])

  useEffect(() => {
    const isoDate = DATES[selectedDate]?.isoDate ?? ''
    const firstAvailable = daySlots.find(slot => !bookedSet.has(new Date(buildSlotISO(isoDate, slot.start_time)).getTime()))
    setSelectedTime(firstAvailable ? formatTime12h(firstAvailable.start_time) : null)
  }, [daySlots, bookedSet, DATES, selectedDate])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('trainers')
        .select('id, profile_id, specialty, bio, rate, location, active_preset_id, max_sessions_per_day, min_notice_hours, max_advance_days, standing_days_off, profiles(name)')
        .eq('profile_id', slug)
        .single()
      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setTrainer(data)

      if (data.active_preset_id) {
        const { data: preset } = await supabase
          .from('trainer_presets')
          .select('days, start_time, end_time, session_length_minutes, break_minutes')
          .eq('id', data.active_preset_id)
          .single()
        setActivePreset(preset || null)
      } else {
        setActivePreset(null)
      }

      setLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    if (!trainer?.id) return
    async function fetchBookings() {
      const supabase = createClient()
      const { data } = await supabase
        .from('trainer_booked_slots')
        .select('session_time')
        .eq('trainer_id', trainer.id)
      setExistingBookings(data || [])
    }
    fetchBookings()
  }, [trainer?.id])

  useEffect(() => {
    if (!trainer?.id) return
    async function fetchExceptions() {
      const supabase = createClient()
      const startDate = DATES[0]?.isoDate
      const endDate = DATES[DATES.length - 1]?.isoDate
      if (!startDate || !endDate) return
      const { data } = await supabase
        .from('availability_exceptions')
        .select('exception_date, status')
        .eq('trainer_id', trainer.id)
        .gte('exception_date', startDate)
        .lte('exception_date', endDate)
      setExceptions(data || [])
    }
    fetchExceptions()
  }, [trainer?.id, DATES])

  // Best-effort rate preview for a logged-in parent with exactly one athlete — this
  // page has no athlete selector, so a parent with multiple children instead gets
  // their definitive per-athlete rate resolved on /booking once they pick who it's for.
  useEffect(() => {
    if (!trainer?.id) return
    async function loadRateOverride() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setOverrideRate(null); return }
      const { data: athletes } = await supabase
        .from('athletes')
        .select('id')
        .eq('parent_id', user.id)
      if (!athletes || athletes.length !== 1) { setOverrideRate(null); return }
      const { data: rateRow } = await supabase
        .from('trainer_athlete_rates')
        .select('rate')
        .eq('trainer_id', trainer.id)
        .eq('athlete_id', athletes[0].id)
        .maybeSingle()
      setOverrideRate(rateRow?.rate ?? null)
    }
    loadRateOverride()
  }, [trainer?.id])

  const card = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '24px 28px',
  }

  const sectionHeading = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--ink)',
    margin: '0 0 16px',
    letterSpacing: '-.01em',
  }

  const labelCaps = {
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: '10px',
  }

  // Derive name safely
  const name = trainer?.profiles?.name ?? ''
  const { profile_id, specialty, bio, rate, location } = trainer ?? {}
  const displayRate = overrideRate ?? rate

  const bookingHref = trainer && selectedTime
    ? `/booking?trainerId=${profile_id}&name=${encodeURIComponent(name)}&specialty=${encodeURIComponent(specialty ?? '')}&rate=${displayRate ?? ''}&date=${encodeURIComponent(DATES[selectedDate]?.isoDate ?? '')}&time=${encodeURIComponent(selectedTime)}&format=${encodeURIComponent(selectedFormat)}`
    : '/booking'

  if (loading) {
    return (
      <div style={{
        '--bg': '#F8F8F6', '--surface': '#FFFFFF', '--line': 'rgba(0,0,0,0.08)',
        '--ink-3': '#9A9A9A', '--accent': '#00BCC8',
        background: 'var(--bg)', minHeight: '100vh',
        fontFamily: "'Hanken Grotesk', sans-serif", WebkitFontSmoothing: 'antialiased',
      }}>
        {/* Nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'color-mix(in srgb, #F8F8F6 84%, transparent)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{
            maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px',
              }}>F</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '.02em', color: '#1A1A1A' }}>FARM</span>
            </Link>
            <Link href="/search" style={{
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
              color: '#4A4A4A', fontWeight: 600, fontSize: '14px',
              padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
            }}>← Back to search</Link>
          </div>
        </nav>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '80px 32px', textAlign: 'center', color: 'var(--ink-3)', fontSize: '15px' }}>
          Loading…
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{
        '--bg': '#F8F8F6', '--surface': '#FFFFFF', '--line': 'rgba(0,0,0,0.08)',
        '--ink': '#1A1A1A', '--ink-2': '#4A4A4A', '--ink-3': '#9A9A9A', '--accent': '#00BCC8',
        background: 'var(--bg)', minHeight: '100vh',
        fontFamily: "'Hanken Grotesk', sans-serif", WebkitFontSmoothing: 'antialiased',
      }}>
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'color-mix(in srgb, #F8F8F6 84%, transparent)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{
            maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px',
              }}>F</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '.02em', color: '#1A1A1A' }}>FARM</span>
            </Link>
            <Link href="/search" style={{
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
              color: '#4A4A4A', fontWeight: 600, fontSize: '14px',
              padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
            }}>← Back to search</Link>
          </div>
        </nav>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '96px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: '#1A1A1A', marginBottom: '12px' }}>Trainer not found</div>
          <p style={{ color: '#9A9A9A', fontSize: '15px', marginBottom: '28px' }}>This trainer profile doesn&apos;t exist or may have been removed.</p>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            background: '#00BCC8', color: '#fff', fontWeight: 700, fontSize: '15px',
            padding: '12px 24px', borderRadius: '12px',
          }}>Browse trainers</Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        '--bg': '#F8F8F6', '--surface': '#FFFFFF', '--surface-2': '#F0EFEB',
        '--ink': '#1A1A1A', '--ink-2': '#4A4A4A', '--ink-3': '#9A9A9A',
        '--line': 'rgba(0,0,0,0.08)', '--accent': '#00BCC8', '--accent-ink': '#FFFFFF',
        '--radius': '14px',
        background: 'var(--bg)', color: 'var(--ink)',
        fontFamily: "'Hanken Grotesk', sans-serif",
        minHeight: '100vh', WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        .tp-grid {
          display: grid;
          grid-template-columns: 1fr 364px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .tp-grid { grid-template-columns: 1fr; }
          .tp-sticky { position: static !important; top: auto !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'color-mix(in srgb, #F8F8F6 84%, transparent)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-ink)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px',
            }}>F</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '.02em', color: 'var(--ink)' }}>FARM</span>
          </Link>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            color: 'var(--ink-2)', fontWeight: 600, fontSize: '14px',
            padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
          }}>← Back to search</Link>
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '36px 32px 96px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--ink-3)', marginBottom: '28px' }}>
          <Link href="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>›</span>
          <Link href="/search" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Trainers</Link>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>›</span>
          <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{name}</span>
        </div>

        <div className="tp-grid">

          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >

            {/* Profile header */}
            <div style={card}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: '88px', height: '88px', borderRadius: '20px', flexShrink: 0,
                  background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '30px',
                  color: '#fff', letterSpacing: '-.02em', border: '1px solid var(--line)',
                }}>{getInitials(name)}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px',
                    margin: '0 0 12px', letterSpacing: '-.02em', color: 'var(--ink)',
                  }}>{name}</h1>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '12px' }}>
                    {specialty && (
                      <span style={{
                        background: 'rgba(0,188,200,0.10)',
                        color: '#00BCC8', fontSize: '12.5px', fontWeight: 700,
                        padding: '4px 12px', borderRadius: '999px',
                      }}>{specialty}</span>
                    )}
                  </div>

                  {location && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '13.5px', color: 'var(--ink-3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        {location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {bio && (
              <div style={card}>
                <h2 style={sectionHeading}>About</h2>
                <p style={{ color: 'var(--ink-2)', fontSize: '15.5px', lineHeight: 1.7, margin: 0 }}>{bio}</p>
              </div>
            )}

            {/* Rate */}
            <div style={{ ...card, display: 'inline-block' }}>
              <h2 style={sectionHeading}>Rate</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '34px', color: 'var(--ink)', lineHeight: 1 }}>${displayRate}</span>
                <span style={{ color: 'var(--ink-3)', fontSize: '15px' }}>/hr</span>
              </div>
              <p style={{ color: 'var(--ink-3)', fontSize: '13px', margin: 0, lineHeight: 1.45 }}>No subscription.<br />Pay per session.</p>
            </div>

          </motion.div>

          {/* RIGHT COLUMN — Sticky booking card */}
          <motion.div
            className="tp-sticky"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
            style={{ position: 'sticky', top: '88px' }}
          >
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              padding: '24px 24px 28px',
              boxShadow: '0 28px 64px rgba(0,0,0,0.08)',
            }}>

              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                paddingBottom: '18px', borderBottom: '1px solid var(--line)', marginBottom: '20px',
              }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--ink)', letterSpacing: '-.01em' }}>{name}</div>
                  {specialty && (
                    <div style={{ fontSize: '12.5px', color: 'var(--ink-3)', marginTop: '5px' }}>{specialty}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '24px', color: 'var(--ink)', lineHeight: 1 }}>${displayRate}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '3px' }}>per hour</div>
                </div>
              </div>

              {/* Date picker */}
              <div style={{ marginBottom: '18px' }}>
                <div style={labelCaps}>Select a date</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${DATES.length || 1}, 1fr)`, gap: '6px' }}>
                  {DATES.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      style={{
                        textAlign: 'center', padding: '10px 0', borderRadius: '11px', cursor: 'pointer',
                        background: selectedDate === i ? 'var(--accent)' : 'var(--bg)',
                        border: selectedDate === i ? '1px solid var(--accent)' : '1px solid var(--line)',
                        boxShadow: selectedDate === i ? '0 6px 18px rgba(0,188,200,0.28)' : 'none',
                        transition: 'all .15s ease',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 600, color: selectedDate === i ? 'rgba(255,255,255,0.75)' : 'var(--ink-3)', marginBottom: '3px' }}>{d.day}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '17px', lineHeight: 1, color: selectedDate === i ? 'var(--accent-ink)' : 'var(--ink)' }}>{d.num}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div style={{ marginBottom: '18px' }}>
                <div style={labelCaps}>Time</div>
                {!activePreset ? (
                  <div style={{ fontSize: '13.5px', color: 'var(--ink-3)', padding: '8px 0' }}>This trainer hasn&apos;t set their availability yet</div>
                ) : daySlots.length === 0 ? (
                  <div style={{ fontSize: '13.5px', color: 'var(--ink-3)', padding: '8px 0' }}>No availability this day</div>
                ) : (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {daySlots.map((slot) => {
                      const label = formatTime12h(slot.start_time)
                      const slotISO = buildSlotISO(DATES[selectedDate]?.isoDate ?? '', slot.start_time)
                      const isBooked = bookedSet.has(new Date(slotISO).getTime())
                      return (
                        <button
                          key={slot.start_time}
                          onClick={isBooked ? undefined : () => setSelectedTime(label)}
                          style={{
                            padding: '8px 13px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                            cursor: isBooked ? 'default' : 'pointer',
                            background: !isBooked && selectedTime === label ? 'var(--ink)' : 'var(--bg)',
                            border: `1px solid ${!isBooked && selectedTime === label ? 'var(--ink)' : 'var(--line)'}`,
                            color: isBooked ? 'var(--ink-3)' : selectedTime === label ? 'var(--bg)' : 'var(--ink-2)',
                            textDecoration: isBooked ? 'line-through' : 'none',
                            opacity: isBooked ? 0.55 : 1,
                            transition: 'all .15s ease',
                          }}
                        >{label}</button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Format toggle */}
              <div style={{ marginBottom: '22px' }}>
                <div style={labelCaps}>Format</div>
                <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '10px', padding: '3px', gap: '3px' }}>
                  {['In-Person', 'Remote Video'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: '8px',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        background: selectedFormat === f ? 'var(--surface)' : 'transparent',
                        border: selectedFormat === f ? '1px solid var(--line)' : '1px solid transparent',
                        color: selectedFormat === f ? 'var(--ink)' : 'var(--ink-3)',
                        boxShadow: selectedFormat === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all .15s ease',
                      }}
                    >{f}</button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: '18px', marginBottom: '18px', borderBottom: '1px solid var(--line)',
              }}>
                <span style={{ color: 'var(--ink-2)', fontSize: '15px' }}>Total</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', color: 'var(--ink)' }}>${displayRate}</span>
              </div>

              {/* CTA */}
              {selectedTime ? (
                <Link href={bookingHref} style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
                  width: '100%', padding: '15px', borderRadius: '12px',
                  background: '#00BCC8', color: '#FFFFFF',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '16px',
                  cursor: 'pointer', marginBottom: '10px',
                }}>
                  Request session
                </Link>
              ) : (
                <div style={{
                  display: 'block', textAlign: 'center', boxSizing: 'border-box',
                  width: '100%', padding: '15px', borderRadius: '12px',
                  background: 'var(--surface-2)', color: 'var(--ink-3)',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '16px',
                  cursor: 'not-allowed', marginBottom: '10px',
                }}>
                  Request session
                </div>
              )}

              <Link href={`/dashboard/messages?withId=${profile_id}`} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
                width: '100%', padding: '15px', borderRadius: '12px',
                background: 'transparent', color: '#00BCC8',
                border: '1px solid rgba(0,188,200,0.4)',
                fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '16px',
                cursor: 'pointer', marginBottom: '12px',
              }}>
                Message trainer
              </Link>

              {/* Response time badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', border: '1px solid var(--line)',
                  borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  color: 'var(--ink-3)', background: 'var(--surface-2)',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Responds within 2 hrs
                </span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--ink-3)', margin: 0 }}>
                Free cancellation up to 24 hours before
              </p>

            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
