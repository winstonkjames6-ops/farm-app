'use client'

import Link from 'next/link'

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  ink: '#111827',
  ink2: '#374151',
  ink3: '#6B7280',
  ink4: '#9CA3AF',
  line: '#E5E7EB',
  card: 'rgba(255,255,255,0.92)',
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const RECENT_SESSIONS = [
  { date: 'Jun 24, 2026', trainer: 'Marcus Rivera', sport: 'Soccer', duration: '60 min', stars: 5 },
  { date: 'Jun 17, 2026', trainer: 'Marcus Rivera', sport: 'Soccer', duration: '60 min', stars: 5 },
  { date: 'Jun 10, 2026', trainer: 'Ava Thompson',  sport: 'Soccer', duration: '45 min', stars: 5 },
]

// ── Subcomponents ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 600, fontSize: 11, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: T.ink4,
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.card,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Avatar({ initials, size = 40, fontSize = 15 }: { initials: string; size?: number; fontSize?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize, color: '#FFFFFF',
    }}>
      {initials}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChildProfilePage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(248,248,246,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '52px',
      }}>
        <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: T.ink3, minHeight: 44, minWidth: 44 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{
            width: 28, height: 28, borderRadius: 7, background: T.cyan,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 15, color: '#FFFFFF',
          }}>F</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: 18, color: T.ink, letterSpacing: '.02em' }}>FARM</span>
        </Link>
        <div style={{ width: 44 }} />
      </header>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* ── Section 1: Hero card ── */}
        <Card>
          {/* Cyan gradient band */}
          <div style={{ height: 72, background: 'linear-gradient(135deg, #00BCC8 0%, #00D4E2 100%)' }} />

          {/* Avatar + info */}
          <div style={{ padding: '0 20px 24px', marginTop: -40 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
              border: '3px solid #FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 28, color: '#FFFFFF',
              marginBottom: 12,
            }}>
              LC
            </div>

            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 24, color: T.ink, marginBottom: 10, letterSpacing: '-.02em' }}>
              Liam Chen
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <span style={{
                background: 'rgba(0,188,200,0.1)', color: T.cyan,
                border: '1px solid rgba(0,188,200,0.25)',
                borderRadius: 999, padding: '4px 12px',
                fontSize: 13, fontWeight: 600,
              }}>Soccer</span>
              <span style={{
                background: '#F3F4F6', color: T.ink3,
                border: '1px solid #E5E7EB',
                borderRadius: 999, padding: '4px 12px',
                fontSize: 13, fontWeight: 600,
              }}>Competitive</span>
            </div>

            {/* Stat strip */}
            <div style={{
              display: 'flex', gap: 0,
              borderTop: `1px solid ${T.line}`,
              paddingTop: 16,
            }}>
              {[
                { value: '12', label: 'Sessions' },
                { value: '2',  label: 'Sports' },
                { value: 'May 2026', label: 'Since' },
              ].map(({ value, label }, i) => (
                <div key={label} style={{
                  flex: 1, textAlign: 'center',
                  borderLeft: i > 0 ? `1px solid ${T.line}` : 'none',
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, color: T.ink, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: T.ink4, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Section 2: Upcoming session ── */}
        <Card style={{ marginTop: 16 }}>
          <div style={{ padding: '20px' }}>
            <SectionLabel>Next Session</SectionLabel>

            {/* Trainer row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Avatar initials="MR" size={44} fontSize={16} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>Marcus Rivera</div>
                <div style={{ fontSize: 13, color: T.ink3 }}>Soccer Trainer</div>
              </div>
            </div>

            {/* Date row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: 14, color: T.ink2, fontWeight: 500 }}>Mon, Jun 30 · 9:00 AM</span>
              <span style={{
                marginLeft: 'auto',
                background: 'rgba(0,188,200,0.1)', color: T.cyan,
                border: '1px solid rgba(0,188,200,0.2)',
                borderRadius: 999, padding: '3px 10px',
                fontSize: 12, fontWeight: 600,
              }}>In-Person</span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Link href="/dashboard/messages" style={{
                flex: 1, height: 44, borderRadius: 10,
                background: T.cyan, color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>
                View booking
              </Link>
              <Link href="/dashboard/messages" style={{
                flex: 1, height: 44, borderRadius: 10,
                background: 'transparent', color: T.cyan,
                border: `1.5px solid ${T.cyan}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>
                Message trainer
              </Link>
            </div>
          </div>
        </Card>

        {/* ── Section 3: Recent sessions ── */}
        <Card style={{ marginTop: 16 }}>
          <div style={{ padding: '20px' }}>
            <SectionLabel>Recent Sessions</SectionLabel>
            {RECENT_SESSIONS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingTop: i === 0 ? 0 : 14,
                paddingBottom: i === RECENT_SESSIONS.length - 1 ? 0 : 14,
                borderBottom: i < RECENT_SESSIONS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}>
                <Avatar initials={s.trainer.split(' ').map(w => w[0]).join('')} size={40} fontSize={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{s.trainer}</div>
                  <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{s.date} · {s.sport} · {s.duration}</div>
                </div>
                <div style={{ color: T.cyan, fontSize: 14, flexShrink: 0 }}>
                  {'★'.repeat(s.stars)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Section 4: CTA ── */}
        <div style={{ marginTop: 16 }}>
          <Link href="/dashboard/search" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: 52, borderRadius: 12,
            background: T.cyan, color: '#FFFFFF',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 16, textDecoration: 'none',
            letterSpacing: '0.03em',
          }}>
            Book another session
          </Link>
        </div>

      </div>
    </div>
  )
}
