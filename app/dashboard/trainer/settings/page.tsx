'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

import { T } from '@/lib/theme'

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
    <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '12px' }}>
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

export default function TrainerSettingsPage() {
  const router = useRouter()

  async function handleLogOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const [sessionReminders, setSessionReminders] = useState(true)
  const [newMessages, setNewMessages] = useState(true)
  const [bookingRequests, setBookingRequests] = useState(true)
  const [promoUpdates, setPromoUpdates] = useState(false)

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
                description="Get notified 1 hour before each session"
                on={sessionReminders}
                onToggle={() => setSessionReminders((v) => !v)}
              />
              <ToggleRow
                label="New messages"
                description="When a parent messages you"
                on={newMessages}
                onToggle={() => setNewMessages((v) => !v)}
              />
              <ToggleRow
                label="Booking requests"
                description="When a parent requests a new session"
                on={bookingRequests}
                onToggle={() => setBookingRequests((v) => !v)}
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

          {/* Payout */}
          <div>
            <SectionHeading>Payout</SectionHeading>
            <div style={cardStyle}>
              <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', color: T.ink, fontWeight: 500, marginBottom: '6px' }}>
                  Payout method
                </div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3, lineHeight: 1.6 }}>
                  Payout method setup via Stripe is coming soon. Your earnings will be held and released once your payout account is configured.
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <SectionHeading>Account</SectionHeading>
            <div style={cardStyle}>
              <div
                onClick={handleLogOut}
                style={{
                  display: 'flex', alignItems: 'center',
                  paddingTop: '16px', paddingBottom: '16px',
                  borderBottom: `1px solid ${T.line}`, cursor: 'pointer',
                }}
              >
                <span style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '15px', fontWeight: 600, color: T.ink2,
                }}>Log out</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                paddingTop: '16px', paddingBottom: '16px', cursor: 'pointer',
              }}>
                <span style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '15px', fontWeight: 600, color: '#EF4444',
                }}>Delete account</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
