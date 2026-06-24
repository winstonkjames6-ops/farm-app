'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const T = {
  bg: '#09090B',
  surface: '#111113',
  surface2: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  yellow: '#00BCC8',
  yellowBg: 'rgba(0,188,200,0.06)',
  ink: '#FAFAFA',
  ink2: '#A1A1AA',
  ink3: '#52525B',
}

const TRAINER = {
  name: 'Marcus Rivera',
  initials: 'MR',
  sport: 'Soccer',
  specialty: 'Youth Development · Ages 8–16',
  rating: 4.9,
  reviewCount: 48,
}

function Toggle({
  label, enabled, onToggle,
}: {
  label: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', background: T.surface2, border: `1px solid ${T.border}`,
        cursor: 'pointer',
      }}
      onClick={onToggle}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: enabled ? T.ink : T.ink3 }}>{label}</span>
      <div style={{
        width: 44, height: 24, background: enabled ? T.yellow : T.surface,
        border: `1px solid ${enabled ? T.yellow : T.border}`,
        position: 'relative', flexShrink: 0,
        transition: 'background .2s ease, border-color .2s ease',
      }}>
        <div style={{
          position: 'absolute', top: 3,
          left: enabled ? 23 : 3,
          width: 16, height: 16,
          background: enabled ? '#000' : T.ink3,
          transition: 'left .2s ease, background .2s ease',
        }} />
      </div>
    </div>
  )
}

export default function WaitlistNotifyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [emailNotify, setEmailNotify] = useState(true)
  const [textNotify, setTextNotify] = useState(true)
  const [email, setEmail] = useState('sarah.k@gmail.com')
  const [phone, setPhone] = useState('(512) 555-0192')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div
      style={{
        background: T.bg, color: T.ink, minHeight: '100vh',
        fontFamily: "'Hanken Grotesk', sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Nav */}
      <nav style={{
        height: 60, borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', padding: '0 24px',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
        background: T.bg,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22,
            color: T.yellow, letterSpacing: '.06em',
          }}>FARM</span>
        </Link>
        <Link href="/search" style={{
          fontSize: 12, fontWeight: 700, color: T.ink2, textDecoration: 'none',
          padding: '7px 14px', border: `1px solid ${T.border}`,
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.08em', textTransform: 'uppercase' as const,
        }}>← Back to search</Link>
      </nav>

      <main style={{ maxWidth: 500, margin: '0 auto', padding: '56px 24px 80px' }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              style={{ textAlign: 'center', padding: '40px 0' }}
            >
              <div style={{
                width: 64, height: 64, background: T.yellow,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36,
                color: T.ink, margin: '0 0 16px', textTransform: 'uppercase' as const,
                letterSpacing: '.04em', lineHeight: 1,
              }}>You&apos;re on the list.</h1>
              <p style={{ fontSize: 16, color: T.ink2, margin: '0 0 32px', lineHeight: 1.6 }}>
                We&apos;ll reach out the moment a slot opens for{' '}
                <span style={{ color: T.ink, fontWeight: 600 }}>{TRAINER.name}</span>.
              </p>

              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                padding: '20px 24px', textAlign: 'left', marginBottom: 32,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink3, letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 14, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Notify me via
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {emailNotify && (
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: T.ink2,
                      background: T.surface2, border: `1px solid ${T.border}`,
                      padding: '6px 14px',
                    }}>Email</span>
                  )}
                  {textNotify && (
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: T.ink2,
                      background: T.surface2, border: `1px solid ${T.border}`,
                      padding: '6px 14px',
                    }}>Text</span>
                  )}
                </div>
              </div>

              <Link href="/search" style={{
                display: 'inline-block', textDecoration: 'none',
                color: T.ink2, fontSize: 13, fontWeight: 600,
                borderBottom: `1px solid ${T.border}`, paddingBottom: 2,
              }}>Browse other trainers →</Link>
            </motion.div>
          ) : (
            /* ── Opt-in form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {/* Status badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                padding: '6px 14px', marginBottom: 32,
              }}>
                <div style={{ width: 7, height: 7, background: '#EF4444', borderRadius: '50%' }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#EF4444',
                  fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase' as const,
                }}>Fully Booked</span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 48,
                color: T.ink, margin: '0 0 8px', textTransform: 'uppercase' as const,
                letterSpacing: '.03em', lineHeight: 1,
              }}>TRAINER FULLY BOOKED</h1>
              <p style={{ fontSize: 15, color: T.ink3, margin: '0 0 40px', lineHeight: 1.55 }}>
                Join the waitlist and we&apos;ll notify you the moment a slot opens.
              </p>

              {/* Trainer card */}
              <div style={{
                display: 'flex', gap: 16, alignItems: 'center',
                background: T.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${T.border}`,
                padding: '20px 24px', marginBottom: 40,
              }}>
                <div style={{
                  width: 56, height: 56, flexShrink: 0,
                  background: 'linear-gradient(140deg, #2a2a2a, #1a1a1a)',
                  border: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 18, color: T.yellow,
                }}>{TRAINER.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: T.ink, marginBottom: 4 }}>{TRAINER.name}</div>
                  <div style={{ fontSize: 13, color: T.ink3, marginBottom: 6 }}>{TRAINER.specialty}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: T.yellow,
                      background: 'rgba(0,188,200,0.08)', border: '1px solid rgba(0,188,200,0.2)',
                      padding: '3px 10px', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.06em',
                    }}>{TRAINER.sport}</span>
                    <span style={{ fontSize: 12, color: T.ink3 }}>★ {TRAINER.rating} · {TRAINER.reviewCount} reviews</span>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  padding: '6px 12px', flexShrink: 0, fontSize: 11, fontWeight: 700,
                  color: '#EF4444', fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: '.08em', textTransform: 'uppercase' as const,
                }}>Fully Booked</div>
              </div>

              {/* Body text */}
              <p style={{ fontSize: 15, color: T.ink2, margin: '0 0 32px', lineHeight: 1.65 }}>
                <strong style={{ color: T.ink }}>{TRAINER.name}</strong> is fully booked. We&apos;ll text and email you
                the moment a slot opens.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Email input */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 700, color: T.ink3,
                    letterSpacing: '.1em', textTransform: 'uppercase' as const,
                    fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 8,
                  }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%', background: T.surface, border: `1px solid ${T.border}`,
                      color: T.ink, padding: '13px 16px', fontSize: 14, outline: 'none',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      boxSizing: 'border-box' as const,
                    }}
                  />
                </div>

                {/* Phone input */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 700, color: T.ink3,
                    letterSpacing: '.1em', textTransform: 'uppercase' as const,
                    fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 8,
                  }}>Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%', background: T.surface, border: `1px solid ${T.border}`,
                      color: T.ink, padding: '13px 16px', fontSize: 14, outline: 'none',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      boxSizing: 'border-box' as const,
                    }}
                  />
                </div>

                {/* Notification toggles */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: '.1em', textTransform: 'uppercase' as const, fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 10 }}>
                    Notification preferences
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Toggle
                      label="Notify me by email"
                      enabled={emailNotify}
                      onToggle={() => setEmailNotify((v) => !v)}
                    />
                    <Toggle
                      label="Notify me by text"
                      enabled={textNotify}
                      onToggle={() => setTextNotify((v) => !v)}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  style={{
                    width: '100%', background: T.yellow, color: '#000', border: 'none',
                    padding: '16px', cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                    fontSize: 16, letterSpacing: '.1em', textTransform: 'uppercase' as const,
                  }}
                >NOTIFY ME WHEN AVAILABLE</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
