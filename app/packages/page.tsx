'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'

const D = {
  bg: '#09090B',
  surface: '#111113',
  border: 'rgba(255,255,255,0.08)',
  borderAccent: '#00BCC8',
  accent: '#00BCC8',
  accentDim: 'rgba(0,188,200,0.10)',
  muted: 'rgba(255,255,255,0.40)',
  text: '#F0F0F0',
}

const PACKAGES = [
  { id: 'starter',  label: 'Starter',       sessions: 3,  total: 180, perSession: 60, savings: null,  popular: false },
  { id: 'popular',  label: 'Most Popular',   sessions: 5,  total: 275, perSession: 55, savings: '8%',  popular: true  },
  { id: 'elite',    label: 'Elite',          sessions: 10, total: 500, perSession: 50, savings: '17%', popular: false },
]

const containerVariants: Variants = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.1 } },
}

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
}

const font = {
  heading: "'Barlow Condensed', sans-serif",
  body:    "'Hanken Grotesk', sans-serif",
}

export default function PackagesPage() {
  return (
    <div
      style={{
        background: D.bg,
        minHeight: '100vh',
        color: D.text,
        fontFamily: font.body,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: D.bg,
          borderBottom: `1px solid ${D.border}`,
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            padding: '0 32px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: font.heading,
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '0.06em',
              color: D.accent,
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            FARM
          </Link>
          <Link
            href="/search"
            style={{
              fontFamily: font.body,
              fontSize: '14px',
              fontWeight: 500,
              color: D.muted,
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Find a trainer →
          </Link>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '72px 32px 56px' }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <h1
            style={{
              fontFamily: font.heading,
              fontWeight: 800,
              fontSize: 'clamp(32px,6vw,52px)',
              lineHeight: 0.96,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: '0 0 14px',
              color: D.text,
            }}
          >
            Training{' '}
            <span style={{ color: D.accent }}>Packages</span>
          </h1>
          <p
            style={{
              fontFamily: font.body,
              fontSize: '16px',
              color: D.muted,
              margin: 0,
              lineHeight: 1.55,
              maxWidth: '420px',
            }}
          >
            Commit to your athlete&apos;s development. Save when you book in bulk.
          </p>
        </motion.div>
      </section>

      {/* ── CARDS ── */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 32px 80px' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              style={{
                position: 'relative',
                background: D.surface,
                border: pkg.popular ? `2px solid ${D.borderAccent}` : `1px solid ${D.border}`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '32px 28px 28px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Popular badge */}
              {pkg.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: D.accent,
                    color: D.bg,
                    fontFamily: font.heading,
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '4px 14px',
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Label */}
              <div
                style={{
                  fontFamily: font.heading,
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: D.muted,
                  marginBottom: '20px',
                  marginTop: pkg.popular ? '12px' : '0',
                }}
              >
                {pkg.label}
              </div>

              {/* Session count */}
              <div
                style={{
                  fontFamily: font.heading,
                  fontWeight: 800,
                  fontSize: 'clamp(42px,7vw,72px)',
                  lineHeight: 1,
                  color: D.accent,
                  letterSpacing: '-0.01em',
                }}
              >
                {pkg.sessions}
              </div>

              {/* "SESSIONS" label */}
              <div
                style={{
                  fontFamily: font.heading,
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: D.muted,
                  marginBottom: '24px',
                  marginTop: '2px',
                }}
              >
                Sessions
              </div>

              {/* Total price */}
              <div
                style={{
                  fontFamily: font.heading,
                  fontWeight: 700,
                  fontSize: '38px',
                  lineHeight: 1,
                  color: D.text,
                  letterSpacing: '0.01em',
                  marginBottom: '6px',
                }}
              >
                ${pkg.total}
              </div>

              {/* Per-session rate */}
              <div
                style={{
                  fontFamily: font.body,
                  fontSize: '13px',
                  color: D.muted,
                  marginBottom: '20px',
                }}
              >
                ${pkg.perSession} per session
              </div>

              {/* Savings badge — reserved height regardless */}
              <div style={{ height: '28px', marginBottom: '24px' }}>
                {pkg.savings ? (
                  <span
                    style={{
                      display: 'inline-block',
                      background: D.accentDim,
                      color: D.accent,
                      border: `1px solid ${D.accent}`,
                      fontFamily: font.heading,
                      fontWeight: 600,
                      fontSize: '12px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                    }}
                  >
                    Save {pkg.savings}
                  </span>
                ) : null}
              </div>

              {/* CTA button */}
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: pkg.popular ? D.accent : 'transparent',
                  color: pkg.popular ? D.bg : D.text,
                  border: pkg.popular ? 'none' : `1px solid ${D.muted}`,
                  fontFamily: font.heading,
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginTop: 'auto',
                }}
              >
                Select Package
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: D.muted,
            marginTop: '36px',
            fontFamily: font.body,
            lineHeight: 1.55,
          }}
        >
          Packages expire 90 days after purchase. No refunds after first session is booked.
        </motion.p>
      </section>
    </div>
  )
}
