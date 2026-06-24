'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] } },
}

function PasswordInput({ value, onChange, placeholder, focus, onFocus, onBlur }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  focus: boolean
  onFocus: () => void
  onBlur: () => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        required
        style={{
          ...inputBase,
          paddingRight: '46px',
          borderColor: focus ? '#00BCC8' : 'rgba(255,255,255,0.1)',
          boxShadow: focus ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
        }}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        style={{
          position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
          transition: 'color .15s ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  )
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newFocus, setNewFocus] = useState(false)
  const [confirmFocus, setConfirmFocus] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mismatch, setMismatch] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMismatch(true)
      return
    }
    setMismatch(false)
    setSubmitted(true)
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
                  Reset password
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: 0, lineHeight: 1.5 }}>
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <Field label="New password">
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="••••••••"
                    focus={newFocus}
                    onFocus={() => setNewFocus(true)}
                    onBlur={() => setNewFocus(false)}
                  />
                </Field>

                <Field label="Confirm password">
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(v) => { setConfirmPassword(v); setMismatch(false) }}
                    placeholder="••••••••"
                    focus={confirmFocus}
                    onFocus={() => setConfirmFocus(true)}
                    onBlur={() => setConfirmFocus(false)}
                  />
                  {mismatch && (
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#ff5a5a', fontWeight: 500 }}>
                      Passwords don&apos;t match.
                    </p>
                  )}
                </Field>

                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '11px', border: 'none',
                    background: '#00BCC8', color: '#000',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    letterSpacing: '.06em', textTransform: 'uppercase',
                    marginTop: '6px',
                    transition: 'filter .15s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.92)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'none' }}
                >
                  Set new password
                </button>
              </form>
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
                Password updated.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: '0 0 28px', lineHeight: 1.6 }}>
                Redirecting you to login&hellip;
              </p>

              <Link
                href="/login"
                style={{
                  display: 'block', width: '100%', padding: '14px', borderRadius: '11px',
                  background: '#00BCC8', color: '#000',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  textAlign: 'center', boxSizing: 'border-box',
                  transition: 'filter .15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(0.92)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.filter = 'none' }}
              >
                Go to login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
