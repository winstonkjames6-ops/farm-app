'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, CheckCircle, Circle, Camera, Loader2, Mail, Phone } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

import { T } from '@/lib/theme'
import { AvatarCropModal } from '@/components/profile/AvatarCropModal'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { AppearanceSection } from '@/components/profile/AppearanceSection'
import { ActivityList } from '@/components/profile/ActivityList'
import { getProfileCardTokens, resolveThemeSetting } from '@/components/profile/theme'
import type { ActivityItem, BackgroundMode, ThemeSetting } from '@/components/profile/types'

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcAge(dob: string | null): number | null {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface AthleteRow {
  id: string
  name: string
  dob: string | null
  age: number | null
  sport: string
  initials: string
  waiver_signed_at: string | null
  profile_id: string | null
  comments_enabled: boolean
  banner_image_url: string | null
}

// ── Static data ────────────────────────────────────────────────────────────────

const SPORTS = [
  'Soccer','Basketball','Tennis','Volleyball',
  'Lacrosse','Baseball','Swimming','Track'
]

const PROFILE_ITEMS = [
  { key: 'photo',     label: 'Profile photo',           boost: '+10%', completed: true  },
  { key: 'name',      label: 'Full name set',            boost: '+10%', completed: true  },
  { key: 'location',  label: 'Location set',             boost: '+10%', completed: true  },
  { key: 'phone',     label: 'Phone number added',       boost: '+10%', completed: false },
  { key: 'athlete',   label: 'Athlete profile created',  boost: '+30%', completed: true  },
  { key: 'sport',     label: 'Athlete sport set',        boost: '+20%', completed: true  },
  { key: 'notifs',    label: 'Notifications configured', boost: '+10%', completed: false },
]

const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_BYTES = 5 * 1024 * 1024 // matches the avatars bucket's own file_size_limit

const BANNER_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BANNER_MAX_BYTES = 5 * 1024 * 1024 // matches the banners bucket's own file_size_limit
const BANNER_EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const NOTIF_ROWS = [
  { key: 'sessionReminder', label: 'Session reminders',    desc: '1 hour before each session' },
  { key: 'newMessage',      label: 'New trainer messages', desc: 'When a trainer messages you' },
  { key: 'reviewReminder',  label: 'Review reminders',     desc: 'After each completed session' },
  { key: 'promos',          label: 'Promotional updates',  desc: 'Tips, offers, and platform news' },
]

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%',
  height: '44px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  padding: '0 14px',
  fontSize: '16px',
  fontFamily: "'Hanken Grotesk', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  color: '#111827',
  background: '#FFFFFF',
}

function SectionCard({
  children, id, dangerBorder
}: {
  children: React.ReactNode; id?: string; dangerBorder?: boolean
}) {
  return (
    <div id={id} style={{
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '14px',
      padding: '24px',
      border: dangerBorder
        ? '1px solid rgba(239,68,68,0.2)'
        : '1px solid rgba(0,0,0,0.08)',
    }}>
      {children}
    </div>
  )
}

function CardLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: '11px',
      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      color: danger ? T.danger : T.ink3,
      marginBottom: '16px',
    }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '13px', color: '#374151',
      fontFamily: "'Hanken Grotesk', sans-serif",
      fontWeight: 500, marginBottom: '6px',
    }}>
      {children}
    </div>
  )
}

function FloatingSaveBar({
  status,
  error,
  onSave,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error'
  error: string
  onSave: () => void
}) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'fixed', bottom: '24px', right: '92px', zIndex: 105, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}
    >
      {status === 'error' && (
        <div style={{ background: '#111827', color: '#FCA5A5', fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", borderRadius: '8px', padding: '8px 14px', maxWidth: '280px' }}>
          {error || 'Save failed'}
        </div>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={status === 'saving'}
        style={{
          height: '48px', padding: '0 28px', borderRadius: '999px', border: 'none',
          background: T.cyan, color: '#FFFFFF',
          fontSize: '15px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif",
          cursor: status === 'saving' ? 'default' : 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', gap: '8px',
          opacity: status === 'saving' ? 0.85 : 1,
        }}
      >
        {status === 'saving' && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} style={{ display: 'flex' }}>
            <Loader2 size={16} color="#FFFFFF" />
          </motion.div>
        )}
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save changes'}
      </button>
    </motion.div>,
    document.body
  )
}

function ToggleSwitch({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '999px', background: on ? T.cyan : '#E5E7EB',
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0,
        transition: 'background 0.2s ease', display: 'inline-block', opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: '2px', left: on ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

// ── Section: Photo + Profile Strength ──────────────────────────────────────────

function PhotoSection({
  initials, userId, avatarUrl, onAvatarChange,
}: {
  initials: string
  userId: string
  avatarUrl: string | null
  onAvatarChange: (url: string) => void
}) {
  const strength = PROFILE_ITEMS
    .filter((i) => i.completed)
    .reduce((sum, i) => sum + parseInt(i.boost), 0)
  const [expanded, setExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadError('')

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, or WEBP image.')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setUploadError('Image must be under 5MB.')
      return
    }

    setPendingFile(file)
  }

  async function handleCropSave(blob: Blob) {
    setPendingFile(null)
    setUploading(true)
    const supabase = createClient()
    const path = `${userId}/${Date.now()}.jpg`

    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' })
    if (uploadErr) {
      setUploadError(uploadErr.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
    if (updateErr) {
      setUploadError(updateErr.message)
      setUploading(false)
      return
    }

    onAvatarChange(publicUrl)
    setUploading(false)
  }

  return (
    <SectionCard id="section-photo">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
        >
          <input
            ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange} style={{ display: 'none' }}
          />
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl} alt=""
              style={{ width: 100, height: 100, borderRadius: '999px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 100, height: 100, borderRadius: '999px',
              background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: '30px', color: '#FFFFFF',
            }}>{initials}</div>
          )}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '999px',
              background: 'rgba(255,255,255,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
                <Loader2 size={24} color={T.cyan} />
              </motion.div>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
            style={{
              position: 'absolute', bottom: '2px', right: '2px',
              width: '30px', height: '30px', borderRadius: '999px',
              background: T.cyan, border: '2px solid #FFFFFF',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
          >
            <Camera size={14} color="#FFFFFF" />
          </button>
        </div>

        {/* Strength meter */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '20px', color: T.ink, marginBottom: '4px',
          }}>Profile strength</div>

          <div
            onClick={() => setExpanded((e) => !e)}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '8px 0',
              cursor: 'pointer', maxWidth: '320px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <div style={{
                width: '140px', height: '4px',
                background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden', flexShrink: 0,
              }}>
                <div style={{
                  width: `${strength}%`, height: '100%',
                  background: T.cyan, borderRadius: '999px',
                }} />
              </div>
              <span style={{
                fontSize: '13px', color: '#374151',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>{strength}% complete</span>
            </div>
            <ChevronDown
              size={16} color={T.ink3}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s', flexShrink: 0,
              }}
            />
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ maxWidth: '320px', paddingTop: '4px' }}>
                  {PROFILE_ITEMS.map((item, i) => (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 0',
                        borderBottom: i < PROFILE_ITEMS.length - 1
                          ? '1px solid #F3F4F6' : 'none',
                      }}
                    >
                      {item.completed
                        ? <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />
                        : <Circle size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
                      }
                      <span style={{
                        flex: 1, fontSize: '13px',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                        color: item.completed ? T.ink2 : T.ink,
                        textDecoration: item.completed ? 'line-through' : 'none',
                      }}>
                        {item.label}
                      </span>
                      {!item.completed && (
                        <span style={{
                          fontSize: '12px', color: T.cyan,
                          fontFamily: "'Hanken Grotesk', sans-serif",
                          fontWeight: 600, flexShrink: 0,
                        }}>{item.boost}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {uploadError && (
        <div style={{
          color: T.danger, fontSize: '13px', marginTop: '12px',
          fontFamily: "'Hanken Grotesk', sans-serif",
        }}>{uploadError}</div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            height: '44px', padding: '0 20px',
            background: T.cyan, color: '#FFFFFF',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            fontFamily: "'Hanken Grotesk', sans-serif", cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
        >{uploading ? 'Uploading…' : 'Upload photo'}</button>
        <button style={{
          height: '44px', padding: '0 20px',
          background: 'transparent', color: T.ink2,
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: '8px', fontSize: '14px',
          fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
        }}>Remove photo</button>
      </div>

      {pendingFile && (
        <AvatarCropModal
          file={pendingFile}
          onSave={handleCropSave}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </SectionCard>
  )
}

// ── Section: Basic Info ────────────────────────────────────────────────────────

function BasicInfoSection({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  emailPending,
}: {
  firstName: string
  onFirstNameChange: (v: string) => void
  lastName: string
  onLastNameChange: (v: string) => void
  email: string
  onEmailChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  emailPending?: string | null
}) {
  const [location, setLocation] = useState('')

  return (
    <SectionCard id="section-basic-info">
      <CardLabel>Basic Info</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FieldLabel>First name</FieldLabel>
            <input
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              style={inputBase}
            />
          </div>
          <div>
            <FieldLabel>Last name</FieldLabel>
            <input
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              style={inputBase}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <input
            value={email} type="email"
            onChange={(e) => onEmailChange(e.target.value)}
            style={inputBase}
          />
          {emailPending && (
            <div style={{
              color: '#059669', fontSize: '13px', marginTop: '6px',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>
              {emailPending}
            </div>
          )}
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <input
            value={phone} type="tel"
            onChange={(e) => onPhoneChange(e.target.value)}
            style={inputBase}
          />
        </div>
        <div>
          <FieldLabel>Location</FieldLabel>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State"
            style={inputBase}
          />
        </div>
      </div>
    </SectionCard>
  )
}

// ── Athlete permission categories ─────────────────────────────────────────────

const ATHLETE_PERMISSION_CATEGORIES = [
  {
    label: 'Session Control',
    items: [
      { key: 'shareSessionClips',          label: 'Allow trainer to share session clips' },
      { key: 'progressNotesAfterSession',  label: 'Allow progress notes after each session' },
      { key: 'parentalApprovalReschedule', label: 'Parental approval required for rescheduling' },
      { key: 'cancelLessThan24hr',         label: 'Allow trainer to cancel with less than 24hr notice' },
      { key: 'parentPresentInPerson',      label: 'Require parent present for in-person sessions' },
      { key: 'remoteWithoutParent',        label: 'Allow remote sessions without parent supervision' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { key: 'directMessageAthlete',  label: 'Allow trainer to message athlete directly (vs parent only)' },
      { key: 'sessionRecapEmails',    label: 'Receive session recap emails' },
      { key: 'notifyProfileViewed',   label: 'Notify me when trainer views athlete profile' },
      { key: 'trainerSuggestDrills',  label: 'Allow trainer to suggest drills between sessions' },
    ],
  },
  {
    label: 'Profile & Visibility',
    items: [
      { key: 'showProfileBeforeBooking', label: 'Show athlete profile to trainers before booking' },
      { key: 'testimonialAnonymized',    label: "Show athlete in trainer's testimonials (anonymized)" },
      { key: 'farmSuccessStories',       label: 'Allow athlete to appear in FARM success stories' },
      { key: 'hideAgeFromSearch',        label: 'Hide athlete age from public search' },
    ],
  },
  {
    label: 'Progress & Tracking',
    items: [
      { key: 'trainerSetGoals',           label: 'Allow trainer to set session goals' },
      { key: 'trackSkillRatings',         label: 'Allow trainer to track skill ratings over time' },
      { key: 'shareProgressOtherCoaches', label: 'Share athlete progress with other coaches' },
      { key: 'monthlyProgressReport',     label: 'Receive monthly progress report' },
    ],
  },
  {
    label: 'Booking & Payments',
    items: [
      { key: 'approveBeforeAthleteBook', label: 'Require my approval before athlete can book independently' },
      { key: 'trainerOfferPackages',     label: 'Allow trainer to offer package deals to my athlete' },
      { key: 'autoApproveRebooking',     label: 'Auto-approve rebooking with same trainer' },
    ],
  },
]

const PERM_KEYS = ATHLETE_PERMISSION_CATEGORIES.flatMap((c) => c.items.map((it) => it.key))

// ── Direct-message waiver modal ───────────────────────────────────────────────

function pointFromEvent(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect()
  return { x: clientX - rect.left, y: clientY - rect.top }
}

function WaiverModal({
  athleteName, onSubmit, onCancel, submitting, error,
}: {
  athleteName: string
  onSubmit: (parentName: string, signatureDataUrl: string) => void
  onCancel: () => void
  submitting: boolean
  error: string | null
}) {
  const [parentName, setParentName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  function beginStroke(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas || submitting) return
    isDrawingRef.current = true
    lastPointRef.current = pointFromEvent(canvas, clientX, clientY)
    setHasSignature(true)
  }

  function extendStroke(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas || !isDrawingRef.current || submitting) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !lastPointRef.current) return
    const point = pointFromEvent(canvas, clientX, clientY)
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPointRef.current = point
  }

  function endStroke() {
    isDrawingRef.current = false
    lastPointRef.current = null
  }

  function handleClear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const canSubmit = parentName.trim().length > 0 && agreed && hasSignature && !submitting

  function handleSubmit() {
    const canvas = canvasRef.current
    if (!canvas || !canSubmit) return
    onSubmit(parentName.trim(), canvas.toDataURL('image/png'))
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '24px',
        width: '420px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px', background: T.cyan,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '15px',
              color: '#FFFFFF',
            }}>F</span>
          </div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px',
            color: T.ink,
          }}>
            Allow direct messaging
          </div>
        </div>
        <div style={{
          fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif",
          marginBottom: '16px',
        }}>
          Parent/guardian consent required — FARM Athlete Communication Waiver
        </div>

        {/* Waiver text */}
        <div style={{
          background: T.surface2, border: `1px solid ${T.line}`, borderRadius: '8px',
          padding: '12px', maxHeight: '120px', overflowY: 'auto',
          fontSize: '13px', lineHeight: 1.5, color: T.ink2,
          fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px',
        }}>
          By signing this waiver, I acknowledge that my child will be able to send and receive
          private messages directly with their assigned trainer(s) on FARM. I understand I am
          responsible for periodically reviewing this decision and may revoke it at any time.
          I have read and agree to FARM&apos;s full messaging consent terms.
        </div>

        {/* Parent/Guardian name */}
        <div style={{ marginBottom: '12px' }}>
          <FieldLabel>Parent/Guardian name</FieldLabel>
          <input
            style={inputBase}
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Type your full name"
            disabled={submitting}
          />
        </div>

        {/* Athlete name (read-only) */}
        <div style={{ marginBottom: '12px' }}>
          <FieldLabel>Athlete name</FieldLabel>
          <input
            style={{ ...inputBase, background: T.surface2, color: T.ink2, cursor: 'not-allowed' }}
            value={athleteName}
            readOnly
            disabled
          />
        </div>

        {/* Signature */}
        <div style={{ marginBottom: '8px' }}>
          <FieldLabel>Signature</FieldLabel>
          <div style={{ position: 'relative', width: '100%', height: '140px' }}>
            <canvas
              ref={canvasRef}
              width={372}
              height={140}
              style={{
                width: '100%', height: '140px', borderRadius: '8px',
                border: `1px solid ${T.line}`, background: T.surface2,
                touchAction: 'none', cursor: submitting ? 'not-allowed' : 'crosshair',
                display: 'block',
              }}
              onPointerDown={(e) => beginStroke(e.clientX, e.clientY)}
              onPointerMove={(e) => extendStroke(e.clientX, e.clientY)}
              onPointerUp={endStroke}
              onPointerLeave={endStroke}
              onPointerCancel={endStroke}
            />
            {!hasSignature && (
              <span style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '13px', color: 'rgba(107,114,128,0.5)', pointerEvents: 'none',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>
                Draw with mouse or touch
              </span>
            )}
          </div>
          <button
            onClick={handleClear}
            disabled={submitting}
            style={{
              marginTop: '6px', background: 'transparent', border: 'none', padding: 0,
              color: T.cyan, fontSize: '13px', fontWeight: 600,
              fontFamily: "'Hanken Grotesk', sans-serif",
              cursor: submitting ? 'default' : 'pointer',
            }}
          >Clear</button>
        </div>

        {/* Agreement checkbox */}
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px',
          marginTop: '12px', marginBottom: '12px',
          cursor: submitting ? 'default' : 'pointer',
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={submitting}
            style={{ marginTop: '2px' }}
          />
          <span style={{
            fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif",
          }}>
            I have read and agree to the terms above
          </span>
        </label>

        {error && (
          <div style={{
            fontSize: '13px', color: T.danger, marginBottom: '12px',
            fontFamily: "'Hanken Grotesk', sans-serif",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              flex: 1, height: '44px', padding: '0 16px',
              background: 'transparent', color: T.ink2,
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px',
              fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif",
              cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1,
            }}
          >Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              flex: 1, height: '44px', padding: '0 16px',
              background: T.cyan, color: '#FFFFFF',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5,
            }}
          >{submitting ? 'Enabling…' : 'I agree, enable messaging'}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Section: Athletes ──────────────────────────────────────────────────────────

function AthletesSection({ initialAthletes }: { initialAthletes: AthleteRow[] }) {
  const [athletes, setAthletes] = useState<AthleteRow[]>(initialAthletes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saveError, setSaveError] = useState<Record<string, string | null>>({})

  // Per-athlete active tab — default 'details'
  const [activeTab, setActiveTab] = useState<Record<string, 'details' | 'permissions'>>({})

  // Per-athlete permission toggles — all false by default, except
  // directMessageAthlete which reflects whether the messaging waiver is on file.
  const [athletePerms, setAthletePerms] = useState<Record<string, Record<string, boolean>>>(
    () => Object.fromEntries(
      initialAthletes.map((a) => [
        a.id,
        Object.fromEntries(PERM_KEYS.map((k) => [
          k,
          k === 'directMessageAthlete' ? a.waiver_signed_at != null : false,
        ])),
      ])
    )
  )

  // Direct-message waiver: the athlete pending confirmation, and per-athlete
  // in-flight state for the waiver write (separate from the details `saving`).
  const [pendingDmAthlete, setPendingDmAthlete] = useState<AthleteRow | null>(null)
  const [dmPending, setDmPending] = useState<Record<string, boolean>>({})

  // Account-wide comment permission per athlete — backed by athletes.comments_enabled.
  const [commentsEnabledMap, setCommentsEnabledMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(initialAthletes.map((a) => [a.id, a.comments_enabled]))
  )
  const [commentsEnabledPending, setCommentsEnabledPending] = useState<Record<string, boolean>>({})

  // Invite-code reveal — per athlete, fetched lazily on first "View invite code" click.
  const [inviteCodeOpen, setInviteCodeOpen] = useState<Record<string, boolean>>({})
  const [inviteCodeLoading, setInviteCodeLoading] = useState<Record<string, boolean>>({})
  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({})
  const [inviteCodeError, setInviteCodeError] = useState<Record<string, string | null>>({})
  const [inviteCodeCopied, setInviteCodeCopied] = useState<Record<string, boolean>>({})

  // Under-13 login setup — per athlete, opened via "Set up their login".
  const [setupLoginOpen, setSetupLoginOpen] = useState<Record<string, boolean>>({})
  const [setupLoginUsername, setSetupLoginUsername] = useState<Record<string, string>>({})
  const [setupLoginPin, setSetupLoginPin] = useState<Record<string, string>>({})
  const [setupLoginSubmitting, setSetupLoginSubmitting] = useState<Record<string, boolean>>({})
  const [setupLoginError, setSetupLoginError] = useState<Record<string, string | null>>({})
  const [setupLoginResult, setSetupLoginResult] = useState<Record<string, string | null>>({})

  // Banner upload — per athlete, under-13 linked athletes only.
  const [bannerUploading, setBannerUploading] = useState<Record<string, boolean>>({})
  const [bannerError, setBannerError] = useState<Record<string, string | null>>({})
  const bannerFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function handleBannerFileChange(athlete: AthleteRow, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBannerError((prev) => ({ ...prev, [athlete.id]: null }))

    if (!athlete.profile_id) {
      setBannerError((prev) => ({ ...prev, [athlete.id]: 'This athlete is not linked yet.' }))
      return
    }
    if (!BANNER_ALLOWED_TYPES.includes(file.type)) {
      setBannerError((prev) => ({ ...prev, [athlete.id]: 'Please upload a JPEG, PNG, or WEBP image.' }))
      return
    }
    if (file.size > BANNER_MAX_BYTES) {
      setBannerError((prev) => ({ ...prev, [athlete.id]: 'Image must be under 5MB.' }))
      return
    }

    uploadAthleteBanner(athlete, file)
  }

  async function uploadAthleteBanner(athlete: AthleteRow, file: File) {
    const profileId = athlete.profile_id
    if (!profileId) return

    setBannerUploading((prev) => ({ ...prev, [athlete.id]: true }))
    const supabase = createClient()
    const extension = BANNER_EXTENSION_BY_TYPE[file.type] ?? 'jpg'
    const path = `${profileId}/${Date.now()}.${extension}`

    const { error: uploadErr } = await supabase.storage.from('banners').upload(path, file, { contentType: file.type })
    if (uploadErr) {
      setBannerError((prev) => ({ ...prev, [athlete.id]: uploadErr.message }))
      setBannerUploading((prev) => ({ ...prev, [athlete.id]: false }))
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(path)
    const { error: updateErr } = await supabase.from('profiles').update({ banner_image_url: publicUrl }).eq('id', profileId)
    if (updateErr) {
      setBannerError((prev) => ({ ...prev, [athlete.id]: updateErr.message }))
      setBannerUploading((prev) => ({ ...prev, [athlete.id]: false }))
      return
    }

    setAthletes((prev) => prev.map((a) => a.id === athlete.id ? { ...a, banner_image_url: publicUrl } : a))
    setBannerUploading((prev) => ({ ...prev, [athlete.id]: false }))
  }

  function handleChange(id: string, field: string, value: string | number) {
    setAthletes((prev) =>
      prev.map((a) => a.id === id ? { ...a, [field]: value } : a)
    )
  }

  async function handleSave(athlete: AthleteRow) {
    setSaving((prev) => ({ ...prev, [athlete.id]: true }))
    setSaveError((prev) => ({ ...prev, [athlete.id]: null }))
    const supabase = createClient()
    const { error } = await supabase
      .from('athletes')
      .update({ name: athlete.name, dob: athlete.dob, sport: athlete.sport })
      .eq('id', athlete.id)
    if (error) {
      setSaveError((prev) => ({ ...prev, [athlete.id]: error.message }))
      setSaving((prev) => ({ ...prev, [athlete.id]: false }))
      return
    }
    setAthletes((prev) =>
      prev.map((a) => a.id === athlete.id ? { ...a, age: calcAge(a.dob) } : a)
    )
    setSaving((prev) => ({ ...prev, [athlete.id]: false }))
    setEditingId(null)
  }

  function togglePerm(athleteId: string, key: string) {
    setAthletePerms((prev) => ({
      ...prev,
      [athleteId]: { ...prev[athleteId], [key]: !prev[athleteId][key] },
    }))
  }

  async function handleViewInviteCode(athleteId: string) {
    setInviteCodeOpen((prev) => ({ ...prev, [athleteId]: true }))
    if (inviteCodes[athleteId]) return
    setInviteCodeLoading((prev) => ({ ...prev, [athleteId]: true }))
    setInviteCodeError((prev) => ({ ...prev, [athleteId]: null }))
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_child_invite_code', { p_athlete_id: athleteId })
    setInviteCodeLoading((prev) => ({ ...prev, [athleteId]: false }))
    if (error) {
      setInviteCodeError((prev) => ({ ...prev, [athleteId]: 'This invite code has expired — contact support' }))
      return
    }
    setInviteCodes((prev) => ({ ...prev, [athleteId]: data as string }))
  }

  function closeInviteCode(athleteId: string) {
    setInviteCodeOpen((prev) => ({ ...prev, [athleteId]: false }))
  }

  function copyInviteCode(athleteId: string) {
    const code = inviteCodes[athleteId]
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setInviteCodeCopied((prev) => ({ ...prev, [athleteId]: true }))
      setTimeout(() => setInviteCodeCopied((prev) => ({ ...prev, [athleteId]: false })), 2000)
    })
  }

  function openSetupLogin(athleteId: string) {
    setSetupLoginOpen((prev) => ({ ...prev, [athleteId]: true }))
  }

  function closeSetupLogin(athleteId: string) {
    setSetupLoginOpen((prev) => ({ ...prev, [athleteId]: false }))
  }

  async function handleSetupLoginSubmit(athlete: AthleteRow) {
    const username = setupLoginUsername[athlete.id] ?? ''
    const pin = setupLoginPin[athlete.id] ?? ''
    setSetupLoginSubmitting((prev) => ({ ...prev, [athlete.id]: true }))
    setSetupLoginError((prev) => ({ ...prev, [athlete.id]: null }))

    const spaceIdx = athlete.name.indexOf(' ')
    const firstName = spaceIdx >= 0 ? athlete.name.slice(0, spaceIdx) : athlete.name
    const lastName = spaceIdx >= 0 ? athlete.name.slice(spaceIdx + 1) : ''

    try {
      const res = await fetch('/api/create-athlete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, dob: athlete.dob, sport: athlete.sport, username, pin,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSetupLoginError((prev) => ({ ...prev, [athlete.id]: data.error ?? 'Failed to create login.' }))
        return
      }
      setSetupLoginResult((prev) => ({ ...prev, [athlete.id]: username.trim().toLowerCase() }))
    } catch {
      setSetupLoginError((prev) => ({ ...prev, [athlete.id]: 'Failed to create login.' }))
    } finally {
      setSetupLoginSubmitting((prev) => ({ ...prev, [athlete.id]: false }))
    }
  }

  // Persists the messaging waiver (sign or revoke) and only flips the toggle
  // once the write succeeds — never optimistically. Returns whether it succeeded
  // so callers (e.g. the waiver modal) know whether to close.
  async function persistWaiver(
    athleteId: string,
    waiverSignedAt: string | null,
    waiverSignedBy: string | null,
    waiverSignature: string | null,
    nextValue: boolean,
  ): Promise<boolean> {
    setDmPending((prev) => ({ ...prev, [athleteId]: true }))
    setSaveError((prev) => ({ ...prev, [athleteId]: null }))
    const supabase = createClient()
    const { error } = await supabase
      .from('athletes')
      .update({
        waiver_signed_at: waiverSignedAt,
        waiver_signed_by: waiverSignedBy,
        waiver_signature: waiverSignature,
      })
      .eq('id', athleteId)
    setDmPending((prev) => ({ ...prev, [athleteId]: false }))
    if (error) {
      setSaveError((prev) => ({ ...prev, [athleteId]: error.message }))
      return false
    }
    setAthletePerms((prev) => ({
      ...prev,
      [athleteId]: { ...prev[athleteId], directMessageAthlete: nextValue },
    }))
    return true
  }

  function handleDirectMessageToggle(athlete: AthleteRow) {
    const current = athletePerms[athlete.id]?.directMessageAthlete ?? false
    if (current) {
      // Turning off — no waiver needed; clear the signature along with the date.
      void persistWaiver(athlete.id, null, null, null, false)
      return
    }
    // Turning on — require a signed waiver before writing anything.
    setPendingDmAthlete(athlete)
  }

  async function submitWaiver(parentName: string, signatureDataUrl: string) {
    if (!pendingDmAthlete) return
    const athlete = pendingDmAthlete
    const ok = await persistWaiver(
      athlete.id,
      new Date().toISOString(),
      parentName,
      signatureDataUrl,
      true,
    )
    if (ok) setPendingDmAthlete(null)
  }

  function cancelDirectMessage() {
    setPendingDmAthlete(null)
  }

  async function toggleCommentsEnabled(athleteId: string) {
    const next = !(commentsEnabledMap[athleteId] ?? false)
    setCommentsEnabledPending((prev) => ({ ...prev, [athleteId]: true }))
    setSaveError((prev) => ({ ...prev, [athleteId]: null }))
    const supabase = createClient()
    const { error } = await supabase
      .from('athletes')
      .update({ comments_enabled: next })
      .eq('id', athleteId)
    setCommentsEnabledPending((prev) => ({ ...prev, [athleteId]: false }))
    if (error) {
      setSaveError((prev) => ({ ...prev, [athleteId]: error.message }))
      return
    }
    setCommentsEnabledMap((prev) => ({ ...prev, [athleteId]: next }))
  }

  function setTab(athleteId: string, tab: 'details' | 'permissions') {
    setActiveTab((prev) => ({ ...prev, [athleteId]: tab }))
  }

  const selectStyle: React.CSSProperties = {
    ...inputBase,
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.40)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
    cursor: 'pointer',
  }

  return (
    <div id="tour-profile-permissions-anchor" style={{ scrollMarginTop: '80px' }}>
    <SectionCard id="tour-profile-permissions">
      <CardLabel>Athletes</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {athletes.map((athlete, i) => {
          const tab = activeTab[athlete.id] ?? 'details'
          return (
            <div key={athlete.id}>
              {editingId === athlete.id ? (
                <div style={{
                  paddingTop: i > 0 ? '16px' : '0',
                  paddingBottom: '16px',
                  borderBottom: `1px solid ${T.line}`,
                }}>
                  {/* Tab buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {(['details', 'permissions'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(athlete.id, t)}
                        style={{
                          height: '32px',
                          padding: '0 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: "'Hanken Grotesk', sans-serif",
                          cursor: 'pointer',
                          background: tab === t ? T.cyan : '#F3F4F6',
                          color: tab === t ? '#FFFFFF' : T.ink2,
                          border: 'none',
                          fontWeight: 600,
                          textTransform: 'capitalize' as const,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {tab === 'details' ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <FieldLabel>Name</FieldLabel>
                          <input
                            style={inputBase} value={athlete.name}
                            onChange={(e) => handleChange(athlete.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <FieldLabel>Date of birth</FieldLabel>
                          <input
                            style={inputBase} type="date" value={athlete.dob ?? ''}
                            onChange={(e) => handleChange(athlete.id, 'dob', e.target.value)}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <FieldLabel>Sport</FieldLabel>
                        <select
                          value={athlete.sport}
                          onChange={(e) => handleChange(athlete.id, 'sport', e.target.value)}
                          style={selectStyle}
                        >
                          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {saveError[athlete.id] && (
                        <div style={{
                          fontSize: '13px', color: T.danger, marginBottom: '10px',
                          fontFamily: "'Hanken Grotesk', sans-serif",
                        }}>
                          {saveError[athlete.id]}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleSave(athlete)}
                          disabled={saving[athlete.id]}
                          style={{
                            flex: 1, height: '44px',
                            background: T.cyan, color: '#FFFFFF',
                            border: 'none', borderRadius: '8px', fontSize: '14px',
                            fontFamily: "'Hanken Grotesk', sans-serif",
                            fontWeight: 600,
                            cursor: saving[athlete.id] ? 'not-allowed' : 'pointer',
                            opacity: saving[athlete.id] ? 0.7 : 1,
                          }}
                        >{saving[athlete.id] ? 'Saving…' : 'Save'}</button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={saving[athlete.id]}
                          style={{
                            height: '44px', padding: '0 16px',
                            background: 'transparent', color: T.ink2,
                            border: '1px solid rgba(0,0,0,0.12)',
                            borderRadius: '8px', fontSize: '14px',
                            fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
                          }}
                        >Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      {ATHLETE_PERMISSION_CATEGORIES.map((category) => (
                        <div key={category.label}>
                          <div style={{
                            fontSize: '11px',
                            fontFamily: "'Hanken Grotesk', sans-serif",
                            fontWeight: 700,
                            color: '#9CA3AF',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.1em',
                            paddingTop: '16px',
                            paddingBottom: '8px',
                          }}>
                            {category.label}
                          </div>
                          {category.items.map((item) => (
                            <div
                              key={item.key}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 0',
                                borderBottom: '1px solid rgba(0,0,0,0.08)',
                              }}
                            >
                              <span style={{
                                fontSize: '14px',
                                color: '#111827',
                                fontFamily: "'Hanken Grotesk', sans-serif",
                                paddingRight: '16px',
                              }}>
                                {item.label}
                              </span>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '44px',
                                minHeight: '44px',
                                flexShrink: 0,
                              }}>
                                <ToggleSwitch
                                  on={athletePerms[athlete.id]?.[item.key] ?? false}
                                  disabled={item.key === 'directMessageAthlete' && dmPending[athlete.id]}
                                  onChange={() => {
                                    if (item.key === 'directMessageAthlete') {
                                      handleDirectMessageToggle(athlete)
                                    } else {
                                      togglePerm(athlete.id, item.key)
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div>
                        <div style={{
                          fontSize: '11px',
                          fontFamily: "'Hanken Grotesk', sans-serif",
                          fontWeight: 700,
                          color: '#9CA3AF',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.1em',
                          paddingTop: '16px',
                          paddingBottom: '8px',
                        }}>
                          Comments
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 0',
                          borderBottom: '1px solid rgba(0,0,0,0.08)',
                        }}>
                          <span style={{
                            fontSize: '14px',
                            color: '#111827',
                            fontFamily: "'Hanken Grotesk', sans-serif",
                            paddingRight: '16px',
                          }}>
                            {`Allow comments on ${athlete.name}'s posts`}
                          </span>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '44px',
                            minHeight: '44px',
                            flexShrink: 0,
                          }}>
                            <ToggleSwitch
                              on={commentsEnabledMap[athlete.id] ?? false}
                              disabled={commentsEnabledPending[athlete.id]}
                              onChange={() => toggleCommentsEnabled(athlete.id)}
                            />
                          </div>
                        </div>
                      </div>
                      {saveError[athlete.id] && (
                        <div style={{
                          fontSize: '13px', color: T.danger, marginTop: '12px',
                          fontFamily: "'Hanken Grotesk', sans-serif",
                        }}>
                          {saveError[athlete.id]}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  paddingTop: i > 0 ? '16px' : '0', paddingBottom: '16px',
                  borderBottom: `1px solid ${T.line}`,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '999px',
                    background: T.surface2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: '14px', color: T.ink,
                  }}>{athlete.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontWeight: 600, fontSize: '15px', color: T.ink,
                    }}>{athlete.name}</div>
                    <div style={{
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontSize: '13px', color: T.ink3,
                    }}>Age {athlete.age} · {athlete.sport}</div>

                    {athlete.profile_id ? (
                      <div style={{
                        marginTop: '4px', fontSize: '12px', fontWeight: 600, color: '#10B981',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                      }}>Linked</div>
                    ) : athlete.age !== null && athlete.age < 13 ? (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: 600, color: T.ink3,
                          fontFamily: "'Hanken Grotesk', sans-serif",
                        }}>Not yet linked</span>
                        <button
                          onClick={() => openSetupLogin(athlete.id)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: T.cyan, fontSize: '12px', fontWeight: 600,
                            fontFamily: "'Hanken Grotesk', sans-serif", padding: 0,
                          }}
                        >Set up their login</button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: 600, color: T.ink3,
                          fontFamily: "'Hanken Grotesk', sans-serif",
                        }}>Not yet linked</span>
                        <button
                          onClick={() => handleViewInviteCode(athlete.id)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: T.cyan, fontSize: '12px', fontWeight: 600,
                            fontFamily: "'Hanken Grotesk', sans-serif", padding: 0,
                          }}
                        >View invite code</button>
                      </div>
                    )}

                    {athlete.profile_id && athlete.age !== null && athlete.age < 13 && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', width: '96px', height: '36px', borderRadius: '6px', overflow: 'hidden', background: T.surface2, flexShrink: 0 }}>
                          {athlete.banner_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={athlete.banner_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                              No banner
                            </div>
                          )}
                          {bannerUploading[athlete.id] && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
                                <Loader2 size={14} color={T.cyan} />
                              </motion.div>
                            </div>
                          )}
                        </div>
                        <input
                          ref={(el) => { bannerFileInputRefs.current[athlete.id] = el }}
                          type="file" accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleBannerFileChange(athlete, e)}
                          style={{ display: 'none' }}
                        />
                        <button
                          onClick={() => bannerFileInputRefs.current[athlete.id]?.click()}
                          disabled={bannerUploading[athlete.id]}
                          style={{
                            background: 'transparent', border: 'none', cursor: bannerUploading[athlete.id] ? 'default' : 'pointer',
                            color: T.cyan, fontSize: '12px', fontWeight: 600,
                            fontFamily: "'Hanken Grotesk', sans-serif", padding: 0,
                            opacity: bannerUploading[athlete.id] ? 0.7 : 1,
                          }}
                        >{bannerUploading[athlete.id] ? 'Uploading…' : athlete.banner_image_url ? 'Change banner' : 'Upload banner'}</button>
                      </div>
                    )}
                    {bannerError[athlete.id] && (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                        {bannerError[athlete.id]}
                      </div>
                    )}

                    <AnimatePresence>
                      {inviteCodeOpen[athlete.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px',
                            background: T.surface2, borderRadius: '8px', padding: '8px 12px',
                          }}>
                            {inviteCodeLoading[athlete.id] ? (
                              <span style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                                Loading&hellip;
                              </span>
                            ) : inviteCodeError[athlete.id] ? (
                              <span style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                                {inviteCodeError[athlete.id]}
                              </span>
                            ) : (
                              <>
                                <code style={{
                                  fontFamily: "'Courier New', monospace", fontSize: '14px',
                                  fontWeight: 700, color: T.ink, letterSpacing: '0.04em',
                                }}>{inviteCodes[athlete.id]}</code>
                                <button
                                  onClick={() => copyInviteCode(athlete.id)}
                                  style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    color: T.cyan, fontSize: '12px', fontWeight: 600,
                                    fontFamily: "'Hanken Grotesk', sans-serif", padding: 0,
                                  }}
                                >{inviteCodeCopied[athlete.id] ? 'Copied!' : 'Copy'}</button>
                              </>
                            )}
                            <button
                              onClick={() => closeInviteCode(athlete.id)}
                              style={{
                                marginLeft: 'auto', background: 'transparent', border: 'none',
                                cursor: 'pointer', color: T.ink3, fontSize: '12px',
                                fontFamily: "'Hanken Grotesk', sans-serif", padding: 0,
                              }}
                            >Close</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {setupLoginOpen[athlete.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            marginTop: '8px', background: T.surface2, borderRadius: '8px', padding: '12px',
                          }}>
                            {setupLoginResult[athlete.id] ? (
                              <div style={{
                                fontSize: '13px', color: T.ink2, lineHeight: 1.5,
                                fontFamily: "'Hanken Grotesk', sans-serif",
                              }}>
                                Login created — username{' '}
                                <code style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: T.ink }}>
                                  {setupLoginResult[athlete.id]}
                                </code>
                                . Your child signs in with this username and their PIN.
                              </div>
                            ) : (
                              <>
                                <div style={{ marginBottom: '10px' }}>
                                  <FieldLabel>Username</FieldLabel>
                                  <input
                                    style={inputBase}
                                    value={setupLoginUsername[athlete.id] ?? ''}
                                    onChange={(e) => setSetupLoginUsername((prev) => ({ ...prev, [athlete.id]: e.target.value }))}
                                    placeholder="e.g. jsmith23"
                                    disabled={setupLoginSubmitting[athlete.id]}
                                  />
                                  <div style={{
                                    fontSize: '12px', color: T.ink3, marginTop: '4px',
                                    fontFamily: "'Hanken Grotesk', sans-serif",
                                  }}>
                                    Lowercase letters and numbers only, no spaces or symbols.
                                  </div>
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                  <FieldLabel>PIN</FieldLabel>
                                  <input
                                    style={inputBase}
                                    type="text"
                                    inputMode="numeric"
                                    value={setupLoginPin[athlete.id] ?? ''}
                                    onChange={(e) => setSetupLoginPin((prev) => ({ ...prev, [athlete.id]: e.target.value }))}
                                    placeholder="4 to 6 digits"
                                    disabled={setupLoginSubmitting[athlete.id]}
                                  />
                                </div>
                                {setupLoginError[athlete.id] && (
                                  <div style={{
                                    fontSize: '13px', color: T.danger, marginBottom: '10px',
                                    fontFamily: "'Hanken Grotesk', sans-serif",
                                  }}>
                                    {setupLoginError[athlete.id]}
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={() => handleSetupLoginSubmit(athlete)}
                                    disabled={setupLoginSubmitting[athlete.id]}
                                    style={{
                                      height: '36px', padding: '0 16px',
                                      background: T.cyan, color: '#FFFFFF',
                                      border: 'none', borderRadius: '8px', fontSize: '13px',
                                      fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
                                      cursor: setupLoginSubmitting[athlete.id] ? 'not-allowed' : 'pointer',
                                      opacity: setupLoginSubmitting[athlete.id] ? 0.7 : 1,
                                    }}
                                  >{setupLoginSubmitting[athlete.id] ? 'Creating…' : 'Create login'}</button>
                                  <button
                                    onClick={() => closeSetupLogin(athlete.id)}
                                    disabled={setupLoginSubmitting[athlete.id]}
                                    style={{
                                      height: '36px', padding: '0 16px',
                                      background: 'transparent', color: T.ink2,
                                      border: '1px solid rgba(0,0,0,0.12)',
                                      borderRadius: '8px', fontSize: '13px',
                                      fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
                                    }}
                                  >Cancel</button>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(athlete.id)
                      setTab(athlete.id, 'details')
                    }}
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', color: T.cyan, fontSize: '13px',
                      fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
                      minHeight: '44px', padding: '0 4px', alignSelf: 'flex-start',
                    }}
                  >Edit</button>
                </div>
              )}
            </div>
          )
        })}

        {/* Add athlete */}
        <Link
          href="/child/create"
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            paddingTop: '16px', color: T.ink2, textDecoration: 'none',
          }}
        >
          <div style={{
            width: 44, height: 44, background: T.surface2,
            borderRadius: '12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke={T.ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 600, fontSize: '15px', color: T.ink,
            }}>Add an athlete</div>
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px', color: T.ink3,
            }}>Create a profile for your child to find the right coach</div>
          </div>
        </Link>
      </div>
    </SectionCard>
    {pendingDmAthlete && (
      <WaiverModal
        athleteName={pendingDmAthlete.name}
        submitting={dmPending[pendingDmAthlete.id] ?? false}
        error={saveError[pendingDmAthlete.id] ?? null}
        onSubmit={(parentName, signatureDataUrl) => void submitWaiver(parentName, signatureDataUrl)}
        onCancel={cancelDirectMessage}
      />
    )}
    </div>
  )
}

// ── Section: Notifications ─────────────────────────────────────────────────────

function NotificationsSection() {
  const [state, setState] = useState<Record<string, { email: boolean; sms: boolean }>>({
    sessionReminder: { email: true,  sms: false },
    newMessage:      { email: true,  sms: false },
    reviewReminder:  { email: true,  sms: false },
    promos:          { email: false, sms: false },
  })

  function toggle(key: string, ch: 'email' | 'sms') {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], [ch]: !prev[key][ch] } }))
  }

  return (
    <div id="tour-profile-notifications-anchor" style={{ scrollMarginTop: '80px' }}>
    <SectionCard id="tour-profile-notifications">
      <CardLabel>Notifications</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Column headers */}
        <div style={{
          display: 'flex', alignItems: 'center',
          paddingBottom: '8px', borderBottom: `1px solid ${T.line}`,
          marginBottom: '4px',
        }}>
          <div style={{ flex: 1 }} />
          {['Email', 'SMS'].map((ch) => (
            <div key={ch} style={{
              width: '52px', textAlign: 'center', flexShrink: 0,
              fontSize: '11px', color: T.ink3,
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            }}>{ch}</div>
          ))}
        </div>

        {NOTIF_ROWS.map((row, i) => (
          <div key={row.key} style={{
            display: 'flex', alignItems: 'center',
            padding: '14px 0',
            borderBottom: i < NOTIF_ROWS.length - 1 ? `1px solid ${T.line}` : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px', fontWeight: 500, color: T.ink,
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>{row.label}</div>
              <div style={{
                fontSize: '12px', color: T.ink3,
                fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px',
              }}>{row.desc}</div>
            </div>
            <div style={{ width: '52px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <ToggleSwitch on={state[row.key].email} onChange={() => toggle(row.key, 'email')} />
            </div>
            <div style={{ width: '52px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <ToggleSwitch on={state[row.key].sms} onChange={() => toggle(row.key, 'sms')} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
    </div>
  )
}

// ── Section: Danger Zone ───────────────────────────────────────────────────────

function DangerZoneSection({ onLogOut }: { onLogOut: () => void }) {
  const router = useRouter()
  return (
    <SectionCard dangerBorder>
      <CardLabel danger>Danger Zone</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          padding: '16px 0', borderBottom: `1px solid ${T.line}`,
        }}>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 500, color: T.ink,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>Log out</div>
            <div style={{
              fontSize: '12px', color: T.ink3,
              fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px',
            }}>Sign out of your account on this device</div>
          </div>
          <button
            onClick={onLogOut}
            style={{
              padding: '8px 16px',
              border: '1px solid rgba(0,0,0,0.12)',
              color: T.ink2, background: 'transparent',
              borderRadius: '8px', fontSize: '14px',
              fontFamily: "'Hanken Grotesk', sans-serif",
              cursor: 'pointer', minHeight: '44px', flexShrink: 0,
            }}
          >Log out</button>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          padding: '16px 0',
        }}>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 500, color: T.danger,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>Delete account</div>
            <div style={{
              fontSize: '12px', color: T.ink3,
              fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px',
            }}>Permanently delete your account and all data</div>
          </div>
          <button
            onClick={() => router.push('/dashboard/settings')}
            style={{
              padding: '8px 16px',
              border: '1px solid rgba(239,68,68,0.4)',
              color: T.danger, background: 'transparent',
              borderRadius: '8px', fontSize: '14px',
              fontFamily: "'Hanken Grotesk', sans-serif",
              cursor: 'pointer', minHeight: '44px', flexShrink: 0,
            }}
          >Request deletion</button>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Edit mode ──────────────────────────────────────────────────────────────────

function EditMode({
  onBack, firstName, onFirstNameChange, lastName, onLastNameChange, email, onEmailChange,
  phone, onPhoneChange, emailPending, userId, athletes, onLogOut,
  themePreference, backgroundMode, hasBannerImage, onSaveAppearance, avatarUrl, onAvatarChange,
}: {
  onBack: () => void
  firstName: string
  onFirstNameChange: (v: string) => void
  lastName: string
  onLastNameChange: (v: string) => void
  email: string
  onEmailChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  emailPending: string | null
  userId: string
  athletes: AthleteRow[]
  onLogOut: () => void
  themePreference: ThemeSetting
  backgroundMode: BackgroundMode
  hasBannerImage: boolean
  onSaveAppearance: (updates: { theme_preference?: ThemeSetting; background_mode?: BackgroundMode }) => Promise<void>
  avatarUrl: string | null
  onAvatarChange: (url: string) => void
}) {
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  return (
    <div>
      {/* Edit header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '24px',
      }}>
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '28px', color: T.ink,
          }}>Edit profile</div>
          <div style={{
            fontSize: '14px', color: T.ink2,
            fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '4px',
          }}>Your changes are saved together from the button below</div>
        </div>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            border: '1px solid rgba(0,0,0,0.12)', color: T.ink2,
            background: 'transparent', borderRadius: '8px',
            padding: '8px 16px', fontSize: '14px',
            fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
            minHeight: '44px',
          }}
        >← Back to profile</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PhotoSection initials={initials} userId={userId} avatarUrl={avatarUrl} onAvatarChange={onAvatarChange} />
        <BasicInfoSection
          firstName={firstName}
          onFirstNameChange={onFirstNameChange}
          lastName={lastName}
          onLastNameChange={onLastNameChange}
          email={email}
          onEmailChange={onEmailChange}
          phone={phone}
          onPhoneChange={onPhoneChange}
          emailPending={emailPending}
        />
        <div id="section-appearance">
          <AppearanceSection
            themePreference={themePreference}
            backgroundMode={backgroundMode}
            hasBannerImage={hasBannerImage}
            onSave={onSaveAppearance}
          />
        </div>
        <AthletesSection initialAthletes={athletes} />
        <NotificationsSection />
        <DangerZoneSection onLogOut={onLogOut} />
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

interface ProfileState {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatarUrl: string | null
  bannerImageUrl: string | null
  verified: boolean
  themePreference: ThemeSetting
  backgroundMode: BackgroundMode
}

interface BookingRow {
  id: string
  session_time: string
  status: string
  rate: number | null
  trainerName: string | null
  specialty: string | null
}

interface MessageRow {
  id: string
  body: string
  sent_at: string
  senderName: string | null
}

const PARENT_TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'athletes', label: 'Athletes' },
  { key: 'payments', label: 'Payments' },
]

export default function ParentProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileState | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [athletes, setAthletes] = useState<AthleteRow[]>([])
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [activeTab, setActiveTab] = useState('activity')

  const [draftFirstName, setDraftFirstName] = useState('')
  const [draftLastName, setDraftLastName] = useState('')
  const [draftPhone, setDraftPhone] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [emailPending, setEmailPending] = useState<string | null>(null)
  const [saveBarStatus, setSaveBarStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveBarError, setSaveBarError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfileLoading(false); return }
      setUserId(user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, avatar_url, banner_image_url, phone, verified, theme_preference, background_mode')
        .eq('id', user.id)
        .single()

      const fullName = profileData?.name ?? ''
      const spaceIdx = fullName.indexOf(' ')
      const firstName = spaceIdx >= 0 ? fullName.slice(0, spaceIdx) : fullName
      const lastName  = spaceIdx >= 0 ? fullName.slice(spaceIdx + 1) : ''

      setProfile({
        firstName, lastName, email: user.email ?? '',
        phone: profileData?.phone ?? '',
        avatarUrl: profileData?.avatar_url ?? null,
        bannerImageUrl: profileData?.banner_image_url ?? null,
        verified: profileData?.verified ?? false,
        themePreference: (profileData?.theme_preference as ThemeSetting) ?? 'light',
        backgroundMode: (profileData?.background_mode as BackgroundMode) ?? 'full',
      })
      setDraftFirstName(firstName)
      setDraftLastName(lastName)
      setDraftPhone(profileData?.phone ?? '')
      setDraftEmail(user.email ?? '')

      const { data: athleteData } = await supabase
        .from('athletes')
        .select('id, name, dob, sport, waiver_signed_at, profile_id, comments_enabled, profiles!profile_id(banner_image_url)')
        .eq('parent_id', user.id)

      setAthletes(
        (athleteData ?? []).map((a) => ({
          id: a.id as string,
          name: a.name as string,
          dob: a.dob as string | null,
          age: calcAge(a.dob as string | null),
          sport: a.sport as string,
          initials: getInitials(a.name as string),
          waiver_signed_at: a.waiver_signed_at as string | null,
          profile_id: a.profile_id as string | null,
          comments_enabled: !!a.comments_enabled,
          banner_image_url: (a as any).profiles?.banner_image_url ?? null,
        }))
      )

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, session_time, status, rate, trainers!trainer_id(specialty, profiles(name))')
        .eq('parent_id', user.id)
        .order('session_time', { ascending: false })
        .limit(20)

      setBookings(
        (bookingData ?? []).map((b: any) => ({
          id: b.id,
          session_time: b.session_time,
          status: b.status,
          rate: b.rate,
          trainerName: b.trainers?.profiles?.name ?? null,
          specialty: b.trainers?.specialty ?? null,
        }))
      )

      const { data: messageData } = await supabase
        .from('messages')
        .select('id, sender_id, body, sent_at')
        .eq('recipient_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10)

      const senderIds = Array.from(new Set((messageData ?? []).map((m) => m.sender_id)))
      let senderNames: Record<string, string> = {}
      if (senderIds.length > 0) {
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', senderIds)
        senderNames = Object.fromEntries((senderProfiles ?? []).map((p) => [p.id, p.name]))
      }

      setMessages(
        (messageData ?? []).map((m) => ({
          id: m.id,
          body: m.body,
          sent_at: m.sent_at,
          senderName: senderNames[m.sender_id] ?? null,
        }))
      )

      setProfileLoading(false)
    }
    loadProfile()
  }, [])

  async function saveBasicInfo() {
    if (!userId || !profile) throw new Error('Not authenticated')
    const supabase = createClient()
    const nameChanged = draftFirstName !== profile.firstName || draftLastName !== profile.lastName
    const phoneChanged = draftPhone !== profile.phone
    const emailChanged = draftEmail !== profile.email

    if (nameChanged || phoneChanged) {
      const fullName = `${draftFirstName} ${draftLastName}`.trim()
      const { error } = await supabase.from('profiles').update({ name: fullName, phone: draftPhone }).eq('id', userId)
      if (error) throw new Error(error.message)
      setProfile((p) => p ? { ...p, firstName: draftFirstName, lastName: draftLastName, phone: draftPhone } : p)
    }

    if (emailChanged) {
      const { error } = await supabase.auth.updateUser(
        { email: draftEmail },
        { emailRedirectTo: `${window.location.origin}/auth/callback` }
      )
      if (error) throw new Error(error.message)
      setEmailPending(`Confirmation email sent to ${draftEmail}. Your login email won't change until you click the link in that email.`)
      setDraftEmail(profile.email)
    }
  }

  async function handleSaveAll() {
    setSaveBarStatus('saving')
    setSaveBarError('')
    try {
      if (basicDirty) await saveBasicInfo()
      setSaveBarStatus('saved')
      setTimeout(() => setSaveBarStatus('idle'), 1500)
    } catch (e) {
      setSaveBarError(e instanceof Error ? e.message : 'Save failed')
      setSaveBarStatus('error')
    }
  }

  function handleAvatarChange(url: string) {
    setProfile((p) => p ? { ...p, avatarUrl: url } : p)
  }

  async function handleSaveAppearance(updates: { theme_preference?: ThemeSetting; background_mode?: BackgroundMode }) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
    if (error) throw new Error(error.message)
    setProfile((p) => p ? {
      ...p,
      themePreference: updates.theme_preference ?? p.themePreference,
      backgroundMode: updates.background_mode ?? p.backgroundMode,
    } : p)
  }

  async function handleLogOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (profileLoading) {
    return (
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          maxWidth: '672px', margin: '0 auto', padding: '32px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '200px',
        }}>
          <div style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '14px', color: T.ink3,
          }}>Loading profile…</div>
        </div>
      </div>
    )
  }

  if (!profile || !userId) {
    return (
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          maxWidth: '672px', margin: '0 auto', padding: '32px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '200px',
        }}>
          <div style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '14px', color: T.ink3,
          }}>Unable to load profile.</div>
        </div>
      </div>
    )
  }

  const displayName = `${profile.firstName} ${profile.lastName}`.trim()
  const sportsCount = new Set(athletes.map((a) => a.sport).filter(Boolean)).size
  const cardTokens = getProfileCardTokens(profile.themePreference)

  const basicDirty = draftFirstName !== profile.firstName || draftLastName !== profile.lastName || draftPhone !== profile.phone || draftEmail !== profile.email
  const showSaveBar = isEditing && (basicDirty || saveBarStatus === 'saving' || saveBarStatus === 'saved')

  const activityItems: ActivityItem[] = [
    ...bookings.map((b) => ({
      id: `b-${b.id}`,
      title: `Session with ${b.trainerName ?? 'trainer'}`,
      subtitle: [b.specialty, b.status].filter(Boolean).join(' · '),
      timestamp: b.session_time,
    })),
    ...messages.map((m) => ({
      id: `m-${m.id}`,
      title: `Message from ${m.senderName ?? 'trainer'}`,
      subtitle: m.body.slice(0, 64),
      timestamp: m.sent_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

  const paymentItems: ActivityItem[] = bookings
    .filter((b) => b.status === 'completed' && b.rate != null)
    .map((b) => ({
      id: `p-${b.id}`,
      title: `Session with ${b.trainerName ?? 'trainer'}`,
      subtitle: new Date(b.session_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      meta: `$${b.rate}`,
      timestamp: b.session_time,
    }))

  let tabContent: React.ReactNode
  if (activeTab === 'athletes') {
    tabContent = athletes.length === 0 ? (
      <div style={{ padding: '28px 24px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: cardTokens.ink3 }}>
        No athletes added yet
      </div>
    ) : (
      <div style={{ padding: '4px 20px' }}>
        {athletes.map((a, i) => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 4px',
            borderBottom: i < athletes.length - 1 ? `1px solid ${cardTokens.border}` : 'none',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '999px', flexShrink: 0,
              background: cardTokens.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: cardTokens.ink,
            }}>{a.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: cardTokens.ink }}>{a.name}</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: cardTokens.ink3, marginTop: '2px' }}>
                {a.age != null ? `Age ${a.age}` : 'Age —'} · {a.sport}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  } else if (activeTab === 'payments') {
    tabContent = <ActivityList items={paymentItems} tokens={cardTokens} emptyLabel="No completed sessions yet" />
  } else {
    tabContent = <ActivityList items={activityItems} tokens={cardTokens} emptyLabel="No recent activity" />
  }

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px' }}>
        <motion.div
          key={isEditing ? 'edit' : 'view'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {isEditing ? (
            <EditMode
              onBack={() => setIsEditing(false)}
              firstName={draftFirstName}
              onFirstNameChange={setDraftFirstName}
              lastName={draftLastName}
              onLastNameChange={setDraftLastName}
              email={draftEmail}
              onEmailChange={setDraftEmail}
              phone={draftPhone}
              onPhoneChange={setDraftPhone}
              emailPending={emailPending}
              userId={userId}
              athletes={athletes}
              onLogOut={handleLogOut}
              themePreference={profile.themePreference}
              backgroundMode={profile.backgroundMode}
              hasBannerImage={!!profile.bannerImageUrl}
              onSaveAppearance={handleSaveAppearance}
              avatarUrl={profile.avatarUrl}
              onAvatarChange={handleAvatarChange}
            />
          ) : (
            <ProfileCard
              themePreference={resolveThemeSetting(profile.themePreference)}
              backgroundMode={profile.backgroundMode}
              bannerImageUrl={profile.bannerImageUrl}
              avatarUrl={profile.avatarUrl}
              name={displayName}
              verified={profile.verified}
              verifiedLabel="Verified Parent"
              stats={[
                { value: String(athletes.length), label: athletes.length === 1 ? 'Athlete' : 'Athletes' },
                { value: String(sportsCount), label: 'Sports' },
              ]}
              contactRows={[
                ...(profile.phone ? [{ key: 'phone', icon: <Phone size={14} />, label: profile.phone }] : []),
                { key: 'email', icon: <Mail size={14} />, label: profile.email },
              ]}
              tabs={PARENT_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabContent={tabContent}
              onEditProfile={() => setIsEditing(true)}
              onOpenSettings={() => {
                setIsEditing(true)
                setTimeout(() => document.getElementById('section-appearance')?.scrollIntoView({ behavior: 'smooth' }), 100)
              }}
            />
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showSaveBar && (
          <FloatingSaveBar status={saveBarStatus} error={saveBarError} onSave={handleSaveAll} />
        )}
      </AnimatePresence>
    </div>
  )
}
