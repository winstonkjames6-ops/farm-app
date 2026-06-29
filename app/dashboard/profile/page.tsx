'use client'

import Link from 'next/link'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  accent: '#00BCC8',
  cyanDim: 'rgba(0,188,200,0.06)',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  glass: 'rgba(0,0,0,0.04)',
  border: 'rgba(0,0,0,0.08)',
  line: 'rgba(0,0,0,0.08)',
  card: '#FFFFFF',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid rgba(0,0,0,0.08)',
  padding: '24px',
}

// ── Section heading ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      marginBottom: '12px',
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: '11px',
        letterSpacing: '.12em',
        textTransform: 'uppercase' as const,
        color: '#FFFFFF',
        background: 'rgba(0,0,0,0.38)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '3px 10px',
        borderRadius: '999px',
      }}>
        {children}
      </span>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ParentProfilePage() {
  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Profile header card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '999px',
                background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: '#FFFFFF',
                flexShrink: 0,
              }}>
                SC
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Archivo Black', 'Archivo', sans-serif", fontWeight: 900, fontSize: '24px', color: T.ink, marginBottom: '4px' }}>
                  Sarah Chen
                </div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '8px' }}>
                  sarah.chen@email.com
                </div>
                {/* Verified Parent badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 10px 3px 8px',
                  border: '1.5px solid #00BCC8',
                  borderRadius: '999px',
                  background: 'rgba(0,188,200,0.07)',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00BCC8" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: '10.5px', letterSpacing: '.1em', textTransform: 'uppercase',
                    color: '#00838C',
                  }}>Verified Parent</span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button style={{
                    border: '1.5px solid rgba(0,0,0,0.12)',
                    color: T.ink2,
                    background: 'transparent',
                    borderRadius: '12px',
                    padding: '8px 20px',
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}>
                    Edit profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Athletes */}
          <div>
            <SectionHeading>Athletes</SectionHeading>
            <div style={cardStyle}>
              {/* Existing athlete row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: `1px solid ${T.line}` }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '999px',
                  background: '#F0EFEB', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink,
                }}>
                  LC
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink }}>
                    Liam Chen
                  </div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                    Age 13 · Soccer
                  </div>
                </div>
                <button style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.accent, fontSize: '13px',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
                }}>
                  Edit
                </button>
              </div>

              {/* Add athlete row */}
              <Link
                href="/child/create"
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  paddingTop: '16px',
                  color: T.ink2, textDecoration: 'none',
                }}
              >
                <div style={{
                  width: 44, height: 44, background: '#F0EFEB', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink }}>
                    Add an athlete
                  </div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                    Create a profile for your child to find the right coach
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <SectionHeading>Account</SectionHeading>
            <div style={cardStyle}>
              {[
                {
                  label: 'Notifications',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  ),
                },
                {
                  label: 'Payment methods',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  ),
                },
                {
                  label: 'Session history',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                },
                {
                  label: 'Help & support',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  ),
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    paddingTop: '16px', paddingBottom: '16px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{row.icon}</span>
                  <span style={{ flex: 1, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', color: T.ink }}>
                    {row.label}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Account actions */}
          <div>
            <SectionHeading>Account actions</SectionHeading>
            <div style={cardStyle}>
              <div style={{
                display: 'flex', alignItems: 'center',
                paddingTop: '16px', paddingBottom: '16px',
                borderBottom: `1px solid ${T.line}`,
                cursor: 'pointer',
              }}>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', fontWeight: 600, color: T.ink2 }}>
                  Log out
                </span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                paddingTop: '16px', paddingBottom: '16px',
                cursor: 'pointer',
              }}>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', fontWeight: 600, color: '#EF4444' }}>
                  Delete account
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
