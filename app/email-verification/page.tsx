'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function MailIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DFE104" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  )
}

export default function EmailVerificationPage() {
  // In a real app this would come from auth context / query params
  const email = 'you@example.com'
  const [resent, setResent] = useState(false)

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0F', color: '#fff',
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          style={{
            width: '100%', maxWidth: '420px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '18px', padding: '36px 32px',
            textAlign: 'center',
          }}
        >
          {/* Mail icon */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(223,225,4,0.08)', border: '1px solid rgba(223,225,4,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <MailIcon />
          </div>

          <h1 style={{
            fontFamily: "'Archivo', sans-serif", fontWeight: 900,
            fontSize: '28px', margin: '0 0 12px', letterSpacing: '-.025em', lineHeight: 1.1,
          }}>
            Verify your email
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: '0 0 28px', lineHeight: 1.6 }}>
            We sent a confirmation link to{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>{email}</span>.{' '}
            Check your inbox and click the link to activate your account.
          </p>

          {resent ? (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(223,225,4,0.08)', border: '1px solid rgba(223,225,4,0.2)',
              marginBottom: '20px',
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#DFE104', fontWeight: 600 }}>
                Email resent! Check your inbox.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setResent(true)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '11px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', color: '#fff',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
                marginBottom: '20px',
                transition: 'border-color .15s ease, background .15s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = 'rgba(255,255,255,0.28)'
                el.style.background = 'rgba(255,255,255,0.09)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = 'rgba(255,255,255,0.15)'
                el.style.background = 'rgba(255,255,255,0.05)'
              }}
            >
              Resend confirmation email
            </button>
          )}

          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Wrong email?{' '}
            <Link href="/signup" style={{
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500,
              transition: 'color .15s ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)' }}
            >
              Go back
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
