'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0F', color: '#fff',
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

        {/* 404 */}
        <motion.p
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }}
          style={{
            fontFamily: "'Archivo', sans-serif", fontWeight: 900,
            fontSize: 'clamp(96px, 22vw, 160px)', lineHeight: 1,
            color: 'rgba(255,255,255,0.1)', letterSpacing: '-.04em',
            margin: '0 0 24px', userSelect: 'none',
          }}
        >
          404
        </motion.p>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Archivo', sans-serif", fontWeight: 900,
          fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '-.025em',
          margin: '0 0 14px', lineHeight: 1.1,
        }}>
          Wrong field.
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
          margin: '0 0 40px', maxWidth: '320px',
        }}>
          This page doesn&apos;t exist. Let&apos;s get you back in the game.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 24px', borderRadius: '12px', textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff',
              fontWeight: 600, fontSize: '15px',
              fontFamily: "'Hanken Grotesk', sans-serif",
              transition: 'border-color .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.38)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
          >
            Back to home
          </Link>
          <Link
            href="/search"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 24px', borderRadius: '12px', textDecoration: 'none',
              background: '#22C55E', color: '#000',
              fontWeight: 700, fontSize: '15px',
              fontFamily: "'Hanken Grotesk', sans-serif",
              transition: 'filter .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.92)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            Find a trainer
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
