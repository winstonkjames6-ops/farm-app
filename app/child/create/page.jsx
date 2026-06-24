'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ── Data ─────────────────────────────────────────────────────────────────────

const SPORTS = [
  'Soccer', 'Basketball', 'Baseball', 'Softball', 'Tennis',
  'Volleyball', 'Lacrosse', 'Football', 'Track & Field',
  'Swimming', 'Golf', 'Gymnastics', 'Martial Arts', 'Hockey', 'Wrestling', 'Other',
]

const SKILL_LEVELS = ['Beginner', 'Developing', 'Competitive', 'Elite']

const SESSION_FORMATS = [
  { type: 'In-Person',    icon: '📍', desc: 'At a field or facility near you' },
  { type: 'Remote Video', icon: '🎥', desc: 'Live coaching via video call' },
  { type: 'Either works', icon: '✓',  desc: 'Open to both options' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcAge(dob) {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

function getInitials(first, last) {
  return `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase()
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', padding: '13px 16px',
  color: '#fff', fontSize: '15px', outline: 'none',
  fontFamily: "'Hanken Grotesk', sans-serif",
  transition: 'border-color .15s ease, box-shadow .15s ease',
}

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 600,
  color: 'rgba(255,255,255,0.45)', marginBottom: '8px',
  letterSpacing: '.07em', textTransform: 'uppercase',
  fontFamily: "'Hanken Grotesk', sans-serif",
}

function Field({ label, optional, children }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <label style={labelStyle}>
        {label}{optional && <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>optional</span>}
      </label>
      {children}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CreateChildPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '',
    sport: '', skillLevel: '', position: '',
    goals: '', sessionFormat: '',
  })
  const [focusedField, setFocusedField] = useState(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const age = calcAge(form.dob)
  const initials = form.firstName || form.lastName ? getInitials(form.firstName || '?', form.lastName || '?') : null
  const isValid = form.firstName.trim() && form.lastName.trim() && form.sport && form.skillLevel

  const focusStyle = (name) => focusedField === name
    ? { borderColor: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.12)' }
    : {}

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0F', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" }}>

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

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px 96px' }}>
        <AnimatePresence mode="wait">
          {!submitted ? (

            /* ── Form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.2, 0.7, 0.2, 1] } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            >
              {/* Heading */}
              <div style={{ marginBottom: '36px' }}>
                <h1 style={{
                  fontFamily: "'Archivo', sans-serif", fontWeight: 900,
                  fontSize: 'clamp(30px,5vw,42px)', margin: '0 0 10px',
                  letterSpacing: '-.025em', lineHeight: 1.08,
                }}>
                  Add your athlete
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: 1.55, margin: 0 }}>
                  This helps us match your child with the right coach.
                </p>
              </div>

              {/* Avatar preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px', gap: '10px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: initials ? 'linear-gradient(140deg,#22C55E 0%,#16a34a 100%)' : 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '26px', color: '#000',
                  transition: 'background .2s ease',
                }}>
                  {initials || (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Add photo</span>
              </div>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => update('firstName', e.target.value)}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Jordan"
                    style={{ ...inputStyle, ...focusStyle('firstName') }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => update('lastName', e.target.value)}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Smith"
                    style={{ ...inputStyle, ...focusStyle('lastName') }}
                  />
                </div>
              </div>

              {/* Date of birth */}
              <Field label="Date of birth">
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => update('dob', e.target.value)}
                  onFocus={() => setFocusedField('dob')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle, ...focusStyle('dob'),
                    colorScheme: 'dark',
                  }}
                />
                {age !== null && (
                  <p style={{ margin: '7px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
                    Age: <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{age}</strong>
                  </p>
                )}
              </Field>

              {/* Sport */}
              <Field label="Primary sport">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SPORTS.map(sport => (
                    <button
                      key={sport}
                      onClick={() => update('sport', sport)}
                      style={{
                        padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        background: form.sport === sport ? '#22C55E' : 'transparent',
                        color: form.sport === sport ? '#000' : 'rgba(255,255,255,0.5)',
                        border: form.sport === sport ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.15)',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                      }}
                    >{sport}</button>
                  ))}
                </div>
              </Field>

              {/* Skill level */}
              <Field label="Skill level">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SKILL_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => update('skillLevel', level)}
                      style={{
                        padding: '9px 20px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        background: form.skillLevel === level ? '#22C55E' : 'transparent',
                        color: form.skillLevel === level ? '#000' : 'rgba(255,255,255,0.5)',
                        border: form.skillLevel === level ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.15)',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                      }}
                    >{level}</button>
                  ))}
                </div>
              </Field>

              {/* Position */}
              <Field label="Position / specialty" optional>
                <input
                  type="text"
                  value={form.position}
                  onChange={e => update('position', e.target.value)}
                  onFocus={() => setFocusedField('position')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Goalkeeper, Point Guard, Setter"
                  style={{ ...inputStyle, ...focusStyle('position') }}
                />
              </Field>

              {/* Goals */}
              <Field label="Goals" optional>
                <textarea
                  value={form.goals}
                  onChange={e => update('goals', e.target.value)}
                  onFocus={() => setFocusedField('goals')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="What do you want your athlete to improve? e.g. First touch, shooting accuracy, footwork"
                  rows={3}
                  style={{
                    ...inputStyle, ...focusStyle('goals'),
                    resize: 'vertical', minHeight: '88px',
                  }}
                />
              </Field>

              {/* Session format */}
              <Field label="Session format preference">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {SESSION_FORMATS.map(({ type, icon, desc }) => (
                    <button
                      key={type}
                      onClick={() => update('sessionFormat', type)}
                      style={{
                        padding: '16px 12px', borderRadius: '12px', textAlign: 'center',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        background: form.sessionFormat === type ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                        border: form.sessionFormat === type ? '1.5px solid #22C55E' : '1px solid rgba(255,255,255,0.1)',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                      }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: form.sessionFormat === type ? '#22C55E' : '#fff', marginBottom: '3px' }}>{type}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </Field>

              {/* Submit */}
              <button
                onClick={() => isValid && setSubmitted(true)}
                disabled={!isValid}
                style={{
                  width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                  background: isValid ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: isValid ? '#000' : 'rgba(255,255,255,0.22)',
                  fontSize: '16px', fontWeight: 700, cursor: isValid ? 'pointer' : 'not-allowed',
                  fontFamily: "'Hanken Grotesk', sans-serif", transition: 'all 0.15s ease',
                  marginTop: '8px',
                }}
                onMouseEnter={(e) => { if (isValid) e.currentTarget.style.filter = 'brightness(0.93)' }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
              >
                Save athlete profile
              </button>
            </motion.div>

          ) : (

            /* ── Confirmation ── */
            <motion.div
              key="confirmation"
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.32, ease: [0.2, 0.7, 0.2, 1] } }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', paddingTop: '24px' }}
            >
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 20, delay: 0.1 } }}
                style={{
                  width: '84px', height: '84px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.14)', border: '2px solid #22C55E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px',
                }}
              >
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 13 9 18 20 6" />
                </svg>
              </motion.div>

              <h1 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '34px', margin: '0 0 12px', letterSpacing: '-.025em' }}>
                Athlete profile created
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: 1.6, margin: '0 0 36px' }}>
                {form.firstName} is ready to be matched with a coach.
              </p>

              {/* Summary card */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px', padding: '20px', marginBottom: '32px', textAlign: 'left',
              }}>
                {/* Avatar row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'linear-gradient(140deg,#22C55E 0%,#16a34a 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '18px', color: '#000', flexShrink: 0,
                  }}>
                    {getInitials(form.firstName, form.lastName)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff' }}>
                      {form.firstName} {form.lastName}
                    </div>
                    {age !== null && (
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Age {age}</div>
                    )}
                  </div>
                </div>
                {[
                  { label: 'Sport',        value: form.sport },
                  { label: 'Skill level',  value: form.skillLevel },
                  ...(form.position ? [{ label: 'Position', value: form.position }] : []),
                  ...(form.sessionFormat ? [{ label: 'Format', value: form.sessionFormat }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/search"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '15px', borderRadius: '12px',
                  background: '#22C55E', color: '#000',
                  fontWeight: 700, fontSize: '16px', textDecoration: 'none',
                  justifyContent: 'center', fontFamily: "'Hanken Grotesk', sans-serif",
                  transition: 'filter .15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.93)' }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
              >
                Find a trainer for {form.firstName}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <div style={{ marginTop: '20px' }}>
                <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                  ← Back to dashboard
                </Link>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
