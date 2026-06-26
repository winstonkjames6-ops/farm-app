'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const SPORTS = [
  'Soccer', 'Basketball', 'Baseball', 'Softball', 'Tennis',
  'Volleyball', 'Lacrosse', 'Football', 'Track & Field',
  'Swimming', 'Golf', 'Gymnastics', 'Martial Arts', 'Hockey', 'Wrestling', 'Other',
]

const AGE_GROUPS = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18', '18+']

const SESSION_FORMATS = [
  { type: 'In-Person', icon: '📍', desc: 'At a field or facility near you' },
  { type: 'Remote Video', icon: '🎥', desc: 'Live coaching via video call' },
  { type: 'Either works', icon: '✓', desc: 'Open to both options' },
]

export default function ParentSignup() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    email: '', sport: '', zipCode: '', ageGroup: '', sessionFormat: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const isValid = form.email && form.sport && form.zipCode && form.ageGroup && form.sessionFormat

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0F', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] } }}
              exit={{ x: -20, opacity: 0, transition: { duration: 0.2 } }}
            >
              <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 'clamp(32px,5vw,46px)', margin: '0 0 12px', letterSpacing: '-.025em', lineHeight: 1.05 }}>Find the right trainer.</h1>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
                  Tell us what you're looking for and we'll match your athlete with a vetted, experienced coach in your area.
                </p>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '8px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '16px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif' " }}
                />
              </div>

              {/* Sport */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '10px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Sport</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SPORTS.map(sport => (
                    <button
                      key={sport}
                      onClick={() => update('sport', sport)}
                      style={{
                        padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                        background: form.sport === sport ? '#22C55E' : 'transparent',
                        color: form.sport === sport ? '#000' : 'rgba(255,255,255,0.5)',
                        border: form.sport === sport ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.15)',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                      }}
                    >{sport}</button>
                  ))}
                </div>
              </div>

              {/* ZIP */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '8px', letterSpacing: '.06em', textTransform: 'uppercase' }}>ZIP code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.zipCode}
                  onChange={e => update('zipCode', e.target.value)}
                  placeholder="78701"
                  maxLength={5}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '16px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif" }}
                />
              </div>

              {/* Age group */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '10px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Athlete age group</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {AGE_GROUPS.map(ag => (
                    <button
                      key={ag}
                      onClick={() => update('ageGroup', ag)}
                      style={{
                        padding: '8px 18px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                        background: form.ageGroup === ag ? '#22C55E' : 'transparent',
                        color: form.ageGroup === ag ? '#000' : 'rgba(255,255,255,0.5)',
                        border: form.ageGroup === ag ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.15)',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                      }}
                    >{ag}</button>
                  ))}
                </div>
              </div>

              {/* Session format */}
              <div style={{ marginBottom: '36px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '10px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Session format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {SESSION_FORMATS.map(({ type, icon, desc }) => (
                    <button
                      key={type}
                      onClick={() => update('sessionFormat', type)}
                      style={{
                        padding: '16px 12px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
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
              </div>

              {/* Submit */}
              <button
                onClick={() => isValid && setSubmitted(true)}
                disabled={!isValid}
                style={{
                  width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                  background: isValid ? '#22C55E' : 'rgba(255,255,255,0.08)',
                  color: isValid ? '#000' : 'rgba(255,255,255,0.25)',
                  fontSize: '16px', fontWeight: 700, cursor: isValid ? 'pointer' : 'not-allowed',
                  fontFamily: "'Hanken Grotesk', sans-serif", transition: 'all 0.2s ease',
                  marginBottom: '12px',
                }}
              >
                Find my trainer
              </button>
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>No credit card needed.</p>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.32, ease: [0.2, 0.7, 0.2, 1] } }}
              exit={{ opacity: 0 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 0.1 } }}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 13 9 18 20 6" />
                  </svg>
                </motion.div>
                <h1 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '36px', margin: '0 0 12px', letterSpacing: '-.02em' }}>You're on the list</h1>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: 1.6, margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                  We're matching your <strong style={{ color: '#fff' }}>{form.sport}</strong> athlete in <strong style={{ color: '#fff' }}>{form.zipCode}</strong> with top coaches. Expect a message at <strong style={{ color: '#fff' }}>{form.email}</strong> within 24 hours.
                </p>
              </div>

              {/* Summary card */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '20px', marginBottom: '32px' }}>
                {[
                  { label: 'Sport', value: form.sport },
                  { label: 'Age group', value: form.ageGroup },
                  { label: 'Format', value: form.sessionFormat },
                  { label: 'ZIP code', value: form.zipCode },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link href="/" style={{ color: '#22C55E', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>← Back to FARM</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
