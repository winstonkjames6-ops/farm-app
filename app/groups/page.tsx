'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'

const D = {
  bg: '#09090B',
  surface: '#111113',
  border: 'rgba(255,255,255,0.08)',
  borderAccent: '#00BCC8',
  accent: '#00BCC8',
  accentDim: 'rgba(0,188,200,0.10)',
  muted: 'rgba(255,255,255,0.40)',
  text: '#F0F0F0',
}

const font = {
  heading: "'Barlow Condensed', sans-serif",
  body:    "'Hanken Grotesk', sans-serif",
}

const SPORT_FILTERS = ['All Sports', 'Soccer', 'Tennis', 'Basketball', 'Volleyball', 'Lacrosse']
const AGE_FILTERS   = ['All Ages', 'U10–U12', 'U12–U14', 'U14–U16', 'U16–U18']

const SESSIONS = [
  { id: 1, name: 'Marcus Reid',  initials: 'MR', sport: 'Soccer',     age: 'U12–U14', date: 'Monday, Jun 23',    time: '10:00 AM', spotsTotal: 6, spotsTaken: 3, price: 45, full: false },
  { id: 2, name: 'Lisa Chen',    initials: 'LC', sport: 'Tennis',     age: 'U10–U12', date: 'Wednesday, Jun 25', time: '9:00 AM',  spotsTotal: 6, spotsTaken: 5, price: 50, full: false },
  { id: 3, name: 'Darius Webb',  initials: 'DW', sport: 'Basketball', age: 'U14–U16', date: 'Saturday, Jun 28',  time: '2:00 PM',  spotsTotal: 6, spotsTaken: 6, price: 55, full: true  },
]

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        background: active ? D.accent : 'transparent',
        color: active ? D.bg : D.muted,
        border: active ? 'none' : `1px solid ${D.border}`,
        fontFamily: font.heading,
        fontWeight: 600,
        fontSize: '12px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        borderRadius: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function SpotDots({ total, taken }: { total: number; taken: number }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: 0,
            background: i < taken ? D.accent : D.border,
          }}
        />
      ))}
    </div>
  )
}

// Minimal SVG icons inlined — calendar and clock
function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={D.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="0" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={D.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function GroupsPage() {
  const [sportFilter, setSportFilter] = useState('All Sports')
  const [ageFilter, setAgeFilter]     = useState('All Ages')

  return (
    <div
      style={{
        background: D.bg,
        minHeight: '100vh',
        color: D.text,
        fontFamily: font.body,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: D.bg,
          borderBottom: `1px solid ${D.border}`,
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            padding: '0 32px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: font.heading,
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '0.06em',
              color: D.accent,
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            FARM
          </Link>
          <Link
            href="/search"
            style={{
              fontFamily: font.body,
              fontSize: '14px',
              fontWeight: 500,
              color: D.muted,
              textDecoration: 'none',
            }}
          >
            Find a trainer →
          </Link>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '72px 32px 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <h1
            style={{
              fontFamily: font.heading,
              fontWeight: 800,
              fontSize: '52px',
              lineHeight: 0.96,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: '0 0 14px',
              color: D.text,
            }}
          >
            Group{' '}
            <span style={{ color: D.accent }}>Training</span>
          </h1>
          <p
            style={{
              fontFamily: font.body,
              fontSize: '16px',
              color: D.muted,
              margin: 0,
              lineHeight: 1.55,
              maxWidth: '380px',
            }}
          >
            One trainer. Up to 6 athletes. Lower cost per family.
          </p>
        </motion.div>
      </section>

      {/* ── FILTER BAR ── */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 32px 40px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
        >
          {/* Sport filters */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '10px',
            }}
          >
            {SPORT_FILTERS.map((s) => (
              <FilterPill
                key={s}
                label={s}
                active={sportFilter === s}
                onClick={() => setSportFilter(s)}
              />
            ))}
          </div>

          {/* Age filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {AGE_FILTERS.map((a) => (
              <FilterPill
                key={a}
                label={a}
                active={ageFilter === a}
                onClick={() => setAgeFilter(a)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SESSION CARDS ── */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {SESSIONS.map((sess, i) => (
            <motion.div
              key={sess.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: D.surface,
                border: `1px solid ${D.border}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '20px',
              }}
            >
              {/* ── LEFT: Avatar + info ── */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  flexShrink: 0,
                  background: D.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: font.heading,
                    fontWeight: 700,
                    fontSize: '18px',
                    color: D.bg,
                    letterSpacing: '0.03em',
                  }}
                >
                  {sess.initials}
                </span>
              </div>

              {/* ── MIDDLE: Details ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Trainer name + sport badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: font.heading,
                      fontWeight: 600,
                      fontSize: '20px',
                      color: D.text,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {sess.name}
                  </span>
                  <span
                    style={{
                      fontFamily: font.heading,
                      fontWeight: 600,
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: D.accent,
                      background: D.accentDim,
                      padding: '3px 8px',
                      borderRadius: 0,
                    }}
                  >
                    {sess.sport}
                  </span>
                </div>

                {/* Date + time */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '13px',
                      color: D.muted,
                      fontFamily: font.body,
                    }}
                  >
                    <IconCalendar />
                    {sess.date}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '13px',
                      color: D.muted,
                      fontFamily: font.body,
                    }}
                  >
                    <IconClock />
                    {sess.time}
                  </span>
                </div>

                {/* Age group */}
                <div
                  style={{
                    fontSize: '13px',
                    color: D.muted,
                    fontFamily: font.body,
                    marginBottom: '14px',
                  }}
                >
                  Ages {sess.age}
                </div>

                {/* Spot visualization */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <SpotDots total={sess.spotsTotal} taken={sess.spotsTaken} />
                  {sess.full ? (
                    <span
                      style={{
                        fontFamily: font.heading,
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: D.accent,
                      }}
                    >
                      Fully Booked
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '13px',
                        color: D.muted,
                        fontFamily: font.body,
                      }}
                    >
                      {sess.spotsTotal - sess.spotsTaken} of {sess.spotsTotal} spots left
                    </span>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Price + CTA ── */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexShrink: 0,
                  minWidth: '130px',
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: font.heading,
                      fontWeight: 700,
                      fontSize: '26px',
                      color: D.text,
                      lineHeight: 1,
                      letterSpacing: '0.01em',
                    }}
                  >
                    ${sess.price}
                  </div>
                  <div
                    style={{
                      fontFamily: font.body,
                      fontSize: '12px',
                      color: D.muted,
                      marginTop: '3px',
                    }}
                  >
                    per athlete
                  </div>
                </div>

                {sess.full ? (
                  <button
                    type="button"
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: D.accent,
                      border: `1px solid ${D.accent}`,
                      fontFamily: font.heading,
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Waitlist
                  </button>
                ) : (
                  <button
                    type="button"
                    style={{
                      padding: '10px 20px',
                      background: D.accent,
                      color: D.bg,
                      border: 'none',
                      fontFamily: font.heading,
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Join Session
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
