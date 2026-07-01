'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const T = {
  bg: '#F8F8F6',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
  cyan: '#00BCC8',
  line: 'rgba(0,0,0,0.08)',
  error: '#EF4444',
}

const inputBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '10px',
  padding: '13px 16px',
  color: T.ink,
  fontSize: '16px',
  outline: 'none',
  fontFamily: "'Hanken Grotesk', sans-serif",
  transition: 'border-color .15s ease, box-shadow .15s ease',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: T.ink3,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  marginBottom: '8px',
  display: 'block',
}

const SPORTS = [
  'Soccer','Basketball','Baseball','Softball','Tennis','Volleyball',
  'Lacrosse','Football','Track & Field','Swimming','Golf','Gymnastics',
  'Martial Arts','Hockey','Wrestling','Other',
]

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function WarningIcon({ color = '#F59E0B' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="white" />
    </svg>
  )
}

function DotProgress({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: i === active ? T.cyan : 'rgba(0,0,0,0.12)',
          transition: 'background .2s ease',
        }} />
      ))}
    </div>
  )
}

type Step = 'age' | 'account' | 'role' | 'onboarding-parent' | 'onboarding-trainer' | 'done'

export default function SignupPage() {
  const [step, setStep] = useState<Step>('age')
  const [ageError, setAgeError] = useState<string | null>(null)
  const [ageWarning, setAgeWarning] = useState(false)
  const [dob, setDob] = useState('')
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: '' as 'parent' | 'trainer' | '',
    athleteFirstName: '', athleteSport: '', athleteAge: '',
    trainerSport: '', trainerRate: '', trainerLocation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  function calcAge(dobStr: string): number | null {
    if (!dobStr) return null
    const today = new Date()
    const birth = new Date(dobStr)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age >= 0 ? age : null
  }

  const liveAge = calcAge(dob)

  function handleAgeContinue() {
    const age = calcAge(dob)
    setCalculatedAge(age)
    if (age === null) { setAgeError('Please enter a valid date of birth.'); return }
    if (age < 13) { setAgeError('under13'); return }
    if (age >= 13 && age <= 17) { setAgeWarning(true) }
    setStep('account')
  }

  function validateAccount(): boolean {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required.'
    if (!form.lastName.trim()) e.lastName = 'Last name is required.'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Enter a valid email address.'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleAccountContinue() {
    if (validateAccount()) setStep('role')
  }

  function handleRoleContinue() {
    if (form.role === 'parent') setStep('onboarding-parent')
    else if (form.role === 'trainer') setStep('onboarding-trainer')
  }

  function handleParentDone() {
    setStep('done')
    router.push('/dashboard/search')
  }

  function handleTrainerDone() {
    setStep('done')
    router.push('/dashboard/trainer/schedule')
  }

  function goBack() {
    if (step === 'account') setStep('age')
    else if (step === 'role') setStep('account')
    else if (step === 'onboarding-parent' || step === 'onboarding-trainer') setStep('role')
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    ...inputBase,
    borderColor: focused === field ? T.cyan : errors[field] ? T.error : 'rgba(0,0,0,0.12)',
    boxShadow: focused === field ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
  })

  const cyanBtn: React.CSSProperties = {
    width: '100%', height: '52px', borderRadius: '11px', border: 'none',
    background: T.cyan, color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
    transition: 'filter .15s ease', marginTop: '8px',
  }

  // ── Render steps ────────────────────────────────────────────────────────────

  function renderStep() {
    if (step === 'age') {
      if (ageError === 'under13') {
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <WarningIcon color="#F97316" />
            </div>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: T.ink, margin: '0 0 12px' }}>
              You need a parent account
            </h2>
            <p style={{ fontSize: '14px', color: T.ink2, lineHeight: 1.6, margin: '0 0 28px' }}>
              Athletes under 13 can&apos;t create their own account. Ask a parent or guardian to sign up and add you as an athlete.
            </p>
            <Link href="/signup" style={{ display: 'block', ...cyanBtn, lineHeight: '52px', textDecoration: 'none', textAlign: 'center', marginBottom: '16px' }}>
              Go to parent signup
            </Link>
            <p style={{ fontSize: '13px', color: T.ink3, margin: 0 }}>
              Already have a parent account?{' '}
              <Link href="/login" style={{ color: T.cyan, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        )
      }

      return (
        <>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: T.ink, margin: '0 0 8px' }}>
            How old are you?
          </h1>
          <p style={{ fontSize: '15px', color: T.ink2, margin: '0 0 28px', lineHeight: 1.5 }}>
            We use this to keep younger athletes safe.
          </p>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => { setDob(e.target.value); setAgeError(null) }}
              onFocus={() => setFocused('dob')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputBase,
                borderColor: focused === 'dob' ? T.cyan : ageError && ageError !== 'under13' ? T.error : 'rgba(0,0,0,0.12)',
                boxShadow: focused === 'dob' ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
              }}
            />
            {liveAge !== null && (
              <p style={{ fontSize: '13px', color: T.ink3, margin: '6px 0 0' }}>Age: {liveAge}</p>
            )}
            {ageError && ageError !== 'under13' && (
              <p style={{ fontSize: '12px', color: T.error, margin: '6px 0 0' }}>{ageError}</p>
            )}
          </div>

          <button
            onClick={handleAgeContinue}
            disabled={!dob}
            style={{ ...cyanBtn, opacity: dob ? 1 : 0.5, cursor: dob ? 'pointer' : 'not-allowed' }}
          >
            Continue
          </button>
        </>
      )
    }

    if (step === 'account') {
      return (
        <>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '14px', padding: '0 0 20px', fontFamily: "'Hanken Grotesk', sans-serif' " }}>
            ← Back
          </button>

          {ageWarning && (
            <div style={{
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
              display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <WarningIcon color="#F59E0B" />
              <p style={{ fontSize: '13px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                Since you&apos;re under 18, a parent or guardian will need to verify your account before you can book sessions.
              </p>
            </div>
          )}

          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: T.ink, margin: '0 0 8px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '15px', color: T.ink2, margin: '0 0 28px', lineHeight: 1.5 }}>
            You&apos;re {calculatedAge} — let&apos;s get you set up.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>First name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => update('firstName', e.target.value)}
                onFocus={() => setFocused('firstName')}
                onBlur={() => setFocused(null)}
                placeholder="Alex"
                style={inputStyle('firstName')}
              />
              {errors.firstName && <p style={{ fontSize: '12px', color: T.error, margin: '4px 0 0' }}>{errors.firstName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => update('lastName', e.target.value)}
                onFocus={() => setFocused('lastName')}
                onBlur={() => setFocused(null)}
                placeholder="Johnson"
                style={inputStyle('lastName')}
              />
              {errors.lastName && <p style={{ fontSize: '12px', color: T.error, margin: '4px 0 0' }}>{errors.lastName}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              style={inputStyle('email')}
            />
            {errors.email && <p style={{ fontSize: '12px', color: T.error, margin: '4px 0 0' }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                style={{ ...inputStyle('password'), paddingRight: '46px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '10px',
                  minWidth: '44px', minHeight: '44px', color: T.ink3,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p style={{ fontSize: '12px', color: T.error, margin: '4px 0 0' }}>{errors.password}</p>}
          </div>

          <button
            onClick={handleAccountContinue}
            style={cyanBtn}
          >
            Continue
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: T.ink3, margin: '20px 0 0' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: T.cyan, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </>
      )
    }

    if (step === 'role') {
      const roleCard = (id: 'parent' | 'trainer', icon: React.ReactNode, title: string, desc: string) => {
        const selected = form.role === id
        return (
          <div
            onClick={() => update('role', id)}
            style={{
              borderRadius: '14px', padding: '24px 20px', cursor: 'pointer',
              transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center', gap: '10px', minHeight: '140px',
              border: selected ? `2px solid ${T.cyan}` : '2px solid rgba(0,0,0,0.08)',
              background: selected ? 'rgba(0,188,200,0.06)' : '#FFFFFF',
              justifyContent: 'center',
            }}
          >
            {icon}
            <p style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: T.ink, margin: 0 }}>{title}</p>
            <p style={{ fontSize: '13px', color: T.ink2, margin: 0, lineHeight: 1.4 }}>{desc}</p>
          </div>
        )
      }

      return (
        <>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '14px', padding: '0 0 20px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '28px', color: T.ink, margin: '0 0 8px' }}>
            I am a...
          </h1>
          <p style={{ fontSize: '15px', color: T.ink2, margin: '0 0 28px', lineHeight: 1.5 }}>
            This determines how FARM works for you.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            {roleCard('parent',
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.ink2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                <circle cx="18" cy="10" r="2" />
                <path d="M21 21v-1a3 3 0 0 0-3-3h-1" />
              </svg>,
              'Parent',
              'Find and book trainers for your athlete.'
            )}
            {roleCard('trainer',
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.ink2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="2" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>,
              'Trainer',
              'List your services and get booked by parents.'
            )}
          </div>

          <button
            onClick={handleRoleContinue}
            disabled={!form.role}
            style={{ ...cyanBtn, opacity: form.role ? 1 : 0.5, cursor: form.role ? 'pointer' : 'not-allowed' }}
          >
            Continue
          </button>
        </>
      )
    }

    if (step === 'onboarding-parent') {
      const valid = form.athleteFirstName.trim() && form.athleteSport
      return (
        <>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '14px', padding: '0 0 4px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            ← Back
          </button>
          <DotProgress total={3} active={1} />
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: T.ink, margin: '0 0 8px' }}>
            Tell us about your athlete
          </h1>
          <p style={{ fontSize: '14px', color: T.ink2, margin: '0 0 28px', lineHeight: 1.5 }}>
            You can add more athletes later.
          </p>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Athlete&apos;s first name</label>
            <input
              type="text"
              value={form.athleteFirstName}
              onChange={e => update('athleteFirstName', e.target.value)}
              onFocus={() => setFocused('athleteFirstName')}
              onBlur={() => setFocused(null)}
              placeholder="Jordan"
              style={inputStyle('athleteFirstName')}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Age (optional)</label>
            <input
              type="number"
              min={4}
              max={18}
              value={form.athleteAge}
              onChange={e => update('athleteAge', e.target.value)}
              onFocus={() => setFocused('athleteAge')}
              onBlur={() => setFocused(null)}
              placeholder="12"
              style={inputStyle('athleteAge')}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Primary sport</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SPORTS.map(sport => {
                const selected = form.athleteSport === sport
                return (
                  <button
                    key={sport}
                    onClick={() => update('athleteSport', sport)}
                    style={{
                      padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', minHeight: '44px', border: 'none',
                      background: selected ? T.cyan : 'transparent',
                      color: selected ? '#FFFFFF' : T.ink2,
                      outline: selected ? 'none' : `1px solid rgba(0,0,0,0.12)`,
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      transition: 'all .15s ease',
                    }}
                  >
                    {sport}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleParentDone}
            disabled={!valid}
            style={{ ...cyanBtn, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
          >
            Let&apos;s find a trainer →
          </button>
        </>
      )
    }

    if (step === 'onboarding-trainer') {
      const valid = form.trainerSport && form.trainerRate
      return (
        <>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '14px', padding: '0 0 4px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            ← Back
          </button>
          <DotProgress total={3} active={1} />
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '26px', color: T.ink, margin: '0 0 8px' }}>
            Set up your profile
          </h1>
          <p style={{ fontSize: '14px', color: T.ink2, margin: '0 0 28px', lineHeight: 1.5 }}>
            You can update this anytime.
          </p>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Primary sport</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SPORTS.map(sport => {
                const selected = form.trainerSport === sport
                return (
                  <button
                    key={sport}
                    onClick={() => update('trainerSport', sport)}
                    style={{
                      padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', minHeight: '44px', border: 'none',
                      background: selected ? T.cyan : 'transparent',
                      color: selected ? '#FFFFFF' : T.ink2,
                      outline: selected ? 'none' : `1px solid rgba(0,0,0,0.12)`,
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      transition: 'all .15s ease',
                    }}
                  >
                    {sport}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Hourly rate</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${focused === 'trainerRate' ? T.cyan : 'rgba(0,0,0,0.12)'}`, borderRadius: '10px', padding: '0 16px', boxShadow: focused === 'trainerRate' ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none', transition: 'border-color .15s ease, box-shadow .15s ease' }}>
              <span style={{ fontSize: '16px', color: T.ink2, paddingRight: '8px' }}>$</span>
              <input
                type="number"
                value={form.trainerRate}
                onChange={e => update('trainerRate', e.target.value)}
                onFocus={() => setFocused('trainerRate')}
                onBlur={() => setFocused(null)}
                placeholder="65"
                style={{ ...inputBase, border: 'none', padding: '13px 0', boxShadow: 'none', flex: 1 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Location / City</label>
            <input
              type="text"
              value={form.trainerLocation}
              onChange={e => update('trainerLocation', e.target.value)}
              onFocus={() => setFocused('trainerLocation')}
              onBlur={() => setFocused(null)}
              placeholder="Austin, TX"
              style={inputStyle('trainerLocation')}
            />
          </div>

          <button
            onClick={handleTrainerDone}
            disabled={!valid}
            style={{ ...cyanBtn, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
          >
            Go to my dashboard →
          </button>
        </>
      )
    }

    if (step === 'done') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: T.cyan,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ fontSize: '16px', color: T.ink2, margin: 0, fontWeight: 600 }}>Setting things up...</p>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <style>{`
        .auth-left { display: none; }
        @media (min-width: 768px) { .auth-left { display: flex; flex: 0 0 50%; } }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Hanken Grotesk', sans-serif" }}>
        {/* LEFT PANEL */}
        <div className="auth-left" style={{ position: 'relative', overflow: 'hidden', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/backgrounds/auth-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
          <div style={{ position: 'absolute', bottom: '48px', left: '48px', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: '#FFFFFF' }}>F</span>
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '36px', color: '#FFFFFF', letterSpacing: '0.12em' }}>FARM</span>
            </div>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>
              On-demand training for the next generation.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: T.bg, overflowY: 'auto', minHeight: '100vh' }}>
          <div style={{ maxWidth: '440px', width: '100%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
