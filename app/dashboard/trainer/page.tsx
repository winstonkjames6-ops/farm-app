'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_TRAINER = {
  name: 'Marcus Torres',
  initials: 'MT',
  sport: 'soccer',
}

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

const MOCK_MESSAGES = [
  {
    id: 1,
    parentName: 'Sarah Williams',
    parentInitials: 'SW',
    childName: 'Ethan Williams',
    sport: 'Soccer',
    lastMessage: "Will Ethan need to bring any equipment to Saturday's session?",
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    parentName: 'David Chen',
    parentInitials: 'DC',
    childName: 'Maya Chen',
    sport: 'Tennis',
    lastMessage: 'Thanks so much — Maya was so excited after the last session!',
    time: '1h ago',
    unread: false,
  },
  {
    id: 3,
    parentName: 'Lisa Blake',
    parentInitials: 'LB',
    childName: 'Jordan Blake',
    sport: 'Basketball',
    lastMessage: 'Can we move Tuesday to Wednesday this week?',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 4,
    parentName: 'Marcus Webb',
    parentInitials: 'MW',
    childName: 'Darius Webb',
    sport: 'Soccer',
    lastMessage: 'Booked — looking forward to it.',
    time: '2d ago',
    unread: false,
  },
]

const MOCK_EARNINGS = {
  pendingPayout: 212,
  nextPayoutDate: 'Friday, Jun 27',
  weeklyEarned: 340,
  weeklyGoal: 500,
  allTime: 4820,
  sessionRate: 65,
  history: [
    { id: 1, parentName: 'Sarah Williams', childName: 'Ethan Williams', sport: 'Soccer',
      date: 'Mon, Jun 23', amount: 65, status: 'pending' as const },
    { id: 2, parentName: 'David Chen', childName: 'Maya Chen', sport: 'Tennis',
      date: 'Mon, Jun 23', amount: 75, status: 'pending' as const },
    { id: 3, parentName: 'Lisa Blake', childName: 'Jordan Blake', sport: 'Basketball',
      date: 'Tue, Jun 17', amount: 55, status: 'paid' as const },
    { id: 4, parentName: 'Priya Nair', childName: 'Anika Nair', sport: 'Soccer',
      date: 'Sat, Jun 14', amount: 65, status: 'paid' as const },
    { id: 5, parentName: 'James Okafor', childName: 'Kofi Okafor', sport: 'Soccer',
      date: 'Wed, Jun 11', amount: 65, status: 'paid' as const },
  ],
}

const FULL_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ALL_SESSIONS_BY_DAY: Record<string, typeof MOCK_SESSIONS> = {
  Mon: MOCK_SESSIONS.filter(s => s.day === 'Mon'),
  Tue: MOCK_SESSIONS.filter(s => s.day === 'Tue'),
  Wed: [], Thu: [], Fri: [], Sat: [], Sun: [],
}

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

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatTodayDate() {
  const now = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`
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
  { key: 'home', label: 'Home', Icon: IconHome, badge: false },
  { key: 'schedule', label: 'Schedule', Icon: IconCalendar, badge: false },
  { key: 'earnings', label: 'Earnings', Icon: IconDollarSign, badge: false },
  { key: 'messages', label: 'Messages', Icon: MessageSquare, badge: true },
  { key: 'profile', label: 'Profile', Icon: IconUser, badge: false },
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
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '12px',
        padding: '20px 24px',
        minWidth: '140px',
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
          padding: '32px 24px',
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
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(8px)',
        border: `1px solid rgba(0,188,200,0.25)`,
        borderLeft: `4px solid ${T.cyan}`,
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
              background: isActive ? T.cyan : 'rgba(255,255,255,0.85)',
              border: `1px solid ${isActive ? T.cyan : 'rgba(0,0,0,0.15)'}`,
              color: isActive ? '#FFFFFF' : '#374151',
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
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
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
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(8px)',
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

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>
            This week
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '22px', color: T.ink }}>
            ${weeklyAmount}
            <span style={{ fontSize: '13px', color: T.ink3, marginLeft: '4px', fontWeight: 400 }}>/ ${weeklyGoal}</span>
          </span>
        </div>
        <div style={{ height: '6px', borderRadius: '999px', background: '#E5E7EB', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: '999px', background: T.cyan }}
          />
        </div>
      </div>

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
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, marginBottom: '2px' }}>
            Pending payout
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>
            Stripe payout Friday
          </div>
        </div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '22px', color: T.ink }}>
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
        fontWeight: 600,
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: '#111827',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}
    >
      {children}
    </div>
  )
}

// ── HomeView ───────────────────────────────────────────────────────────────────

function HomeView({
  activeDay,
  onDaySelect,
  nextSession,
  filteredSessions,
}: {
  activeDay: string
  onDaySelect: (d: string) => void
  nextSession: typeof MOCK_SESSIONS[0] | null
  filteredSessions: typeof MOCK_SESSIONS
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '28px', color: '#111827' }}>
            {getGreeting()}, Marcus.
          </div>
          <div style={{ fontSize: '14px', color: '#374151', marginTop: '4px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Here&apos;s your day at a glance.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none' as const }}>
          <StatTile value="7" label="Sessions this week" index={0} accentColor="#6366F1" />
          <StatTile value="485" label="Earnings this week" isEarnings index={1} accentColor="#00BCC8" />
          <StatTile value="2" label="Upcoming today" index={2} accentColor="#F59E0B" />
          <StatTile value="4.9" label="Avg rating" index={3} suffix={<IconStar />} accentColor="#10B981" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionLabel>Next Session</SectionLabel>
          <NextSessionCard session={nextSession} />

          <SectionLabel>Schedule</SectionLabel>
          <WeeklyStrip activeDay={activeDay} onDaySelect={onDaySelect} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredSessions.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px',
                color: T.ink3, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
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
      </div>
    </motion.div>
  )
}

// ── ScheduleView ───────────────────────────────────────────────────────────────

function ScheduleView() {
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
            7 sessions this week
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FULL_WEEK.map((day) => {
            const sessions = ALL_SESSIONS_BY_DAY[day] || []
            return (
              <div key={day} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: sessions.length > 0 ? '16px' : '0' }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink }}>
                    {day}
                  </span>
                  <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3 }}>
                    {sessions.length > 0 ? `${sessions.length} session${sessions.length > 1 ? 's' : ''}` : 'Available'}
                  </span>
                </div>

                {sessions.length > 0 ? (
                  <div>
                    {sessions.map((session, i) => (
                      <div key={session.id}>
                        {i > 0 && <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '12px 0' }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: T.ink }}>
                              {session.childName}
                            </div>
                            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>
                              {session.sport}
                            </div>
                          </div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink, flexShrink: 0 }}>
                            {session.time}
                          </div>
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '44px', border: '1px dashed rgba(0,0,0,0.10)', borderRadius: '10px',
                    fontSize: '13px', color: T.ink3, cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                  }}>
                    + Add availability
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ── EarningsView ───────────────────────────────────────────────────────────────

function EarningsView() {
  const progress = Math.min((MOCK_EARNINGS.weeklyEarned / MOCK_EARNINGS.weeklyGoal) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Payout summary */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>Pending payout</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '36px', color: T.ink, lineHeight: 1 }}>
                ${MOCK_EARNINGS.pendingPayout}
              </div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginTop: '2px' }}>
                Stripe payout {MOCK_EARNINGS.nextPayoutDate}
              </div>
            </div>
          </div>
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '16px 0' }} />
          <div style={{ display: 'flex' }}>
            {[
              { label: 'All time', value: `$${MOCK_EARNINGS.allTime.toLocaleString()}` },
              { label: 'This week', value: `$${MOCK_EARNINGS.weeklyEarned} / $${MOCK_EARNINGS.weeklyGoal}` },
              { label: 'Rate', value: `$${MOCK_EARNINGS.sessionRate}/hr` },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{
                flex: 1,
                paddingLeft: i > 0 ? '16px' : 0,
                paddingRight: i < arr.length - 1 ? '16px' : 0,
                borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none',
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', color: T.ink3,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px',
                }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '20px', color: T.ink }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly progress */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <SectionLabel>Weekly goal</SectionLabel>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ height: '6px', borderRadius: '999px', background: '#E5E7EB', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '999px', background: T.cyan }}
              />
            </div>
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>
            ${MOCK_EARNINGS.weeklyEarned} earned of ${MOCK_EARNINGS.weeklyGoal} goal
          </div>
        </div>

        {/* Payout history */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <SectionLabel>Payout history</SectionLabel>
          <div>
            {MOCK_EARNINGS.history.map((item, i) => (
              <div key={item.id}>
                {i > 0 && <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '999px', background: T.cyanLight, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: T.cyan,
                  }}>
                    {item.parentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink, fontWeight: 500 }}>
                      {item.childName}
                    </div>
                    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>
                      {item.parentName}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 8px', background: T.cyanLight, color: T.cyan,
                    border: '1px solid rgba(0,188,200,0.2)',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
                    letterSpacing: '0.06em', borderRadius: '6px', flexShrink: 0,
                  }}>
                    {item.sport}
                  </span>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3, flexShrink: 0 }}>
                    {item.date}
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink, flexShrink: 0 }}>
                    ${item.amount}
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    background: item.status === 'paid' ? 'rgba(34,197,94,0.10)' : T.cyanLight,
                    color: item.status === 'paid' ? '#16a34a' : T.cyan,
                    fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '11px',
                    borderRadius: '999px', flexShrink: 0,
                  }}>
                    {item.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── MessagesView ───────────────────────────────────────────────────────────────

function MessagesView() {
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const unreadCount = MOCK_MESSAGES.filter(m => m.unread).length
  const activeMessage = MOCK_MESSAGES.find(m => m.id === activeThread)

  if (activeThread !== null && activeMessage) {
    const mockConversation = [
      { from: 'parent', text: `Hi! Quick question about ${activeMessage.childName}'s upcoming session.` },
      { from: 'trainer', text: 'Of course! Happy to help. What\'s on your mind?' },
      { from: 'parent', text: activeMessage.lastMessage },
    ]
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div style={{ padding: '32px' }}>
          <button
            onClick={() => setActiveThread(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2,
              textAlign: 'left', padding: '0 0 16px 0', minHeight: '44px',
            }}
          >
            ← Messages
          </button>

          <div style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '999px', background: T.cyanLight, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.cyan,
                }}>
                  {activeMessage.parentInitials}
                </div>
                <div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink }}>
                    {activeMessage.parentName}
                  </div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>
                    {activeMessage.childName} · {activeMessage.sport}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                minHeight: '200px', overflowY: 'auto', padding: '16px 0',
              }}>
                {mockConversation.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'trainer' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: msg.from === 'trainer' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.from === 'trainer' ? T.cyan : T.card,
                      border: msg.from === 'trainer' ? 'none' : `1px solid ${T.border}`,
                      color: msg.from === 'trainer' ? '#FFFFFF' : T.ink,
                      fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', maxWidth: '72%',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex', gap: '8px', alignItems: 'center',
              padding: '16px 24px',
              borderTop: `1px solid ${T.border}`,
              background: T.card,
            }}>
              <input
                type="text"
                placeholder={`Message ${activeMessage.parentName}...`}
                style={{
                  flex: 1, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: '999px', padding: '12px 20px', fontSize: '16px',
                  fontFamily: "'Hanken Grotesk', sans-serif", outline: 'none',
                }}
              />
              <button style={{
                width: 44, height: 44, borderRadius: '999px', flexShrink: 0,
                background: T.cyan, color: '#FFFFFF', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink }}>
            Messages
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginTop: '4px' }}>
            {unreadCount} unread
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {MOCK_MESSAGES.map((message) => (
            <div
              key={message.id}
              onClick={() => setActiveThread(message.id)}
              style={{
                background: T.card,
                border: `1px solid ${message.unread ? 'rgba(0,188,200,0.20)' : T.border}`,
                borderRadius: '14px', padding: '16px 20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '999px', background: T.cyanLight, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.cyan,
              }}>
                {message.parentInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink, marginBottom: '2px' }}>
                  {message.parentName}
                </div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginBottom: '4px' }}>
                  {message.childName} · {message.sport}
                </div>
                <div style={{
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {message.lastMessage}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>
                  {message.time}
                </span>
                {message.unread && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.cyan }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Desktop sidebar ────────────────────────────────────────────────────────────

function Sidebar({
  active,
  onSelect,
  sidebarOpen,
  onToggle,
  isProfilePage,
}: {
  active: string
  onSelect: (k: string) => void
  sidebarOpen: boolean
  onToggle: () => void
  isProfilePage: boolean
}) {
  const todaySessions = MOCK_SESSIONS.filter((s) => s.isToday).length
  const weeklyDone = 7
  const weeklyGoal = 10

  return (
    <motion.div
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
        overflow: 'visible',
      }}
    >
      {/* Inner content — clips sidebar body */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(0,0,0,0.08)',
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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', flexShrink: 0 }}>
          {NAV_ITEMS.map(({ key, label, Icon, badge }) => {
            const isActive = isProfilePage ? key === 'profile' : key === active
            const navStyle = {
              position: 'relative' as const,
              display: 'flex' as const,
              alignItems: 'center' as const,
              gap: sidebarOpen ? '12px' : '0',
              justifyContent: (sidebarOpen ? 'flex-start' : 'center') as 'flex-start' | 'center',
              padding: sidebarOpen ? '14px 24px' : '14px 0',
              borderRadius: '10px',
              background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent',
              color: isActive ? T.cyan : T.ink2,
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              width: '100%',
              minHeight: '44px',
              transition: 'background 0.15s',
              flexShrink: 0,
            }
            const navContent = (
              <>
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 20 }}>
                  <Icon size={20} />
                </span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {badge && (
                  <span style={{ position: 'absolute', top: '10px', right: '20px', width: '8px', height: '8px', borderRadius: '50%', background: '#00BCC8', flexShrink: 0 }} />
                )}
              </>
            )
            if (key === 'profile') {
              return (
                <Link
                  key={key}
                  href="/dashboard/trainer/profile"
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = '#F3F4F6' }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                  style={{ textDecoration: 'none', cursor: 'pointer', ...navStyle }}
                >
                  {navContent}
                </Link>
              )
            }
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6' }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                style={{ border: 'none', cursor: 'pointer', textAlign: 'left', ...navStyle }}
              >
                {navContent}
              </button>
            )
          })}
        </nav>

        {/* Today section — fills remaining space */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {/* Divider with margin */}
          <div style={{ height: '1px', background: '#E5E7EB', margin: '16px 0', flexShrink: 0 }} />

          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* TODAY label */}
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  color: T.ink3,
                  textTransform: 'uppercase',
                  padding: '0 24px',
                  marginBottom: '12px',
                }}
              >
                Today
              </div>

              {/* Date line */}
              <div
                style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '13px',
                  color: '#374151',
                  padding: '0 24px',
                  marginBottom: '4px',
                }}
              >
                {formatTodayDate()}
              </div>

              {/* Sessions row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 24px',
                  color: T.cyan,
                }}
              >
                <IconCalendar size={16} />
                <span
                  style={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '13px',
                    color: '#374151',
                  }}
                >
                  {todaySessions} sessions today
                </span>
              </div>

              {/* Weekly goal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 24px',
                }}
              >
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>
                  Weekly goal
                </span>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>
                  {weeklyDone}/{weeklyGoal}
                </span>
              </div>
              <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden', margin: '6px 24px 0' }}>
                <div
                  style={{
                    width: `${(weeklyDone / weeklyGoal) * 100}%`,
                    height: '100%',
                    background: T.cyan,
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', color: T.cyan }}>
              <IconCalendar size={16} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

        {/* Trainer info */}
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
            {MOCK_TRAINER.initials}
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
                {MOCK_TRAINER.name}
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
      </div>

      {/* Protruding toggle tab */}
      <button
        onClick={onToggle}
        onMouseEnter={(e) => {
          const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg')
          if (icon) icon.style.color = '#374151'
        }}
        onMouseLeave={(e) => {
          const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg')
          if (icon) icon.style.color = T.ink3
        }}
        style={{
          position: 'absolute',
          right: '-16px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '48px',
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          padding: 0,
        }}
      >
        {sidebarOpen ? (
          <ChevronLeft size={14} color={T.ink3} />
        ) : (
          <ChevronRight size={14} color={T.ink3} />
        )}
      </button>
    </motion.div>
  )
}

// ── Desktop header ─────────────────────────────────────────────────────────────

function DesktopHeader({ sidebarOpen }: { sidebarOpen: boolean }) {
  return (
    <motion.header
      animate={{ left: sidebarOpen ? 240 : 72, width: `calc(100% - ${sidebarOpen ? 240 : 72}px)` }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '52px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 40,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: T.ink3, display: 'flex', alignItems: 'center' }}>
          <IconHome size={16} />
        </span>
        <span
          style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '14px',
            color: '#374151',
            fontWeight: 500,
          }}
        >
          Dashboard
        </span>
      </div>

      {/* Actions */}
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
          height: '52px',
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
              top: '52px',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              padding: '12px',
              zIndex: 45,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {NAV_ITEMS.map(({ key, label, Icon }) => {
                const isActive = key === activeNav
                const mobileStyle = {
                  display: 'flex' as const,
                  flexDirection: 'column' as const,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(0,188,200,0.2)' : 'rgba(0,0,0,0.08)'}`,
                  color: isActive ? T.cyan : T.ink2,
                  cursor: 'pointer',
                  minHeight: '80px',
                }
                const mobileContent = (
                  <>
                    <Icon size={22} />
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 500 }}>
                      {label}
                    </span>
                  </>
                )
                if (key === 'profile') {
                  return (
                    <Link
                      key={key}
                      href="/dashboard/trainer/profile"
                      onClick={() => setIsOpen(false)}
                      style={{ textDecoration: 'none', ...mobileStyle }}
                    >
                      {mobileContent}
                    </Link>
                  )
                }
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSelect(key)
                      setIsOpen(false)
                    }}
                    style={mobileStyle}
                  >
                    {mobileContent}
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
  const searchParams = useSearchParams()
  const [activeDay, setActiveDay] = useState('Mon')
  const [activeNav, setActiveNav] = useState(() => {
    return searchParams.get('tab') ?? 'home'
  })
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
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Fixed background image layer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url('/backgrounds/${MOCK_TRAINER.sport}.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Fixed overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: 'rgba(248,248,246,0.60)',
          pointerEvents: 'none',
        }}
      />

      {/* Nav */}
      {isMobile ? (
        <MobileHeader activeNav={activeNav} onSelect={setActiveNav} />
      ) : (
        <>
          <Sidebar
            active={activeNav}
            onSelect={setActiveNav}
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((o) => !o)}
            isProfilePage={false}
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
          zIndex: 2,
          paddingTop: '52px',
          paddingBottom: '40px',
        }}
      >
        {activeNav === 'home' && (
          <HomeView
            activeDay={activeDay}
            onDaySelect={setActiveDay}
            nextSession={nextSession}
            filteredSessions={filteredSessions}
          />
        )}
        {activeNav === 'schedule' && <ScheduleView />}
        {activeNav === 'earnings' && <EarningsView />}
        {activeNav === 'messages' && <MessagesView />}
      </motion.main>
    </div>
  )
}
