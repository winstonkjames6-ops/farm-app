'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, MapPin, Users } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ProfileCard } from '@/components/profile/ProfileCard'
import type { ContactRow, StatItem } from '@/components/profile/types'
import { T } from '@/lib/theme'
import { CURRENT_TERMS_VERSION } from '@/lib/terms'

type Tag = { id: string; name: string }

const TOTAL_STEPS = 6

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Portuguese', 'Arabic', 'Other']
const REFERRAL_SOURCES = ['Instagram', 'Friend/family', 'Search engine', 'Other']

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#FFFFFF', border: '1px solid #E5E7EB',
  borderRadius: '10px', padding: '13px 16px',
  color: T.ink, fontSize: '16px', outline: 'none',
  fontFamily: "'Hanken Grotesk', sans-serif",
  transition: 'border-color .15s ease, box-shadow .15s ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600,
  color: T.ink2, marginBottom: '8px',
  letterSpacing: '.07em', textTransform: 'uppercase',
  fontFamily: "'Hanken Grotesk', sans-serif",
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
  fontSize: 'clamp(28px, 5vw, 34px)', letterSpacing: '-.02em',
  lineHeight: 1.1, margin: '0 0 8px', color: T.ink,
}

const subStyle: React.CSSProperties = {
  fontSize: '15px', lineHeight: 1.55, color: T.ink2, margin: '0 0 28px',
}

const chipStyle = (sel: boolean): React.CSSProperties => ({
  padding: '8px 16px', borderRadius: '999px', fontSize: '14px',
  fontWeight: 600, cursor: 'pointer', transition: 'all .15s ease',
  background: sel ? T.cyan : 'transparent',
  color: sel ? '#FFFFFF' : T.ink2,
  border: sel ? `1px solid ${T.cyan}` : '1px solid #E5E7EB',
  fontFamily: "'Hanken Grotesk', sans-serif",
})

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', gap: '16px', padding: '14px 16px',
        background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
        cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
      }}
    >
      <span style={{ fontSize: '15px', fontWeight: 600, color: T.ink }}>{label}</span>
      <span style={{
        flex: '0 0 auto', width: '44px', height: '26px', borderRadius: '999px',
        background: on ? T.cyan : '#E5E7EB', position: 'relative',
        transition: 'background .15s ease',
      }}>
        <span style={{
          position: 'absolute', top: '3px', left: on ? '21px' : '3px',
          width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left .15s ease',
        }} />
      </span>
    </button>
  )
}

export default function TrainerSetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // 1 — About you
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarPublicUrl, setAvatarPublicUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [yearsExperience, setYearsExperience] = useState('')

  // 2 — Tags
  const [tags, setTags] = useState<Tag[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [newTag, setNewTag] = useState('')

  // 3 — Who & where you coach
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [travelRadius, setTravelRadius] = useState('')
  const [location, setLocation] = useState('')
  const [rate, setRate] = useState('')

  // 4 — Verification
  const docInputRef = useRef<HTMLInputElement | null>(null)
  const [verificationPath, setVerificationPath] = useState<string | null>(null)
  const [verificationName, setVerificationName] = useState<string | null>(null)
  const [docUploading, setDocUploading] = useState(false)

  // 5 — Wrap-up
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [notifSessionReminders, setNotifSessionReminders] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifBookingRequests, setNotifBookingRequests] = useState(true)
  const [referralSource, setReferralSource] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  // Auth gate
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) { router.replace('/login'); return }
      setUserId(user.id)
      setReady(true)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTags() {
    const { data } = await supabase.from('tags').select('id, name').order('name')
    setTags((data as Tag[]) ?? [])
  }

  useEffect(() => { if (ready) loadTags() /* eslint-disable-next-line */ }, [ready])

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleLanguage(lang: string) {
    setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(x => x !== lang) : [...prev, lang])
  }

  async function addOwnTag() {
    const name = newTag.trim()
    if (!name) return
    const { data, error: insertError } = await supabase
      .from('tags').insert({ name }).select('id, name').single()
    if (insertError || !data) { setError('Could not add that tag.'); return }
    setNewTag('')
    setAdding(false)
    setSelected(prev => [...prev, (data as Tag).id])
    await loadTags()
  }

  async function handleAvatarUpload(file: File | undefined) {
    if (!file || !userId) return
    setAvatarUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${userId}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars').upload(filename, file, { upsert: true, contentType: file.type })
    if (uploadError) {
      setError('Could not upload that photo.')
      setAvatarUploading(false)
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filename)
    setAvatarPublicUrl(data.publicUrl)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(false)
  }

  async function handleDocUpload(file: File | undefined) {
    if (!file || !userId) return
    setDocUploading(true)
    setError(null)
    const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error: uploadError } = await supabase.storage
      .from('verification-docs').upload(path, file, { upsert: false, contentType: file.type })
    if (uploadError) {
      setError('Could not upload that document.')
      setDocUploading(false)
      return
    }
    setVerificationPath(path)
    setVerificationName(file.name)
    setDocUploading(false)
  }

  async function finish() {
    if (saving) return
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: trainer } = await supabase
      .from('trainers').select('id').eq('profile_id', user.id).single()

    if (!trainer) { setError('Trainer record not found.'); setSaving(false); return }

    await supabase.from('trainers').update({
      location, rate: parseFloat(rate),
      years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
      preferred_age_min: ageMin ? parseInt(ageMin, 10) : null,
      preferred_age_max: ageMax ? parseInt(ageMax, 10) : null,
      languages: selectedLanguages,
      travel_radius_miles: travelRadius ? parseInt(travelRadius, 10) : null,
      id_verification_url: verificationPath,
    }).eq('id', trainer.id)

    await supabase.from('profiles').update({
      name: `${firstName} ${lastName}`,
      avatar_url: avatarPublicUrl,
      referral_source: referralSource,
      terms_accepted_at: new Date().toISOString(),
      terms_version: CURRENT_TERMS_VERSION,
      notif_session_reminders: notifSessionReminders,
      notif_messages: notifMessages,
      notif_booking_requests: notifBookingRequests,
    }).eq('id', user.id)

    const tagRows = selected.map(tag_id => ({ trainer_id: trainer.id, tag_id }))
    await supabase.from('trainer_tags').insert(tagRows)

    router.push('/onboarding?role=trainer')
  }

  const canContinue =
    step === 1 ? Boolean(firstName.trim() && lastName.trim())
    : step === 2 ? selected.length >= 3 && selected.length <= 5
    : step === 5 ? termsAccepted
    : true

  const focusStyle = (name: string) => focused === name
    ? { borderColor: T.cyan, boxShadow: '0 0 0 3px rgba(0,188,200,0.12)' }
    : {}

  const selectedTags = tags.filter(t => selected.includes(t.id))

  const profileStats: StatItem[] = [
    ...(yearsExperience ? [{ value: yearsExperience, label: yearsExperience === '1' ? 'yr coaching' : 'yrs coaching' }] : []),
    ...(rate ? [{ value: `$${rate}`, label: 'per hour' }] : []),
  ]

  const profileContactRows: ContactRow[] = [
    ...(location.trim() ? [{
      key: 'location', icon: <MapPin size={13} />,
      label: travelRadius ? `${location} · travels ${travelRadius} mi` : location,
    }] : []),
    ...(ageMin && ageMax ? [{
      key: 'ages', icon: <Users size={13} />, label: `Coaches ages ${ageMin}–${ageMax}`,
    }] : []),
    ...(referralSource ? [{
      key: 'referral', icon: <Globe size={13} />, label: `Found FARM via ${referralSource}`,
    }] : []),
  ]

  if (!ready) return <div style={{ minHeight: '100vh', background: T.bg }} />

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.ink,
      fontFamily: "'Hanken Grotesk', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px 96px',
    }}>
      {/* Brand mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <span style={{
          width: '30px', height: '30px', borderRadius: '8px', background: T.cyan,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: '16px', color: '#FFFFFF',
        }}>F</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: T.ink2 }}>
          Setting up your trainer profile
        </span>
      </div>

      <div style={{
        width: '100%', maxWidth: '520px', background: T.card,
        border: `1px solid ${T.border}`, borderRadius: '20px',
        padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Segmented progress */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '4px', borderRadius: '999px',
              background: i + 1 <= step ? T.cyan : '#E5E7EB',
              transition: 'background .25s ease',
            }} />
          ))}
        </div>

        {/* Step 1 — About you */}
        {step === 1 && (
          <div>
            <h1 style={headingStyle}>Tell us about yourself.</h1>
            <p style={subStyle}>Parents will see this on your profile.</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <button
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: '104px', height: '104px', borderRadius: '50%', padding: 0,
                  border: avatarPreview ? `2px solid ${T.cyan}` : '2px dashed #D1D5DB',
                  background: avatarPreview ? `center / cover no-repeat url(${avatarPreview})` : '#F9FAFB',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {!avatarPreview && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7h4l2-3h6l2 3h4v13H3z" /><circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </button>
              <input
                ref={photoInputRef} type="file" accept="image/*" hidden
                onChange={e => handleAvatarUpload(e.target.files?.[0])}
              />
              <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
                {avatarUploading ? 'Uploading…' : avatarPreview ? 'Change photo' : 'Add photo'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  type="text" value={firstName} placeholder="Jordan"
                  onChange={e => setFirstName(e.target.value)}
                  onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle, ...focusStyle('firstName') }}
                />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input
                  type="text" value={lastName} placeholder="Smith"
                  onChange={e => setLastName(e.target.value)}
                  onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle, ...focusStyle('lastName') }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Years of coaching experience</label>
              <input
                type="number" min={0} max={60} value={yearsExperience} placeholder="6"
                onChange={e => setYearsExperience(e.target.value)}
                onFocus={() => setFocused('years')} onBlur={() => setFocused(null)}
                style={{ ...inputStyle, ...focusStyle('years') }}
              />
            </div>
          </div>
        )}

        {/* Step 2 — Coaching tags */}
        {step === 2 && (
          <div>
            <h1 style={headingStyle}>What do you coach?</h1>
            <p style={{ ...subStyle, marginBottom: '24px' }}>
              Pick 3&ndash;5 that best describe you. Parents use these to find you.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tags.map(tag => (
                <button key={tag.id} onClick={() => toggle(tag.id)} style={chipStyle(selected.includes(tag.id))}>
                  {tag.name}
                </button>
              ))}
              {!adding && (
                <button
                  onClick={() => setAdding(true)}
                  style={{
                    padding: '8px 16px', borderRadius: '999px', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer', background: 'transparent',
                    color: T.ink2, border: '1px dashed #D1D5DB',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                  }}
                >+ Add your own</button>
              )}
            </div>

            {adding && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <input
                  type="text" value={newTag} placeholder="e.g. Pitching mechanics"
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addOwnTag() }}
                  onFocus={() => setFocused('newTag')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle, ...focusStyle('newTag'), flex: 1, padding: '11px 14px', fontSize: '15px' }}
                  autoFocus
                />
                <button
                  onClick={addOwnTag}
                  style={{
                    padding: '0 18px', borderRadius: '10px', border: 'none',
                    background: T.cyan, color: '#FFFFFF', fontSize: '14px',
                    fontWeight: 700, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                  }}
                >Add</button>
                <button
                  onClick={() => { setAdding(false); setNewTag('') }}
                  style={{
                    padding: '0 14px', borderRadius: '10px', border: '1px solid #E5E7EB',
                    background: 'transparent', color: T.ink2, fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                  }}
                >Cancel</button>
              </div>
            )}

            <p style={{ margin: '16px 0 0', fontSize: '13px', fontWeight: 600, color: '#9CA3AF' }}>
              {selected.length} of 5 selected
            </p>
          </div>
        )}

        {/* Step 3 — Who & where you coach */}
        {step === 3 && (
          <div>
            <h1 style={headingStyle}>Who and where do you coach?</h1>
            <p style={subStyle}>This filters you into the right parent searches.</p>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Preferred age range</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number" min={4} max={22} value={ageMin} placeholder="from"
                  onChange={e => setAgeMin(e.target.value)}
                  onFocus={() => setFocused('ageMin')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle, ...focusStyle('ageMin'), width: '96px' }}
                />
                <span style={{ color: '#9CA3AF', fontSize: '15px' }}>to</span>
                <input
                  type="number" min={4} max={22} value={ageMax} placeholder="to"
                  onChange={e => setAgeMax(e.target.value)}
                  onFocus={() => setFocused('ageMax')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle, ...focusStyle('ageMax'), width: '96px' }}
                />
                <span style={{ color: '#9CA3AF', fontSize: '15px' }}>years old</span>
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Travel radius (miles)</label>
              <input
                type="number" min={0} value={travelRadius} placeholder="15"
                onChange={e => setTravelRadius(e.target.value)}
                onFocus={() => setFocused('radius')} onBlur={() => setFocused(null)}
                style={{ ...inputStyle, ...focusStyle('radius') }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Location</label>
              <input
                type="text" value={location} placeholder="e.g. Ann Arbor, MI"
                onChange={e => setLocation(e.target.value)}
                onFocus={() => setFocused('location')} onBlur={() => setFocused(null)}
                style={{ ...inputStyle, ...focusStyle('location') }}
              />
            </div>

            <div>
              <label style={labelStyle}>Hourly rate</label>
              <div style={{
                display: 'flex', alignItems: 'center', background: '#FFFFFF',
                border: `1px solid ${focused === 'rate' ? T.cyan : '#E5E7EB'}`,
                boxShadow: focused === 'rate' ? '0 0 0 3px rgba(0,188,200,0.12)' : 'none',
                borderRadius: '10px', padding: '0 16px', height: '50px',
                transition: 'border-color .15s ease, box-shadow .15s ease',
              }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: T.ink2, marginRight: '6px' }}>$</span>
                <input
                  type="number" min={0} value={rate} placeholder="65"
                  onChange={e => setRate(e.target.value)}
                  onFocus={() => setFocused('rate')} onBlur={() => setFocused(null)}
                  style={{
                    flex: 1, minWidth: 0, border: 'none', outline: 'none',
                    background: 'transparent', fontSize: '16px', color: T.ink,
                    fontFamily: "'Hanken Grotesk', sans-serif", padding: 0,
                  }}
                />
                <span style={{ fontSize: '15px', color: '#9CA3AF', marginLeft: '6px' }}>/hr</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Verification */}
        {step === 4 && (
          <div>
            <h1 style={headingStyle}>Upload an ID or background-check document.</h1>
            <p style={subStyle}>Parents only book verified trainers.</p>

            <button
              onClick={() => docInputRef.current?.click()}
              style={{
                width: '100%', padding: '26px 20px', borderRadius: '14px',
                border: verificationPath ? `1.5px solid ${T.cyan}` : '1.5px dashed #D1D5DB',
                background: verificationPath ? 'rgba(0,188,200,0.06)' : '#F9FAFB',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px', fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={verificationPath ? T.cyan : '#9CA3AF'} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span style={{ fontSize: '15px', fontWeight: 700, color: verificationPath ? T.cyan : T.ink }}>
                {docUploading ? 'Uploading…' : verificationName ?? 'Choose a file'}
              </span>
              <span style={{ fontSize: '13px', color: '#9CA3AF' }}>JPG, PNG or PDF</span>
            </button>
            <input
              ref={docInputRef} type="file" accept="image/*,application/pdf" hidden
              onChange={e => handleDocUpload(e.target.files?.[0])}
            />

            <p style={{ margin: '14px 0 0', fontSize: '13px', color: '#9CA3AF', lineHeight: 1.5 }}>
              This is kept private and only used for verification.
            </p>
          </div>
        )}

        {/* Step 5 — Wrap-up */}
        {step === 5 && (
          <div>
            <h1 style={headingStyle}>A few last things.</h1>
            <p style={subStyle}>Then your profile is live.</p>

            <div style={{ marginBottom: '26px' }}>
              <label style={labelStyle}>What languages do you speak?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {LANGUAGES.map(lang => (
                  <button key={lang} onClick={() => toggleLanguage(lang)} style={chipStyle(selectedLanguages.includes(lang))}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '26px' }}>
              <label style={labelStyle}>How should we notify you?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Toggle label="Session reminders" on={notifSessionReminders} onChange={setNotifSessionReminders} />
                <Toggle label="New messages" on={notifMessages} onChange={setNotifMessages} />
                <Toggle label="New booking requests" on={notifBookingRequests} onChange={setNotifBookingRequests} />
              </div>
            </div>

            <div style={{ marginBottom: '26px' }}>
              <label style={labelStyle}>How did you hear about FARM?</label>
              <select
                value={referralSource}
                onChange={e => setReferralSource(e.target.value)}
                onFocus={() => setFocused('referral')} onBlur={() => setFocused(null)}
                style={{ ...inputStyle, ...focusStyle('referral'), height: '50px', padding: '0 16px', appearance: 'none' }}
              >
                <option value="">Select one</option>
                {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={() => setTermsAccepted(!termsAccepted)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%',
                textAlign: 'left', padding: '14px 16px', borderRadius: '12px',
                background: termsAccepted ? 'rgba(0,188,200,0.06)' : '#F9FAFB',
                border: termsAccepted ? `1px solid ${T.cyan}` : '1px solid #E5E7EB',
                cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >
              <span style={{
                flex: '0 0 auto', width: '20px', height: '20px', borderRadius: '6px',
                marginTop: '1px',
                background: termsAccepted ? T.cyan : '#FFFFFF',
                border: termsAccepted ? `1px solid ${T.cyan}` : '1px solid #D1D5DB',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {termsAccepted && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 13 9 18 20 6" />
                  </svg>
                )}
              </span>
              <span style={{ fontSize: '14px', lineHeight: 1.5, color: T.ink, fontWeight: 500 }}>
                I agree to FARM&rsquo;s Terms of Service and Trainer Agreement
              </span>
            </button>
          </div>
        )}

        {/* Step 6 — Review & finish (live profile-card preview) */}
        {step === 6 && (
          <div>
            <h1 style={headingStyle}>Review &amp; finish</h1>
            <p style={{ ...subStyle, marginBottom: '24px' }}>
              This is your profile as parents will see it.
            </p>

            <ProfileCard
              themePreference="light"
              backgroundMode="full"
              bannerImageUrl={null}
              avatarUrl={avatarPreview}
              name={`${firstName} ${lastName}`.trim() || 'Your name'}
              verified={Boolean(verificationPath)}
              verifiedLabel="ID submitted"
              metaLine={selectedLanguages.length ? `Speaks ${selectedLanguages.join(', ')}` : undefined}
              stats={profileStats}
              contactRows={profileContactRows}
              onEditProfile={() => setStep(1)}
              profileLabel="Profile preview"
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
              {selectedTags.map(t => (
                <span key={t.id} style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
                  fontWeight: 600, background: T.cyan, color: '#FFFFFF',
                }}>{t.name}</span>
              ))}
            </div>

            <p style={{ margin: '14px 0 0', fontSize: '13px', color: '#9CA3AF' }}>
              Payouts: set up once Stripe is connected (coming soon).
            </p>
          </div>
        )}

        {error && (
          <p style={{
            margin: '16px 0 0', padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#DC2626', fontSize: '14px',
          }}>{error}</p>
        )}

        {/* Back / Continue */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              style={{
                flex: '0 0 auto', padding: '0 22px', height: '50px', borderRadius: '12px',
                border: '1px solid #E5E7EB', background: 'transparent', color: T.ink2,
                fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >Back</button>
          )}
          <button
            onClick={() => { if (step === TOTAL_STEPS) finish(); else if (canContinue) setStep(s => s + 1) }}
            disabled={!canContinue || saving}
            style={{
              flex: 1, height: '50px', borderRadius: '12px', border: 'none',
              background: canContinue && !saving ? T.cyan : '#F3F4F6',
              color: canContinue && !saving ? '#FFFFFF' : '#9CA3AF',
              fontSize: '16px', fontWeight: 700,
              cursor: canContinue && !saving ? 'pointer' : 'not-allowed',
              fontFamily: "'Hanken Grotesk', sans-serif", transition: 'all .15s ease',
            }}
          >
            {step === TOTAL_STEPS ? (saving ? 'Saving…' : 'Finish setup') : 'Continue'}
          </button>
        </div>

        <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '.04em' }}>
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>
    </div>
  )
}
