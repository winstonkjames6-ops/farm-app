'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UploadCloud, Film, Loader2, CheckCircle2, AlertCircle, X as XIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { SPORTS } from '@/components/search/TrainerDirectory'

type Role = 'trainer' | 'athlete'

type BookingOption = {
  id: string
  label: string
}

type SubmitStatus = 'idle' | 'uploading' | 'success' | 'error'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

// ── Shared UI (mirrors app/dashboard/trainer/profile/page.tsx) ────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </div>
  )
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: barlow, fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: T.ink3, textTransform: 'uppercase', marginBottom: '16px' }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '13px', color: '#374151', fontFamily: hanken, fontWeight: 500, marginBottom: '6px' }}>
      {children}
    </div>
  )
}

const inputBase: React.CSSProperties = {
  width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
  padding: '0 14px', fontSize: '16px', fontFamily: hanken,
  outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
}

const selectBase: React.CSSProperties = {
  width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
  fontSize: '16px', fontFamily: hanken, padding: '0 14px', outline: 'none',
  color: T.ink, background: '#FFFFFF', cursor: 'pointer', boxSizing: 'border-box',
}

function formatBookingDate(sessionTime: string): string {
  const dt = new Date(sessionTime)
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Component ───────────────────────────────────────────────────────────────

export function PostUploadForm({ role }: { role: Role }) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingOption[]>([])
  const [loadError, setLoadError] = useState('')

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [sport, setSport] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [feedbackRequested, setFeedbackRequested] = useState(false)

  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const table = role === 'trainer' ? 'trainers' : 'athletes'
      const { data: roleRow, error: roleErr } = await supabase
        .from(table)
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (roleErr || !roleRow) {
        setLoadError(roleErr?.message ?? `Could not load ${role} record.`)
        return
      }

      const roleRowId = (roleRow as any).id

      if (role === 'trainer') {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, session_time, athletes!athlete_id(name)')
          .eq('trainer_id', roleRowId)
          .eq('status', 'completed')
          .order('session_time', { ascending: false })

        if (error) { setLoadError(error.message); return }
        setBookings(
          (data ?? []).map((b: any) => ({
            id: b.id,
            label: `${formatBookingDate(b.session_time)} — ${b.athletes?.name ?? 'Athlete'}`,
          }))
        )
      } else {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, session_time, trainers!trainer_id(profiles(name))')
          .eq('athlete_id', roleRowId)
          .eq('status', 'completed')
          .order('session_time', { ascending: false })

        if (error) { setLoadError(error.message); return }
        setBookings(
          (data ?? []).map((b: any) => ({
            id: b.id,
            label: `${formatBookingDate(b.session_time)} — ${b.trainers?.profiles?.name ?? 'Trainer'}`,
          }))
        )
      }
    }
    load()
  }, [role])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please choose a video file.')
      return
    }
    setErrorMessage('')
    setVideoFile(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) {
      setStatus('error')
      setErrorMessage('Not authenticated. Please refresh and try again.')
      return
    }
    if (!videoFile) {
      setStatus('error')
      setErrorMessage('Please choose a video to upload.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    const supabase = createClient()
    const ext = videoFile.name.includes('.') ? videoFile.name.split('.').pop() : 'mp4'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('post-videos')
      .upload(path, videoFile, { contentType: videoFile.type })

    if (uploadErr) {
      setStatus('error')
      setErrorMessage(uploadErr.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('post-videos').getPublicUrl(path)

    const { error: insertErr } = await supabase.from('posts').insert({
      author_type: role,
      author_id: userId,
      video_url: publicUrl,
      caption: caption.trim() || null,
      sport: sport || null,
      booking_id: bookingId || null,
      feedback_requested: feedbackRequested,
    })

    if (insertErr) {
      setStatus('error')
      setErrorMessage(insertErr.message)
      return
    }

    setStatus('success')
    setVideoFile(null)
    setCaption('')
    setSport('')
    setBookingId('')
    setFeedbackRequested(false)

    const discoverPath = role === 'trainer' ? '/dashboard/trainer/discover' : '/dashboard/athlete/discover'
    setTimeout(() => router.push(discoverPath), 900)
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '672px', margin: '0 auto' }}>
      <div>
        <div style={{ fontFamily: barlow, fontWeight: 700, fontSize: '28px', color: T.ink }}>New post</div>
        <div style={{ fontFamily: hanken, fontSize: '14px', color: T.ink2, marginTop: '4px' }}>Share a training clip with a caption and sport.</div>
      </div>

      {loadError && (
        <div style={{ fontSize: '13px', color: '#EF4444', fontFamily: hanken }}>{loadError}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SectionCard>
          <CardLabel>Video</CardLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {videoFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <Film size={18} color={T.cyan} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: hanken, fontSize: '14px', color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {videoFile.name}
              </span>
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', padding: 0 }}
              >
                <XIcon size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', height: '96px', borderRadius: '8px', border: '1px dashed #D1D5DB',
                background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '6px', cursor: 'pointer', color: T.ink2,
              }}
            >
              <UploadCloud size={22} color={T.cyan} />
              <span style={{ fontFamily: hanken, fontSize: '14px' }}>Choose a video file</span>
            </button>
          )}
        </SectionCard>

        <SectionCard>
          <CardLabel>Details</CardLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <FieldLabel>Caption</FieldLabel>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Say something about this clip... (optional)"
                style={{ width: '100%', minHeight: '100px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '14px', fontSize: '16px', fontFamily: hanken, resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF' }}
              />
            </div>
            <div>
              <FieldLabel>Sport</FieldLabel>
              <select value={sport} onChange={(e) => setSport(e.target.value)} style={selectBase}>
                <option value="">Select a sport</option>
                {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Link to a finished session (optional)</FieldLabel>
              <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} style={selectBase}>
                <option value="">No linked session</option>
                {bookings.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={feedbackRequested}
                onChange={(e) => setFeedbackRequested(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: T.cyan }}
              />
              <span style={{ fontSize: '14px', color: T.ink, fontFamily: hanken }}>Request feedback on this clip</span>
            </label>
          </div>
        </SectionCard>

        {status === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px 14px' }}>
            <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#DC2626', fontFamily: hanken }}>{errorMessage || 'Something went wrong.'}</span>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '12px 14px' }}>
            <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#047857', fontFamily: hanken }}>Post uploaded successfully.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'uploading'}
          style={{
            height: '48px', padding: '0 28px', borderRadius: '999px', border: 'none',
            background: T.cyan, color: '#FFFFFF', fontSize: '15px', fontWeight: 600, fontFamily: hanken,
            cursor: status === 'uploading' ? 'default' : 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', opacity: status === 'uploading' ? 0.85 : 1, alignSelf: 'flex-start',
          }}
        >
          {status === 'uploading' && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} style={{ display: 'flex' }}>
              <Loader2 size={16} color="#FFFFFF" />
            </motion.div>
          )}
          {status === 'uploading' ? 'Uploading…' : 'Share post'}
        </button>
      </form>
    </div>
  )
}
