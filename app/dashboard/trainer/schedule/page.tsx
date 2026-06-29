'use client'

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
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink }}>{day}</span>
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
                            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: T.ink }}>{session.childName}</div>
                            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{session.sport}</div>
                          </div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink, flexShrink: 0 }}>{session.time}</div>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', border: '1px dashed rgba(0,0,0,0.10)', borderRadius: '10px', fontSize: '13px', color: T.ink3, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif" }}>
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerSchedulePage() {
  return <ScheduleView />
}
