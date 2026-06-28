'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

// ── Greeting helper ────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
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

const IconHome = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconCalendar = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconDollarSign = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const IconUser = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ── Nav items ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'home', label: 'Home', Icon: IconHome },
  { key: 'schedule', label: 'Schedule', Icon: IconCalendar },
  { key: 'earnings', label: 'Earnings', Icon: IconDollarSign },
  { key: 'profile', label: 'Profile', Icon: IconUser },
]

// ── Stat tile ──────────────────────────────────────────────────────────────────

function StatTile({
  value,
  label,
  isEarnings,
  suffix,
  index,
  accentColor,
}: {
  value: string
  label: string
  isEarnings?: boolean
  suffix?: React.ReactNode
  index: number
  accentColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.08 }}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '130px',
        flexShrink: 0,
      }}
    >
      {isEarnings ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1px' }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '22px',
              color: T.ink3,
              paddingTop: '7px',
              lineHeight: 1,
            }}
          >
            $
          </span>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: '48px',
              color: T.ink,
              lineHeight: 1,
            }}
          >
            {value}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: '48px',
              color: T.ink,
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {suffix && (
            <span style={{ color: T.cyan, display: 'flex', alignItems: 'center' }}>
              {suffix}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: '12px',
          color: T.ink3,
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
          background: T.card,
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
          }}
        >
          No sessions today
        </div>
        <button
          style={{
            padding: '0 24px',
            height: '44px',
            background: T.cyan,
            color: '#FFFFFF',
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
        background: 'rgba(0,188,200,0.10)',
        border: `1px solid rgba(0,188,200,0.25)`,
        borderLeft: `4px solid ${T.cyan}`,
        borderRadius: '16px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
                fontWeight: 700,
                fontSize: '22px',
                color: T.ink,
                letterSpacing: '0.02em',
              }}
            >
              {session.childName}
            </span>
            <span
              style={{
                padding: '3px 10px',
                border: `1px solid rgba(0,188,200,0.25)`,
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
              fontSize: '14px',
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
              fontSize: '32px',
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
              color: T.ink3,
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
              background: T.cyanLight,
              border: `2px solid rgba(0,188,200,0.25)`,
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
              padding: '12px 20px',
              minHeight: '44px',
              background: T.cyan,
              color: '#FFFFFF',
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            View Details
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
              border: `1px solid ${isActive ? T.cyan : '#E5E7EB'}`,
              color: isActive ? '#FFFFFF' : T.ink3,
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
            {hasSessions ? (
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '999px',
                  background: T.cyan,
                  transition: 'background 0.15s',
                  flexShrink: 0,
                }}
              />
            ) : (
              <span style={{ width: '4px', height: '4px', flexShrink: 0 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Session list card ──────────────────────────────────────────────────────────

function SessionCard({ session, index }: { session: (typeof MOCK_SESSIONS)[0]; index: number }) {
  const badgeStyles: Record<string, { bg: string; color: string; border: string }> = {
    'IN-PERSON': {
      bg: 'rgba(0,188,200,0.1)',
      color: T.cyan,
      border: '1px solid rgba(0,188,200,0.2)',
    },
    REMOTE: {
      bg: 'rgba(99,102,241,0.1)',
      color: '#6366F1',
      border: '1px solid rgba(99,102,241,0.2)',
    },
  }
  const badge = badgeStyles[session.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        padding: '16px 20px',
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
              fontWeight: 700,
              fontSize: '18px',
              color: T.ink,
              letterSpacing: '0.01em',
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
                padding: '3px 10px',
                background: badge.bg,
                color: badge.color,
                border: badge.border,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.08em',
                borderRadius: '6px',
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
            background: T.cyan,
            border: 'none',
            color: '#FFFFFF',
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
            border: '1px solid rgba(0,0,0,0.12)',
            color: '#374151',
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
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: '22px',
          color: T.ink,
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
              fontWeight: 600,
              fontSize: '22px',
              color: T.ink,
            }}
          >
            ${weeklyAmount}
            <span style={{ fontSize: '13px', color: T.ink3, marginLeft: '4px', fontWeight: 400 }}>/ ${weeklyGoal}</span>
          </span>
        </div>
        <div
          style={{
            height: '6px',
            borderRadius: '999px',
            background: '#E5E7EB',
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
            fontWeight: 600,
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

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 500,
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: T.ink3,
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}
    >
      {children}
    </div>
  )
}

// ── Desktop sidebar ────────────────────────────────────────────────────────────

function Sidebar({
  active,
  onSelect,
  sidebarOpen,
  onToggle,
}: {
  active: string
  onSelect: (k: string) => void
  sidebarOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Wordmark + logo mark */}
      <div
        style={{
          padding: '24px 24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            background: T.cyan,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              color: '#FFFFFF',
              lineHeight: 1,
            }}
          >
            F
          </span>
        </div>
        {sidebarOpen && (
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: '22px',
              color: T.cyan,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            FARM
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '8px', flexShrink: 0 }} />

      {/* Nav items */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '8px 0',
          flex: 1,
        }}
      >
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: sidebarOpen ? '12px' : '0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                padding: sidebarOpen ? '10px 24px' : '10px 0',
                borderRadius: '10px',
                background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent',
                border: 'none',
                color: isActive ? T.cyan : T.ink2,
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                minHeight: '44px',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 20 }}>
                <Icon size={20} />
              </span>
              {sidebarOpen && (
                <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

      {/* Toggle button */}
      <button
        onClick={onToggle}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
        style={{
          width: '100%',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: sidebarOpen ? 'flex-end' : 'center',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          color: T.ink3,
          cursor: 'pointer',
          flexShrink: 0,
          minHeight: '44px',
          transition: 'background 0.15s',
        }}
      >
        {sidebarOpen ? (
          <ChevronLeft size={20} color={T.ink3} />
        ) : (
          <ChevronRight size={20} color={T.ink3} />
        )}
      </button>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

      {/* Trainer info pinned to bottom */}
      <div
        style={{
          padding: '16px 12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '999px',
            background: T.cyanLight,
            border: `2px solid ${T.cyanBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            color: T.cyan,
            flexShrink: 0,
          }}
        >
          MT
        </div>
        {sidebarOpen && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: T.ink,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}
            >
              Marcus Torres
            </div>
            <div
              style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '12px',
                color: T.ink3,
                whiteSpace: 'nowrap',
              }}
            >
              Trainer
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Desktop header ─────────────────────────────────────────────────────────────

function DesktopHeader({ sidebarOpen }: { sidebarOpen: boolean }) {
  return (
    <motion.header
      animate={{ left: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '64px',
        background: 'rgba(248,248,246,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        zIndex: 40,
      }}
    >
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
    </motion.header>
  )
}

// ── Mobile header with dropdown ────────────────────────────────────────────────

function MobileHeader({
  activeNav,
  onSelect,
}: {
  activeNav: string
  onSelect: (k: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 50,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            MT
          </div>
          <button
            onClick={() => setIsOpen((o) => !o)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#374151',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              padding: '12px',
              zIndex: 45,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              {NAV_ITEMS.map(({ key, label, Icon }) => {
                const isActive = key === activeNav
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSelect(key)
                      setIsOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(0,188,200,0.2)' : 'rgba(0,0,0,0.08)'}`,
                      color: isActive ? T.cyan : T.ink2,
                      cursor: 'pointer',
                      minHeight: '80px',
                    }}
                  >
                    <Icon size={22} />
                    <span
                      style={{
                        fontFamily: "'Hanken Grotesk', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerDashboardPage() {
  const [activeDay, setActiveDay] = useState('Mon')
  const [activeNav, setActiveNav] = useState('home')
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const nextSession = MOCK_SESSIONS.find((s) => s.isToday) ?? null
  const filteredSessions = MOCK_SESSIONS.filter((s) => s.day === activeDay)
  const sidebarWidth = isMobile ? 0 : sidebarOpen ? 240 : 72

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
          background: 'rgba(0,188,200,0.06)',
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
          left: isMobile ? '-100px' : '140px',
          width: '500px',
          height: '500px',
          borderRadius: '999px',
          background: 'rgba(99,102,241,0.06)',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Nav — sidebar on desktop, dropdown on mobile */}
      {isMobile ? (
        <MobileHeader activeNav={activeNav} onSelect={setActiveNav} />
      ) : (
        <>
          <Sidebar
            active={activeNav}
            onSelect={setActiveNav}
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((o) => !o)}
          />
          <DesktopHeader sidebarOpen={sidebarOpen} />
        </>
      )}

      {/* Scrollable main content */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: '64px',
          paddingBottom: '40px',
        }}
      >
        {/* Greeting */}
        <div style={{ padding: '24px 20px 0', marginBottom: '24px' }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: '28px',
              color: '#111827',
            }}
          >
            {getGreeting()}, Marcus.
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#9CA3AF',
              marginTop: '4px',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}
          >
            Here&apos;s your day at a glance.
          </div>
        </div>

        {/* Stat strip — horizontal scroll */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            padding: '0 20px',
            scrollbarWidth: 'none' as const,
          }}
        >
          <StatTile value="7" label="Sessions this week" index={0} accentColor="#6366F1" />
          <StatTile value="485" label="Earnings this week" isEarnings index={1} accentColor="#00BCC8" />
          <StatTile value="2" label="Upcoming today" index={2} accentColor="#F59E0B" />
          <StatTile value="4.9" label="Avg rating" index={3} suffix={<IconStar />} accentColor="#10B981" />
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
      </motion.main>
    </div>
  )
}
