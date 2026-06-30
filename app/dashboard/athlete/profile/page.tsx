'use client'

import Link from 'next/link'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  cyan: '#00BCC8',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: '16px',
  overflow: 'hidden',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: T.ink3,
  display: 'block',
  marginBottom: '4px',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Section 1 — Profile hero card */}
        <div style={glassCard}>
          {/* Cyan gradient header band */}
          <div style={{ height: '80px', background: 'linear-gradient(135deg, rgba(0,188,200,0.15) 0%, rgba(0,212,226,0.08) 100%)' }} />

          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '999px',
            background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: '#FFFFFF',
            marginTop: '-36px', marginLeft: '24px',
            border: '3px solid rgba(255,255,255,0.9)',
            flexShrink: 0,
          }}>
            LC
          </div>

          {/* Name */}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '24px', color: T.ink, marginTop: '8px', padding: '0 24px', lineHeight: 1.2 }}>
            Liam Chen
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 24px' }}>
            <span style={{ background: 'rgba(0,188,200,0.1)', color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
              Soccer
            </span>
            <span style={{ background: 'rgba(0,0,0,0.06)', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
              Age 13
            </span>
            <span style={{ background: 'rgba(0,0,0,0.06)', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
              Competitive
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 24px' }} />

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '16px 24px', gap: '8px' }}>
            {[
              { value: '12',         label: 'Sessions'      },
              { value: 'May 2026',   label: 'Since'         },
              { value: '4.9★',       label: 'Rating'        },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: T.cyan, lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3, marginTop: '3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 — About */}
        <div style={{ ...glassCard, marginTop: '16px', padding: '20px' }}>
          <span style={sectionLabel}>ABOUT</span>
          {[
            { label: 'Position', value: 'Midfielder' },
            { label: 'Goals',    value: 'Improve first touch and shooting accuracy' },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              style={{
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.ink3, marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — Current trainer */}
        <div style={{ ...glassCard, marginTop: '16px', padding: '20px' }}>
          <span style={sectionLabel}>MY TRAINER</span>
          <Link
            href="/dashboard/athlete/messages"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              minHeight: '56px', textDecoration: 'none', color: 'inherit',
              marginTop: '4px',
            }}
          >
            {/* Avatar */}
            <div style={{ width: 44, height: 44, borderRadius: '999px', background: T.cyanLight, border: `2px solid ${T.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.cyan, flexShrink: 0 }}>
              MR
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink }}>Marcus Rivera</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginTop: '2px' }}>Soccer Trainer</div>
            </div>

            {/* Chevron */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Section 4 — Read-only notice */}
        <div style={{ marginTop: '16px', fontSize: '12px', color: T.ink3, textAlign: 'center', lineHeight: 1.6 }}>
          Profile managed by your parent · Contact Sarah Chen to make changes
        </div>

      </div>
    </div>
  )
}
