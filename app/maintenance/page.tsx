'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

function WrenchIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00BCC8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#09090B', color: '#fff',
      fontFamily: "'Hanken Grotesk', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '48px' }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '8px', background: '#22C55E',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '16px', color: '#000',
          }}>F</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '.02em' }}>FARM</span>
        </Link>

        {/* Wrench icon */}
        <motion.div
          animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
          transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
          style={{ marginBottom: '32px' }}
        >
          <WrenchIcon />
        </motion.div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Archivo', sans-serif", fontWeight: 900,
          fontSize: 'clamp(26px, 5vw, 40px)', letterSpacing: '-.025em',
          margin: '0 0 14px', lineHeight: 1.1,
        }}>
          Down for maintenance.
        </h1>

        {/* Body */}
        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
          margin: '0 0 24px', maxWidth: '320px',
        }}>
          We&apos;re making improvements. Back shortly.
        </p>

        {/* ETA pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '100px',
          background: 'rgba(0,188,200,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,188,200,0.2)',
          marginBottom: '40px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00BCC8', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            Back by <span style={{ color: '#00BCC8', fontWeight: 700 }}>8:00 PM EST, Jun 22</span>
          </span>
        </div>

        {/* Button */}
        <Link
          href="/waitlist"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px 32px', borderRadius: '12px', textDecoration: 'none',
            border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff',
            fontWeight: 600, fontSize: '15px',
            fontFamily: "'Hanken Grotesk', sans-serif",
            transition: 'border-color .15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.38)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
        >
          Get notified
        </Link>
      </motion.div>
    </div>
  )
}
