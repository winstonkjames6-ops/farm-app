'use client'

import { useState } from 'react'
import { T } from '@/lib/theme'

const SPORTS = [
  'Soccer', 'Basketball', 'Baseball', 'Softball', 'Tennis',
  'Volleyball', 'Lacrosse', 'Football', 'Track & Field',
  'Swimming', 'Golf', 'Gymnastics', 'Martial Arts', 'Hockey', 'Wrestling', 'Other',
]

interface ChildDraft { localId: string; firstName: string; lastName: string; dob: string; sport: string }
interface ClaimedChild { id: string; name: string; inviteCode: string }

function newChildDraft(): ChildDraft {
  return { localId: Math.random().toString(36).slice(2), firstName: '', lastName: '', dob: '', sport: '' }
}

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
        <div key={i} style={{ flex: 1, height: '4px', borderRadius: '999px', background: i <= step ? T.cyan : '#E5E7EB', transition: 'background 0.2s' }} />
      ))}
    </div>
  )
}

function WizardShell({
  step, title, subtitle, children, onBack, onContinue, canContinue, submitting, isLastStep,
}: {
  step: number; title: string; subtitle: string; children: React.ReactNode
  onBack: (() => void) | null; onContinue: () => void; canContinue: boolean; submitting: boolean; isLastStep: boolean
}) {
  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px 100px' }}>
        <StepIndicator step={step} />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink, marginBottom: '4px' }}>{title}</div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '28px' }}>{subtitle}</div>
        {children}
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          background: 'rgba(248,248,246,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px 20px', display: 'flex', gap: '12px', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '480px', width: '100%', display: 'flex', gap: '12px' }}>
            {onBack && (
              <button onClick={onBack} disabled={submitting} style={{
                height: '48px', padding: '0 20px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)',
                background: 'transparent', color: T.ink2, fontSize: '15px', fontWeight: 600,
                fontFamily: "'Hanken Grotesk', sans-serif", cursor: submitting ? 'default' : 'pointer',
              }}>Back</button>
            )}
            <button onClick={onContinue} disabled={!canContinue || submitting} style={{
              flex: 1, height: '48px', padding: '0 20px', borderRadius: '10px', border: 'none',
              background: T.cyan, color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
              fontFamily: "'Hanken Grotesk', sans-serif", cursor: (!canContinue || submitting) ? 'default' : 'pointer',
              opacity: (!canContinue || submitting) ? 0.5 : 1,
            }}>{submitting ? 'Saving…' : isLastStep ? 'Finish setup' : 'Continue'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountStep({
  firstName, setFirstName, lastName, setLastName, email, setEmail, password, setPassword, error,
}: {
  firstName: string; setFirstName: (v: string) => void
  lastName: string; setLastName: (v: string) => void
  email: string; setEmail: (v: string) => void
  password: string; setPassword: (v: string) => void
  error: string | null
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div><FieldLabel>First name</FieldLabel><input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><FieldLabel>Last name</FieldLabel><input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: '16px' }}><FieldLabel>Email</FieldLabel><input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <div><FieldLabel>Password</FieldLabel><input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /></div>
      {error && <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>}
    </div>
  )
}

function ChildCard({ child, onChange, onRemove, canRemove }: { child: ChildDraft; onChange: (patch: Partial<ChildDraft>) => void; onRemove: () => void; canRemove: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: canRemove ? '4px' : 0 }}>
        {canRemove && <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '12px', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600 }}>Remove</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div><FieldLabel>First name</FieldLabel><input style={inputStyle} value={child.firstName} onChange={(e) => onChange({ firstName: e.target.value })} /></div>
        <div><FieldLabel>Last name</FieldLabel><input style={inputStyle} value={child.lastName} onChange={(e) => onChange({ lastName: e.target.value })} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div><FieldLabel>Date of birth</FieldLabel><input style={inputStyle} type="date" value={child.dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => onChange({ dob: e.target.value })} /></div>
        <div>
          <FieldLabel>Sport</FieldLabel>
          <select style={selectStyle} value={child.sport} onChange={(e) => onChange({ sport: e.target.value })}>
            <option value="">Select a sport</option>
            {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

function AthletesStep({ kids, onChangeChild, onAddChild, onRemoveChild }: {
  kids: ChildDraft[]; onChangeChild: (localId: string, patch: Partial<ChildDraft>) => void; onAddChild: () => void; onRemoveChild: (localId: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px' }}>Add each athlete you&apos;ll be booking sessions for.</div>
      {kids.map((child) => (
        <ChildCard key={child.localId} child={child} onChange={(patch) => onChangeChild(child.localId, patch)} onRemove={() => onRemoveChild(child.localId)} canRemove={kids.length > 1} />
      ))}
      <button onClick={onAddChild} style={{
        width: '100%', height: '48px', borderRadius: '10px', border: '1px dashed #E5E7EB',
        background: 'transparent', color: T.ink3, fontSize: '14px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
      }}>+ Add another athlete</button>
    </div>
  )
}

function computeAge(dob: string): number | null {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

function ConsentStep({ kids, agreed, setAgreed, error }: { kids: ChildDraft[]; agreed: boolean; setAgreed: (v: boolean) => void; error: string | null }) {
  return (
    <div>
      <div style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
        {kids.map((child, i) => {
          const age = computeAge(child.dob)
          return (
            <div key={child.localId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < kids.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: T.ink }}>{child.firstName} {child.lastName}</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>{age != null ? `${age} yrs · ` : ''}{child.sport}</div>
            </div>
          )
        })}
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: T.cyan, flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", lineHeight: 1.5 }}>
          I confirm I am the parent or legal guardian of the athlete(s) listed above and I agree to FARM&apos;s Terms of Service and Privacy Policy on their behalf.
        </span>
      </label>
      {error && <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>}
    </div>
  )
}

function SuccessScreen({ claimed, onDone }: { claimed: ClaimedChild[]; onDone: () => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000)
    })
  }
  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px 100px' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink, marginBottom: '4px' }}>You&apos;re all set</div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3, marginBottom: '28px' }}>
          Share each code below with your athlete — they&apos;ll enter it when they set up their own FARM account.
        </div>
        {claimed.map((child) => (
          <div key={child.id} style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: T.ink, marginBottom: '10px' }}>{child.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', letterSpacing: '0.08em', color: T.cyan, background: 'rgba(0,188,200,0.08)', border: '1px solid rgba(0,188,200,0.2)', borderRadius: '10px', padding: '10px 14px', textAlign: 'center' }}>{child.inviteCode}</div>
              <button onClick={() => copyCode(child.id, child.inviteCode)} style={{
                height: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)',
                background: 'transparent', color: T.ink2, fontSize: '13px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', flexShrink: 0,
              }}>{copiedId === child.id ? 'Copied!' : 'Copy'}</button>
            </div>
          </div>
        ))}
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, background: 'rgba(248,248,246,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px 20px', display: 'flex', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '480px', width: '100%' }}>
            <button onClick={onDone} style={{ width: '100%', height: '48px', padding: '0 20px', borderRadius: '10px', border: 'none', background: T.cyan, color: '#FFFFFF', fontSize: '15px', fontWeight: 700, fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer' }}>Go to dashboard</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ParentOnboardingPreview() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [claimed, setClaimed] = useState<ClaimedChild[] | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [children, setChildren] = useState<ChildDraft[]>([newChildDraft()])
  const [agreed, setAgreed] = useState(false)

  const accountValid = firstName.trim().length > 0 && lastName.trim().length > 0 && email.trim().includes('@') && password.length >= 8
  const athletesValid = children.length > 0 && children.every((c) => c.firstName.trim().length > 0 && c.lastName.trim().length > 0 && c.dob !== '' && c.sport !== '')

  function updateChild(localId: string, patch: Partial<ChildDraft>) {
    setChildren((prev) => prev.map((c) => (c.localId === localId ? { ...c, ...patch } : c)))
  }
  function addChild() { setChildren((prev) => [...prev, newChildDraft()]) }
  function removeChild(localId: string) { setChildren((prev) => (prev.length > 1 ? prev.filter((c) => c.localId !== localId) : prev)) }

  function handleContinue() {
    if (step === 0 && accountValid) {
      setSubmitting(true)
      setTimeout(() => { setSubmitting(false); setStep(1) }, 300)
    } else if (step === 1 && athletesValid) setStep(2)
    else if (step === 2) {
      if (!agreed) return
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        setClaimed(children.map((c, i) => ({ id: `mock-${i}`, name: `${c.firstName} ${c.lastName}`.trim(), inviteCode: 'ABC-123' })))
      }, 300)
    }
  }

  if (claimed) return <SuccessScreen claimed={claimed} onDone={() => {}} />

  return (
    <>
      {step === 0 && (
        <WizardShell step={0} title="Create your account" subtitle="Let's get you set up on FARM." onBack={null} onContinue={handleContinue} canContinue={accountValid} submitting={submitting} isLastStep={false}>
          <AccountStep firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={null} />
        </WizardShell>
      )}
      {step === 1 && (
        <WizardShell step={1} title="Add your athletes" subtitle="Who are you booking sessions for?" onBack={null} onContinue={handleContinue} canContinue={athletesValid} submitting={false} isLastStep={false}>
          <AthletesStep kids={children} onChangeChild={updateChild} onAddChild={addChild} onRemoveChild={removeChild} />
        </WizardShell>
      )}
      {step === 2 && (
        <WizardShell step={2} title="Consent & review" subtitle="One last thing before you're done." onBack={() => setStep(1)} onContinue={handleContinue} canContinue={agreed} submitting={submitting} isLastStep>
          <ConsentStep kids={children} agreed={agreed} setAgreed={setAgreed} error={null} />
        </WizardShell>
      )}
    </>
  )
}
