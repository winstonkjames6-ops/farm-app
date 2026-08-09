'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/utils/supabase/client'
import { useTrainerSport } from '../sport-context'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronDown,
  Camera,
  Loader2,
  MapPin,
  Phone,
  Video,
  Plus,
  Trash2,
  Award,
  Check,
  X as XIcon,
  CheckCircle,
  Circle,
  Star,
  Music,
  PlayCircle,
  FileText,
  Upload,
} from 'lucide-react'
import { T } from '@/lib/theme'
import { AvatarCropModal } from '@/components/profile/AvatarCropModal'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { AppearanceSection } from '@/components/profile/AppearanceSection'
import { ActivityList } from '@/components/profile/ActivityList'
import { getProfileCardTokens, resolveThemeSetting } from '@/components/profile/theme'
import type { ActivityItem, BackgroundMode, ThemeSetting } from '@/components/profile/types'

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="#E1306C" stroke="none" />
  </svg>
)

const IconTwitterX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 4l16 16M20 4L4 20" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const IconYoutube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="3" fill="#FF0000" />
    <polygon points="10,8.5 10,15.5 16,12" fill="#FFFFFF" />
  </svg>
)

// ── Mock data ──────────────────────────────────────────────────────────────────

type Certification = { id: number; name: string; org: string; year: string }
type Affiliation = { id: number; name: string; role: string; years: string }

const INITIAL_CERTS: Certification[] = [
  { id: 1, name: 'UEFA B License', org: 'UEFA', year: '2019' },
  { id: 2, name: 'Youth Soccer Coach', org: 'US Soccer Federation', year: '2021' },
]

const INITIAL_AFFS: Affiliation[] = [
  { id: 1, name: 'Green Valley FC', role: 'Head Coach', years: '2018–present' },
  { id: 2, name: 'Riverside Academy', role: 'Skills Trainer', years: '2020–2022' },
]

const MOCK_REVIEWS = [
  {
    id: 1, initials: 'SM', parentName: 'Sarah M.', date: 'Jun 12, 2026', rating: 5,
    text: "Marcus is incredible with our 11-year-old. His patience and technical expertise have transformed her game in just 8 weeks. She went from struggling with basic passes to confidently executing combination plays. Highly recommend for any youth soccer player serious about improving.",
  },
  {
    id: 2, initials: 'DK', parentName: 'David K.', date: 'May 28, 2026', rating: 5,
    text: "Best investment we've made for our son's soccer development. Marcus creates a structured yet fun environment that keeps kids engaged. He communicates clearly with both parents and players about goals and progress. Our son looks forward to every session.",
  },
  {
    id: 3, initials: 'JR', parentName: 'Jennifer R.', date: 'May 10, 2026', rating: 4,
    text: "Great trainer who clearly knows the game. Marcus tailored drills specifically to our daughter's weak points — her first touch and shooting accuracy. She's made real strides. The only thing I'd suggest is slightly more communication after sessions about what was covered.",
  },
]

// Base completion values here are placeholders for the keys that get overridden with
// live data in TrainerProfilePage's `profileItems` (photo, bio, specialties, availability,
// rate, certification, location). video/social/notifications have no backing database
// field yet — IntroVideoSection, SocialLinksSection, and NotificationsSection are all
// local-state-only with no persistence — so they stay hardcoded false until those
// sections are wired to the database.
const PROFILE_ITEMS = [
  { key: 'photo',         label: 'Profile photo',                boost: '+10%', sectionId: 'section-photo',         completed: false },
  { key: 'bio',           label: 'Bio',                          boost: '+15%', sectionId: 'section-basic-info',     completed: false },
  { key: 'specialties',   label: 'Specialties set',              boost: '+10%', sectionId: 'section-specialties',    completed: false },
  { key: 'availability',  label: 'Availability set',             boost: '+20%', sectionId: 'section-availability',   completed: false },
  { key: 'rate',          label: 'Rate set',                     boost: '+10%', sectionId: 'section-rate',           completed: false },
  { key: 'certification', label: 'At least 1 certification',     boost: '+10%', sectionId: 'section-credentials',    completed: false },
  { key: 'video',         label: 'Intro video added',            boost: '+10%', sectionId: 'section-intro-video',    completed: false }, // no backend field — IntroVideoSection isn't wired
  { key: 'social',        label: 'Social link added',            boost: '+5%',  sectionId: 'section-social',         completed: false }, // no backend field — SocialLinksSection isn't wired
  { key: 'notifications', label: 'Notification preferences set', boost: '+5%',  sectionId: 'section-notifications',  completed: false }, // no backend field — NotificationsSection isn't wired
  { key: 'location',      label: 'Location set',                 boost: '+5%',  sectionId: 'section-basic-info',     completed: false },
]

const NOTIF_ROWS = [
  { key: 'newBooking',       name: 'New booking',        description: 'When a parent books a session with you' },
  { key: 'bookingCancelled', name: 'Booking cancelled',  description: 'When a parent cancels a session' },
  { key: 'newMessage',       name: 'New message',        description: 'When a parent sends you a message' },
  { key: 'sessionReminder',  name: 'Session reminder',   description: '2 hours before each session' },
  { key: 'payoutSent',       name: 'Payout sent',        description: 'When your weekly payout is processed' },
  { key: 'newReview',        name: 'New review',         description: 'When a parent leaves a review' },
]

// ── Constants ──────────────────────────────────────────────────────────────────

const SPORTS = ['Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Lacrosse', 'Baseball', 'Swimming', 'Track']
const AGE_GROUPS = ['U6-U8', 'U9-U10', 'U11-U12', 'U13-U14', 'U15-U16', 'U17-U18', 'Adults']
const TRAVEL_OPTIONS = ['No travel', 'Up to 5 miles', 'Up to 10 miles', 'Up to 20 miles', 'Up to 30 miles']

const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_BYTES = 5 * 1024 * 1024 // matches the avatars bucket's own file_size_limit

const VERIFICATION_DOC_ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

// verification-docs paths are `${userId}/${epochMs}-${originalFilename}` (see
// uploadVerificationDoc) — parsed back out here to show filename/upload date
// without a dedicated timestamp column on trainers.
function parseVerificationDocPath(path: string): { filename: string; uploadedAt: Date } | null {
  const basename = path.split('/').pop() ?? ''
  const dashIndex = basename.indexOf('-')
  if (dashIndex === -1) return null
  const ts = Number(basename.slice(0, dashIndex))
  if (!Number.isFinite(ts)) return null
  return { filename: basename.slice(dashIndex + 1), uploadedAt: new Date(ts) }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function getInitials(fullName: string): string {
  return fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?'
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= rating ? '#F59E0B' : '#E5E7EB'} color={i <= rating ? '#F59E0B' : '#E5E7EB'} />
      ))}
    </div>
  )
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function SectionCard({ children, dangerBorder, id }: { children: React.ReactNode; dangerBorder?: boolean; id?: string }) {
  return (
    <div
      id={id}
      style={{
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '14px',
        padding: '24px',
        border: dangerBorder ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </div>
  )
}

function CardLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: danger ? '#EF4444' : T.ink3, textTransform: 'uppercase', marginBottom: '16px' }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '13px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, marginBottom: '6px' }}>
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

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{ width: '44px', height: '24px', borderRadius: '999px', background: on ? T.cyan : '#E5E7EB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0 }}
    >
      <div style={{ position: 'absolute', top: '2px', left: on ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s ease' }} />
    </button>
  )
}

// ── Section: Profile photo ─────────────────────────────────────────────────────

function ProfilePhotoSection({
  fullName, sport, userId, avatarUrl, onAvatarChange, profileItems,
}: {
  fullName: string
  sport: string
  userId: string
  avatarUrl: string | null
  onAvatarChange: (url: string) => void
  profileItems: typeof PROFILE_ITEMS
}) {
  const profileStrength = profileItems.filter((i) => i.completed).reduce((sum, i) => sum + parseInt(i.boost), 0)
  const [strengthExpanded, setStrengthExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initials = getInitials(fullName)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadError('')

    if (!userId) {
      setUploadError('Not authenticated. Please refresh and try again.')
      return
    }
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
              style={{ width: 120, height: 120, borderRadius: '999px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: '999px', background: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '36px', color: '#FFFFFF' }}>{initials}</div>
          )}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '999px',
              background: 'rgba(255,255,255,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
                <Loader2 size={26} color={T.cyan} />
              </motion.div>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
            style={{ position: 'absolute', bottom: '4px', right: '4px', width: '32px', height: '32px', borderRadius: '999px', background: T.cyan, border: '2px solid #FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <Camera size={16} color="#FFFFFF" />
          </button>
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '24px', color: T.ink, marginBottom: '8px' }}>{fullName || 'Your Name'}</div>
          <div style={{ display: 'inline-block', background: 'rgba(0,188,200,0.1)', color: T.cyan, borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '12px' }}>{sport || 'No sport set'}</div>
          <div
            onClick={() => setStrengthExpanded((e) => !e)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer', maxWidth: '320px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ width: '140px', height: '4px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: `${profileStrength}%`, height: '100%', background: T.cyan, borderRadius: '999px' }} />
              </div>
              <span style={{ fontSize: '13px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif" }}>{profileStrength}% complete</span>
            </div>
            <ChevronDown size={16} color="#9CA3AF" style={{ transform: strengthExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
          </div>
          <AnimatePresence>
            {strengthExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ width: '100%', maxWidth: '320px' }}>
                  {profileItems.map((item, i) => (
                    <div
                      key={item.key}
                      onClick={() => !item.completed && scrollTo(item.sectionId)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < profileItems.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: item.completed ? 'default' : 'pointer' }}
                    >
                      {item.completed
                        ? <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />
                        : <Circle size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />}
                      <span style={{ flex: 1, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", color: item.completed ? '#6B7280' : '#374151', textDecoration: item.completed ? 'line-through' : 'none' }}>
                        {item.label}
                      </span>
                      {!item.completed && (
                        <span style={{ fontSize: '12px', color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, flexShrink: 0 }}>{item.boost}</span>
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
        <div style={{ fontSize: '13px', color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '12px' }}>{uploadError}</div>
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ height: '44px', padding: '0 20px', background: T.cyan, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.7 : 1 }}
        >{uploading ? 'Uploading…' : 'Upload photo'}</button>
        <button style={{ height: '44px', padding: '0 20px', background: 'transparent', color: T.ink2, border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer' }}>Remove photo</button>
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

// ── Section: Basic info ────────────────────────────────────────────────────────

function BasicInfoSection({
  fullName,
  onFullNameChange,
  bio,
  onBioChange,
  location,
  onLocationChange,
  phone,
  onPhoneChange,
}: {
  fullName: string
  onFullNameChange: (v: string) => void
  bio: string
  onBioChange: (v: string) => void
  location: string
  onLocationChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
}) {
  const [tagline, setTagline] = useState('')
  const [experience, setExperience] = useState('')

  const inputBase: React.CSSProperties = {
    width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
    padding: '0 14px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
  }

  return (
    <SectionCard id="section-basic-info">
      <CardLabel>Basic Info</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <FieldLabel>Full name</FieldLabel>
          <input value={fullName} onChange={(e) => onFullNameChange(e.target.value)} placeholder="Marcus Torres" style={inputBase} />
        </div>
        <div>
          <FieldLabel>Tagline</FieldLabel>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Elite soccer trainer for ages 8-18" style={inputBase} />
        </div>
        <div>
          <FieldLabel>Bio</FieldLabel>
          <textarea value={bio} onChange={(e) => onBioChange(e.target.value)} placeholder="Tell parents about your training philosophy, background, and what makes your sessions unique..." style={{ width: '100%', minHeight: '120px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '14px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF' }} />
        </div>
        <div>
          <FieldLabel>Location</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><MapPin size={16} /></span>
            <input value={location} onChange={(e) => onLocationChange(e.target.value)} placeholder="City, State" style={{ ...inputBase, paddingLeft: '40px' }} />
          </div>
        </div>
        <div>
          <FieldLabel>Years of experience</FieldLabel>
          <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="0" style={{ ...inputBase, width: '120px' }} />
        </div>
        <div>
          <FieldLabel>Phone number</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><Phone size={16} /></span>
            <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="(555) 000-0000" style={{ ...inputBase, paddingLeft: '40px' }} />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Section: Social links ──────────────────────────────────────────────────────

function SocialLinksSection() {
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')

  const inputBase: React.CSSProperties = {
    width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
    padding: '0 14px 0 40px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
  }

  const rows = [
    { value: instagram, onChange: setInstagram, icon: <IconInstagram />,              placeholder: 'instagram.com/yourhandle' },
    { value: twitter,   onChange: setTwitter,   icon: <IconTwitterX />,               placeholder: 'x.com/yourhandle' },
    { value: youtube,   onChange: setYoutube,   icon: <IconYoutube />,                placeholder: 'youtube.com/yourchannel' },
    { value: tiktok,    onChange: setTiktok,    icon: <Music size={16} color="#000" />, placeholder: 'tiktok.com/@yourhandle' },
  ]

  return (
    <SectionCard id="section-social">
      <CardLabel>Social &amp; Media</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((row, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
              {row.icon}
            </span>
            <input value={row.value} onChange={(e) => row.onChange(e.target.value)} placeholder={row.placeholder} style={inputBase} />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ── Section: Intro video ───────────────────────────────────────────────────────

function IntroVideoSection() {
  const [videoUrl, setVideoUrl] = useState('')

  return (
    <SectionCard id="section-intro-video">
      <CardLabel>Intro Video</CardLabel>
      <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px', lineHeight: 1.5 }}>
        A short video dramatically increases parent bookings. Link a YouTube or Instagram reel of you training.
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}>
          <Video size={16} />
        </span>
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=... or instagram.com/reel/..." style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '0 14px 0 40px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF' }} />
      </div>
      <div style={{ marginTop: '16px' }}>
        {videoUrl ? (
          <div style={{ height: '120px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <PlayCircle size={24} color={T.cyan} />
            <span style={{ fontSize: '13px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif" }}>Video linked</span>
          </div>
        ) : (
          <div style={{ height: '120px', borderRadius: '12px', border: '2px dashed #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <PlayCircle size={32} color="#D1D5DB" />
            <span style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: "'Hanken Grotesk', sans-serif" }}>Your video preview will appear here</span>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

// ── Section: Specialties ───────────────────────────────────────────────────────

function SpecialtiesSection({
  primarySport,
  setPrimarySport,
  initialSpecialty,
  onPrimarySelect,
}: {
  primarySport: string
  setPrimarySport: (s: string) => void
  initialSpecialty?: string
  onPrimarySelect?: () => void
}) {
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedAges, setSelectedAges] = useState<string[]>(['U9-U10', 'U11-U12'])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['In-Person'])
  const [pillPopover, setPillPopover] = useState<string | null>(null)

  useEffect(() => {
    if (!initialSpecialty) return
    setSelectedSports([initialSpecialty])
    setPrimarySport(initialSpecialty.toLowerCase())
  }, [initialSpecialty])

  function toggle(arr: string[], setArr: (a: string[]) => void, item: string) {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item])
  }

  function pillStyle(selected: boolean): React.CSSProperties {
    return {
      borderRadius: '999px', padding: '6px 16px', fontSize: '13px',
      fontFamily: "'Hanken Grotesk', sans-serif",
      border: selected ? '1px solid rgba(0,188,200,0.3)' : '1px solid #E5E7EB',
      background: selected ? 'rgba(0,188,200,0.1)' : 'transparent',
      color: selected ? T.cyan : T.ink2,
      cursor: 'pointer', minHeight: '44px', display: 'flex', alignItems: 'center',
    }
  }

  function handleSportClick(sport: string) {
    if (sport.toLowerCase() === primarySport) return
    const isSelected = selectedSports.includes(sport)
    if (!isSelected) {
      setSelectedSports((prev) => [...prev, sport])
    } else {
      setPillPopover(pillPopover === sport ? null : sport)
    }
  }

  return (
    <SectionCard id="section-specialties">
      <CardLabel>Specialties</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <FieldLabel>Sports</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
            {SPORTS.map((sport) => {
              const isPrimary = sport.toLowerCase() === primarySport
              const isSelected = selectedSports.includes(sport)
              return (
                <div key={sport} style={{ position: 'relative' }}>
                  <motion.button
                    whileTap={isPrimary ? {} : { scale: 0.95 }}
                    onClick={() => handleSportClick(sport)}
                    title={isPrimary ? 'This is your primary sport' : undefined}
                    style={isPrimary ? {
                      borderRadius: '999px', padding: '6px 16px', fontSize: '13px',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      border: '2px solid #00BCC8', background: 'rgba(0,188,200,0.15)', color: '#00BCC8',
                      cursor: 'default', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '4px',
                    } : pillStyle(isSelected)}
                  >
                    {isPrimary && <Star size={12} fill="#00BCC8" color="#00BCC8" />}
                    {sport}
                  </motion.button>
                  {pillPopover === sport && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#111827', color: '#FFFFFF', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', zIndex: 20, whiteSpace: 'nowrap', display: 'flex', gap: '12px' }}>
                      <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setPrimarySport(sport.toLowerCase()); onPrimarySelect?.(); setPillPopover(null) }}>
                        Set as primary
                      </span>
                      <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedSports((prev) => prev.filter((s) => s !== sport)); setPillPopover(null) }}>
                        Remove
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '8px' }}>
            Your primary sport sets your profile background image.
          </div>
        </div>
        <div>
          <FieldLabel>Age groups</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
            {AGE_GROUPS.map((age) => (
              <motion.button key={age} whileTap={{ scale: 0.95 }} onClick={() => toggle(selectedAges, setSelectedAges, age)} style={pillStyle(selectedAges.includes(age))}>
                {age}
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Session types</FieldLabel>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            {(['In-Person', 'Remote'] as const).map((type) => {
              const sel = selectedTypes.includes(type)
              return (
                <button key={type} onClick={() => toggle(selectedTypes, setSelectedTypes, type)} style={{ flex: 1, borderRadius: '12px', padding: '16px', border: sel ? `2px solid ${T.cyan}` : '1px solid #E5E7EB', background: sel ? 'rgba(0,188,200,0.06)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', minHeight: '80px' }}>
                  {type === 'In-Person' ? <MapPin size={18} color={sel ? T.cyan : T.ink3} /> : <Video size={18} color={sel ? T.cyan : T.ink3} />}
                  <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 500, color: sel ? T.cyan : T.ink2 }}>{type}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Section: Rate ──────────────────────────────────────────────────────────────

function RateSection({
  hourlyRate,
  onHourlyRateChange,
}: {
  hourlyRate: string
  onHourlyRateChange: (v: string) => void
}) {
  return (
    <SectionCard id="section-rate">
      <CardLabel>Rate</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <FieldLabel>Hourly rate</FieldLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '20px', color: T.ink3 }}>$</span>
            <input type="number" value={hourlyRate} onChange={(e) => onHourlyRateChange(e.target.value)} style={{ width: '160px', border: 'none', borderBottom: '2px solid #E5E7EB', fontSize: '32px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: T.ink, outline: 'none', background: 'transparent', padding: '0 4px' }} />
          </div>
          <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '6px' }}>Planned split: trainers keep the majority of each session fee (final terms coming soon)</div>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Section: Credentials ───────────────────────────────────────────────────────

function CredentialsSection({
  certificationStatus,
  certificationNotes,
  onRequestVerification,
  idVerificationUrl,
  onUploadVerificationDoc,
}: {
  certificationStatus?: 'none' | 'pending' | 'approved' | 'rejected'
  certificationNotes?: string
  onRequestVerification?: (notes: string) => Promise<void>
  idVerificationUrl?: string | null
  onUploadVerificationDoc?: (file: File) => Promise<void>
}) {
  const [certs, setCerts] = useState<Certification[]>(INITIAL_CERTS)
  const [affs, setAffs] = useState<Affiliation[]>(INITIAL_AFFS)
  const [addingCert, setAddingCert] = useState(false)
  const [newCert, setNewCert] = useState({ name: '', org: '', year: '' })
  const [addingAff, setAddingAff] = useState(false)
  const [newAff, setNewAff] = useState({ name: '', role: '', years: '' })

  const [notesDraft, setNotesDraft] = useState(certificationNotes ?? '')
  const [verificationSaveStatus, setVerificationSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [verificationSaveError, setVerificationSaveError] = useState('')

  const [docUploading, setDocUploading] = useState(false)
  const [docUploadError, setDocUploadError] = useState('')
  const [replacingDoc, setReplacingDoc] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)
  const parsedDoc = idVerificationUrl ? parseVerificationDocPath(idVerificationUrl) : null

  useEffect(() => {
    setNotesDraft(certificationNotes ?? '')
  }, [certificationNotes])

  async function submitVerificationRequest() {
    if (!onRequestVerification) return
    setVerificationSaveStatus('saving')
    setVerificationSaveError('')
    try {
      await onRequestVerification(notesDraft)
      setVerificationSaveStatus('saved')
    } catch (e) {
      setVerificationSaveError(e instanceof Error ? e.message : 'Request failed')
      setVerificationSaveStatus('error')
    }
  }

  async function handleDocFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !onUploadVerificationDoc) return

    setDocUploadError('')
    if (!VERIFICATION_DOC_ALLOWED_TYPES.includes(file.type)) {
      setDocUploadError('Please upload a PDF, JPEG, or PNG file.')
      return
    }

    setDocUploading(true)
    try {
      await onUploadVerificationDoc(file)
      setReplacingDoc(false)
    } catch (e) {
      setDocUploadError(e instanceof Error ? e.message : 'Upload failed')
    }
    setDocUploading(false)
  }

  const inlineInput: React.CSSProperties = {
    flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #E5E7EB',
    padding: '0 12px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', color: T.ink, background: '#FFFFFF', minWidth: '80px',
  }

  function confirmCert() {
    if (!newCert.name) return
    setCerts((prev) => [...prev, { id: Date.now(), ...newCert }])
    setNewCert({ name: '', org: '', year: '' })
    setAddingCert(false)
  }

  function confirmAff() {
    if (!newAff.name) return
    setAffs((prev) => [...prev, { id: Date.now(), ...newAff }])
    setNewAff({ name: '', role: '', years: '' })
    setAddingAff(false)
  }

  return (
    <SectionCard id="section-credentials">
      <CardLabel>Credentials</CardLabel>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, marginBottom: '12px' }}>Certifications</div>
        {certs.map((cert, i) => (
          <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: (i < certs.length - 1 || addingCert) ? '1px solid #E5E7EB' : 'none' }}>
            <Award size={18} color={T.cyan} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500 }}>{cert.name}</div>
              <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>{cert.org} · {cert.year}</div>
            </div>
            <button onClick={() => setCerts((prev) => prev.filter((c) => c.id !== cert.id))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {addingCert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', flexWrap: 'wrap' }}>
            <input value={newCert.name} onChange={(e) => setNewCert((p) => ({ ...p, name: e.target.value }))} placeholder="Certification name" style={{ ...inlineInput, minWidth: '140px' }} />
            <input value={newCert.org} onChange={(e) => setNewCert((p) => ({ ...p, org: e.target.value }))} placeholder="Issuing org" style={inlineInput} />
            <input value={newCert.year} onChange={(e) => setNewCert((p) => ({ ...p, year: e.target.value }))} placeholder="Year" style={{ ...inlineInput, flex: '0 0 80px' }} />
            <button onClick={confirmCert} style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#10B981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={16} color="#FFFFFF" />
            </button>
            <button onClick={() => setAddingCert(false)} style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'transparent', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <XIcon size={16} color={T.ink3} />
            </button>
          </div>
        )}
        {!addingCert && (
          <button onClick={() => setAddingCert(true)} style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px dashed #E5E7EB', background: 'transparent', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <Plus size={16} /> Add certification
          </button>
        )}
      </div>

      <div>
        <div style={{ fontSize: '13px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, marginBottom: '12px' }}>Affiliations</div>
        {affs.map((aff, i) => (
          <div key={aff.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: (i < affs.length - 1 || addingAff) ? '1px solid #E5E7EB' : 'none' }}>
            <Award size={18} color={T.cyan} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500 }}>{aff.name}</div>
              <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>{aff.role} · {aff.years}</div>
            </div>
            <button onClick={() => setAffs((prev) => prev.filter((a) => a.id !== aff.id))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {addingAff && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', flexWrap: 'wrap' }}>
            <input value={newAff.name} onChange={(e) => setNewAff((p) => ({ ...p, name: e.target.value }))} placeholder="School or club name" style={{ ...inlineInput, minWidth: '140px' }} />
            <input value={newAff.role} onChange={(e) => setNewAff((p) => ({ ...p, role: e.target.value }))} placeholder="Role" style={inlineInput} />
            <input value={newAff.years} onChange={(e) => setNewAff((p) => ({ ...p, years: e.target.value }))} placeholder="Years active" style={{ ...inlineInput, flex: '0 0 110px' }} />
            <button onClick={confirmAff} style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#10B981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={16} color="#FFFFFF" />
            </button>
            <button onClick={() => setAddingAff(false)} style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'transparent', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <XIcon size={16} color={T.ink3} />
            </button>
          </div>
        )}
        {!addingAff && (
          <button onClick={() => setAddingAff(true)} style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px dashed #E5E7EB', background: 'transparent', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <Plus size={16} /> Add affiliation
          </button>
        )}
      </div>

      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: '13px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, marginBottom: '12px' }}>Verification</div>

        {certificationStatus === 'approved' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px' }}>
            <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500 }}>Verification approved</span>
          </div>
        )}

        {certificationStatus !== 'approved' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <FieldLabel>ID or certification document</FieldLabel>
            {parsedDoc && !replacingDoc ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                <FileText size={18} color={T.cyan} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {parsedDoc.filename}
                  </div>
                  <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                    Uploaded {parsedDoc.uploadedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplacingDoc(true)}
                  style={{ background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', flexShrink: 0 }}
                >
                  Replace
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={docInputRef} type="file" accept="application/pdf,image/jpeg,image/png"
                  onChange={handleDocFileChange} style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={docUploading}
                  style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px dashed #E5E7EB', background: 'transparent', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', cursor: docUploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: docUploading ? 0.6 : 1 }}
                >
                  {docUploading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} style={{ display: 'flex' }}>
                        <Loader2 size={16} />
                      </motion.div>
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> {parsedDoc ? 'Upload a new document' : 'Upload PDF, JPEG, or PNG'}
                    </>
                  )}
                </button>
                {parsedDoc && replacingDoc && !docUploading && (
                  <button
                    type="button"
                    onClick={() => { setReplacingDoc(false); setDocUploadError('') }}
                    style={{ background: 'transparent', border: 'none', color: T.ink3, fontSize: '12px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', marginTop: '6px', padding: 0 }}
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
            {docUploadError && (
              <div style={{ fontSize: '13px', color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '8px' }}>{docUploadError}</div>
            )}
          </div>

          {certificationStatus === 'pending' && (
            <div style={{ fontSize: '14px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Verification request submitted — under review
            </div>
          )}

          {(certificationStatus === 'none' || certificationStatus === 'rejected' || !certificationStatus) && (
            <>
              {certificationStatus === 'rejected' && (
                <div style={{ fontSize: '14px', color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '12px' }}>
                  Verification request not approved
                </div>
              )}
              <FieldLabel>Describe your certifications, coaching credentials, or experience</FieldLabel>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", outline: 'none', color: T.ink, background: '#FFFFFF', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={submitVerificationRequest}
                disabled={verificationSaveStatus === 'saving'}
                style={{ width: '100%', height: '44px', background: T.cyan, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, fontFamily: "'Hanken Grotesk', sans-serif", cursor: verificationSaveStatus === 'saving' ? 'default' : 'pointer', marginTop: '12px', opacity: verificationSaveStatus === 'saving' ? 0.7 : 1 }}
              >
                {certificationStatus === 'rejected' ? 'Resubmit for verification' : 'Request verification'}
              </button>
              {verificationSaveStatus === 'error' && <div style={{ fontSize: '13px', color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '8px' }}>{verificationSaveError}</div>}
            </>
          )}
        </>
        )}
      </div>

    </SectionCard>
  )
}

// ── Section: Reviews ───────────────────────────────────────────────────────────

function ReviewsSection() {
  const avgRating = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1)

  return (
    <SectionCard>
      <CardLabel>Your Reviews</CardLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '48px', fontWeight: 700, color: T.ink, lineHeight: 1 }}>{avgRating}</span>
          <Star size={24} fill="#F59E0B" color="#F59E0B" />
        </div>
        <span style={{ fontSize: '14px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>from {MOCK_REVIEWS.length} reviews</span>
      </div>
      {MOCK_REVIEWS.map((review) => (
        <div key={review.id} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '999px', background: 'rgba(0,188,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: T.cyan, flexShrink: 0 }}>
                {review.initials}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>{review.parentName}</span>
            </div>
            <span style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", flexShrink: 0 }}>{review.date}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <StarRow rating={review.rating} size={16} />
          </div>
          <p style={{ fontSize: '14px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif", lineHeight: 1.6, margin: 0, marginBottom: '8px' }}>{review.text}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              style={{ background: 'transparent', border: 'none', fontSize: '12px', color: T.ink3, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", padding: '4px 0' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.ink3 }}
            >
              Flag review
            </button>
          </div>
        </div>
      ))}
    </SectionCard>
  )
}

// ── Section: Session setup ─────────────────────────────────────────────────────

function SessionSetupSection() {
  const [location, setLocation] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [travelRadius, setTravelRadius] = useState('No travel')
  const [equipment, setEquipment] = useState('')

  const inputBase: React.CSSProperties = {
    width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
    fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
  }

  return (
    <SectionCard>
      <CardLabel>Session Setup</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <FieldLabel>In-person location</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><MapPin size={16} /></span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Default training location or address" style={{ ...inputBase, paddingLeft: '40px', paddingRight: '14px' }} />
          </div>
        </div>
        <div>
          <FieldLabel>Zoom link</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><Video size={16} /></span>
            <input value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/j/..." style={{ ...inputBase, paddingLeft: '40px', paddingRight: '14px' }} />
          </div>
        </div>
        <div>
          <FieldLabel>Travel radius</FieldLabel>
          <select value={travelRadius} onChange={(e) => setTravelRadius(e.target.value)} style={{ height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", padding: '0 14px', outline: 'none', color: T.ink, background: '#FFFFFF', cursor: 'pointer' }}>
            {TRAVEL_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Equipment provided</FieldLabel>
          <textarea value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="List any equipment you bring or require parents to have..." style={{ width: '100%', minHeight: '80px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '14px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF' }} />
        </div>
      </div>
    </SectionCard>
  )
}

// ── Section: Notifications ─────────────────────────────────────────────────────

type NotifChannels = { email: boolean; sms: boolean }

function NotificationsSection() {
  const [notifState, setNotifState] = useState<Record<string, NotifChannels>>({
    newBooking:        { email: true, sms: false },
    bookingCancelled:  { email: true, sms: false },
    newMessage:        { email: true, sms: false },
    sessionReminder:   { email: true, sms: false },
    payoutSent:        { email: true, sms: false },
    newReview:         { email: true, sms: false },
  })

  function toggle(key: string, channel: 'email' | 'sms') {
    setNotifState((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: !prev[key][channel] } }))
  }

  const colHeaderStyle: React.CSSProperties = {
    fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif",
    fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', width: '52px', flexShrink: 0,
  }

  return (
    <SectionCard id="section-notifications">
      <CardLabel>Notifications</CardLabel>
      <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px', lineHeight: 1.5 }}>
        Choose how you want to be notified about activity on your account.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ flex: 1 }} />
        <div style={colHeaderStyle}>Email</div>
        <div style={colHeaderStyle}>SMS</div>
      </div>
      {NOTIF_ROWS.map((row, i) => (
        <div key={row.key} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < NOTIF_ROWS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, marginBottom: '2px' }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>{row.description}</div>
          </div>
          <div style={{ width: '52px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => toggle(row.key, 'email')}
              style={{ width: '44px', height: '24px', borderRadius: '999px', background: notifState[row.key].email ? '#00BCC8' : '#E5E7EB', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s ease', display: 'inline-block' }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: '2px', left: notifState[row.key].email ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
            </div>
          </div>
          <div style={{ width: '52px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => toggle(row.key, 'sms')}
              style={{ width: '44px', height: '24px', borderRadius: '999px', background: notifState[row.key].sms ? '#00BCC8' : '#E5E7EB', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s ease', display: 'inline-block' }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: '2px', left: notifState[row.key].sms ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
            </div>
          </div>
        </div>
      ))}
    </SectionCard>
  )
}

// ── Section: Danger zone ───────────────────────────────────────────────────────

function DangerZoneSection({ paused, setPaused }: { paused: boolean; setPaused: (v: boolean) => void }) {
  return (
    <SectionCard dangerBorder>
      <CardLabel danger>Account</CardLabel>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, marginBottom: '2px' }}>Pause my profile</div>
            <div style={{ fontSize: '12px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>Your profile won&apos;t appear in search while paused</div>
          </div>
          <div
            onClick={() => setPaused(!paused)}
            style={{ width: '44px', height: '24px', borderRadius: '999px', background: paused ? '#00BCC8' : '#E5E7EB', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s ease', display: 'inline-block' }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: '2px', left: paused ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0' }}>
          <div style={{ fontSize: '14px', color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500 }}>Delete account</div>
          <Link
            href="/dashboard/trainer/settings"
            style={{ padding: '8px 16px', border: '1px solid #EF4444', color: '#EF4444', background: 'transparent', borderRadius: '8px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', minHeight: '44px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            Request deletion
          </Link>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

interface TrainerBookingRow {
  id: string
  session_time: string
  status: string
  athleteName: string | null
}

interface TrainerReviewRow {
  id: string
  rating: number
  body: string | null
  parentName: string | null
  session_time: string
}

const TRAINER_TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'reviews', label: 'Reviews' },
]

export default function TrainerProfilePage() {
  const [paused, setPaused] = useState(false)
  const { primarySport, setPrimarySport } = useTrainerSport()
  const [isEditing, setIsEditing] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [initName, setInitName] = useState('')
  const [initBio, setInitBio] = useState('')
  const [initLocation, setInitLocation] = useState('')
  const [initRate, setInitRate] = useState('')
  const [initSpecialty, setInitSpecialty] = useState('')
  const [initPhone, setInitPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [isCertified, setIsCertified] = useState(false)
  const [certificationStatus, setCertificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [certificationNotes, setCertificationNotes] = useState('')
  const [idVerificationUrl, setIdVerificationUrl] = useState<string | null>(null)
  const [credentials, setCredentials] = useState('')
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [themePreference, setThemePreference] = useState<ThemeSetting>('light')
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('full')
  const [bookings, setBookings] = useState<TrainerBookingRow[]>([])
  const [reviews, setReviews] = useState<TrainerReviewRow[]>([])
  const [activeTab, setActiveTab] = useState('activity')

  const [dataLoaded, setDataLoaded] = useState(false)
  const [draftFullName, setDraftFullName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [draftLocation, setDraftLocation] = useState('')
  const [draftPhone, setDraftPhone] = useState('')
  const [draftRate, setDraftRate] = useState('')
  const [specialtyTouched, setSpecialtyTouched] = useState(false)
  const [saveBarStatus, setSaveBarStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveBarError, setSaveBarError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [profileRes, trainerRes] = await Promise.all([
        supabase.from('profiles').select('name, avatar_url, banner_image_url, phone, verified, theme_preference, background_mode').eq('id', user.id).single(),
        supabase.from('trainers').select('id, specialty, bio, rate, location, is_certified, certification_status, certification_notes, id_verification_url, credentials, active_preset_id').eq('profile_id', user.id).single(),
      ])
      const loadedName = profileRes.data?.name ?? ''
      const loadedPhone = profileRes.data?.phone ?? ''
      const loadedBio = trainerRes.data?.bio ?? ''
      const loadedLocation = trainerRes.data?.location ?? ''
      const loadedRate = trainerRes.data?.rate != null ? String(trainerRes.data.rate) : ''
      const loadedSpecialty = trainerRes.data?.specialty ?? ''

      if (loadedName) setInitName(loadedName)
      setAvatarUrl(profileRes.data?.avatar_url ?? null)
      setBannerImageUrl(profileRes.data?.banner_image_url ?? null)
      setInitPhone(loadedPhone)
      setVerified(profileRes.data?.verified ?? false)
      setThemePreference((profileRes.data?.theme_preference as ThemeSetting) ?? 'light')
      setBackgroundMode((profileRes.data?.background_mode as BackgroundMode) ?? 'full')
      if (loadedBio) setInitBio(loadedBio)
      if (loadedLocation) setInitLocation(loadedLocation)
      if (loadedRate) setInitRate(loadedRate)
      if (loadedSpecialty) setInitSpecialty(loadedSpecialty)
      setIsCertified((trainerRes.data as any)?.is_certified ?? false)
      setCertificationStatus(((trainerRes.data as any)?.certification_status as typeof certificationStatus) ?? 'none')
      setCertificationNotes((trainerRes.data as any)?.certification_notes ?? '')
      setIdVerificationUrl((trainerRes.data as any)?.id_verification_url ?? null)
      setCredentials((trainerRes.data as any)?.credentials ?? '')
      setActivePresetId((trainerRes.data as any)?.active_preset_id ?? null)

      setDraftFullName(loadedName)
      setDraftBio(loadedBio)
      setDraftLocation(loadedLocation)
      setDraftPhone(loadedPhone)
      setDraftRate(loadedRate)
      setDataLoaded(true)

      const trainerRowId = trainerRes.data?.id
      if (trainerRowId) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id, session_time, status, athletes!athlete_id(name)')
          .eq('trainer_id', trainerRowId)
          .order('session_time', { ascending: false })
          .limit(20)

        setBookings(
          (bookingData ?? []).map((b: any) => ({
            id: b.id,
            session_time: b.session_time,
            status: b.status,
            athleteName: b.athletes?.name ?? null,
          }))
        )

        const { data: reviewData } = await supabase
          .from('reviews')
          .select('id, rating, body, bookings!booking_id(session_time, profiles!parent_id(name))')
          .eq('trainer_id', trainerRowId)
          .order('id', { ascending: false })
          .limit(10)

        setReviews(
          (reviewData ?? []).map((r: any) => ({
            id: r.id,
            rating: r.rating,
            body: r.body,
            parentName: r.bookings?.profiles?.name ?? null,
            session_time: r.bookings?.session_time ?? new Date().toISOString(),
          }))
        )
      }
    }
    load()
  }, [])

  async function saveBasicInfo(fullName: string, bio: string, location: string, phone: string) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const [profileRes, trainerRes] = await Promise.all([
      supabase.from('profiles').update({ name: fullName, phone }).eq('id', userId),
      supabase.from('trainers').update({ bio, location }).eq('profile_id', userId),
    ])
    if (profileRes.error) throw new Error(profileRes.error.message)
    if (trainerRes.error) throw new Error(trainerRes.error.message)
    setInitName(fullName)
    setInitBio(bio)
    setInitLocation(location)
    setInitPhone(phone)
  }

  async function saveRate(rate: string) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const { error } = await supabase.from('trainers').update({ rate: Number(rate) }).eq('profile_id', userId)
    if (error) throw new Error(error.message)
    setInitRate(rate)
  }

  async function saveSpecialty(specialty: string) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const { error } = await supabase.from('trainers').update({ specialty }).eq('profile_id', userId)
    if (error) throw new Error(error.message)
    setInitSpecialty(specialty)
    setSpecialtyTouched(false)
  }

  async function handleSaveAll() {
    setSaveBarStatus('saving')
    setSaveBarError('')
    try {
      const tasks: Promise<void>[] = []
      if (basicDirty) tasks.push(saveBasicInfo(draftFullName, draftBio, draftLocation, draftPhone))
      if (specialtyDirty) {
        const sportName = SPORTS.find((s) => s.toLowerCase() === primarySport) ?? primarySport
        tasks.push(saveSpecialty(sportName))
      }
      if (rateDirty) tasks.push(saveRate(draftRate))
      await Promise.all(tasks)
      setSaveBarStatus('saved')
      setTimeout(() => setSaveBarStatus('idle'), 1500)
    } catch (e) {
      setSaveBarError(e instanceof Error ? e.message : 'Save failed')
      setSaveBarStatus('error')
    }
  }

  async function requestVerification(notes: string) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const { error } = await supabase
      .from('trainers')
      .update({ certification_status: 'pending', certification_notes: notes })
      .eq('profile_id', userId)
    if (error) throw new Error(error.message)
    setCertificationStatus('pending')
    setCertificationNotes(notes)
  }

  async function uploadVerificationDoc(file: File) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`

    const { error: uploadErr } = await supabase.storage
      .from('verification-docs')
      .upload(path, file, { contentType: file.type })
    if (uploadErr) throw new Error(uploadErr.message)

    // Uploading resubmits for review from 'none' or 'rejected'; an already-
    // 'approved' trainer isn't silently downgraded back to 'pending'.
    const nextStatus = certificationStatus === 'approved' ? certificationStatus : 'pending'
    const { error: updateErr } = await supabase
      .from('trainers')
      .update({ id_verification_url: path, certification_status: nextStatus })
      .eq('profile_id', userId)
    if (updateErr) throw new Error(updateErr.message)

    setIdVerificationUrl(path)
    setCertificationStatus(nextStatus)
  }

  async function handleSaveAppearance(updates: { theme_preference?: ThemeSetting; background_mode?: BackgroundMode }) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
    if (error) throw new Error(error.message)
    if (updates.theme_preference) setThemePreference(updates.theme_preference)
    if (updates.background_mode) setBackgroundMode(updates.background_mode)
  }

  const location = initLocation
  const sport = SPORTS.find((s) => s.toLowerCase() === primarySport) ?? primarySport
  const cardTokens = getProfileCardTokens(themePreference)

  const profileItems = PROFILE_ITEMS.map((item) => {
    switch (item.key) {
      case 'photo': return { ...item, completed: !!avatarUrl }
      case 'bio': return { ...item, completed: !!initBio.trim() }
      case 'specialties': return { ...item, completed: !!initSpecialty.trim() }
      case 'availability': return { ...item, completed: !!activePresetId }
      case 'rate': return { ...item, completed: Number(initRate) > 0 }
      case 'certification': return { ...item, completed: !!credentials?.trim() }
      case 'location': return { ...item, completed: !!initLocation.trim() }
      // video, social, notifications intentionally left at their base `completed: false` —
      // no backend field exists for any of them yet, see the comment on PROFILE_ITEMS.
      default: return item
    }
  })

  const basicDirty = dataLoaded && (draftFullName !== initName || draftBio !== initBio || draftLocation !== initLocation || draftPhone !== initPhone)
  const specialtyDirty = specialtyTouched
  const rateDirty = dataLoaded && draftRate !== initRate
  const anyDirty = basicDirty || specialtyDirty || rateDirty
  const showSaveBar = isEditing && (anyDirty || saveBarStatus === 'saving' || saveBarStatus === 'saved')

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const activityItems: ActivityItem[] = [
    ...bookings.map((b) => ({
      id: `b-${b.id}`,
      title: `Session with ${b.athleteName ?? 'athlete'}`,
      subtitle: b.status,
      timestamp: b.session_time,
    })),
    ...reviews.map((r) => ({
      id: `r-${r.id}`,
      title: `New review from ${r.parentName ?? 'a parent'}`,
      subtitle: r.body ? r.body.slice(0, 64) : `${r.rating} star${r.rating === 1 ? '' : 's'}`,
      meta: '★'.repeat(r.rating),
      timestamp: r.session_time,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

  const bookingItems: ActivityItem[] = bookings.map((b) => ({
    id: `bk-${b.id}`,
    title: `Session with ${b.athleteName ?? 'athlete'}`,
    meta: b.status,
    timestamp: b.session_time,
  }))

  const reviewItems: ActivityItem[] = reviews.map((r) => ({
    id: `rv-${r.id}`,
    title: r.parentName ?? 'Parent',
    subtitle: r.body ?? undefined,
    meta: '★'.repeat(r.rating),
    timestamp: r.session_time,
  }))

  let tabContent: React.ReactNode
  if (activeTab === 'bookings') {
    tabContent = <ActivityList items={bookingItems} tokens={cardTokens} emptyLabel="No sessions booked yet" />
  } else if (activeTab === 'reviews') {
    tabContent = <ActivityList items={reviewItems} tokens={cardTokens} emptyLabel="No reviews yet" />
  } else {
    tabContent = <ActivityList items={activityItems} tokens={cardTokens} emptyLabel="No recent activity" />
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '672px', margin: '0 auto' }}>

      <motion.div
        key={isEditing ? 'edit' : 'view'}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '28px', color: T.ink }}>Edit profile</div>
                <div style={{ fontSize: '14px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '4px' }}>Your changes are saved together from the button below</div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                style={{ border: '1px solid rgba(0,0,0,0.12)', color: T.ink2, background: 'transparent', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', minHeight: '44px', flexShrink: 0 }}
              >← Done editing</button>
            </div>
            <ProfilePhotoSection fullName={initName} sport={sport} userId={userId ?? ''} avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} profileItems={profileItems} />
            <BasicInfoSection
              fullName={draftFullName}
              onFullNameChange={setDraftFullName}
              bio={draftBio}
              onBioChange={setDraftBio}
              location={draftLocation}
              onLocationChange={setDraftLocation}
              phone={draftPhone}
              onPhoneChange={setDraftPhone}
            />
            <div id="section-appearance">
              <AppearanceSection
                themePreference={themePreference}
                backgroundMode={backgroundMode}
                hasBannerImage={!!bannerImageUrl}
                onSave={handleSaveAppearance}
              />
            </div>
            <SocialLinksSection />
            <IntroVideoSection />
            <SpecialtiesSection
              primarySport={primarySport}
              setPrimarySport={setPrimarySport}
              initialSpecialty={initSpecialty}
              onPrimarySelect={() => setSpecialtyTouched(true)}
            />
            <RateSection
              hourlyRate={draftRate}
              onHourlyRateChange={setDraftRate}
            />
            <CredentialsSection
              certificationStatus={certificationStatus}
              certificationNotes={certificationNotes}
              onRequestVerification={requestVerification}
              idVerificationUrl={idVerificationUrl}
              onUploadVerificationDoc={uploadVerificationDoc}
            />
            <ReviewsSection />
            <SessionSetupSection />
            <NotificationsSection />
            <DangerZoneSection paused={paused} setPaused={setPaused} />
          </div>
        ) : (
          <ProfileCard
            themePreference={resolveThemeSetting(themePreference)}
            backgroundMode={backgroundMode}
            bannerImageUrl={bannerImageUrl}
            avatarUrl={avatarUrl}
            name={initName || 'Your Name'}
            verified={verified}
            verifiedLabel="Verified"
            metaLine={[location, isCertified ? 'Certified Trainer' : null, sport].filter(Boolean).join(' · ')}
            stats={[
              { value: avgRating, label: 'Rating' },
              { value: String(reviews.length), label: reviews.length === 1 ? 'Review' : 'Reviews' },
              { value: initRate ? `$${initRate}` : '—', label: 'Rate' },
            ]}
            contactRows={[
              ...(initPhone ? [{ key: 'phone', icon: <Phone size={14} />, label: initPhone }] : []),
            ]}
            tabs={TRAINER_TABS}
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

      <AnimatePresence>
        {showSaveBar && (
          <FloatingSaveBar status={saveBarStatus} error={saveBarError} onSave={handleSaveAll} />
        )}
      </AnimatePresence>
    </div>
  )
}
