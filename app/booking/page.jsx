'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ── Mock booking context ────────────────────────────────────────────────────

const BOOKING = {
  trainerName: 'Marcus Rivera',
  trainerInitials: 'MR',
  sport: 'Soccer',
  rating: 4.9,
  reviewCount: 48,
  date: 'Monday, Jun 23',
  time: '9:00 AM',
  duration: '1 hour',
  rate: 65,
}

// ── Shared token values ─────────────────────────────────────────────────────

const T = {
  bg: '#F5F2EE',
  surface: '#FBF9F5',
  surface2: '#ECE6DA',
  ink: '#1A1814',
  ink2: '#4C473E',
  ink3: '#8C8678',
  line: 'rgba(26,24,20,0.10)',
  accent: '#D94F2B',
  accentInk: '#FFF8F2',
  green: '#22C55E',
  radius: '14px',
}

// ── Stars ───────────────────────────────────────────────────────────────────

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24">
          <polygon
            points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1"
            fill={i <= Math.round(rating) ? T.accent : 'rgba(26,24,20,0.12)'}
          />
        </svg>
      ))}
    </span>
  )
}

// ── Trainer summary card ─────────────────────────────────────────────────────

function TrainerSummary() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      background: T.surface2, borderRadius: '12px', padding: '16px 18px',
      marginBottom: '24px',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
        background: `linear-gradient(140deg, ${T.accent} 0%, #e8784e 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '19px', color: '#fff',
      }}>
        {BOOKING.trainerInitials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink }}>
            {BOOKING.trainerName}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
            background: `color-mix(in srgb, ${T.accent} 13%, ${T.surface2})`,
            color: T.accent, padding: '3px 8px', borderRadius: '999px',
          }}>
            {BOOKING.sport}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
          <Stars rating={BOOKING.rating} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: T.ink }}>{BOOKING.rating}</span>
          <span style={{ fontSize: '12.5px', color: T.ink3 }}>· {BOOKING.reviewCount} reviews</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '22px', color: T.ink, lineHeight: 1 }}>
          ${BOOKING.rate}
        </div>
        <div style={{ fontSize: '12px', color: T.ink3 }}>/hr</div>
      </div>
    </div>
  )
}

// ── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }) {
  const steps = ['Confirm', 'Payment', 'Done']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px' }}>
      {steps.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? T.accent : active ? T.ink : T.surface2,
                border: `2px solid ${done || active ? (done ? T.accent : T.ink) : T.line}`,
                transition: 'all .3s ease',
              }}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 13 9 18 20 6" />
                  </svg>
                ) : (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: active ? '#fff' : T.ink3 }}>{i + 1}</span>
                )}
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: active ? 700 : 500, color: active ? T.ink : T.ink3, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 8px', marginBottom: '18px',
                background: done ? T.accent : T.line,
                transition: 'background .3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Screen 0: Confirm details ────────────────────────────────────────────────

function ConfirmScreen({ format, setFormat, onNext }) {
  const rowStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '12px', padding: '14px 0', borderBottom: `1px solid ${T.line}`,
  }
  const labelStyle = { fontSize: '14px', color: T.ink2, fontWeight: 500 }
  const valueStyle = { fontSize: '14.5px', fontWeight: 600, color: T.ink, textAlign: 'right' }

  return (
    <div>
      <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '24px', letterSpacing: '-.02em', color: T.ink, margin: '0 0 24px' }}>
        Confirm your session
      </h2>

      <TrainerSummary />

      {/* Session details */}
      <div style={{ marginBottom: '24px' }}>
        <div style={rowStyle}>
          <span style={labelStyle}>Date</span>
          <span style={valueStyle}>{BOOKING.date}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Time</span>
          <span style={valueStyle}>{BOOKING.time}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Duration</span>
          <span style={valueStyle}>{BOOKING.duration}</span>
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none', alignItems: 'flex-start', paddingTop: '16px' }}>
          <span style={labelStyle}>Format</span>
          <div style={{
            display: 'flex', background: T.bg,
            border: `1px solid ${T.line}`, borderRadius: '10px', padding: '3px', gap: '3px',
          }}>
            {['In-Person', 'Remote Video'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  background: format === f ? T.surface : 'transparent',
                  border: `1px solid ${format === f ? T.line : 'transparent'}`,
                  color: format === f ? T.ink : T.ink3,
                  boxShadow: format === f ? '0 1px 4px rgba(26,24,20,.08)' : 'none',
                  transition: 'all .15s ease',
                  fontFamily: "'Hanken Grotesk', sans-serif",
                }}
              >{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div style={{
        background: T.surface2, borderRadius: '12px', padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: T.ink2 }}>
          <span>Session (1 hr)</span>
          <span>${BOOKING.rate}.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: T.ink2 }}>
          <span>Platform fee</span>
          <span style={{ color: '#22C55E', fontWeight: 600 }}>$0.00</span>
        </div>
        <div style={{ height: '1px', background: T.line }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink }}>Total</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '18px', color: T.ink }}>${BOOKING.rate}.00</span>
        </div>
      </div>

      <button
        onClick={onNext}
        style={{
          display: 'block', width: '100%', padding: '16px', borderRadius: '12px',
          background: T.accent, color: T.accentInk, border: 'none',
          fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '16px',
          cursor: 'pointer', transition: 'filter .15s ease, transform .15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.08)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
      >
        Continue to payment →
      </button>
    </div>
  )
}

// ── Input field component ────────────────────────────────────────────────────

function CardInput({ label, placeholder, value, onChange, maxLength, pattern }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.ink3 }}>
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: '12px 14px', borderRadius: '10px',
          border: `1.5px solid ${focused ? T.ink : T.line}`,
          background: T.surface, color: T.ink, outline: 'none',
          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px',
          transition: 'border-color .15s ease',
          boxShadow: focused ? `0 0 0 3px rgba(26,24,20,0.06)` : 'none',
        }}
      />
    </div>
  )
}

// ── Screen 1: Payment ────────────────────────────────────────────────────────

function PaymentScreen({ format, onNext, onBack }) {
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  const formatCardNum = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }
  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? digits.slice(0, 2) + ' / ' + digits.slice(2) : digits
  }

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', padding: '0 0 20px', cursor: 'pointer',
          color: T.ink3, fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px',
          fontFamily: "'Hanken Grotesk', sans-serif",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="11 18 5 12 11 6" />
        </svg>
        Back
      </button>

      <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '24px', letterSpacing: '-.02em', color: T.ink, margin: '0 0 24px' }}>
        Payment details
      </h2>

      <div className="booking-payment-grid">
        {/* Form */}
        <div>
          <TrainerSummary />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <CardInput
              label="Card number"
              placeholder="1234 5678 9012 3456"
              value={cardNum}
              onChange={(e) => setCardNum(formatCardNum(e.target.value))}
              maxLength={19}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <CardInput
                label="Expiry"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={7}
              />
              <CardInput
                label="CVC"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
              />
            </div>
            <CardInput
              label="Name on card"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            onClick={onNext}
            style={{
              display: 'block', width: '100%', padding: '17px', borderRadius: '12px',
              background: '#22C55E', color: '#000', border: 'none',
              fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '16.5px',
              cursor: 'pointer', transition: 'filter .15s ease, transform .15s ease',
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            Pay ${BOOKING.rate}.00
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', color: T.ink3, fontSize: '13px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secured by Stripe
          </div>
        </div>

        {/* Order summary */}
        <div className="min-w-0 w-full" style={{
          background: T.surface2, borderRadius: '14px', padding: '20px 22px',
          alignSelf: 'flex-start',
        }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '15px', color: T.ink, marginBottom: '16px' }}>
            Order summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Trainer', value: BOOKING.trainerName },
              { label: 'Date', value: BOOKING.date },
              { label: 'Time', value: BOOKING.time },
              { label: 'Format', value: format },
              { label: 'Duration', value: BOOKING.duration },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13.5px' }}>
                <span style={{ color: T.ink3, fontWeight: 500, flexShrink: 0 }}>{label}</span>
                <span style={{ color: T.ink, fontWeight: 600, textAlign: 'right', minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: T.line, margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: T.ink }}>Total</span>
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '18px', color: T.ink }}>
                ${BOOKING.rate}.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Screen 2: Confirmation ───────────────────────────────────────────────────

function ConfirmationScreen({ format }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Animated checkmark */}
      <motion.div
        style={{
          width: '88px', height: '88px', borderRadius: '50%',
          background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 12px 40px rgba(34,197,94,0.32)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.1 }}
      >
        <motion.svg
          width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
        >
          <motion.polyline
            points="4 13 9 18 20 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
          />
        </motion.svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
        style={{
          fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '34px',
          letterSpacing: '-.025em', color: T.ink, margin: '0 0 8px',
        }}
      >
        You're booked.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ fontSize: '15.5px', color: T.ink2, margin: '0 0 32px' }}
      >
        A confirmation has been sent to your email.
      </motion.p>

      {/* Booking details */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.38, ease: [0.2, 0.7, 0.2, 1] }}
        style={{
          background: T.surface, border: `1px solid ${T.line}`,
          borderRadius: '16px', padding: '24px 28px',
          textAlign: 'left', marginBottom: '24px',
        }}
      >
        {/* Mini trainer card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${T.line}` }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
            background: `linear-gradient(140deg, ${T.accent} 0%, #e8784e 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '16px', color: '#fff',
          }}>
            {BOOKING.trainerInitials}
          </div>
          <div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '15px', color: T.ink }}>{BOOKING.trainerName}</div>
            <div style={{ fontSize: '12.5px', color: T.ink3, marginTop: '2px' }}>{BOOKING.sport} · USSF D License</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {[
            { icon: '📅', label: 'Date', value: BOOKING.date },
            { icon: '🕘', label: 'Time', value: BOOKING.time },
            { icon: '📍', label: 'Format', value: format },
            { icon: '⏱', label: 'Duration', value: BOOKING.duration },
            { icon: '💳', label: 'Total paid', value: `$${BOOKING.rate}.00` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: T.ink3, fontWeight: 500 }}>{label}</span>
              <span style={{ color: T.ink, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.46, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <button
          onClick={() => {}}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '15px', borderRadius: '12px',
            background: T.surface, color: T.ink, border: `1.5px solid ${T.line}`,
            fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px',
            cursor: 'pointer', transition: 'border-color .15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(26,24,20,0.24)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Add to calendar
        </button>

        <Link
          href="/dashboard"
          style={{
            display: 'block', textAlign: 'center', padding: '14px',
            color: T.ink3, fontSize: '14.5px', fontWeight: 500, textDecoration: 'none',
            transition: 'color .15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = T.ink }}
          onMouseLeave={(e) => { e.currentTarget.style.color = T.ink3 }}
        >
          ← Go to dashboard
        </Link>
      </motion.div>
    </div>
  )
}

// ── Slide transition variants ────────────────────────────────────────────────

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [format, setFormat] = useState('In-Person')

  const goTo = (next) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.ink,
      fontFamily: "'Hanken Grotesk', sans-serif", WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `color-mix(in srgb, ${T.bg} 88%, transparent)`,
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${T.line}`,
      }}>
        <div style={{
          maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '68px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{
              width: '30px', height: '30px', borderRadius: '8px', background: T.accent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: T.accentInk, fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '15px',
            }}>F</span>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '20px', letterSpacing: '.02em', color: T.ink }}>FARM</span>
          </Link>
          {step < 2 && (
            <Link href="/trainer/marcus-rivera" style={{
              textDecoration: 'none', color: T.ink2, fontWeight: 600, fontSize: '14px',
              padding: '9px 16px', border: `1.5px solid ${T.line}`, borderRadius: '999px',
            }}>
              ← Back to profile
            </Link>
          )}
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {step < 2 && <StepIndicator step={step} />}

        <div className="overflow-visible">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {step === 0 && (
                <ConfirmScreen
                  format={format}
                  setFormat={setFormat}
                  onNext={() => goTo(1)}
                />
              )}
              {step === 1 && (
                <PaymentScreen
                  format={format}
                  onNext={() => goTo(2)}
                  onBack={() => goTo(0)}
                />
              )}
              {step === 2 && (
                <ConfirmationScreen format={format} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .booking-payment-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 28px;
          align-items: start;
          overflow: visible;
        }
        @media (max-width: 680px) {
          .booking-payment-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
