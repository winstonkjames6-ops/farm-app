'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

// ── Eye icon ──────────────────────────────────────────────────────────────────

function EyeIcon({ open }) {
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

// ── Input field ───────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{
        display: 'block', fontSize: '12px', fontWeight: 600,
        color: '#9A9A9A', marginBottom: '8px',
        letterSpacing: '.07em', textTransform: 'uppercase',
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputBase = {
  width: '100%', boxSizing: 'border-box',
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '10px', padding: '13px 16px',
  color: '#1A1A1A', fontSize: '16px', outline: 'none',
  fontFamily: "'Hanken Grotesk', sans-serif",
  transition: 'border-color .15s ease',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AthleteLoginPage() {
  const [showPin, setShowPin] = useState(false)
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [usernameFocus, setUsernameFocus] = useState(false)
  const [pinFocus, setPinFocus] = useState(false)
  const [authError, setAuthError] = useState(null)

  const router = useRouter()

  async function handleSignIn() {
    setAuthError(null)
    const sanitized = username.trim().toLowerCase()
    const syntheticEmail = `${sanitized}@athlete.farmapp.internal`
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password: pin })
    if (error) {
      setAuthError('Incorrect username or PIN.')
      return
    }
    router.push('/dashboard/athlete')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8F8F6', color: '#1A1A1A',
      fontFamily: "'Hanken Grotesk', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(248,248,246,0.88)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '8px', background: '#00BCC8',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '16px', color: '#FFFFFF',
          }}>F</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '20px', color: '#1A1A1A', letterSpacing: '.02em' }}>FARM</span>
        </Link>
      </header>

      {/* Centered card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1] }}
          className="glass-modal"
          style={{
            width: '100%', maxWidth: '420px',
            borderRadius: '16px', padding: '36px 32px',
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: "'Archivo', sans-serif", fontWeight: 900,
              fontSize: '30px', margin: '0 0 8px', letterSpacing: '-.025em', lineHeight: 1.1,
              color: '#1A1A1A',
            }}>
              Athlete sign in
            </h1>
            <p style={{ color: '#9A9A9A', fontSize: '15px', margin: 0, lineHeight: 1.5 }}>
              Enter your username and PIN to continue
            </p>
          </div>

          {/* Username */}
          <Field label="Username">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
              placeholder="your username"
              autoComplete="username"
              style={{
                ...inputBase,
                borderColor: usernameFocus ? '#00BCC8' : 'rgba(0,0,0,0.12)',
                boxShadow: usernameFocus ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
              }}
            />
          </Field>

          {/* PIN */}
          <Field label="PIN">
            <div style={{ position: 'relative' }}>
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onFocus={() => setPinFocus(true)}
                onBlur={() => setPinFocus(false)}
                placeholder="••••••"
                autoComplete="current-password"
                inputMode="numeric"
                style={{
                  ...inputBase,
                  paddingRight: '46px',
                  borderColor: pinFocus ? '#00BCC8' : 'rgba(0,0,0,0.12)',
                  boxShadow: pinFocus ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '10px', minWidth: '44px', minHeight: '44px',
                  color: '#9A9A9A', display: 'flex', alignItems: 'center',
                  transition: 'color .15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4A4A' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A9A' }}
              >
                <EyeIcon open={showPin} />
              </button>
            </div>
          </Field>

          {authError && (
            <p style={{ fontSize: '13px', color: '#EF4444', margin: '0 0 14px', padding: '10px 14px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.18)' }}>
              {authError}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSignIn}
            style={{
              width: '100%', padding: '14px', borderRadius: '11px', border: 'none', minHeight: '44px',
              background: '#00BCC8', color: '#FFFFFF',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif",
              marginTop: '6px', marginBottom: '28px',
              transition: 'filter .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.93)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            Sign in
          </button>

          {/* Cross-link to regular login */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#9A9A9A', margin: 0 }}>
            Not an athlete?{' '}
            <Link href="/login" style={{
              color: '#00BCC8', textDecoration: 'none', fontWeight: 700,
              transition: 'opacity .15s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              Log in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
