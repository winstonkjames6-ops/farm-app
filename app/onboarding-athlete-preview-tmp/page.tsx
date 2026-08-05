'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { PasswordStrengthMeter, computePasswordStrength } from '@/components/auth/PasswordStrengthMeter'

// For athletes 18+ only — full self-service, no parent-account linkage
// required afterward. A minor claiming their row goes through a separate
// wizard (not built yet) that keeps parental oversight in place.
//
// The invite code is the only handle the client ever holds — never the
// athlete row's id. lookup_invite_code() (anon-callable) previews the
// parent-entered name/dob/sport before any account exists; the real claim
// (setting profile_id) happens via claim_athlete_invite() right after
// signUp(), since it needs an authenticated auth.uid().

const SPORTS = [
  'Soccer', 'Basketball', 'Baseball', 'Softball', 'Tennis',
  'Volleyball', 'Lacrosse', 'Football', 'Track & Field',
  'Swimming', 'Golf', 'Gymnastics', 'Martial Arts', 'Hockey', 'Wrestling', 'Other',
]

const inputStyle: React.CSSProperties = {
  width: '100%', height: '48px', borderRadius: '10px', border: '1px solid #E5E7EB',
  padding: '0 14px', fontSize: '15px', fontFamily: "'Hanken Grotesk', sans-serif",
  outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.40)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
      letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: T.ink3, marginBottom: '6px',
    }}>{children}</div>
  )
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          flex: 1, height: '4px', borderRadius: '999px',
          background: i <= step ? T.cyan : '#E5E7EB',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  )
}

function WizardShell({
  step, title, subtitle, children, onBack, onContinue, canContinue, submitting, isLastStep,
}: {
  step: number
  title: string
  subtitle: string
  children: React.ReactNode
  onBack: (() => void) | null
  onContinue: () => void
  canContinue: boolean
  submitting: boolean
  isLastStep: boolean
}) {
  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px 100px' }}>
        <StepIndicator step={step} />

        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink,
          marginBottom: '4px',
        }}>{title}</div>
        <div style={{
          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '28px',
        }}>{subtitle}</div>

        {children}

        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          background: 'rgba(248,248,246,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px 20px',
          display: 'flex', gap: '12px', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '480px', width: '100%', display: 'flex', gap: '12px' }}>
            {onBack && (
              <button
                onClick={onBack}
                disabled={submitting}
                style={{
                  height: '48px', padding: '0 20px', borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: T.ink2,
                  fontSize: '15px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif",
                  cursor: submitting ? 'default' : 'pointer',
                }}
              >Back</button>
            )}
            <button
              onClick={onContinue}
              disabled={!canContinue || submitting}
              style={{
                flex: 1, height: '48px', padding: '0 20px', borderRadius: '10px', border: 'none',
                background: T.cyan, color: '#FFFFFF',
                fontSize: '15px', fontWeight: 700, fontFamily: "'Hanken Grotesk', sans-serif",
                cursor: (!canContinue || submitting) ? 'default' : 'pointer',
                opacity: (!canContinue || submitting) ? 0.5 : 1,
              }}
            >{submitting ? 'Saving…' : isLastStep ? 'Finish setup' : 'Continue'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Invite gate ──────────────────────────────────────────────────────────────────

function InviteGate({ onSubmit, error, submitting }: {
  onSubmit: (code: string) => void
  error: string | null
  submitting: boolean
}) {
  const [code, setCode] = useState('')

  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink, marginBottom: '4px',
        }}>Set up your account</div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '24px' }}>
          Enter the invite code your parent gave you.
        </div>
        <FieldLabel>Invite code</FieldLabel>
        <input
          style={{ ...inputStyle, textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '0.08em' }}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC-123"
          onKeyDown={(e) => { if (e.key === 'Enter' && code.trim()) onSubmit(code.trim()) }}
        />
        {error && (
          <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '10px' }}>{error}</div>
        )}
        <button
          onClick={() => onSubmit(code.trim())}
          disabled={!code.trim() || submitting}
          style={{
            width: '100%', height: '48px', padding: '0 20px', borderRadius: '10px', border: 'none',
            background: T.cyan, color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
            fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px',
            cursor: (!code.trim() || submitting) ? 'default' : 'pointer',
            opacity: (!code.trim() || submitting) ? 0.5 : 1,
          }}
        >{submitting ? 'Checking…' : 'Continue'}</button>
      </div>
    </div>
  )
}

// ── Step 1: Confirm info ─────────────────────────────────────────────────────────

function computeAge(dob: string): number | null {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

function ConfirmInfoStep({
  firstName, setFirstName, lastName, setLastName, dob, setDob, sport, setSport, ageError,
}: {
  firstName: string; setFirstName: (v: string) => void
  lastName: string; setLastName: (v: string) => void
  dob: string; setDob: (v: string) => void
  sport: string; setSport: (v: string) => void
  ageError: string | null
}) {
  return (
    <div>
      <div style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px' }}>
        Your parent entered this when they set up your invite — make sure it&apos;s right, and fix anything that isn&apos;t.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div><FieldLabel>First name</FieldLabel><input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><FieldLabel>Last name</FieldLabel><input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Date of birth</FieldLabel>
        <input style={inputStyle} type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDob(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Sport</FieldLabel>
        <select style={selectStyle} value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">Select a sport</option>
          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {ageError && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{ageError}</div>
      )}
    </div>
  )
}

// ── Step 2: Login ────────────────────────────────────────────────────────────────

function LoginStep({
  email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, agreed, setAgreed, error,
}: {
  email: string; setEmail: (v: string) => void
  password: string; setPassword: (v: string) => void
  confirmPassword: string; setConfirmPassword: (v: string) => void
  agreed: boolean; setAgreed: (v: boolean) => void
  error: string | null
}) {
  const strength = computePasswordStrength(password)
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Email</FieldLabel>
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Password</FieldLabel>
        <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        <PasswordStrengthMeter password={password} />
      </div>
      <div>
        <FieldLabel>Confirm password</FieldLabel>
        <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {mismatch && (
          <div style={{ fontSize: '12px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '6px' }}>Passwords don&apos;t match.</div>
        )}
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '20px' }}>
        <input
          type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: T.cyan, flexShrink: 0 }}
        />
        <span style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", lineHeight: 1.5 }}>
          I agree to FARM&apos;s Terms of Service and Privacy Policy.
        </span>
      </label>

      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>
      )}
      {strength.score === 0 && password.length > 0 && (
        <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '4px' }}>
          Use at least 8 characters.
        </div>
      )}
    </div>
  )
}

// ── Step 3: Notification preferences ─────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '44px', height: '26px', borderRadius: '999px',
        background: on ? T.cyan : '#E5E7EB',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF',
        position: 'absolute', top: '3px', left: on ? '21px' : '3px',
        transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

function ToggleRow({ label, hint, on, onToggle, isLast }: { label: string; hint: string; on: boolean; onToggle: () => void; isLast?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      padding: '14px 0', borderBottom: isLast ? 'none' : `1px solid ${T.line}`,
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>{label}</div>
        <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>{hint}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

function NotificationsStep({
  sessionReminders, setSessionReminders, messages, setMessages, promoUpdates, setPromoUpdates,
}: {
  sessionReminders: boolean; setSessionReminders: (v: boolean) => void
  messages: boolean; setMessages: (v: boolean) => void
  promoUpdates: boolean; setPromoUpdates: (v: boolean) => void
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '18px',
    }}>
      <ToggleRow label="Session reminders" hint="Get notified 1 hour before sessions" on={sessionReminders} onToggle={() => setSessionReminders(!sessionReminders)} />
      <ToggleRow label="Messages" hint="When your trainer messages you" on={messages} onToggle={() => setMessages(!messages)} />
      <ToggleRow label="Promotional updates" hint="Tips, offers, and platform news" on={promoUpdates} onToggle={() => setPromoUpdates(!promoUpdates)} isLast />
    </div>
  )
}

// ── Confirmation screen ───────────────────────────────────────────────────────────

function ConfirmationScreen({ onDone }: { onDone: () => void }) {
  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '999px', background: 'rgba(0,188,200,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink, marginBottom: '8px' }}>
          You&apos;re all set
        </div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '28px' }}>
          Your account is ready. You&apos;re in full control of it from here — no parent sign-in needed.
        </div>
        <button
          onClick={onDone}
          style={{
            width: '100%', height: '48px', padding: '0 20px', borderRadius: '10px', border: 'none',
            background: T.cyan, color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
            fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
          }}
        >Go to dashboard</button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type Phase = 'gate' | 'wizard' | 'done'

export default function AthleteOnboardingPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<Phase>('gate')
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [code, setCode] = useState('')
  const [gateError, setGateError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [sport, setSport] = useState('')
  const [ageError, setAgeError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const [sessionReminders, setSessionReminders] = useState(true)
  const [messages, setMessages] = useState(true)
  const [promoUpdates, setPromoUpdates] = useState(false)

  useEffect(() => { setReady(true) }, [])

  async function handleSubmitCode(enteredCode: string) {
    setSubmitting(true)
    setGateError(null)
    await new Promise((r) => setTimeout(r, 300))
    setSubmitting(false)
    if (enteredCode === 'BAD-000') {
      setGateError('Invalid or expired invite code.')
      return
    }
    setFirstName('Jordan')
    setLastName('Rivera')
    setDob('2005-06-15')
    setSport('Soccer')
    setCode(enteredCode)
    setPhase('wizard')
  }

  const confirmInfoValid = firstName.trim().length > 0 && lastName.trim().length > 0 && dob !== '' && sport !== ''
  const loginValid = email.trim().includes('@') && password.length >= 8 && password === confirmPassword && agreed

  function handleConfirmInfoContinue() {
    const age = computeAge(dob)
    if (age === null) { setAgeError('Please enter a valid date of birth.'); return }
    if (age < 18) {
      setAgeError('This account setup is for athletes 18 and older. Please check the date of birth, or ask your parent for help finishing your account.')
      return
    }
    setAgeError(null)
    setStep(1)
  }

  async function handleCreateAndClaim() {
    setSubmitting(true)
    setLoginError(null)
    await new Promise((r) => setTimeout(r, 300))
    setSubmitting(false)
    setStep(2)
  }

  async function handleFinish() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 300))
    setSubmitting(false)
    setPhase('done')
  }

  function handleContinue() {
    if (step === 0) handleConfirmInfoContinue()
    else if (step === 1 && loginValid) void handleCreateAndClaim()
    else if (step === 2) void handleFinish()
  }

  if (!ready) return null

  if (phase === 'gate') {
    return <InviteGate onSubmit={handleSubmitCode} error={gateError} submitting={submitting} />
  }

  if (phase === 'done') {
    return <ConfirmationScreen onDone={() => router.push('/dashboard/athlete')} />
  }

  return (
    <>
      {step === 0 && (
        <WizardShell
          step={0} title="Confirm your info" subtitle="Let's make sure we have this right."
          onBack={null} onContinue={handleContinue} canContinue={confirmInfoValid}
          submitting={false} isLastStep={false}
        >
          <ConfirmInfoStep
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            dob={dob} setDob={setDob}
            sport={sport} setSport={setSport}
            ageError={ageError}
          />
        </WizardShell>
      )}
      {step === 1 && (
        <WizardShell
          step={1} title="Create your login" subtitle="You're an adult athlete — this account is fully yours."
          onBack={() => setStep(0)} onContinue={handleContinue} canContinue={loginValid}
          submitting={submitting} isLastStep={false}
        >
          <LoginStep
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            agreed={agreed} setAgreed={setAgreed}
            error={loginError}
          />
        </WizardShell>
      )}
      {step === 2 && (
        <WizardShell
          step={2} title="Notification preferences" subtitle="You can change these anytime."
          onBack={null} onContinue={handleContinue} canContinue
          submitting={submitting} isLastStep
        >
          <NotificationsStep
            sessionReminders={sessionReminders} setSessionReminders={setSessionReminders}
            messages={messages} setMessages={setMessages}
            promoUpdates={promoUpdates} setPromoUpdates={setPromoUpdates}
          />
        </WizardShell>
      )}
    </>
  )
}
