'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', padding: '13px 16px',
  color: '#fff', fontSize: '15px', outline: 'none',
  fontFamily: "'Hanken Grotesk', sans-serif",
  transition: 'border-color .15s ease, box-shadow .15s ease',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{
        display: 'block', fontSize: '12px', fontWeight: 600,
        color: 'rgba(255,255,255,0.45)', marginBottom: '8px',
        letterSpacing: '.07em', textTransform: 'uppercase',
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] as const } },
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailFocus, setEmailFocus] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resent, setResent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setResent(false)
  }

  function handleResend() {
    setResent(true)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#09090B', color: '#fff',
      fontFamily: "'Hanken Grotesk', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '8px', background: '#22C55E',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '16px', color: '#000',
          }}>F</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '.02em' }}>FARM</span>
        </Link>
      </header>

      {/* Centered card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 80px' }}>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              style={{
                width: '100%', maxWidth: '420px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '18px', padding: '36px 32px',
              }}
            >
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{
                  fontFamily: "'Archivo', sans-serif", fontWeight: 900,
                  fontSize: '30px', margin: '0 0 8px', letterSpacing: '-.025em', lineHeight: 1.1,
                }}>
                  Forgot password
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: 0, lineHeight: 1.5 }}>
                  Enter your email and we&apos;ll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <Field label="Email address">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    placeholder="you@example.com"
                    required
                    style={{
                      ...inputBase,
                      borderColor: emailFocus ? '#00BCC8' : 'rgba(255,255,255,0.1)',
                      boxShadow: emailFocus ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
                    }}
                  />
                </Field>

                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '11px', border: 'none',
                    background: '#00BCC8', color: '#09090B',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    letterSpacing: '.06em', textTransform: 'uppercase',
                    marginTop: '6px', marginBottom: '20px',
                    transition: 'filter .15s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.92)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'none' }}
                >
                  Send reset link
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                <Link href="/login" style={{
                  color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500,
                  transition: 'color .15s ease',
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}
                >
                  ← Back to login
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{
                width: '100%', maxWidth: '420px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '18px', padding: '36px 32px',
                textAlign: 'center',
              }}
            >
              {/* Check icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(0,188,200,0.1)', border: '1px solid rgba(0,188,200,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00BCC8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h1 style={{
                fontFamily: "'Archivo', sans-serif", fontWeight: 900,
                fontSize: '26px', margin: '0 0 10px', letterSpacing: '-.025em', lineHeight: 1.1,
              }}>
                Check your inbox.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: '0 0 28px', lineHeight: 1.6 }}>
                We sent a reset link to <span style={{ color: '#fff', fontWeight: 600 }}>{email}</span>.
                It may take a minute to arrive.
              </p>

              {resent ? (
                <p style={{ fontSize: '14px', color: '#00BCC8', fontWeight: 600, marginBottom: '20px' }}>
                  Email resent!
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  style={{
                    width: '100%', padding: '13px', borderRadius: '11px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    marginBottom: '20px',
                    transition: 'border-color .15s ease, background .15s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(255,255,255,0.22)'
                    el.style.background = 'rgba(255,255,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(255,255,255,0.12)'
                    el.style.background = 'rgba(255,255,255,0.05)'
                  }}
                >
                  Resend email
                </button>
              )}

              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                <Link href="/login" style={{
                  color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500,
                  transition: 'color .15s ease',
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}
                >
                  ← Back to login
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
