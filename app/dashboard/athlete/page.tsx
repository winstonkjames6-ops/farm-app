'use client'

import Link from 'next/link'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const RECENT_SESSIONS = [
  { date: 'Jun 23', trainer: 'Marcus Rivera', sport: 'Soccer', rating: 5 },
  { date: 'Jun 16', trainer: 'Marcus Rivera', sport: 'Soccer', rating: 5 },
  { date: 'Jun 9',  trainer: 'Marcus Rivera', sport: 'Soccer', rating: 4 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconCalendar = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

// ── Stars ──────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24">
          <polygon
            points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1"
            fill={i <= rating ? T.cyan : 'rgba(0,0,0,0.10)'}
          />
        </svg>
      ))}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AthletePage() {
  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  }

  const sectionLabel: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: T.ink3,
    marginBottom: '16px',
    display: 'block',
  }

  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Section 1 — Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '32px', color: T.ink, margin: '0 0 6px', lineHeight: 1.1 }}>
            {getGreeting()}, Liam
          </h1>
          <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, margin: 0 }}>
            Here&apos;s what&apos;s coming up
          </p>
        </div>

        {/* Section 2 — Next session card */}
        <div style={glassCard}>
          <span style={sectionLabel}>NEXT SESSION</span>

          {/* Trainer row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '999px', background: T.cyanLight, border: `2px solid ${T.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.cyan, flexShrink: 0 }}>
              MR
            </div>
            <div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink, lineHeight: 1.2 }}>Marcus Rivera</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>Soccer Trainer</div>
            </div>
          </div>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: T.ink2 }}>
            <IconCalendar size={14} />
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}>Mon, Jun 30 · 9:00 AM</span>
          </div>

          {/* Type badge */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(0,188,200,0.1)', color: '#00BCC8', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 12px', borderRadius: '999px' }}>
              In-Person
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/dashboard/athlete/messages"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#00BCC8', color: '#FFFFFF', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', textDecoration: 'none', borderRadius: '10px', minHeight: '44px' }}
            >
              View details
            </Link>
            <Link
              href="/dashboard/athlete/messages"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#00BCC8', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', textDecoration: 'none', borderRadius: '10px', minHeight: '44px', border: '1.5px solid #00BCC8' }}
            >
              Message trainer
            </Link>
          </div>
        </div>

        {/* Section 3 — Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[
            { value: '12',   label: 'Sessions'    },
            { value: '4.9★', label: 'Avg Rating'  },
            { value: '3',    label: 'Weeks active' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '16px',
                padding: '16px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '28px', color: '#00BCC8', lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Section 4 — Recent sessions */}
        <div style={{ ...glassCard, marginBottom: 0 }}>
          <span style={sectionLabel}>RECENT SESSIONS</span>
          {RECENT_SESSIONS.map((session, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: i < RECENT_SESSIONS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                minHeight: '44px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, width: '48px', flexShrink: 0 }}>{session.date}</span>
                <div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 500, color: T.ink }}>{session.trainer}</div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{session.sport}</div>
                </div>
              </div>
              <Stars rating={session.rating} />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
