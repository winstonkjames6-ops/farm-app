'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ── Mock session context ──────────────────────────────────────────────────────

const SESSION = {
  trainerName: 'Jamal Brooks',
  initials: 'JB',
  sport: 'Basketball',
  date: 'Wed, Jun 11, 2025 · 4:00 PM',
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: '#09090B',
  surface: '#111113',
  surface2: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  ink: '#FAFAFA',
  ink2: '#A1A1AA',
  ink3: '#71717A',
  yellow: '#DFE104',
}

const TAGS = [
  'Great communicator',
  'Punctual',
  'Highly skilled',
  'Great with kids',
  'Would book again',
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSubmit() {
    if (rating === 0) return
    setSubmitted(true)
  }

  const displayRating = hovered || rating

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
            // ── Success state ─────────────────────────────────────────────────
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
                  background: 'rgba(223,225,4,0.10)',
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
            // ── Form ──────────────────────────────────────────────────────────
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
                  {SESSION.initials}
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
                    {SESSION.trainerName}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontSize: '13px',
                      color: T.ink2,
                      marginTop: '2px',
                    }}
                  >
                    {SESSION.sport} · {SESSION.date}
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

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: rating === 0 ? 'rgba(223,225,4,0.25)' : T.yellow,
                  border: 'none',
                  color: '#09090B',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: '15px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: rating === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Submit Review
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
