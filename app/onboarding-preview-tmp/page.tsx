'use client'

import { useMemo, useState } from 'react'
import { T } from '@/lib/theme'
import { AvatarCropModal } from '@/components/profile/AvatarCropModal'

const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_BYTES = 5 * 1024 * 1024

interface TagOption { id: string; name: string }

const MOCK_TAGS: TagOption[] = [
  'Baseball', 'Basketball', 'Football', 'Golf', 'Injury Recovery', 'Mental Performance',
  'Nutrition Guidance', 'Soccer', 'Speed & Agility', 'Strength Training', 'Swimming',
  'Tennis', 'Track & Field', 'Volleyball', 'Wrestling', 'Youth Coaching',
].map((name, i) => ({ id: `tag-${i}`, name }))

const inputStyle: React.CSSProperties = {
  width: '100%', height: '48px', borderRadius: '10px', border: '1px solid #E5E7EB',
  padding: '0 14px', fontSize: '15px', fontFamily: "'Hanken Grotesk', sans-serif",
  outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
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

function BasicsStep({
  firstName, setFirstName, lastName, setLastName, yearsExperience, setYearsExperience,
  avatarPreviewUrl, onPickFile,
}: {
  firstName: string; setFirstName: (v: string) => void
  lastName: string; setLastName: (v: string) => void
  yearsExperience: string; setYearsExperience: (v: string) => void
  avatarPreviewUrl: string | null
  onPickFile: (file: File) => void
}) {
  const [fileError, setFileError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) { setFileError('Please upload a JPEG, PNG, or WEBP image.'); return }
    if (file.size > AVATAR_MAX_BYTES) { setFileError('Image must be under 5MB.'); return }
    setFileError(null)
    onPickFile(file)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
        <label style={{ cursor: 'pointer' }}>
          <div style={{
            width: '104px', height: '104px', borderRadius: '999px', overflow: 'hidden',
            background: avatarPreviewUrl ? 'transparent' : 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #FFFFFF', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
          }}>
            {avatarPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreviewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>Add photo</span>
            )}
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
        <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '10px' }}>
          {avatarPreviewUrl ? 'Tap to change photo' : 'Optional — you can add this later'}
        </div>
        {fileError && <div style={{ fontSize: '12px', color: T.danger, marginTop: '6px' }}>{fileError}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <FieldLabel>First name</FieldLabel>
          <input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Last name</FieldLabel>
          <input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div>
        <FieldLabel>Years of coaching experience</FieldLabel>
        <input
          style={inputStyle} type="number" min={0} inputMode="numeric"
          value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="e.g. 5"
        />
      </div>
    </div>
  )
}

function SpecialtyChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: '999px', padding: '10px 18px', minHeight: '44px',
        fontSize: '13px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif",
        border: selected ? '1px solid rgba(0,188,200,0.35)' : '1px solid #E5E7EB',
        background: selected ? 'rgba(0,188,200,0.1)' : '#FFFFFF',
        color: selected ? T.cyan : T.ink2,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
      }}
    >{label}</button>
  )
}

function SpecialtiesStep({
  options, selectedIds, onToggle, onAddCustom,
}: {
  options: TagOption[]; selectedIds: Set<string>; onToggle: (id: string) => void; onAddCustom: (name: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [customText, setCustomText] = useState('')

  function handleAdd() {
    const trimmed = customText.trim()
    if (!trimmed) return
    onAddCustom(trimmed)
    setCustomText('')
    setAdding(false)
  }

  return (
    <div>
      <div style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px' }}>
        Choose 3–5 that describe what you coach.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {options.map((opt) => (
          <SpecialtyChip key={opt.id} label={opt.name} selected={selectedIds.has(opt.id)} onClick={() => onToggle(opt.id)} />
        ))}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            style={{
              borderRadius: '999px', padding: '10px 18px', minHeight: '44px',
              fontSize: '13px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif",
              border: '1px dashed #E5E7EB', background: 'transparent', color: T.ink3,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
            }}
          >+ Add your own</button>
        )}
      </div>

      {adding && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            style={{ ...inputStyle, height: '44px' }} value={customText}
            onChange={(e) => setCustomText(e.target.value)} placeholder="e.g. Goalkeeper Training"
            autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          />
          <button onClick={handleAdd} style={{
            height: '44px', padding: '0 16px', borderRadius: '10px', border: 'none',
            background: T.cyan, color: '#FFFFFF', fontSize: '13px', fontWeight: 700,
            fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', flexShrink: 0,
          }}>Add</button>
          <button onClick={() => { setAdding(false); setCustomText('') }} style={{
            height: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent', color: T.ink2, fontSize: '13px', fontWeight: 600,
            fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', flexShrink: 0,
          }}>Cancel</button>
        </div>
      )}

      <div style={{ fontSize: '12px', color: selectedIds.size >= 3 && selectedIds.size <= 5 ? T.ink3 : T.danger, marginTop: '16px' }}>
        {selectedIds.size} of 3–5 selected
      </div>
    </div>
  )
}

function ReachStep({
  ageMin, setAgeMin, ageMax, setAgeMax, travelRadius, setTravelRadius, location, setLocation, rate, setRate,
}: {
  ageMin: string; setAgeMin: (v: string) => void
  ageMax: string; setAgeMax: (v: string) => void
  travelRadius: string; setTravelRadius: (v: string) => void
  location: string; setLocation: (v: string) => void
  rate: string; setRate: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <FieldLabel>Age range you coach</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input style={inputStyle} type="number" min={0} inputMode="numeric" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="Min" />
          <span style={{ color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>to</span>
          <input style={inputStyle} type="number" min={0} inputMode="numeric" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="Max" />
        </div>
      </div>
      <div>
        <FieldLabel>Travel radius (miles)</FieldLabel>
        <input style={inputStyle} type="number" min={0} inputMode="numeric" value={travelRadius} onChange={(e) => setTravelRadius(e.target.value)} placeholder="e.g. 15" />
      </div>
      <div>
        <FieldLabel>Location</FieldLabel>
        <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
      </div>
      <div>
        <FieldLabel>Hourly rate</FieldLabel>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', pointerEvents: 'none' }}>$</span>
          <input style={{ ...inputStyle, padding: '0 44px 0 26px' }} type="number" min={0} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="60" />
          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', pointerEvents: 'none' }}>/hr</span>
        </div>
      </div>
    </div>
  )
}

export default function TrainerOnboardingPreview() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  const [tagOptions, setTagOptions] = useState<TagOption[]>(MOCK_TAGS)
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())

  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [travelRadius, setTravelRadius] = useState('')
  const [location, setLocation] = useState('')
  const [rate, setRate] = useState('')

  function handleCropSave(blob: Blob) {
    setAvatarPreviewUrl(URL.createObjectURL(blob))
    setAvatarFile(null)
  }

  function handleToggleTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddCustomTag(name: string) {
    const existing = tagOptions.find((t) => t.name.toLowerCase() === name.toLowerCase())
    if (existing) { setSelectedTagIds((prev) => new Set(prev).add(existing.id)); return }
    const tempId = `new:${name}`
    setTagOptions((prev) => [...prev, { id: tempId, name }])
    setSelectedTagIds((prev) => new Set(prev).add(tempId))
  }

  const step1Valid = firstName.trim().length > 0 && lastName.trim().length > 0 && yearsExperience !== '' && Number(yearsExperience) >= 0
  const step2Valid = selectedTagIds.size >= 3 && selectedTagIds.size <= 5
  const step3Valid = useMemo(() => {
    const min = Number(ageMin), max = Number(ageMax), radius = Number(travelRadius), r = Number(rate)
    return ageMin !== '' && ageMax !== '' && min >= 0 && max >= min && travelRadius !== '' && radius >= 0 && location.trim().length > 0 && rate !== '' && r > 0
  }, [ageMin, ageMax, travelRadius, location, rate])

  function handleContinue() {
    if (step === 0 && step1Valid) setStep(1)
    else if (step === 1 && step2Valid) setStep(2)
    else if (step === 2 && step3Valid) {
      setSubmitting(true)
      setTimeout(() => { setSubmitting(false); setFinished(true) }, 500)
    }
  }

  if (finished) {
    return <div style={{ padding: '40px', fontFamily: "'Hanken Grotesk', sans-serif" }}>FINISHED — would redirect to /dashboard/trainer</div>
  }

  return (
    <>
      {step === 0 && (
        <WizardShell step={0} title="The basics" subtitle="Let's start with who you are." onBack={null} onContinue={handleContinue} canContinue={step1Valid} submitting={false} isLastStep={false}>
          <BasicsStep firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} yearsExperience={yearsExperience} setYearsExperience={setYearsExperience} avatarPreviewUrl={avatarPreviewUrl} onPickFile={setAvatarFile} />
        </WizardShell>
      )}
      {step === 1 && (
        <WizardShell step={1} title="Your specialties" subtitle="Pick what you're best known for." onBack={() => setStep(0)} onContinue={handleContinue} canContinue={step2Valid} submitting={false} isLastStep={false}>
          <SpecialtiesStep options={tagOptions} selectedIds={selectedTagIds} onToggle={handleToggleTag} onAddCustom={handleAddCustomTag} />
        </WizardShell>
      )}
      {step === 2 && (
        <WizardShell step={2} title="Your reach" subtitle="Help families know where and who you coach." onBack={() => setStep(1)} onContinue={handleContinue} canContinue={step3Valid} submitting={submitting} isLastStep>
          <ReachStep ageMin={ageMin} setAgeMin={setAgeMin} ageMax={ageMax} setAgeMax={setAgeMax} travelRadius={travelRadius} setTravelRadius={setTravelRadius} location={location} setLocation={setLocation} rate={rate} setRate={setRate} />
        </WizardShell>
      )}
      {avatarFile && <AvatarCropModal file={avatarFile} onSave={handleCropSave} onCancel={() => setAvatarFile(null)} />}
    </>
  )
}
