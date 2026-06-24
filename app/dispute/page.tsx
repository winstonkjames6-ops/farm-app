'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const ACCENT = '#00BCC8'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', padding: '12px 14px',
  color: '#fff', fontSize: '14px', outline: 'none',
  fontFamily: "'Hanken Grotesk', sans-serif",
  transition: 'border-color .15s ease, box-shadow .15s ease',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontSize: '11.5px', fontWeight: 700,
      color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
      letterSpacing: '.1em', textTransform: 'uppercase',
      fontFamily: "'Hanken Grotesk', sans-serif",
    }}>
      {children}
    </label>
  )
}

const DISPUTE_TYPES = [
  'Refund request',
  'Trainer no-show',
  'Quality complaint',
  'Other',
]

const timelineSteps = [
  { label: 'Submit your dispute', state: 'active' as const, detail: 'Describe what happened and submit the form below.' },
  { label: 'FARM reviews within 48hrs', state: 'pending' as const, detail: 'Our team investigates both sides of the dispute.' },
  { label: 'Resolution issued', state: 'locked' as const, detail: 'A decision is communicated to both parties via email.' },
]

const stepVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 + i * 0.1 },
  }),
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] } },
}

function TimelineIcon({ state }: { state: 'active' | 'pending' | 'locked' }) {
  if (state === 'active') {
    return (
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(223,225,4,0.1)', border: `1.5px solid ${ACCENT}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.span
          animate={{ scale: [1, 1.35, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
          style={{ width: '7px', height: '7px', borderRadius: '50%', background: ACCENT, display: 'block' }}
        />
      </div>
    )
  }
  if (state === 'pending') {
    return (
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'block' }} />
      </div>
    )
  }
  return (
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
      background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
  )
}

export default function DisputePage() {
  const [sessionDate, setSessionDate] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [disputeType, setDisputeType] = useState('')
  const [description, setDescription] = useState('')
  const [focuses, setFocuses] = useState({ date: false, id: false, type: false, desc: false })
  const [submitted, setSubmitted] = useState(false)

  const setFocus = (field: string, val: boolean) => setFocuses((f) => ({ ...f, [field]: val }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px 80px' }}>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Page heading */}
              <div>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase',
                  color: ACCENT, margin: '0 0 10px',
                }}>Trust &amp; Safety</p>
                <h1 style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: '32px', letterSpacing: '.04em', textTransform: 'uppercase',
                  color: '#fff', margin: '0 0 8px', lineHeight: 1.05,
                }}>
                  Open a Dispute
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>
                  We review all disputes fairly. Both parties are heard before a resolution is issued.
                </p>
              </div>

              {/* Timeline */}
              <div style={{
                padding: '20px 22px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
              }}>
                {timelineSteps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    custom={i}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: 'flex', gap: '12px', position: 'relative' }}
                  >
                    {i < timelineSteps.length - 1 && (
                      <div style={{
                        position: 'absolute', left: '13px', top: '28px',
                        width: '1.5px', height: 'calc(100% - 4px)',
                        background: i === 0
                          ? `linear-gradient(to bottom, ${ACCENT}, rgba(223,225,4,0.1))`
                          : 'rgba(255,255,255,0.07)',
                      }} />
                    )}
                    <TimelineIcon state={step.state} />
                    <div style={{ paddingBottom: i < timelineSteps.length - 1 ? '20px' : '0' }}>
                      <p style={{
                        margin: '0 0 3px', fontSize: '13.5px', fontWeight: 600, lineHeight: 1.2,
                        color: step.state === 'locked' ? 'rgba(255,255,255,0.25)' : step.state === 'active' ? '#fff' : 'rgba(255,255,255,0.55)',
                      }}>
                        {step.label}
                        {step.state === 'active' && (
                          <span style={{
                            display: 'inline-block', marginLeft: '8px',
                            fontSize: '9.5px', fontWeight: 700, letterSpacing: '.08em',
                            textTransform: 'uppercase', color: ACCENT, verticalAlign: 'middle',
                          }}>Now</span>
                        )}
                      </p>
                      <p style={{
                        margin: 0, fontSize: '12px', lineHeight: 1.5,
                        color: step.state === 'locked' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)',
                      }}>
                        {step.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Form */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '18px', padding: '32px 30px',
              }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                  {/* Two-col row: date + booking ID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <FieldLabel>Session date</FieldLabel>
                      <input
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        onFocus={() => setFocus('date', true)}
                        onBlur={() => setFocus('date', false)}
                        required
                        style={{
                          ...inputStyle,
                          colorScheme: 'dark',
                          borderColor: focuses.date ? ACCENT : 'rgba(255,255,255,0.1)',
                          boxShadow: focuses.date ? '0 0 0 3px rgba(223,225,4,0.1)' : 'none',
                        }}
                      />
                    </div>
                    <div>
                      <FieldLabel>Booking ID</FieldLabel>
                      <input
                        type="text"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        onFocus={() => setFocus('id', true)}
                        onBlur={() => setFocus('id', false)}
                        placeholder="BK-00421"
                        required
                        style={{
                          ...inputStyle,
                          borderColor: focuses.id ? ACCENT : 'rgba(255,255,255,0.1)',
                          boxShadow: focuses.id ? '0 0 0 3px rgba(223,225,4,0.1)' : 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Dispute type */}
                  <div>
                    <FieldLabel>Dispute type</FieldLabel>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={disputeType}
                        onChange={(e) => setDisputeType(e.target.value)}
                        onFocus={() => setFocus('type', true)}
                        onBlur={() => setFocus('type', false)}
                        required
                        style={{
                          ...inputStyle,
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          paddingRight: '36px',
                          cursor: 'pointer',
                          borderColor: focuses.type ? ACCENT : 'rgba(255,255,255,0.1)',
                          boxShadow: focuses.type ? '0 0 0 3px rgba(223,225,4,0.1)' : 'none',
                          color: disputeType ? '#fff' : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        <option value="" disabled style={{ background: '#111113' }}>Select type…</option>
                        {DISPUTE_TYPES.map((t) => (
                          <option key={t} value={t} style={{ background: '#111113', color: '#fff' }}>{t}</option>
                        ))}
                      </select>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => setFocus('desc', true)}
                      onBlur={() => setFocus('desc', false)}
                      placeholder="Describe what happened, what you expected, and what outcome you're seeking…"
                      required
                      rows={5}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '120px',
                        borderColor: focuses.desc ? ACCENT : 'rgba(255,255,255,0.1)',
                        boxShadow: focuses.desc ? '0 0 0 3px rgba(223,225,4,0.1)' : 'none',
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: '14px', borderRadius: '11px', border: 'none',
                      background: ACCENT, color: '#000',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: '.1em', textTransform: 'uppercase',
                      marginTop: '4px',
                      transition: 'filter .15s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.92)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'none' }}
                  >
                    Submit dispute
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{
                width: '100%', maxWidth: '480px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '18px', padding: '40px 36px',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(223,225,4,0.08)', border: '1px solid rgba(223,225,4,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '24px', letterSpacing: '.04em', textTransform: 'uppercase',
                margin: '0 0 10px', lineHeight: 1.1,
              }}>
                Dispute opened.
              </h1>
              <div style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: '6px',
                background: 'rgba(223,225,4,0.1)', border: '1px solid rgba(223,225,4,0.22)',
                marginBottom: '16px',
              }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '.08em', color: ACCENT }}>
                  #DIS-0091
                </span>
              </div>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: '0 0 28px', lineHeight: 1.6 }}>
                Check your email for confirmation. Our team will review and respond within 48 hours.
              </p>
              <Link
                href="/dashboard"
                style={{
                  display: 'block', padding: '13px', borderRadius: '11px', textDecoration: 'none',
                  border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff',
                  fontSize: '13px', fontWeight: 700,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  textAlign: 'center', transition: 'border-color .15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.36)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
              >
                Back to dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
