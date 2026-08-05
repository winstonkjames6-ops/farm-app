'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { CURRENT_TERMS_VERSION } from '@/lib/terms'
import { PasswordStrengthMeter, computePasswordStrength } from '@/components/auth/PasswordStrengthMeter'

// Handles both the 18+ self-service flow (full control, no parent-account
// linkage afterward) and the minor flow (parent-entered info stays
// read-only, notification options are limited, and the account is
// explicitly framed as parent-managed) from a single invite-code entry
// point, since the parent's "share this code with your athlete" copy makes
// no distinction by age. Age is decided once, right after the invite-code
// lookup returns a dob, via `flowKind`.
//
// The invite code is the only handle the client ever holds — never the
// athlete row's id. lookup_invite_code() (anon-callable) previews the
// parent-entered name/dob/sport before any account exists; the real claim
// (setting profile_id) happens via claim_athlete_invite() right after
// signUp(), since it needs an authenticated auth.uid().
//
// Minors don't get a "new trainer messages" notification toggle — direct
// trainer<->minor messaging is gated server-side (see the RLS policy from
// block_minor_messaging_without_waiver, keyed off the parent-signed waiver
// on the athletes row), not by a client-side preference. Surfacing a toggle
// here would imply a control that doesn't exist yet.

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

function StepIndicator({ step, totalSteps = 3 }: { step: number; totalSteps?: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
      {Array.from({ length: totalSteps }, (_, i) => i).map((i) => (
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
  step, totalSteps, title, subtitle, children, onBack, onContinue, canContinue, submitting, isLastStep,
}: {
  step: number
  totalSteps?: number
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
        <StepIndicator step={step} totalSteps={totalSteps} />

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
      <div style={{ maxWidth: '480px', width: '100%' }}>
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
        Your parent entered this when they set up your invite — make sure it's right, and fix anything that isn't.
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
          <div style={{ fontSize: '12px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '6px' }}>Passwords don't match.</div>
        )}
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '20px' }}>
        <input
          type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: T.cyan, flexShrink: 0 }}
        />
        <span style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", lineHeight: 1.5 }}>
          I agree to FARM's Terms of Service and Privacy Policy.
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

// ── Minor flow: Step 1 (welcome + account) ───────────────────────────────────────

const readOnlyFieldStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
  padding: '13px 16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px',
}

function MinorWelcomeStep({
  firstName, name, dobDisplay, sport, email, setEmail, password, setPassword, error,
}: {
  firstName: string
  name: string
  dobDisplay: string
  sport: string
  email: string; setEmail: (v: string) => void
  password: string; setPassword: (v: string) => void
  error: string | null
}) {
  return (
    <div>
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', color: T.ink2, lineHeight: 1.5, marginBottom: '20px' }}>
        Your parent or guardian already set up most of your profile. Just add an email and password and you're ready to go.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
        <div style={readOnlyFieldStyle}>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: T.ink3, flexShrink: 0 }}>Name</span>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14.5px', fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', flexShrink: 0 }}>{name}</span>
        </div>
        <div style={readOnlyFieldStyle}>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: T.ink3, flexShrink: 0 }}>Date of birth</span>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14.5px', fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', flexShrink: 0 }}>{dobDisplay}</span>
        </div>
        <div style={readOnlyFieldStyle}>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: T.ink3, flexShrink: 0 }}>Sport</span>
          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14.5px', fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', flexShrink: 0 }}>{sport}</span>
        </div>
      </div>
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', color: T.ink3, marginBottom: '20px' }}>
        Need to change any of this, {firstName}? Ask your parent or guardian to update it from their account.
      </div>

      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Email</FieldLabel>
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <FieldLabel>Set a password</FieldLabel>
        <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        <PasswordStrengthMeter password={password} />
      </div>

      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>
      )}
    </div>
  )
}

// ── Minor flow: Step 2 (notifications) ───────────────────────────────────────────

function MinorNotificationsStep({
  sessionReminders, setSessionReminders, sessionFeedback, setSessionFeedback,
}: {
  sessionReminders: boolean; setSessionReminders: (v: boolean) => void
  sessionFeedback: boolean; setSessionFeedback: (v: boolean) => void
}) {
  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '16px',
      }}>
        <ToggleRow label="Session reminders" hint="Get notified 1 hour before sessions" on={sessionReminders} onToggle={() => setSessionReminders(!sessionReminders)} />
        <ToggleRow label="Feedback after sessions" hint="When your trainer leaves notes on a session" on={sessionFeedback} onToggle={() => setSessionFeedback(!sessionFeedback)} isLast />
      </div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px',
        borderRadius: '12px', background: '#F9FAFB', border: '1px solid #E5E7EB',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
          <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" />
        </svg>
        <span style={{ fontSize: '13px', lineHeight: 1.5, color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          Your parent or guardian has already agreed to FARM's terms on your behalf.
        </span>
      </div>
    </div>
  )
}

// ── Confirmation screen ───────────────────────────────────────────────────────────

function ConfirmationScreen({ onDone }: { onDone: () => void }) {
  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '999px', background: 'rgba(0,188,200,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink, marginBottom: '8px' }}>
          You're all set
        </div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '28px' }}>
          Your account is ready. You're in full control of it from here — no parent sign-in needed.
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

function MinorConfirmationScreen({ firstName, onDone }: { firstName: string; onDone: () => void }) {
  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '999px', background: 'rgba(0,188,200,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink, marginBottom: '8px' }}>
          You're all set
        </div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '20px' }}>
          Your account is ready, {firstName}.
        </div>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px' }}>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13.5px', lineHeight: 1.5, color: T.ink3 }}>
            Your parent or guardian manages your account settings from their dashboard.
          </div>
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
type FlowKind = 'adult' | 'minor'

export default function AthleteOnboardingPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<Phase>('gate')
  const [flowKind, setFlowKind] = useState<FlowKind>('adult')
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

  // Minor flow only
  const [minorEmail, setMinorEmail] = useState('')
  const [minorPassword, setMinorPassword] = useState('')
  const [minorLoginError, setMinorLoginError] = useState<string | null>(null)
  const [minorSessionReminders, setMinorSessionReminders] = useState(true)
  const [minorSessionFeedback, setMinorSessionFeedback] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'athlete') { router.replace('/dashboard'); return }
        const { data: existing } = await supabase.from('athletes').select('id').eq('profile_id', user.id).limit(1)
        if (existing && existing.length > 0) { router.replace('/dashboard/athlete'); return }
      }
      setReady(true)
    }
    init()
  }, [router, supabase])

  async function handleSubmitCode(enteredCode: string) {
    setSubmitting(true)
    setGateError(null)
    const { data, error } = await supabase.rpc('lookup_invite_code', { p_code: enteredCode })
    setSubmitting(false)
    if (error || !data || data.length === 0) {
      setGateError(error?.message ?? 'Invalid or expired invite code.')
      return
    }
    const row = data[0]
    const nameParts = (row.name ?? '').trim().split(/\s+/).filter(Boolean)
    setFirstName(nameParts[0] ?? '')
    setLastName(nameParts.slice(1).join(' '))
    setDob(row.dob ?? '')
    setSport(row.sport ?? '')
    setCode(enteredCode)
    const age = computeAge(row.dob ?? '')
    setFlowKind(age !== null && age < 18 ? 'minor' : 'adult')
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
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { role: 'athlete', name: fullName, dob } },
    })
    if (error || !data.user) {
      setSubmitting(false)
      setLoginError(error?.message ?? 'Something went wrong. Please try again.')
      return
    }

    const { error: claimErr } = await supabase.rpc('claim_athlete_invite', {
      p_code: code, p_name: fullName, p_dob: dob, p_sport: sport,
    })
    if (claimErr) {
      setSubmitting(false)
      setLoginError(claimErr.message)
      return
    }

    await supabase.from('profiles').update({ terms_accepted_at: new Date().toISOString(), terms_version: CURRENT_TERMS_VERSION }).eq('id', data.user.id)

    setSubmitting(false)
    setStep(2)
  }

  async function handleFinish() {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({
          notif_session_reminders: sessionReminders,
          notif_messages: messages,
          notif_promo_updates: promoUpdates,
        })
        .eq('id', user.id)
    }
    setSubmitting(false)
    setPhase('done')
  }

  // Minor flow — the name/dob/sport are already fixed from the invite lookup
  // (read-only in the UI), so there's no confirm-info step to run first, and
  // no ToS checkbox: the parent already accepted on the athlete's behalf
  // during their own onboarding (athletes.terms_accepted_at), so this
  // doesn't touch profiles.terms_accepted_at for the minor's own login.
  const minorLoginValid = minorEmail.trim().includes('@') && minorPassword.length >= 8

  async function handleMinorCreateAndClaim() {
    setSubmitting(true)
    setMinorLoginError(null)
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    const { data, error } = await supabase.auth.signUp({
      email: minorEmail.trim(),
      password: minorPassword,
      options: { data: { role: 'athlete', name: fullName, dob } },
    })
    if (error || !data.user) {
      setSubmitting(false)
      setMinorLoginError(error?.message ?? 'Something went wrong. Please try again.')
      return
    }

    const { error: claimErr } = await supabase.rpc('claim_athlete_invite', {
      p_code: code, p_name: fullName, p_dob: dob, p_sport: sport,
    })
    if (claimErr) {
      setSubmitting(false)
      setMinorLoginError(claimErr.message)
      return
    }

    setSubmitting(false)
    setStep(1)
  }

  async function handleMinorFinish() {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({
          notif_session_reminders: minorSessionReminders,
          notif_session_feedback: minorSessionFeedback,
        })
        .eq('id', user.id)
    }
    setSubmitting(false)
    setPhase('done')
  }

  function handleContinue() {
    if (flowKind === 'minor') {
      if (step === 0 && minorLoginValid) void handleMinorCreateAndClaim()
      else if (step === 1) void handleMinorFinish()
      return
    }
    if (step === 0) handleConfirmInfoContinue()
    else if (step === 1 && loginValid) void handleCreateAndClaim()
    else if (step === 2) void handleFinish()
  }

  if (!ready) return null

  if (phase === 'gate') {
    return <InviteGate onSubmit={handleSubmitCode} error={gateError} submitting={submitting} />
  }

  if (phase === 'done') {
    return flowKind === 'minor'
      ? <MinorConfirmationScreen firstName={firstName} onDone={() => router.push('/dashboard/athlete')} />
      : <ConfirmationScreen onDone={() => router.push('/dashboard/athlete')} />
  }

  if (flowKind === 'minor') {
    const fullName = `${firstName} ${lastName}`.trim()
    const dobDisplay = (() => {
      if (!dob) return '—'
      const d = new Date(`${dob}T00:00:00`)
      if (isNaN(d.getTime())) return dob
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    })()

    return (
      <>
        {step === 0 && (
          <WizardShell
            step={0} totalSteps={2} title={`Welcome, ${firstName || 'there'}!`} subtitle="Let's get your account set up."
            onBack={null} onContinue={handleContinue} canContinue={minorLoginValid}
            submitting={submitting} isLastStep={false}
          >
            <MinorWelcomeStep
              firstName={firstName || 'there'} name={fullName} dobDisplay={dobDisplay} sport={sport}
              email={minorEmail} setEmail={setMinorEmail}
              password={minorPassword} setPassword={setMinorPassword}
              error={minorLoginError}
            />
          </WizardShell>
        )}
        {step === 1 && (
          <WizardShell
            step={1} totalSteps={2} title="How should we notify you?" subtitle="You can change this later."
            onBack={null} onContinue={handleContinue} canContinue
            submitting={submitting} isLastStep
          >
            <MinorNotificationsStep
              sessionReminders={minorSessionReminders} setSessionReminders={setMinorSessionReminders}
              sessionFeedback={minorSessionFeedback} setSessionFeedback={setMinorSessionFeedback}
            />
          </WizardShell>
        )}
      </>
    )
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
