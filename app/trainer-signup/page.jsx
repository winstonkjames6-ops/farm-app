'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const SPORTS = [
  'Soccer', 'Basketball', 'Baseball', 'Softball', 'Tennis',
  'Volleyball', 'Lacrosse', 'Football', 'Track & Field',
  'Swimming', 'Golf', 'Gymnastics', 'Martial Arts', 'Hockey', 'Wrestling',
]

const STEPS = ['Your Info', 'Expertise', 'Availability', 'Review']

const inputClass = 'bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none w-full transition-colors'

export default function TrainerSignup() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    sports: [], location: '', zipCode: '',
    hourlyRate: '', sessionTypes: [],
    bio: '', credentials: '', experience: '',
    agreeToTerms: false,
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const toggleSport = (sport) => {
    setForm(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport],
    }))
  }

  const toggleSession = (type) => {
    setForm(prev => ({
      ...prev,
      sessionTypes: prev.sessionTypes.includes(type)
        ? prev.sessionTypes.filter(t => t !== type)
        : [...prev.sessionTypes, type],
    }))
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 13 9 18 20 6" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '36px', color: '#fff', margin: '0 0 14px', letterSpacing: '-.02em' }}>You're on the list</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', lineHeight: 1.6, margin: '0 0 32px' }}>
            We've received your application and will reach out to <span style={{ color: '#fff', fontWeight: 600 }}>{form.email}</span> within 2–3 business days.
          </p>
          <Link href="/" style={{ color: '#22C55E', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>← Back to FARM</Link>
        </div>
      </div>
    )
  }

  const stepVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.28, ease: [0.2, 0.7, 0.2, 1] } },
    exit: { x: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
  }

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
        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Trainer Application</span>
      </header>

      {/* Progress bar */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  background: i < step ? '#22C55E' : i === step ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: i < step ? '#000' : i === step ? '#0B0B0F' : 'rgba(255,255,255,0.3)',
                  border: i < step ? 'none' : i === step ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}>
                  {i < step
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="4 13 9 18 20 6" /></svg>
                    : i + 1}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: i === step ? '#fff' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: '2px', marginBottom: '22px', marginLeft: '8px', marginRight: '8px',
                  background: i < step ? '#22C55E' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '36px 24px 120px' }}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-0" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '28px', margin: '0 0 8px', letterSpacing: '-.02em' }}>Tell us about yourself</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 32px' }}>Basic info to set up your trainer profile.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>First name</label>
                  <input className={inputClass} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box' }} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Marcus" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Last name</label>
                  <input style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Rivera" />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Email</label>
                <input style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="marcus@example.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Phone</label>
                <input style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 000-0000" />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '28px', margin: '0 0 8px', letterSpacing: '-.02em' }}>Your expertise</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 28px' }}>Select the sports you coach and how you prefer to train.</p>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Sports you coach</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SPORTS.map(sport => (
                    <button key={sport} onClick={() => toggleSport(sport)} style={{
                      padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                      background: form.sports.includes(sport) ? '#22C55E' : 'transparent',
                      color: form.sports.includes(sport) ? '#000' : 'rgba(255,255,255,0.5)',
                      border: form.sports.includes(sport) ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.15)',
                    }}>{sport}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Session formats</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { type: 'In-Person', icon: '📍', desc: 'At a field or facility' },
                    { type: 'Remote Video', icon: '🎥', desc: 'Virtual coaching sessions' },
                    { type: 'Async Feedback', icon: '📋', desc: 'Video reviews & feedback' },
                  ].map(({ type, icon, desc }) => (
                    <button key={type} onClick={() => toggleSession(type)} style={{
                      padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                      background: form.sessionTypes.includes(type) ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                      border: form.sessionTypes.includes(type) ? '1.5px solid #22C55E' : '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: form.sessionTypes.includes(type) ? '#22C55E' : '#fff', marginBottom: '3px' }}>{type}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>City</label>
                  <input style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} value={form.location} onChange={e => update('location', e.target.value)} placeholder="Austin" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>ZIP code</label>
                  <input style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} value={form.zipCode} onChange={e => update('zipCode', e.target.value)} placeholder="78701" maxLength={5} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Hourly rate</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '15px', pointerEvents: 'none' }}>$</span>
                  <input style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 48px 12px 32px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} type="number" value={form.hourlyRate} onChange={e => update('hourlyRate', e.target.value)} placeholder="60" min={0} />
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '13px', pointerEvents: 'none' }}>/hr</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '28px', margin: '0 0 8px', letterSpacing: '-.02em' }}>Availability & background</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 32px' }}>Help parents understand your experience and style.</p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Years of experience</label>
                <select style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: form.experience ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '15px', width: '100%', outline: 'none', cursor: 'pointer', appearance: 'none' }} value={form.experience} onChange={e => update('experience', e.target.value)}>
                  <option value="" disabled style={{ background: '#1a1a24', color: 'rgba(255,255,255,0.5)' }}>Select range</option>
                  <option value="1-2" style={{ background: '#1a1a24', color: '#fff' }}>1–2 years</option>
                  <option value="3-5" style={{ background: '#1a1a24', color: '#fff' }}>3–5 years</option>
                  <option value="6-10" style={{ background: '#1a1a24', color: '#fff' }}>6–10 years</option>
                  <option value="10+" style={{ background: '#1a1a24', color: '#fff' }}>10+ years</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Credentials & certifications</label>
                <textarea style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: "'Hanken Grotesk', sans-serif" }} rows={3} value={form.credentials} onChange={e => update('credentials', e.target.value)} placeholder="e.g. USSF D License, played D1 at UT Austin, 5 years coaching competitive youth leagues" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Bio</label>
                <textarea style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: "'Hanken Grotesk', sans-serif" }} rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell parents what makes your coaching style unique. What should a parent know about working with you? What age groups do you specialize in?" />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '28px', margin: '0 0 8px', letterSpacing: '-.02em' }}>Review your application</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 28px' }}>Double-check your details before submitting.</p>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                {[
                  { label: 'Name', value: `${form.firstName} ${form.lastName}`.trim() || '—' },
                  { label: 'Email', value: form.email || '—' },
                  { label: 'Phone', value: form.phone || '—' },
                  { label: 'Sports', value: form.sports.length ? form.sports.join(', ') : '—' },
                  { label: 'Session formats', value: form.sessionTypes.length ? form.sessionTypes.join(', ') : '—' },
                  { label: 'Location', value: [form.location, form.zipCode].filter(Boolean).join(', ') || '—' },
                  { label: 'Hourly rate', value: form.hourlyRate ? `$${form.hourlyRate}/hr` : '—' },
                  { label: 'Experience', value: form.experience ? `${form.experience} years` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: '16px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, width: '120px', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: '14px', color: '#fff', flex: 1 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#22C55E' }}>85% payout on every session</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>FARM keeps just 15% to run the platform. You keep the rest — paid weekly via Stripe.</div>
                  </div>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <div
                  onClick={() => update('agreeToTerms', !form.agreeToTerms)}
                  style={{
                    width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
                    background: form.agreeToTerms ? '#22C55E' : 'rgba(255,255,255,0.05)',
                    border: form.agreeToTerms ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  {form.agreeToTerms && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 13 9 18 20 6" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  I agree to FARM's <span style={{ color: '#22C55E', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: '#22C55E', cursor: 'pointer' }}>Trainer Agreement</span>. I confirm all information is accurate.
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky nav footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      }}>
        <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 0
            ? <button onClick={() => setStep(s => s - 1)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 24px', color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", transition: 'border-color 0.2s' }}>← Back</button>
            : <div />}
          {step < STEPS.length - 1
            ? <button onClick={() => setStep(s => s + 1)} style={{ background: '#22C55E', border: 'none', borderRadius: '10px', padding: '13px 32px', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", transition: 'filter 0.2s' }}>Continue →</button>
            : <button onClick={() => setSubmitted(true)} disabled={!form.agreeToTerms} style={{ background: form.agreeToTerms ? '#22C55E' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '13px 32px', color: form.agreeToTerms ? '#000' : 'rgba(255,255,255,0.3)', fontSize: '15px', fontWeight: 700, cursor: form.agreeToTerms ? 'pointer' : 'not-allowed', fontFamily: "'Hanken Grotesk', sans-serif", transition: 'all 0.2s' }}>Submit Application</button>}
        </div>
      </div>
    </div>
  )
}
