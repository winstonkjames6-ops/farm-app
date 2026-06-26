'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ── Design tokens ──────────────────────────────────────────────────────────
const D = {
  bg:        '#09090B',
  surface:   '#111113',
  surface2:  '#18181B',
  border:    'rgba(255,255,255,0.08)',
  accent:    '#00BCC8',
  accentDim: 'rgba(0,188,200,0.10)',
  muted:     'rgba(255,255,255,0.40)',
  muted2:    'rgba(255,255,255,0.20)',
  text:      '#F0F0F0',
} as const

const barlow = "'Barlow Condensed', sans-serif"
const hanken  = "'Hanken Grotesk', sans-serif"

// ── SVG arrow for selects ───────────────────────────────────────────────────
const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.40)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`

// ── Shared input/label styles ────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: '#18181B',
  border: `1px solid rgba(255,255,255,0.08)`,
  color: '#F0F0F0',
  fontFamily: hanken,
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  appearance: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: barlow,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.40)',
  marginBottom: '6px',
}

// ── Nav ─────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#09090B',
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: barlow,
            fontWeight: 800,
            fontSize: '22px',
            letterSpacing: '.04em',
            color: '#00BCC8',
            textDecoration: 'none',
          }}
        >
          FARM
        </Link>
        <Link
          href="/search"
          style={{
            fontFamily: hanken,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.40)',
            textDecoration: 'none',
          }}
        >
          Find a trainer →
        </Link>
      </div>
    </nav>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '64px 0',
        gap: '16px',
      }}
    >
      {/* Checkmark circle */}
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="24" stroke="#00BCC8" strokeWidth="2" />
        <polyline
          points="16,26 23,33 36,20"
          stroke="#00BCC8"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <div
        style={{
          fontFamily: barlow,
          fontSize: '36px',
          fontWeight: 800,
          color: '#00BCC8',
          letterSpacing: '.02em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        Clinic Posted.
      </div>

      <p
        style={{
          fontFamily: hanken,
          fontSize: '15px',
          color: 'rgba(255,255,255,0.40)',
          margin: 0,
          maxWidth: '360px',
        }}
      >
        Your clinic is now live. Parents can register immediately.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
        <button
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: hanken,
            fontSize: '14px',
            color: '#00BCC8',
            textDecoration: 'underline',
          }}
        >
          Post another clinic
        </button>
        <Link
          href="/clinics"
          style={{
            fontFamily: hanken,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.40)',
            textDecoration: 'none',
          }}
        >
          ← Back to Clinics
        </Link>
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CreateClinicPage() {
  const [clinicName,    setClinicName]    = useState('')
  const [sport,         setSport]         = useState('Soccer')
  const [ageGroup,      setAgeGroup]      = useState('U10–U12')
  const [startDate,     setStartDate]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [locationType,  setLocationType]  = useState<'in-person' | 'remote'>('in-person')
  const [address,       setAddress]       = useState('')
  const [maxAthletes,   setMaxAthletes]   = useState('')
  const [price,         setPrice]         = useState('')
  const [description,   setDescription]   = useState('')
  const [submitted,     setSubmitted]     = useState(false)

  function handleReset() {
    setClinicName('')
    setSport('Soccer')
    setAgeGroup('U10–U12')
    setStartDate('')
    setEndDate('')
    setLocationType('in-person')
    setAddress('')
    setMaxAthletes('')
    setPrice('')
    setDescription('')
    setSubmitted(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: D.bg,
        color: D.text,
        fontFamily: hanken,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Nav />

      <div
        style={{
          maxWidth: '672px',
          margin: '0 auto',
          padding: '56px 24px 80px',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ marginBottom: '40px' }}
        >
          <h1
            style={{
              fontFamily: barlow,
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '.02em',
              textTransform: 'uppercase',
              margin: '0 0 10px',
              color: D.text,
              lineHeight: 1,
            }}
          >
            Post a Clinic
          </h1>
          <p
            style={{
              fontFamily: hanken,
              fontSize: '16px',
              color: D.muted,
              margin: 0,
            }}
          >
            List a group training event for FARM families.
          </p>
        </motion.div>

        {/* Form / Success */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessScreen key="success" onReset={handleReset} />
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* 1. Clinic Name */}
              <div>
                <label style={labelStyle}>Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. Summer Shooting Clinic"
                  style={inputStyle}
                />
              </div>

              {/* 2. Sport */}
              <div>
                <label style={labelStyle}>Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '36px',
                    backgroundImage: SELECT_ARROW,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    cursor: 'pointer',
                  }}
                >
                  {['Soccer', 'Tennis', 'Basketball', 'Volleyball', 'Lacrosse', 'Other'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* 3. Age Group */}
              <div>
                <label style={labelStyle}>Age Group</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '36px',
                    backgroundImage: SELECT_ARROW,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    cursor: 'pointer',
                  }}
                >
                  {['U8–U10', 'U10–U12', 'U12–U14', 'U14–U16', 'U16–U18', 'All Ages'].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* 4. Date range */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      ...inputStyle,
                      colorScheme: 'dark',
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      ...inputStyle,
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              </div>

              {/* 5. Location type */}
              <div>
                <label style={labelStyle}>Location Type</label>
                <div style={{ display: 'flex', gap: '0' }}>
                  {(['in-person', 'remote'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLocationType(type)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        fontFamily: barlow,
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        border: `1px solid ${locationType === type ? D.accent : D.border}`,
                        background: locationType === type ? D.accentDim : 'transparent',
                        color: locationType === type ? D.accent : D.muted,
                        transition: 'background .14s ease, color .14s ease, border-color .14s ease',
                      }}
                    >
                      {type === 'in-person' ? 'IN-PERSON' : 'REMOTE'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Address — only when in-person */}
              <AnimatePresence>
                {locationType === 'in-person' && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <label style={labelStyle}>Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, State"
                      style={inputStyle}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 7. Max Athletes */}
              <div>
                <label style={labelStyle}>Max Athletes</label>
                <input
                  type="number"
                  value={maxAthletes}
                  onChange={(e) => setMaxAthletes(e.target.value)}
                  placeholder="e.g. 20"
                  min="1"
                  style={inputStyle}
                />
              </div>

              {/* 8. Price */}
              <div>
                <label style={labelStyle}>Price Per Athlete</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. $120"
                  style={inputStyle}
                />
              </div>

              {/* 9. Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the clinic, what athletes will work on, what to bring..."
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: 1.55,
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontFamily: barlow,
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  background: D.accent,
                  color: D.bg,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity .14s ease',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
              >
                PUBLISH CLINIC
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
