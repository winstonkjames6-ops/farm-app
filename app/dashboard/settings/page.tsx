'use client'

import { useState } from 'react'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
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
    <h2 style={{
      fontFamily: "'Archivo', sans-serif",
      fontWeight: 700,
      fontSize: '13px',
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: T.ink3,
      margin: '0 0 12px',
    }}>
      {children}
    </h2>
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '44px', height: '24px', borderRadius: '999px',
        background: on ? '#00BCC8' : 'rgba(0,0,0,0.12)',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.15s',
        display: 'inline-block',
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#FFFFFF',
        position: 'absolute', top: '2px',
        left: on ? '22px' : '2px',
        transition: 'left 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

// ── Toggle row ─────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  on,
  onToggle,
  isLast = false,
}: {
  label: string
  description: string
  on: boolean
  onToggle: () => void
  isLast?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: '16px', paddingBottom: '16px',
      borderBottom: isLast ? 'none' : `1px solid ${T.line}`,
      gap: '16px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', color: T.ink, fontWeight: 500, marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
          {description}
        </div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [sessionReminders, setSessionReminders] = useState(true)
  const [trainerMessages, setTrainerMessages] = useState(true)
  const [reviewReminders, setReviewReminders] = useState(true)
  const [promoUpdates, setPromoUpdates] = useState(false)
  const [shareProgress, setShareProgress] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)

  const chevronRight = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: "'Archivo Black', 'Archivo', sans-serif", fontWeight: 900, fontSize: '26px', color: T.ink, marginBottom: '4px' }}>
            Settings
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3 }}>
            Manage your preferences
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Notifications */}
          <div>
            <SectionHeading>Notifications</SectionHeading>
            <div style={cardStyle}>
              <ToggleRow
                label="Session reminders"
                description="Get notified 1 hour before sessions"
                on={sessionReminders}
                onToggle={() => setSessionReminders((v) => !v)}
              />
              <ToggleRow
                label="New trainer messages"
                description="When a trainer messages you"
                on={trainerMessages}
                onToggle={() => setTrainerMessages((v) => !v)}
              />
              <ToggleRow
                label="Review reminders"
                description="Reminder to rate completed sessions"
                on={reviewReminders}
                onToggle={() => setReviewReminders((v) => !v)}
              />
              <ToggleRow
                label="Promotional updates"
                description="Tips, offers, and platform news"
                on={promoUpdates}
                onToggle={() => setPromoUpdates((v) => !v)}
                isLast
              />
            </div>
          </div>

          {/* Privacy */}
          <div>
            <SectionHeading>Privacy</SectionHeading>
            <div style={cardStyle}>
              <ToggleRow
                label="Share athlete progress"
                description="Allow trainers to share session clips"
                on={shareProgress}
                onToggle={() => setShareProgress((v) => !v)}
              />
              <ToggleRow
                label="Public profile"
                description="Let other parents see your review history"
                on={publicProfile}
                onToggle={() => setPublicProfile((v) => !v)}
                isLast
              />
            </div>
          </div>

          {/* App */}
          <div>
            <SectionHeading>App</SectionHeading>
            <div style={cardStyle}>
              {/* Language row — right side shows value, not chevron */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                paddingTop: '16px', paddingBottom: '16px',
                borderBottom: `1px solid ${T.line}`,
              }}>
                <span style={{ flex: 1, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', color: T.ink }}>
                  Language
                </span>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                  English
                </span>
              </div>

              {/* Chevron rows */}
              {['Clear cache', 'About FARM', 'Terms of service', 'Privacy policy'].map((label, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    paddingTop: '16px', paddingBottom: '16px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ flex: 1, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', color: T.ink }}>
                    {label}
                  </span>
                  {chevronRight}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
