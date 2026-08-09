'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UploadCloud, Film, Loader2, CheckCircle2, AlertCircle, X as XIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { SPORTS } from '@/components/search/TrainerDirectory'

// First-pass, case-insensitive substring blocklist. Blocks uploads with flagged content.
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'piss',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'whore', 'slut',
]

function containsBlockedWord(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED_WORDS.some((word) => lower.includes(word))
}

type Role = 'trainer' | 'athlete'

type BookingOption = {
  id: string
  label: string
}

type SubmitStatus = 'idle' | 'uploading' | 'success' | 'error'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

// Matches the post-videos storage bucket's file_size_limit.
const MAX_VIDEO_BYTES = 200 * 1024 * 1024

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1)
}

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

// Best-effort client-side thumbnail: grabs a frame ~1s in (or 10% in for very short
// clips) via an off-screen <video>/<canvas>. Resolves null on any failure — callers
// must treat that as "no thumbnail" rather than an upload-blocking error.
function generateThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    let settled = false
    let objectUrl: string | null = null
    let video: HTMLVideoElement | null = null

    function finish(blob: Blob | null) {
      if (settled) return
      settled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      if (video?.parentNode) video.parentNode.removeChild(video)
      resolve(blob)
    }

    try {
      video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      objectUrl = URL.createObjectURL(file)
      video.src = objectUrl

      // Must be genuinely attached (off-screen, not display:none/visibility:hidden) —
      // otherwise some browsers never decode a paintable frame for drawImage to capture.
      video.style.position = 'fixed'
      video.style.left = '-9999px'
      video.style.width = '1px'
      video.style.height = '1px'
      document.body.appendChild(video)

      video.addEventListener('error', () => finish(null))

      video.addEventListener('loadedmetadata', () => {
        const duration = video!.duration
        const seekTime = !isFinite(duration) || duration <= 0
          ? 0
          : duration < 2
          ? duration * 0.1
          : 1
        try {
          video!.currentTime = seekTime
        } catch {
          finish(null)
        }
      })

      video.addEventListener('seeked', async () => {
        try {
          // Give the browser a paint cycle to actually commit the seeked frame
          // before capturing it — otherwise drawImage can grab a black frame.
          await new Promise((r) => requestAnimationFrame(r))
          const canvas = document.createElement('canvas')
          canvas.width = video!.videoWidth
          canvas.height = video!.videoHeight
          const ctx = canvas.getContext('2d')
          if (!ctx || canvas.width === 0 || canvas.height === 0) {
            finish(null)
            return
          }
          ctx.drawImage(video!, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => finish(blob), 'image/jpeg', 0.8)
        } catch {
          finish(null)
        }
      })

      setTimeout(() => finish(null), 8000)
    } catch {
      finish(null)
    }
  })
}

// ── Component ───────────────────────────────────────────────────────────────

export function PostUploadForm({ role }: { role: Role }) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingOption[]>([])
  const [loadError, setLoadError] = useState('')

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [videoSizeError, setVideoSizeError] = useState('')
  const [caption, setCaption] = useState('')
  const [sport, setSport] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [feedbackRequested, setFeedbackRequested] = useState(false)
  const [commentsEnabled, setCommentsEnabled] = useState(true)

  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitAction, setSubmitAction] = useState<'publish' | 'draft' | null>(null)
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

  // Object-URL preview of the selected file, independent of thumbnail generation.
  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(videoFile)
    setVideoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [videoFile])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please choose a video file.')
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setVideoSizeError(`This video is too large (${formatMb(file.size)}mb). Please choose a clip under 200MB.`)
      setVideoFile(file)
      return
    }
    setVideoSizeError('')
    setErrorMessage('')
    setVideoFile(file)
  }

  async function handleSubmit(publish: boolean) {
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
    if (caption.trim() && containsBlockedWord(caption)) {
      setStatus('error')
      setErrorMessage('Caption contains blocked content. Please remove or edit.')
      return
    }
    if (sport && containsBlockedWord(sport)) {
      setStatus('error')
      setErrorMessage('Sport selection contains blocked content. Please choose a different sport.')
      return
    }

    setSubmitAction(publish ? 'publish' : 'draft')
    setStatus('uploading')
    setErrorMessage('')

    const supabase = createClient()
    const ext = videoFile.name.includes('.') ? videoFile.name.split('.').pop() : 'mp4'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`

    const [{ error: uploadErr }, thumbnailBlob] = await Promise.all([
      supabase.storage.from('post-videos').upload(path, videoFile, { contentType: videoFile.type }),
      generateThumbnail(videoFile),
    ])

    if (uploadErr) {
      setStatus('error')
      setErrorMessage(uploadErr.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('post-videos').getPublicUrl(path)

    let thumbnailUrl: string | null = null
    if (thumbnailBlob) {
      const thumbPath = `${userId}/${crypto.randomUUID()}.jpg`
      const { error: thumbErr } = await supabase.storage
        .from('post-thumbnails')
        .upload(thumbPath, thumbnailBlob, { contentType: 'image/jpeg' })

      if (thumbErr) {
        console.error('[post-upload] thumbnail upload failed:', thumbErr.message)
      } else {
        thumbnailUrl = supabase.storage.from('post-thumbnails').getPublicUrl(thumbPath).data.publicUrl
      }
    }

    const { error: insertErr } = await supabase.from('posts').insert({
      author_type: role,
      author_id: userId,
      video_url: publicUrl,
      thumbnail_url: thumbnailUrl,
      caption: caption.trim() || null,
      sport: sport || null,
      booking_id: bookingId || null,
      feedback_requested: feedbackRequested,
      published: publish,
      ...(role === 'trainer' ? { comments_enabled: commentsEnabled } : {}),
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
    setCommentsEnabled(true)

    const redirectPath = publish
      ? (role === 'trainer' ? '/dashboard/trainer/discover' : '/dashboard/athlete/discover')
      : (role === 'trainer' ? '/dashboard/trainer/drafts' : '/dashboard/athlete/drafts')
    setTimeout(() => router.push(redirectPath), 900)
  }

  const isOversized = !!videoSizeError
  const submitDisabled = status === 'uploading' || isOversized

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '672px', margin: '0 auto' }}>
      <div>
        <div style={{ fontFamily: barlow, fontWeight: 700, fontSize: '28px', color: T.ink }}>New post</div>
        <div style={{ fontFamily: hanken, fontSize: '14px', color: T.ink2, marginTop: '4px' }}>Share a training clip with a caption and sport.</div>
      </div>

      {loadError && (
        <div style={{ fontSize: '13px', color: '#EF4444', fontFamily: hanken }}>{loadError}</div>
      )}

      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {videoPreviewUrl && (
                <video
                  src={videoPreviewUrl}
                  controls
                  playsInline
                  style={{ width: '100%', maxHeight: '320px', borderRadius: '8px', background: '#000000', display: 'block' }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                <Film size={18} color={T.cyan} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontFamily: hanken, fontSize: '14px', color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {videoFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => { setVideoFile(null); setVideoSizeError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', padding: 0 }}
                >
                  <XIcon size={16} />
                </button>
              </div>
              {videoSizeError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 12px' }}>
                  <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#DC2626', fontFamily: hanken }}>{videoSizeError}</span>
                </div>
              )}
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
            {role === 'trainer' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={commentsEnabled}
                  onChange={(e) => setCommentsEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: T.cyan }}
                />
                <span style={{ fontSize: '14px', color: T.ink, fontFamily: hanken }}>Allow comments on this post</span>
              </label>
            )}
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
            <span style={{ fontSize: '13px', color: '#047857', fontFamily: hanken }}>
              {submitAction === 'draft' ? 'Saved as draft.' : 'Post uploaded successfully.'}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={submitDisabled}
            style={{
              height: '48px', padding: '0 28px', borderRadius: '999px', border: 'none',
              background: T.cyan, color: '#FFFFFF', fontSize: '15px', fontWeight: 600, fontFamily: hanken,
              cursor: submitDisabled ? 'default' : 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px', opacity: submitDisabled ? 0.85 : 1,
            }}
          >
            {status === 'uploading' && submitAction === 'publish' && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} style={{ display: 'flex' }}>
                <Loader2 size={16} color="#FFFFFF" />
              </motion.div>
            )}
            {status === 'uploading' && submitAction === 'publish' ? 'Uploading…' : 'Publish now'}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitDisabled}
            style={{
              height: '48px', padding: '0 28px', borderRadius: '999px', border: `1px solid ${T.line}`,
              background: 'transparent', color: T.ink2, fontSize: '15px', fontWeight: 600, fontFamily: hanken,
              cursor: submitDisabled ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: submitDisabled ? 0.85 : 1,
            }}
          >
            {status === 'uploading' && submitAction === 'draft' && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} style={{ display: 'flex' }}>
                <Loader2 size={16} color={T.ink2} />
              </motion.div>
            )}
            {status === 'uploading' && submitAction === 'draft' ? 'Saving…' : 'Save as draft'}
          </button>
        </div>
      </form>
    </div>
  )
}
