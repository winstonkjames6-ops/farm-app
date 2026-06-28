'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

// ── Google icon ───────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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

export default function LoginPage() {
  const [role, setRole] = useState('parent')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailFocus, setEmailFocus] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)

  const signupHref = role === 'parent' ? '/parent-signup' : '/trainer-signup'

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
              Welcome back
            </h1>
            <p style={{ color: '#9A9A9A', fontSize: '15px', margin: 0, lineHeight: 1.5 }}>
              Sign in to your FARM account
            </p>
          </div>

          {/* Role toggle */}
          <div style={{
            display: 'flex', gap: '6px', marginBottom: '28px',
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px', padding: '5px',
          }}>
            {['parent', 'trainer'].map((r) => {
              const active = role === r
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontSize: '14px', fontWeight: 700,
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    transition: 'all .18s ease', minHeight: '44px',
                    background: active ? '#1A1A1A' : 'transparent',
                    color: active ? '#FFFFFF' : '#9A9A9A',
                  }}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              )
            })}
          </div>

          {/* Email */}
          <Field label="Email address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              placeholder="you@example.com"
              style={{
                ...inputBase,
                borderColor: emailFocus ? '#00BCC8' : 'rgba(0,0,0,0.12)',
                boxShadow: emailFocus ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
              }}
            />
          </Field>

          {/* Password */}
          <Field label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                placeholder="••••••••"
                style={{
                  ...inputBase,
                  paddingRight: '46px',
                  borderColor: passwordFocus ? '#00BCC8' : 'rgba(0,0,0,0.12)',
                  boxShadow: passwordFocus ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '10px', minWidth: '44px', minHeight: '44px',
                  color: '#9A9A9A', display: 'flex', alignItems: 'center',
                  transition: 'color .15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4A4A' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A9A' }}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link href="/forgot-password" style={{
                fontSize: '13px', color: '#9A9A9A', textDecoration: 'none', fontWeight: 500,
                transition: 'color .15s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4A4A' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A9A' }}
              >
                Forgot password?
              </Link>
            </div>
          </Field>

          {/* Submit */}
          <button
            style={{
              width: '100%', padding: '14px', borderRadius: '11px', border: 'none', minHeight: '44px',
              background: '#00BCC8', color: '#FFFFFF',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif",
              marginTop: '6px', marginBottom: '20px',
              transition: 'filter .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.93)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            Sign in
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
            <span style={{ fontSize: '13px', color: '#9A9A9A', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
          </div>

          {/* Google OAuth */}
          <button
            style={{
              width: '100%', padding: '13px 16px', borderRadius: '11px',
              border: '1px solid rgba(0,0,0,0.10)',
              background: 'rgba(0,0,0,0.04)', color: '#1A1A1A',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              marginBottom: '28px',
              transition: 'border-color .15s ease, background .15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.22)'
              e.currentTarget.style.background = 'rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'
              e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#9A9A9A', margin: 0 }}>
            Don&apos;t have an account?{' '}
            <Link href={signupHref} style={{
              color: '#00BCC8', textDecoration: 'none', fontWeight: 700,
              transition: 'opacity .15s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
