'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  {
    id: 1,
    childName: 'Ethan Williams',
    parentName: 'Sarah Williams',
    parentInitials: 'SW',
    sport: 'Soccer',
    type: 'IN-PERSON' as const,
    day: 'Mon',
    time: '9:00 AM',
    location: 'Green Valley Park',
    isToday: true,
  },
  {
    id: 2,
    childName: 'Maya Chen',
    parentName: 'David Chen',
    parentInitials: 'DC',
    sport: 'Tennis',
    type: 'REMOTE' as const,
    day: 'Mon',
    time: '11:30 AM',
    location: 'Zoom',
    isToday: true,
  },
  {
    id: 3,
    childName: 'Jordan Blake',
    parentName: 'Lisa Blake',
    parentInitials: 'LB',
    sport: 'Basketball',
    type: 'IN-PERSON' as const,
    day: 'Tue',
    time: '4:00 PM',
    location: 'Riverside Courts',
    isToday: false,
  },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_WITH_SESSIONS = new Set(['Mon', 'Tue'])

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#09090B',
  cyan: '#00BCC8',
  cyanDim: 'rgba(0,188,200,0.08)',
  cyanBorder: 'rgba(0,188,200,0.2)',
  glass: 'rgba(255,255,255,0.05)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  ink: '#FAFAFA',
  ink2: '#A1A1AA',
  ink3: '#52525B',
}

// ── Icons (Lucide-style inline SVG) ───────────────────────────────────────────

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

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

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconDollarSign = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

// ── Stat tile ──────────────────────────────────────────────────────────────────

function StatTile({
  value,
  label,
  prefix,
  suffix,
  index,
}: {
  value: string
  label: string
  prefix?: string
  suffix?: React.ReactNode
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.08 }}
      style={{
        background: T.glass2,
        border: `1px solid ${T.border}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '128px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        {prefix && (
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              color: T.ink2,
            }}
          >
            {prefix}
          </span>
        )}
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: '32px',
            color: T.ink,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {suffix && (
          <span style={{ color: T.cyan, marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
            {suffix}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: '12px',
          color: T.ink2,
          marginTop: '6px',
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}

// ── Next session hero card ─────────────────────────────────────────────────────

function NextSessionCard({ session }: { session: (typeof MOCK_SESSIONS)[0] | null }) {
  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: T.glass2,
          border: `1px solid ${T.border}`,
          borderRadius: '16px',
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            color: T.ink2,
            letterSpacing: '0.04em',
          }}
        >
          No sessions today
        </div>
        <button
          style={{
            padding: '0 24px',
            height: '44px',
            background: T.cyan,
            color: '#09090B',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.06em',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          SET AVAILABILITY
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: T.cyanDim,
        border: `1px solid ${T.cyanBorder}`,
        borderRadius: '16px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        {/* Left: child + time info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                color: T.ink,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {session.childName}
            </span>
            <span
              style={{
                padding: '3px 10px',
                border: `1px solid ${T.cyanBorder}`,
                color: T.cyan,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.1em',
                borderRadius: '999px',
              }}
            >
              {session.type}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px',
              color: T.ink2,
              marginBottom: '12px',
            }}
          >
            {session.sport}
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '28px',
              color: T.ink,
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {session.time}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginTop: '6px',
              color: T.ink2,
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px',
            }}
          >
            {session.type === 'REMOTE' ? <IconVideo /> : <IconMapPin />}
            {session.location}
          </div>
        </div>

        {/* Right: avatar + CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '999px',
              background: 'rgba(0,188,200,0.15)',
              border: `2px solid ${T.cyanBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              color: T.cyan,
            }}
          >
            {session.parentInitials}
          </div>
          <button
            style={{
              padding: '0 20px',
              height: '44px',
              background: T.cyan,
              color: '#09090B',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.06em',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Weekly schedule strip ──────────────────────────────────────────────────────

function WeeklyStrip({
  activeDay,
  onDaySelect,
}: {
  activeDay: string
  onDaySelect: (d: string) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none' as const,
      }}
    >
      {DAYS.map((day) => {
        const isActive = day === activeDay
        const hasSessions = DAYS_WITH_SESSIONS.has(day)
        return (
          <button
            key={day}
            onClick={() => onDaySelect(day)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 14px',
              borderRadius: '999px',
              background: isActive ? T.cyan : 'transparent',
              border: `1px solid ${isActive ? T.cyan : T.border}`,
              color: isActive ? '#09090B' : T.ink2,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: '44px',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
          >
            {day}
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '999px',
                background: isActive ? '#09090B' : hasSessions ? T.cyan : 'transparent',
                transition: 'background 0.15s',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}

// ── Session list card ──────────────────────────────────────────────────────────

function SessionCard({ session, index }: { session: (typeof MOCK_SESSIONS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      style={{
        background: T.glass,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: '18px',
              color: T.ink,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            {session.childName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '13px',
                color: T.ink2,
              }}
            >
              {session.sport}
            </span>
            <span
              style={{
                padding: '2px 8px',
                border: `1px solid ${T.border}`,
                color: T.ink2,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.08em',
                borderRadius: '4px',
              }}
            >
              {session.type}
            </span>
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            color: T.ink,
            flexShrink: 0,
          }}
        >
          {session.time}
        </div>
      </div>

      {/* Location + message row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: T.ink2,
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '13px',
          }}
        >
          {session.type === 'REMOTE' ? <IconVideo /> : <IconMapPin />}
          {session.location}
        </div>
        <button
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '999px',
            background: 'transparent',
            border: `1px solid ${T.border}`,
            color: T.ink2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <IconMessageCircle />
        </button>
      </div>

      {/* Action row */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderTop: `1px solid ${T.border}`,
          paddingTop: '12px',
        }}
      >
        <button
          style={{
            flex: 1,
            height: '44px',
            background: 'transparent',
            border: `1px solid ${T.border}`,
            color: T.cyan,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.08em',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <IconCheckCircle />
          MARK COMPLETE
        </button>
        <button
          style={{
            flex: 1,
            height: '44px',
            background: 'transparent',
            border: `1px solid ${T.border}`,
            color: T.ink2,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.08em',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          MESSAGE PARENT
        </button>
      </div>
    </motion.div>
  )
}

// ── Earnings card ──────────────────────────────────────────────────────────────

function EarningsCard() {
  const weeklyAmount = 340
  const weeklyGoal = 500
  const pending = 212
  const progress = Math.min((weeklyAmount / weeklyGoal) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      style={{
        background: T.glass,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${T.border}`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: '20px',
          color: T.ink,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Earnings
      </div>

      {/* This week */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px',
              color: T.ink2,
            }}
          >
            This week
          </span>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '22px',
              color: T.ink,
            }}
          >
            ${weeklyAmount}
            <span style={{ fontSize: '13px', color: T.ink3, marginLeft: '4px' }}>/ ${weeklyGoal}</span>
          </span>
        </div>
        <div
          style={{
            height: '4px',
            borderRadius: '999px',
            background: T.border,
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: '999px',
              background: T.cyan,
            }}
          />
        </div>
      </div>

      {/* Pending payout */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${T.border}`,
          paddingTop: '14px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px',
              color: T.ink2,
              marginBottom: '2px',
            }}
          >
            Pending payout
          </div>
          <div
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '12px',
              color: T.ink3,
            }}
          >
            Stripe payout Friday
          </div>
        </div>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '22px',
            color: T.ink,
          }}
        >
          ${pending}
        </span>
      </div>
    </motion.div>
  )
}

// ── Bottom nav (tubelight) ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'home', label: 'Home', Icon: IconHome },
  { key: 'schedule', label: 'Schedule', Icon: IconCalendar },
  { key: 'earnings', label: 'Earnings', Icon: IconDollarSign },
  { key: 'profile', label: 'Profile', Icon: IconUser },
]

function BottomNav({
  active,
  onSelect,
}: {
  active: string
  onSelect: (k: string) => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(9,9,11,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              background: 'transparent',
              border: 'none',
              color: isActive ? T.cyan : T.ink3,
              cursor: 'pointer',
              padding: '6px 16px',
              minHeight: '44px',
              minWidth: '44px',
              position: 'relative',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-tubelight"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '36px',
                  height: '2px',
                  borderRadius: '999px',
                  background: T.cyan,
                  boxShadow: `0 0 10px ${T.cyan}, 0 0 20px rgba(0,188,200,0.4)`,
                }}
              />
            )}
            <Icon />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.06em',
              }}
            >
              {label.toUpperCase()}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: '11px',
        letterSpacing: '0.12em',
        color: T.ink3,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerDashboardPage() {
  const [activeDay, setActiveDay] = useState('Mon')
  const [activeNav, setActiveNav] = useState('home')

  const nextSession = MOCK_SESSIONS.find((s) => s.isToday) ?? null
  const filteredSessions = MOCK_SESSIONS.filter((s) => s.day === activeDay)

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative' }}>

      {/* Ambient orb — cyan, top-right */}
      <div
        style={{
          position: 'fixed',
          top: '-100px',
          right: '-100px',
          width: '600px',
          height: '600px',
          borderRadius: '999px',
          background: 'rgba(0,188,200,0.08)',
          filter: 'blur(120px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient orb — indigo, bottom-left */}
      <div
        style={{
          position: 'fixed',
          bottom: '-100px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '999px',
          background: 'rgba(99,102,241,0.06)',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Fixed top header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(9,9,11,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 40,
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: '22px',
            color: T.cyan,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          FARM
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: T.ink2,
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconBell />
          </button>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '999px',
              background: T.cyan,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: '13px',
              color: '#09090B',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            MT
          </div>
        </div>
      </header>

      {/* Scrollable main content */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: '64px',
          paddingBottom: '80px',
        }}
      >
        {/* Stat strip — horizontal scroll */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            padding: '20px 20px 0',
            scrollbarWidth: 'none' as const,
          }}
        >
          <StatTile value="7" label="Sessions this week" index={0} />
          <StatTile value="485" label="Earnings this week" prefix="$" index={1} />
          <StatTile value="2" label="Upcoming today" index={2} />
          <StatTile
            value="4.9"
            label="Avg rating"
            index={3}
            suffix={<IconStar />}
          />
        </div>

        {/* Content area */}
        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <SectionLabel>Next Session</SectionLabel>
          <NextSessionCard session={nextSession} />

          <SectionLabel>Schedule</SectionLabel>
          <WeeklyStrip activeDay={activeDay} onDaySelect={setActiveDay} />

          {/* Session list for selected day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredSessions.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '15px',
                  color: T.ink3,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                No sessions on {activeDay}
              </div>
            ) : (
              filteredSessions.map((session, i) => (
                <SessionCard key={session.id} session={session} index={i} />
              ))
            )}
          </div>

          <SectionLabel>Summary</SectionLabel>
          <EarningsCard />
        </div>
      </main>

      {/* Bottom tubelight nav */}
      <BottomNav active={activeNav} onSelect={setActiveNav} />
    </div>
  )
}
