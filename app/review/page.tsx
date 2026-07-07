'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: '#09090B',
  surface: '#111113',
  surface2: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  ink: '#FAFAFA',
  ink2: '#A1A1AA',
  ink3: '#71717A',
  yellow: '#00BCC8',
}

const TAGS = [
  'Great communicator',
  'Punctual',
  'Highly skilled',
  'Great with kids',
  'Would book again',
]

// ── Types ─────────────────────────────────────────────────────────────────────

type SessionCtx = {
  trainerName: string
  initials: string
  sport: string
  date: string
  trainerId: string
}

// ── Inner page (needs Suspense for useSearchParams) ───────────────────────────

function ReviewPageInner() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [ctx, setCtx] = useState<SessionCtx | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!bookingId) {
        setLoadError('No booking specified.')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadError('Please sign in to leave a review.')
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, session_time, status, parent_id, trainer_id, trainers!trainer_id(specialty, profiles(name)), athletes!athlete_id(name)')
        .eq('id', bookingId)
        .single()

      if (bookingErr || !booking) {
        setLoadError('Session not found.')
        setLoading(false)
        return
      }

      const b = booking as any

      if (b.parent_id !== user.id) {
        setLoadError("You don't have permission to review this session.")
        setLoading(false)
        return
      }

      if (b.status !== 'completed') {
        setLoadError("This session hasn't been completed yet.")
        setLoading(false)
        return
      }

      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle()

      if (existingReview) {
        setAlreadyReviewed(true)
        setLoading(false)
        return
      }

      const trainerName: string = b.trainers?.profiles?.name ?? 'Trainer'
      const initials = trainerName
        .split(' ')
        .map((w: string) => w[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase()
      const sport: string = b.trainers?.specialty ?? ''
      const dt = new Date(b.session_time)
      const date =
        dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
        ' · ' +
        dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

      setCtx({ trainerName, initials, sport, date, trainerId: b.trainer_id })
      setLoading(false)
    }
    load()
  }, [bookingId])

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit() {
    if (rating === 0 || !ctx || !userId || !bookingId) return
    setSubmitting(true)
    setSubmitError(null)

    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      parent_id: userId,
      trainer_id: ctx.trainerId,
      rating,
      tags: selectedTags,
      body: text,
    })

    setSubmitting(false)

    if (error) {
      setSubmitError(
        error.code === '23505'
          ? "You've already submitted a review for this session."
          : 'Failed to submit review. Please try again.'
      )
      return
    }

    setSubmitted(true)
  }

  const displayRating = hovered || rating

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '14px',
            color: T.ink3,
          }}
        >
          Loading…
        </div>
      </div>
    )
  }

  // ── Error / not authorized / not completed ────────────────────────────────

  if (loadError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          padding: '48px 20px 80px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          <Link
            href="/sessions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.1em',
              color: T.ink3,
              textDecoration: 'none',
              textTransform: 'uppercase',
              marginBottom: '32px',
            }}
          >
            ← Sessions
          </Link>
          <div
            style={{
              padding: '24px',
              background: T.surface,
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '18px',
                color: T.ink,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '8px',
              }}
            >
              Unable to Load Review
            </div>
            <div
              style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '14px',
                color: T.ink2,
              }}
            >
              {loadError}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Already reviewed ──────────────────────────────────────────────────────

  if (alreadyReviewed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          padding: '48px 20px 80px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          <Link
            href="/sessions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.1em',
              color: T.ink3,
              textDecoration: 'none',
              textTransform: 'uppercase',
              marginBottom: '32px',
            }}
          >
            ← Sessions
          </Link>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              paddingTop: '60px',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: 'rgba(0,188,200,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.yellow} strokeWidth="2.5" strokeLinecap="square">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: '32px',
                  color: T.ink,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                  marginBottom: '10px',
                }}
              >
                Already Reviewed.
              </div>
              <div
                style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '15px',
                  color: T.ink2,
                  lineHeight: 1.55,
                }}
              >
                You've already submitted a review for this session.
              </div>
            </div>
            <Link
              href="/sessions"
              style={{
                marginTop: '8px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.08em',
                color: T.yellow,
                textDecoration: 'none',
                textTransform: 'uppercase',
                borderBottom: `1px solid ${T.yellow}`,
                paddingBottom: '2px',
              }}
            >
              Back to Sessions →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        padding: '48px 20px 80px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Back */}
        {!submitted && (
          <Link
            href="/sessions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.1em',
              color: T.ink3,
              textDecoration: 'none',
              textTransform: 'uppercase',
              marginBottom: '32px',
            }}
          >
            ← Sessions
          </Link>
        )}

        <AnimatePresence mode="wait">
          {submitted ? (
            // ── Success state ─────────────────────────────────────────────
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: '60px',
                gap: '20px',
              }}
            >
              {/* Checkmark */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  background: 'rgba(0,188,200,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.yellow} strokeWidth="2.5" strokeLinecap="square">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: '32px',
                    color: T.ink,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    lineHeight: 1.1,
                    marginBottom: '10px',
                  }}
                >
                  Review Submitted.
                </div>
                <div
                  style={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '15px',
                    color: T.ink2,
                    lineHeight: 1.55,
                  }}
                >
                  Thank you for your feedback.
                </div>
              </div>

              <Link
                href="/sessions"
                style={{
                  marginTop: '8px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: T.yellow,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${T.yellow}`,
                  paddingBottom: '2px',
                }}
              >
                Back to Sessions →
              </Link>
            </motion.div>
          ) : (
            // ── Form ──────────────────────────────────────────────────────
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headline */}
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(38px, 8vw, 60px)',
                  color: T.ink,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                  margin: '0 0 28px',
                }}
              >
                Rate Your
                <br />
                Session
              </h1>

              {/* Trainer card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  padding: '16px 18px',
                  marginBottom: '32px',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: T.surface2,
                    border: `1px solid ${T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    color: T.yellow,
                    letterSpacing: '0.04em',
                    flexShrink: 0,
                  }}
                >
                  {ctx?.initials}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: '16px',
                      color: T.ink,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {ctx?.trainerName}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontSize: '13px',
                      color: T.ink2,
                      marginTop: '2px',
                    }}
                  >
                    {ctx?.sport} · {ctx?.date}
                  </div>
                </div>
              </div>

              {/* Star rating */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    color: T.ink3,
                    textTransform: 'uppercase',
                    marginBottom: '14px',
                  }}
                >
                  Your Rating
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        transform: displayRating >= star ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24">
                        <polygon
                          points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1"
                          fill={displayRating >= star ? T.yellow : T.surface2}
                          stroke={displayRating >= star ? T.yellow : T.border}
                          strokeWidth="1"
                        />
                      </svg>
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontSize: '13px',
                      color: T.ink2,
                    }}
                  >
                    <span style={{ color: T.yellow, fontWeight: 600 }}>{rating}</span> out of 5
                  </motion.div>
                )}
              </div>

              {/* Quick tags */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    color: T.ink3,
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  Quick Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TAGS.map((tag) => {
                    const sel = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          padding: '8px 14px',
                          background: sel ? T.yellow : 'transparent',
                          border: `1px solid ${sel ? T.yellow : T.border}`,
                          color: sel ? '#09090B' : T.ink2,
                          fontFamily: "'Hanken Grotesk', sans-serif",
                          fontWeight: sel ? 600 : 400,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Textarea */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    color: T.ink3,
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}
                >
                  Your Experience
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share your experience (optional)"
                  rows={4}
                  style={{
                    width: '100%',
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    color: T.ink,
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '14px',
                    padding: '14px 16px',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    lineHeight: 1.55,
                  }}
                />
              </div>

              {/* Submit error */}
              {submitError && (
                <div
                  style={{
                    marginBottom: '12px',
                    padding: '12px 16px',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '13px',
                    color: '#F87171',
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: rating === 0 ? 'rgba(0,188,200,0.25)' : T.yellow,
                  border: 'none',
                  color: '#09090B',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: '15px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: rating === 0 || submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>

              {rating === 0 && (
                <div
                  style={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '12px',
                    color: T.ink3,
                    marginTop: '8px',
                    textAlign: 'center',
                  }}
                >
                  Select a star rating to continue
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Page export — Suspense required by Next.js for useSearchParams ─────────────

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewPageInner />
    </Suspense>
  )
}
