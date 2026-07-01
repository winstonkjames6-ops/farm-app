'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

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

const REASONS = [
  'No-show',
  'Inappropriate behavior',
  'Misrepresented credentials',
  'Payment issue',
  'Other',
]

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] as const } },
}

export default function ReportPage() {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [descFocus, setDescFocus] = useState(false)
  const [reasonFocus, setReasonFocus] = useState(false)
  const [fileDropped, setFileDropped] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason || !description.trim()) return
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
                width: '100%', maxWidth: '480px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '18px', padding: '40px 36px',
              }}
            >
              {/* Heading */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase',
                  color: '#ff5a5a', margin: '0 0 10px',
                }}>Trust &amp; Safety</p>
                <h1 style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: '26px', letterSpacing: '.04em', textTransform: 'uppercase',
                  color: '#fff', margin: '0 0 8px', lineHeight: 1.1,
                }}>
                  Report a Trainer
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>
                  All reports are reviewed by our Trust &amp; Safety team within 48 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Trainer name (pre-filled) */}
                <div>
                  <FieldLabel>Trainer name</FieldLabel>
                  <input
                    type="text"
                    defaultValue="Marcus Rivera"
                    readOnly
                    style={{
                      ...inputStyle,
                      color: 'rgba(255,255,255,0.55)',
                      cursor: 'default',
                    }}
                  />
                </div>

                {/* Reason dropdown */}
                <div>
                  <FieldLabel>Reason for report</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      onFocus={() => setReasonFocus(true)}
                      onBlur={() => setReasonFocus(false)}
                      required
                      style={{
                        ...inputStyle,
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        paddingRight: '36px',
                        cursor: 'pointer',
                        borderColor: reasonFocus ? ACCENT : 'rgba(255,255,255,0.1)',
                        boxShadow: reasonFocus ? '0 0 0 3px rgba(0,188,200,0.1)' : 'none',
                        color: reason ? '#fff' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      <option value="" disabled style={{ background: '#111113' }}>Select a reason…</option>
                      {REASONS.map((r) => (
                        <option key={r} value={r} style={{ background: '#111113', color: '#fff' }}>{r}</option>
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
                  <FieldLabel>Describe what happened <span style={{ color: '#ff5a5a' }}>*</span></FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setDescFocus(true)}
                    onBlur={() => setDescFocus(false)}
                    placeholder="Please describe the incident in as much detail as possible…"
                    required
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '120px',
                      borderColor: descFocus ? ACCENT : 'rgba(255,255,255,0.1)',
                      boxShadow: descFocus ? '0 0 0 3px rgba(0,188,200,0.1)' : 'none',
                    }}
                  />
                </div>

                {/* File upload drop zone */}
                <div>
                  <FieldLabel>Attach evidence <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span></FieldLabel>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); setFileDropped(true) }}
                    onClick={() => setFileDropped((v) => !v)}
                    style={{
                      border: `1.5px dashed ${dragging ? ACCENT : fileDropped ? 'rgba(0,188,200,0.5)' : 'rgba(255,255,255,0.14)'}`,
                      borderRadius: '10px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragging ? 'rgba(0,188,200,0.04)' : fileDropped ? 'rgba(0,188,200,0.03)' : 'rgba(255,255,255,0.02)',
                      transition: 'all .15s ease',
                    }}
                  >
                    {fileDropped ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: '13.5px', color: ACCENT, fontWeight: 600 }}>screenshot_evidence.png</span>
                      </div>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                          Drag &amp; drop or <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>click to browse</span>
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, PDF up to 10 MB</p>
                      </>
                    )}
                  </div>
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
                  Submit report
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
                width: '100%', maxWidth: '480px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '18px', padding: '40px 36px',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(0,188,200,0.08)', border: '1px solid rgba(0,188,200,0.22)',
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
                Report received.
              </h1>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: '0 0 28px', lineHeight: 1.6 }}>
                We&apos;ll review within 48 hours. You&apos;ll receive an email update when our Trust &amp; Safety team takes action.
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
