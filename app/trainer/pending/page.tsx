'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const ACCENT = '#00BCC8'

const steps = [
  {
    label: 'Application received',
    state: 'done' as const,
    detail: 'Your profile and documents have been submitted.',
  },
  {
    label: 'Background check in progress',
    state: 'active' as const,
    detail: 'Identity and credential verification underway.',
  },
  {
    label: 'Profile goes live',
    state: 'locked' as const,
    detail: 'You\'ll be notified and can start accepting bookings.',
  },
]

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <motion.path
        d="M6 14.5 L11.5 20 L22 9"
        stroke={ACCENT}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
      />
    </svg>
  )
}

function StepIcon({ state }: { state: 'done' | 'active' | 'locked' }) {
  if (state === 'done') {
    return (
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,188,200,0.12)', border: `1.5px solid ${ACCENT}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <polyline points="2.5 7.5 5.5 10.5 11.5 4" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  if (state === 'active') {
    return (
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,188,200,0.08)', border: `1.5px solid rgba(0,188,200,0.4)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.span
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
          style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: ACCENT, display: 'block',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
      background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
  )
}

const stepVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.32, ease: [0.2, 0.7, 0.2, 1], delay: 0.55 + i * 0.1 },
  }),
}

export default function TrainerPendingPage() {
  const trainerEmail = 'trainer@email.com'

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
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1] }}
          style={{
            width: '100%', maxWidth: '460px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '18px', padding: '40px 36px',
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(0,188,200,0.08)', border: `1px solid rgba(0,188,200,0.22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '28px',
            }}
          >
            <CheckIcon />
          </motion.div>

          {/* Headline */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: '28px', letterSpacing: '.06em', textTransform: 'uppercase',
              color: '#fff', margin: '0 0 8px', lineHeight: 1.1,
            }}>
              Application Submitted
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
              We&apos;re reviewing your profile.
            </p>
          </div>

          {/* Timeline */}
          <div style={{
            marginBottom: '32px',
            padding: '24px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
          }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', gap: '14px', position: 'relative' }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', left: '15px', top: '32px',
                    width: '1.5px', height: 'calc(100% - 8px)',
                    background: i === 0
                      ? `linear-gradient(to bottom, ${ACCENT}, rgba(0,188,200,0.15))`
                      : 'rgba(255,255,255,0.08)',
                  }} />
                )}

                <StepIcon state={step.state} />

                <div style={{ paddingBottom: i < steps.length - 1 ? '24px' : '0' }}>
                  <p style={{
                    margin: '0 0 3px',
                    fontSize: '14px', fontWeight: 600,
                    color: step.state === 'locked' ? 'rgba(255,255,255,0.3)' : '#fff',
                    lineHeight: 1.2,
                  }}>
                    {step.label}
                    {step.state === 'active' && (
                      <span style={{
                        display: 'inline-block', marginLeft: '8px',
                        fontSize: '10px', fontWeight: 700, letterSpacing: '.08em',
                        textTransform: 'uppercase', color: ACCENT,
                        verticalAlign: 'middle',
                      }}>
                        In progress
                      </span>
                    )}
                  </p>
                  <p style={{
                    margin: 0, fontSize: '12.5px', lineHeight: 1.5,
                    color: step.state === 'locked' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                  }}>
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Body copy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65,
              margin: '0 0 28px',
            }}
          >
            This usually takes 1–2 business days. We&apos;ll email you at{' '}
            <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{trainerEmail}</span>{' '}
            when you&apos;re approved.
          </motion.p>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
          >
            <Link
              href="/trainer-signup"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '13px',
                border: '1.5px solid rgba(255,255,255,0.18)',
                borderRadius: '11px', textDecoration: 'none',
                color: '#fff', background: 'transparent',
                fontSize: '13px', fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.1em', textTransform: 'uppercase',
                transition: 'border-color .15s ease',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.38)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            >
              Edit my profile
            </Link>

            {/* Support link */}
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: '18px 0 0' }}>
              Questions?{' '}
              <a
                href="mailto:support@farmtraining.com"
                style={{
                  color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 500,
                  transition: 'color .15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}
              >
                support@farmtraining.com
              </a>
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
