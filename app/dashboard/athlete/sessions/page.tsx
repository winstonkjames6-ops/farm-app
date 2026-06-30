'use client'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  cyan: '#00BCC8',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const UPCOMING = [
  { date: 'Mon Jun 30', trainer: 'Marcus Rivera', sport: 'Soccer', time: '9:00 AM',  format: 'In-Person' },
  { date: 'Wed Jul 2',  trainer: 'Marcus Rivera', sport: 'Soccer', time: '4:00 PM',  format: 'In-Person' },
]

const PAST = [
  { date: 'Jun 23', trainer: 'Marcus Rivera', sport: 'Soccer', time: '9:00 AM', format: 'In-Person', rating: 5 },
  { date: 'Jun 16', trainer: 'Marcus Rivera', sport: 'Soccer', time: '9:00 AM', format: 'In-Person', rating: 5 },
  { date: 'Jun 9',  trainer: 'Marcus Rivera', sport: 'Soccer', time: '4:00 PM', format: 'Remote',    rating: 5 },
  { date: 'Jun 2',  trainer: 'Marcus Rivera', sport: 'Soccer', time: '9:00 AM', format: 'In-Person', rating: 4 },
  { date: 'May 26', trainer: 'Marcus Rivera', sport: 'Soccer', time: '9:00 AM', format: 'In-Person', rating: 5 },
]

// ── Stars ──────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center', flexShrink: 0 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24">
          <polygon
            points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1"
            fill={i <= rating ? T.cyan : 'rgba(0,0,0,0.10)'}
          />
        </svg>
      ))}
    </span>
  )
}

// ── Sport badge ────────────────────────────────────────────────────────────────

function SportBadge({ sport }: { sport: string }) {
  return (
    <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.06)', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '11px', padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
      {sport}
    </span>
  )
}

// ── Chevron ────────────────────────────────────────────────────────────────────

const IconChevron = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// ── Shared card style ──────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: '16px',
  padding: '20px',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: T.ink3,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Section 1 — Upcoming sessions */}
        <div style={glassCard}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={sectionLabel}>UPCOMING SESSIONS</span>
            <span style={{ background: 'rgba(0,188,200,0.1)', color: '#00BCC8', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              2
            </span>
          </div>

          {UPCOMING.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 0',
                borderBottom: i < UPCOMING.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                minHeight: '44px',
                cursor: 'pointer',
              }}
            >
              {/* Date + trainer */}
              <div style={{ flex: '0 0 130px', minWidth: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.ink, lineHeight: 1.2 }}>{s.date}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, marginTop: '2px' }}>{s.trainer}</div>
              </div>

              {/* Sport badge */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <SportBadge sport={s.sport} />
              </div>

              {/* Time + format */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{s.time}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3, marginTop: '2px' }}>{s.format}</div>
              </div>

              {/* Chevron */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <IconChevron />
              </div>
            </div>
          ))}
        </div>

        {/* Section 2 — Past sessions */}
        <div style={{ ...glassCard, marginTop: '16px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={sectionLabel}>PAST SESSIONS</span>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>12 total</span>
          </div>

          {PAST.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 0',
                borderBottom: i < PAST.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                minHeight: '44px',
              }}
            >
              {/* Date + trainer */}
              <div style={{ flex: '0 0 130px', minWidth: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.ink, lineHeight: 1.2 }}>{s.date}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, marginTop: '2px' }}>{s.trainer}</div>
              </div>

              {/* Sport badge */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <SportBadge sport={s.sport} />
              </div>

              {/* Time + format */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>{s.time}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3, marginTop: '2px' }}>{s.format}</div>
              </div>

              {/* Star rating */}
              <div style={{ flexShrink: 0 }}>
                <Stars rating={s.rating} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
