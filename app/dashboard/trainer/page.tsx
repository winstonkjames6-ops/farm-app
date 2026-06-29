'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

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

// ── Icons ──────────────────────────────────────────────────────────────────────

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
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: T.ink3, paddingTop: '7px', lineHeight: 1 }}>$</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '48px', color: T.ink, lineHeight: 1 }}>{value}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '48px', color: T.ink, lineHeight: 1 }}>{value}</span>
          {suffix && <span style={{ color: T.cyan, display: 'flex', alignItems: 'center' }}>{suffix}</span>}
        </div>
      )}
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginTop: '6px' }}>{label}</div>
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
        style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
      >
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px', color: T.ink2 }}>
          No sessions today
        </div>
        <button style={{ padding: '0 24px', height: '44px', background: T.cyan, color: '#FFFFFF', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.06em', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
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
      style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', border: `1px solid rgba(0,188,200,0.25)`, borderLeft: `4px solid ${T.cyan}`, borderRadius: '16px', padding: '24px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: T.ink, letterSpacing: '0.02em' }}>{session.childName}</span>
            <span style={{ padding: '3px 10px', border: `1px solid rgba(0,188,200,0.25)`, color: T.cyan, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', borderRadius: '999px' }}>{session.type}</span>
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginBottom: '12px' }}>{session.sport}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '32px', color: T.ink, lineHeight: 1, letterSpacing: '-0.01em' }}>{session.time}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}>
            {session.type === 'REMOTE' ? <IconVideo /> : <IconMapPin />}
            {session.location}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: '999px', background: T.cyanLight, border: `2px solid rgba(0,188,200,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.cyan }}>
            {session.parentInitials}
          </div>
          <button style={{ padding: '12px 20px', minHeight: '44px', background: T.cyan, color: '#FFFFFF', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Weekly schedule strip ──────────────────────────────────────────────────────

function WeeklyStrip({ activeDay, onDaySelect }: { activeDay: string; onDaySelect: (d: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' as const }}>
      {DAYS.map((day) => {
        const isActive = day === activeDay
        const hasSessions = DAYS_WITH_SESSIONS.has(day)
        return (
          <button
            key={day}
            onClick={() => onDaySelect(day)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '999px', background: isActive ? T.cyan : 'rgba(255,255,255,0.85)', border: `1px solid ${isActive ? T.cyan : 'rgba(0,0,0,0.15)'}`, color: isActive ? '#FFFFFF' : '#374151', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em', cursor: 'pointer', flexShrink: 0, minHeight: '44px', transition: 'background 0.15s, border-color 0.15s, color 0.15s' }}
          >
            {day}
            {hasSessions ? (
              <span style={{ width: '4px', height: '4px', borderRadius: '999px', background: T.cyan, flexShrink: 0 }} />
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
    'IN-PERSON': { bg: 'rgba(0,188,200,0.1)', color: T.cyan, border: '1px solid rgba(0,188,200,0.2)' },
    REMOTE:      { bg: 'rgba(99,102,241,0.1)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.2)' },
  }
  const badge = badgeStyles[session.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px', color: T.ink, letterSpacing: '0.01em', marginBottom: '4px' }}>{session.childName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{session.sport}</span>
            <span style={{ padding: '3px 10px', background: badge.bg, color: badge.color, border: badge.border, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', borderRadius: '6px' }}>{session.type}</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px', color: T.ink, flexShrink: 0 }}>{session.time}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}>
          {session.type === 'REMOTE' ? <IconVideo /> : <IconMapPin />}
          {session.location}
        </div>
        <button style={{ width: '44px', height: '44px', borderRadius: '999px', background: 'transparent', border: `1px solid ${T.border}`, color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <IconMessageCircle />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${T.border}`, paddingTop: '12px' }}>
        <button style={{ flex: 1, height: '44px', background: T.cyan, border: 'none', color: '#FFFFFF', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <IconCheckCircle />
          MARK COMPLETE
        </button>
        <button style={{ flex: 1, height: '44px', background: 'transparent', border: '1px solid rgba(0,0,0,0.12)', color: '#374151', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px', cursor: 'pointer' }}>
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
      style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: T.ink }}>Earnings</div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>This week</span>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${T.border}`, paddingTop: '14px' }}>
        <div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, marginBottom: '2px' }}>Pending payout</div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>Stripe payout Friday</div>
        </div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '22px', color: T.ink }}>${pending}</span>
      </div>
    </motion.div>
  )
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: '#111827', textTransform: 'uppercase', marginBottom: '12px' }}>
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
              <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerHomePage() {
  const [activeDay, setActiveDay] = useState('Mon')
  const nextSession = MOCK_SESSIONS.find((s) => s.isToday) ?? null
  const filteredSessions = MOCK_SESSIONS.filter((s) => s.day === activeDay)

  return (
    <HomeView
      activeDay={activeDay}
      onDaySelect={setActiveDay}
      nextSession={nextSession}
      filteredSessions={filteredSessions}
    />
  )
}
