'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

// Child accounts created here are left unclaimed (profile_id = null) with a
// server-generated invite_code the parent relays to the child. The child
// later enters that code as step 1 of the athlete wizard to claim the row —
// see the migration comment on get_child_invite_code() for why the code
// itself is never plain-selectable (a trainer with a booking for the child
// would otherwise be able to read it via the existing RLS select policy).

const SPORTS = [
  'Soccer', 'Basketball', 'Baseball', 'Softball', 'Tennis',
  'Volleyball', 'Lacrosse', 'Football', 'Track & Field',
  'Swimming', 'Golf', 'Gymnastics', 'Martial Arts', 'Hockey', 'Wrestling', 'Other',
]

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Portuguese', 'Arabic', 'Other']

const REFERRAL_OPTIONS = [
  'Instagram', 'Another parent', "My athlete's coach", 'Friend/family', 'Search engine', 'Other',
]

const NOTIF_ROWS: { key: 'notif_session_reminders' | 'notif_messages' | 'notif_promo_updates'; label: string; desc: string }[] = [
  { key: 'notif_session_reminders', label: 'Session reminders', desc: '1 hour before each session' },
  { key: 'notif_messages', label: 'New trainer messages', desc: 'When a trainer messages you' },
  { key: 'notif_promo_updates', label: 'Trainer recommendations', desc: 'Suggestions based on your athletes' },
]

const TOTAL_STEPS = 5

const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_BYTES = 5 * 1024 * 1024 // matches the avatars bucket's own file_size_limit

interface ChildDraft {
  localId: string
  firstName: string
  lastName: string
  dob: string
  sport: string
}

interface ClaimedChild {
  id: string
  name: string
  inviteCode: string
}

type NotifState = Record<typeof NOTIF_ROWS[number]['key'], boolean>

function newLocalId(): string {
  return Math.random().toString(36).slice(2)
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

function getInitial(firstName: string): string {
  return firstName.trim().slice(0, 1).toUpperCase() || '?'
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

function StepProgress({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: '4px', borderRadius: '999px',
          background: i + 1 <= step ? T.cyan : '#E5E7EB',
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
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 20px 110px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '8px', background: T.cyan,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: '#FFFFFF',
          }}>F</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: T.ink2, letterSpacing: '0.02em', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Setting up your parent account
          </span>
        </div>

        <StepProgress step={step} />

        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink,
          marginBottom: '6px', letterSpacing: '-0.01em',
        }}>{title}</div>
        <div style={{
          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginBottom: '28px', lineHeight: 1.5,
        }}>{subtitle}</div>

        {children}

        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          background: 'rgba(248,248,246,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px 20px',
          display: 'flex', gap: '12px', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '520px', width: '100%', display: 'flex', gap: '12px' }}>
            {onBack && (
              <button
                onClick={onBack}
                disabled={submitting}
                style={{
                  height: '50px', padding: '0 22px', borderRadius: '12px',
                  border: '1px solid #E5E7EB', background: 'transparent', color: T.ink2,
                  fontSize: '15px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif",
                  cursor: submitting ? 'default' : 'pointer',
                }}
              >Back</button>
            )}
            <button
              onClick={onContinue}
              disabled={!canContinue || submitting}
              style={{
                flex: 1, height: '50px', padding: '0 20px', borderRadius: '12px', border: 'none',
                background: (!canContinue || submitting) ? '#F3F4F6' : T.cyan,
                color: (!canContinue || submitting) ? '#9CA3AF' : '#FFFFFF',
                fontSize: '15px', fontWeight: 700, fontFamily: "'Hanken Grotesk', sans-serif",
                cursor: (!canContinue || submitting) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >{submitting ? 'Saving…' : isLastStep ? 'Finish setup' : 'Continue'}</button>
          </div>
        </div>
        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: T.ink3, letterSpacing: '0.04em', fontFamily: "'Hanken Grotesk', sans-serif" }}>
          Step {step} of {TOTAL_STEPS}
        </div>
      </div>
    </div>
  )
}

// ── Step 1: About you ───────────────────────────────────────────────────────────

function AboutYouStep({
  fullName, setFullName, email, setEmail, phone, setPhone,
  avatarUrl, onPhotoClick, onPhotoSelected, avatarUploading, avatarError, error,
}: {
  fullName: string; setFullName: (v: string) => void
  email: string; setEmail: (v: string) => void
  phone: string; setPhone: (v: string) => void
  avatarUrl: string | null
  onPhotoClick: () => void
  onPhotoSelected: (e: React.ChangeEvent<HTMLInputElement>) => void
  avatarUploading: boolean
  avatarError: string
  error: string | null
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div
          onClick={() => { onPhotoClick(); fileInputRef.current?.click() }}
          style={{
            width: '104px', height: '104px', borderRadius: '50%', cursor: avatarUploading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            border: avatarUrl ? `2px solid ${T.cyan}` : '2px dashed #D1D5DB',
            background: avatarUrl ? `center / cover no-repeat url(${avatarUrl})` : '#F9FAFB',
            position: 'relative',
          }}
        >
          {!avatarUrl && (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h4l2-3h6l2 3h4v13H3z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
          {avatarUploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Uploading…
            </div>
          )}
          <input
            ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={onPhotoSelected} style={{ display: 'none' }}
          />
        </div>
        <span style={{ fontSize: '13px', color: T.ink3, fontWeight: 500, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          {avatarUrl ? 'Change photo' : 'Add photo'}
        </span>
        {avatarError && (
          <div style={{ fontSize: '12.5px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif" }}>{avatarError}</div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Full name</FieldLabel>
        <input style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dana Whitaker" />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Email</FieldLabel>
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dana@email.com" />
      </div>
      <div>
        <FieldLabel>Phone number</FieldLabel>
        <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(734) 555-0142" />
      </div>

      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>
      )}
    </div>
  )
}

// ── Step 2: Athletes ──────────────────────────────────────────────────────────────

function AthleteRow({ child, onEdit, onRemove }: { child: ChildDraft; onEdit: () => void; onRemove: () => void }) {
  const age = computeAge(child.dob)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
      background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', marginBottom: '10px',
    }}>
      <span style={{
        flexShrink: 0, width: '38px', height: '38px', borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '17px', color: '#FFFFFF',
        background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
      }}>{getInitial(child.firstName)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {child.firstName} {child.lastName}
        </div>
        <div style={{ fontSize: '12.5px', color: T.ink2, marginTop: '2px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
          {[age != null ? `${age} yrs old` : null, child.sport].filter(Boolean).join(' · ') || '—'}
        </div>
      </div>
      <button
        onClick={onEdit}
        style={{
          flexShrink: 0, border: '1px solid #E5E7EB', background: '#FFFFFF', color: T.ink2,
          borderRadius: '9px', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Hanken Grotesk', sans-serif",
        }}
      >Edit</button>
      <button
        onClick={onRemove}
        aria-label="Remove"
        style={{
          flexShrink: 0, width: '32px', height: '32px', border: '1px solid #E5E7EB', background: '#FFFFFF',
          borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function AthletesStep({
  athletes, editingId, draftFirstName, setDraftFirstName, draftLastName, setDraftLastName,
  draftDob, setDraftDob, draftSport, setDraftSport, draftComplete,
  onEdit, onRemove, onCommitDraft, onCancelEdit, error,
}: {
  athletes: ChildDraft[]
  editingId: string | null
  draftFirstName: string; setDraftFirstName: (v: string) => void
  draftLastName: string; setDraftLastName: (v: string) => void
  draftDob: string; setDraftDob: (v: string) => void
  draftSport: string; setDraftSport: (v: string) => void
  draftComplete: boolean
  onEdit: (child: ChildDraft) => void
  onRemove: (localId: string) => void
  onCommitDraft: () => void
  onCancelEdit: () => void
  error: string | null
}) {
  const n = athletes.length
  return (
    <div>
      <div style={{ fontSize: '14px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '18px', lineHeight: 1.55 }}>
        You can add every athlete on your account — siblings included.
      </div>

      {athletes.map((child) => (
        <AthleteRow
          key={child.localId}
          child={child}
          onEdit={() => onEdit(child)}
          onRemove={() => onRemove(child.localId)}
        />
      ))}

      <div style={{
        border: editingId ? `1px solid ${T.cyan}` : '1px solid #E5E7EB',
        background: editingId ? 'rgba(0,188,200,0.04)' : '#FFFFFF',
        borderRadius: '14px', padding: '20px', transition: 'all 0.15s ease',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
          letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.ink3, marginBottom: '16px',
        }}>{editingId ? 'Editing athlete' : n === 0 ? 'Athlete details' : `Athlete ${n + 1}`}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <FieldLabel>First name</FieldLabel>
            <input style={inputStyle} value={draftFirstName} onChange={(e) => setDraftFirstName(e.target.value)} placeholder="Maya" />
          </div>
          <div>
            <FieldLabel>Last name</FieldLabel>
            <input style={inputStyle} value={draftLastName} onChange={(e) => setDraftLastName(e.target.value)} placeholder="Whitaker" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FieldLabel>Date of birth</FieldLabel>
            <input
              style={inputStyle} type="date" value={draftDob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDraftDob(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Sport</FieldLabel>
            <select style={selectStyle} value={draftSport} onChange={(e) => setDraftSport(e.target.value)}>
              <option value="">Select a sport</option>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {editingId && (
          <button
            onClick={onCancelEdit}
            style={{ marginTop: '16px', background: 'transparent', border: 'none', padding: 0, color: T.ink3, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif" }}
          >Cancel edit</button>
        )}
      </div>

      <button
        onClick={onCommitDraft}
        disabled={!draftComplete}
        style={{
          marginTop: '14px', width: '100%', height: '48px', borderRadius: '12px',
          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15px', fontWeight: 700,
          background: !draftComplete ? '#F9FAFB' : editingId ? T.cyan : 'rgba(0,188,200,0.08)',
          color: !draftComplete ? '#C3C7CE' : editingId ? '#FFFFFF' : T.cyan,
          border: !draftComplete ? '1px dashed #E5E7EB' : `1px solid ${T.cyan}`,
          cursor: draftComplete ? 'pointer' : 'not-allowed', transition: 'all 0.15s ease',
        }}
      >{editingId ? 'Save athlete' : '+ Add another athlete'}</button>

      <p style={{ margin: '14px 0 0', fontSize: '13px', fontWeight: 600, color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>
        {n === 0 ? 'Add at least one athlete to continue' : n === 1 ? '1 athlete on this account' : `${n} athletes on this account`}
      </p>

      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>
      )}
    </div>
  )
}

// ── Step 3: Location ─────────────────────────────────────────────────────────────

function LocationStep({
  location, setLocation, travelRadius, setTravelRadius, error,
}: {
  location: string; setLocation: (v: string) => void
  travelRadius: string; setTravelRadius: (v: string) => void
  error: string | null
}) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <FieldLabel>Location</FieldLabel>
        <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Ann Arbor, MI" />
      </div>
      <div>
        <FieldLabel>Travel radius (miles)</FieldLabel>
        <input
          style={inputStyle} type="number" min={0} value={travelRadius}
          onChange={(e) => setTravelRadius(e.target.value)} placeholder="15"
        />
        <p style={{ margin: '10px 0 0', fontSize: '13px', color: T.ink3, lineHeight: 1.5, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          Applies to all athletes on the account.
        </p>
      </div>
      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>
      )}
    </div>
  )
}

// ── Step 4: Last things ───────────────────────────────────────────────────────────

function ToggleTrack({ on }: { on: boolean }) {
  return (
    <span style={{
      flexShrink: 0, width: '44px', height: '26px', borderRadius: '999px',
      background: on ? T.cyan : '#E5E7EB', position: 'relative', transition: 'background 0.15s ease', display: 'inline-block',
    }}>
      <span style={{
        position: 'absolute', top: '3px', left: on ? '21px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left 0.15s ease',
      }} />
    </span>
  )
}

function LastThingsStep({
  langs, onToggleLang, notifState, onToggleNotif, referral, setReferral, terms, setTerms, error,
}: {
  langs: string[]
  onToggleLang: (lang: string) => void
  notifState: NotifState
  onToggleNotif: (key: keyof NotifState) => void
  referral: string
  setReferral: (v: string) => void
  terms: boolean
  setTerms: (v: boolean) => void
  error: string | null
}) {
  return (
    <div>
      <div style={{ marginBottom: '26px' }}>
        <FieldLabel>What languages do you speak?</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
          {LANGUAGES.map((lang) => {
            const sel = langs.includes(lang)
            return (
              <button
                key={lang}
                onClick={() => onToggleLang(lang)}
                style={{
                  padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', minHeight: '36px', fontFamily: "'Hanken Grotesk', sans-serif",
                  background: sel ? T.cyan : 'transparent', color: sel ? '#FFFFFF' : T.ink2,
                  border: sel ? `1px solid ${T.cyan}` : '1px solid #E5E7EB', transition: 'all 0.15s ease',
                }}
              >{lang}</button>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '26px' }}>
        <FieldLabel>How should we notify you?</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          {NOTIF_ROWS.map((row) => (
            <button
              key={row.key}
              onClick={() => onToggleNotif(row.key)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px',
                padding: '14px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
                cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >
              <span style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: T.ink }}>{row.label}</span>
                <span style={{ display: 'block', fontSize: '12.5px', color: T.ink3, marginTop: '2px' }}>{row.desc}</span>
              </span>
              <ToggleTrack on={notifState[row.key]} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '26px' }}>
        <FieldLabel>How did you hear about FARM?</FieldLabel>
        <select style={selectStyle} value={referral} onChange={(e) => setReferral(e.target.value)}>
          <option value="">Select one</option>
          {REFERRAL_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <button
        onClick={() => setTerms(!terms)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%',
          textAlign: 'left', padding: '14px 16px', borderRadius: '12px',
          background: terms ? 'rgba(0,188,200,0.06)' : '#F9FAFB',
          border: terms ? `1px solid ${T.cyan}` : '1px solid #E5E7EB',
          cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
        }}
      >
        <span style={{
          flexShrink: 0, width: '20px', height: '20px', borderRadius: '6px', marginTop: '1px',
          background: terms ? T.cyan : '#FFFFFF', border: terms ? `1px solid ${T.cyan}` : '1px solid #D1D5DB',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {terms && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 13 9 18 20 6" />
            </svg>
          )}
        </span>
        <span style={{ fontSize: '14px', lineHeight: 1.5, color: T.ink, fontWeight: 500 }}>
          I agree to FARM's Terms of Service and confirm I am the parent or legal guardian of the athletes on this account
        </span>
      </button>

      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>
      )}
    </div>
  )
}

// ── Step 5: Review & finish ──────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', padding: '11px 0', borderBottom: `1px solid ${T.line}` }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: T.ink2, flexShrink: 0, fontFamily: "'Hanken Grotesk', sans-serif" }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: value === '—' ? '#C3C7CE' : T.ink, textAlign: 'right', fontFamily: "'Hanken Grotesk', sans-serif" }}>{value}</span>
    </div>
  )
}

function ReviewStep({
  athletes, fullName, email, phone, location, travelRadius, langs, onEditAthletes, onEditAbout, error,
}: {
  athletes: ChildDraft[]
  fullName: string; email: string; phone: string; location: string; travelRadius: string; langs: string[]
  onEditAthletes: () => void
  onEditAbout: () => void
  error: string | null
}) {
  const dash = '—'
  const rows = [
    { label: 'Name', value: fullName.trim() || dash },
    { label: 'Email', value: email.trim() || dash },
    { label: 'Phone', value: phone.trim() || dash },
    { label: 'Location', value: location.trim() || dash },
    { label: 'Travel radius', value: travelRadius ? `${travelRadius} miles` : dash },
    { label: 'Languages', value: langs.length ? langs.join(', ') : dash },
  ]

  return (
    <div>
      <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', background: T.bg, padding: '20px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.ink3 }}>
            Athletes · {athletes.length}
          </span>
          <button
            onClick={onEditAthletes}
            style={{ flexShrink: 0, border: '1px solid rgba(0,0,0,0.12)', color: T.ink2, background: '#FFFFFF', borderRadius: '9px', padding: '6px 13px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif" }}
          >Edit</button>
        </div>
        {athletes.length === 0 ? (
          <div style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: "'Hanken Grotesk', sans-serif" }}>No athletes added yet.</div>
        ) : (
          <div>
            {athletes.map((a) => {
              const age = computeAge(a.dob)
              return (
                <div key={a.localId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', marginBottom: '10px' }}>
                  <span style={{
                    flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: '#FFFFFF',
                    background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
                  }}>{getInitial(a.firstName)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>{a.firstName} {a.lastName}</div>
                    <div style={{ fontSize: '12.5px', color: T.ink2, marginTop: '2px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
                      {[age != null ? `${age} yrs old` : null, a.sport].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', background: T.bg, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.ink3 }}>
            Your info
          </span>
          <button
            onClick={onEditAbout}
            style={{ flexShrink: 0, border: '1px solid rgba(0,0,0,0.12)', color: T.ink2, background: '#FFFFFF', borderRadius: '9px', padding: '6px 13px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif" }}
          >Edit</button>
        </div>
        {rows.map((r) => <ReviewRow key={r.label} label={r.label} value={r.value} />)}
      </div>

      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '16px' }}>{error}</div>
      )}
    </div>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────────

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
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 20px 100px' }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink, marginBottom: '4px',
        }}>You're all set</div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginBottom: '28px', lineHeight: 1.5 }}>
          Share each code below with your athlete — they'll enter it when they set up their own FARM account.
        </div>

        {claimed.map((child) => (
          <div key={child.id} style={{
            background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '16px',
          }}>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: T.ink, marginBottom: '10px' }}>
              {child.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px',
                letterSpacing: '0.08em', color: T.cyan, background: 'rgba(0,188,200,0.08)',
                border: '1px solid rgba(0,188,200,0.2)', borderRadius: '10px', padding: '10px 14px', textAlign: 'center',
              }}>{child.inviteCode}</div>
              <button
                onClick={() => copyCode(child.id, child.inviteCode)}
                style={{
                  height: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)',
                  background: 'transparent', color: T.ink2, fontSize: '13px', fontWeight: 600,
                  fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', flexShrink: 0,
                }}
              >{copiedId === child.id ? 'Copied!' : 'Copy'}</button>
            </div>
          </div>
        ))}

        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          background: 'rgba(248,248,246,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px 20px',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '520px', width: '100%' }}>
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
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ParentOnboardingPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [claimed, setClaimed] = useState<ClaimedChild[] | null>(null)

  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [step2Error, setStep2Error] = useState<string | null>(null)
  const [step3Error, setStep3Error] = useState<string | null>(null)
  const [step4Error, setStep4Error] = useState<string | null>(null)
  const [finishError, setFinishError] = useState<string | null>(null)

  // Step 1 — about you
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  // Step 2 — athletes
  const [athletes, setAthletes] = useState<ChildDraft[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftFirstName, setDraftFirstName] = useState('')
  const [draftLastName, setDraftLastName] = useState('')
  const [draftDob, setDraftDob] = useState('')
  const [draftSport, setDraftSport] = useState('')

  // Step 3 — location
  const [location, setLocation] = useState('')
  const [travelRadius, setTravelRadius] = useState('')

  // Step 4 — last things
  const [langs, setLangs] = useState<string[]>([])
  const [notifState, setNotifState] = useState<NotifState>({
    notif_session_reminders: true,
    notif_messages: true,
    notif_promo_updates: false,
  })
  const [referral, setReferral] = useState('')
  const [terms, setTerms] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, email, phone, avatar_url, location, travel_radius, languages, referral_source, notif_session_reminders, notif_messages, notif_promo_updates')
        .eq('id', user.id)
        .single()
      if (!profile || profile.role !== 'parent') { router.replace('/dashboard'); return }

      const { data: existingAthletes } = await supabase.from('athletes').select('id').eq('parent_id', user.id).limit(1)
      if (existingAthletes && existingAthletes.length > 0) { router.replace('/dashboard'); return }

      setUserId(user.id)
      setFullName(profile.name ?? '')
      setEmail(profile.email ?? user.email ?? '')
      setPhone(profile.phone ?? '')
      setAvatarUrl(profile.avatar_url ?? null)
      setLocation(profile.location ?? '')
      setTravelRadius(profile.travel_radius != null ? String(profile.travel_radius) : '')
      setLangs(profile.languages ?? [])
      setReferral(profile.referral_source ?? '')
      setNotifState({
        notif_session_reminders: profile.notif_session_reminders ?? true,
        notif_messages: profile.notif_messages ?? true,
        notif_promo_updates: profile.notif_promo_updates ?? false,
      })
      setReady(true)
    }
    init()
  }, [router, supabase])

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !userId) return

    setAvatarError('')
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      setAvatarError('Please upload a JPEG, PNG, or WEBP image.')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError('Image must be under 5MB.')
      return
    }

    setAvatarUploading(true)
    const path = `${userId}/${Date.now()}-${file.name}`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type })
    if (uploadErr) {
      setAvatarError(uploadErr.message)
      setAvatarUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
    if (updateErr) {
      setAvatarError(updateErr.message)
      setAvatarUploading(false)
      return
    }
    setAvatarUrl(publicUrl)
    setAvatarUploading(false)
  }

  const draftComplete = draftFirstName.trim().length > 0
    && draftLastName.trim().length > 0
    && draftDob !== ''
    && draftSport !== ''

  function commitDraft() {
    if (!draftComplete) return
    const rec: ChildDraft = {
      localId: editingId ?? newLocalId(),
      firstName: draftFirstName.trim(),
      lastName: draftLastName.trim(),
      dob: draftDob,
      sport: draftSport,
    }
    setAthletes((prev) => (editingId ? prev.map((a) => (a.localId === editingId ? rec : a)) : [...prev, rec]))
    setDraftFirstName('')
    setDraftLastName('')
    setDraftDob('')
    setDraftSport('')
    setEditingId(null)
    setStep2Error(null)
  }

  function startEditAthlete(child: ChildDraft) {
    setEditingId(child.localId)
    setDraftFirstName(child.firstName)
    setDraftLastName(child.lastName)
    setDraftDob(child.dob)
    setDraftSport(child.sport)
  }

  function removeAthlete(localId: string) {
    setAthletes((prev) => prev.filter((a) => a.localId !== localId))
    if (editingId === localId) {
      setEditingId(null)
      setDraftFirstName('')
      setDraftLastName('')
      setDraftDob('')
      setDraftSport('')
    }
  }

  function cancelEditAthlete() {
    setEditingId(null)
    setDraftFirstName('')
    setDraftLastName('')
    setDraftDob('')
    setDraftSport('')
  }

  function toggleLang(lang: string) {
    setLangs((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))
  }

  function toggleNotif(key: keyof NotifState) {
    setNotifState((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const step1Valid = fullName.trim().length > 0 && /.+@.+\..+/.test(email.trim())
  const step2Valid = athletes.length > 0 || draftComplete
  const step3Valid = location.trim().length > 0
  const step4Valid = terms

  async function handleFinish() {
    if (!userId) return
    setSubmitting(true)
    setFinishError(null)

    try {
      const now = new Date().toISOString()

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          location: location.trim(),
          travel_radius: travelRadius.trim() ? Number(travelRadius) : null,
          languages: langs,
          referral_source: referral || null,
          notif_session_reminders: notifState.notif_session_reminders,
          notif_messages: notifState.notif_messages,
          notif_promo_updates: notifState.notif_promo_updates,
          terms_accepted_at: now,
        })
        .eq('id', userId)
      if (profileErr) throw new Error(profileErr.message)

      const insertedRows: Array<{ id: string; name: string }> = []
      for (const child of athletes) {
        const name = `${child.firstName.trim()} ${child.lastName.trim()}`.trim()
        const { data, error } = await supabase
          .from('athletes')
          .insert({
            parent_id: userId,
            name,
            dob: child.dob,
            sport: child.sport,
            terms_accepted_at: now,
          })
          .select('id, name')
          .single()
        if (error) throw new Error(error.message)
        insertedRows.push(data)
      }

      const withCodes: ClaimedChild[] = []
      for (const row of insertedRows) {
        const { data: code, error: codeErr } = await supabase.rpc('get_child_invite_code', { p_athlete_id: row.id })
        if (codeErr) throw new Error(codeErr.message)
        withCodes.push({ id: row.id, name: row.name, inviteCode: code as string })
      }

      setClaimed(withCodes)
    } catch (e) {
      setFinishError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  function handleContinue() {
    if (step === 1) {
      if (!step1Valid) { setStep1Error('Please enter your name and a valid email.'); return }
      setStep1Error(null)
      setStep(2)
      return
    }
    if (step === 2) {
      if (draftComplete) commitDraft()
      const willHaveAthletes = athletes.length > 0 || draftComplete
      if (!willHaveAthletes) { setStep2Error('Add at least one athlete to continue.'); return }
      setStep2Error(null)
      setStep(3)
      return
    }
    if (step === 3) {
      if (!step3Valid) { setStep3Error('Please enter your location.'); return }
      setStep3Error(null)
      setStep(4)
      return
    }
    if (step === 4) {
      if (!step4Valid) { setStep4Error('Please agree to the terms to continue.'); return }
      setStep4Error(null)
      setStep(5)
      return
    }
    if (step === 5) {
      void handleFinish()
    }
  }

  if (!ready) return null

  if (claimed) {
    return <SuccessScreen claimed={claimed} onDone={() => router.push('/dashboard')} />
  }

  return (
    <>
      {step === 1 && (
        <WizardShell
          step={1} title="Tell us about yourself." subtitle="Trainers will see your name when you book."
          onBack={null} onContinue={handleContinue} canContinue={step1Valid}
          submitting={false} isLastStep={false}
        >
          <AboutYouStep
            fullName={fullName} setFullName={setFullName}
            email={email} setEmail={setEmail}
            phone={phone} setPhone={setPhone}
            avatarUrl={avatarUrl}
            onPhotoClick={() => setAvatarError('')}
            onPhotoSelected={handlePhotoSelected}
            avatarUploading={avatarUploading}
            avatarError={avatarError}
            error={step1Error}
          />
        </WizardShell>
      )}
      {step === 2 && (
        <WizardShell
          step={2} title="Tell us about your athlete." subtitle="Who are you booking sessions for?"
          onBack={() => setStep(1)} onContinue={handleContinue} canContinue={step2Valid}
          submitting={false} isLastStep={false}
        >
          <AthletesStep
            athletes={athletes} editingId={editingId}
            draftFirstName={draftFirstName} setDraftFirstName={setDraftFirstName}
            draftLastName={draftLastName} setDraftLastName={setDraftLastName}
            draftDob={draftDob} setDraftDob={setDraftDob}
            draftSport={draftSport} setDraftSport={setDraftSport}
            draftComplete={draftComplete}
            onEdit={startEditAthlete} onRemove={removeAthlete}
            onCommitDraft={commitDraft} onCancelEdit={cancelEditAthlete}
            error={step2Error}
          />
        </WizardShell>
      )}
      {step === 3 && (
        <WizardShell
          step={3} title="Where are you located?" subtitle="We use this to show trainers who can reach you."
          onBack={() => setStep(2)} onContinue={handleContinue} canContinue={step3Valid}
          submitting={false} isLastStep={false}
        >
          <LocationStep
            location={location} setLocation={setLocation}
            travelRadius={travelRadius} setTravelRadius={setTravelRadius}
            error={step3Error}
          />
        </WizardShell>
      )}
      {step === 4 && (
        <WizardShell
          step={4} title="A few last things." subtitle="Then you can start booking sessions."
          onBack={() => setStep(3)} onContinue={handleContinue} canContinue={step4Valid}
          submitting={false} isLastStep={false}
        >
          <LastThingsStep
            langs={langs} onToggleLang={toggleLang}
            notifState={notifState} onToggleNotif={toggleNotif}
            referral={referral} setReferral={setReferral}
            terms={terms} setTerms={setTerms}
            error={step4Error}
          />
        </WizardShell>
      )}
      {step === 5 && (
        <WizardShell
          step={5} title="Review & finish" subtitle="Check everything over before we set up your account."
          onBack={() => setStep(4)} onContinue={handleContinue} canContinue
          submitting={submitting} isLastStep
        >
          <ReviewStep
            athletes={athletes}
            fullName={fullName} email={email} phone={phone} location={location} travelRadius={travelRadius} langs={langs}
            onEditAthletes={() => setStep(2)} onEditAbout={() => setStep(1)}
            error={finishError}
          />
        </WizardShell>
      )}
    </>
  )
}
