'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

// ── Constants ──────────────────────────────────────────────────────────────

const DATES = [
  { day: 'Mon', num: '23' },
  { day: 'Tue', num: '24' },
  { day: 'Wed', num: '25' },
  { day: 'Thu', num: '26' },
  { day: 'Fri', num: '27' },
]

const TIMES = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function TrainerProfile({ params: { slug } }) {
  const [trainer, setTrainer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState('In-Person')
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [playingCard, setPlayingCard] = useState(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('trainers')
        .select('profile_id, specialty, bio, rate, location, profiles(name)')
        .eq('profile_id', slug)
        .single()
      if (!data) {
        setNotFound(true)
      } else {
        setTrainer(data)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const card = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '24px 28px',
  }

  const sectionHeading = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--ink)',
    margin: '0 0 16px',
    letterSpacing: '-.01em',
  }

  const labelCaps = {
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: '10px',
  }

  const shell = (
    <div
      style={{
        '--bg': '#F8F8F6', '--surface': '#FFFFFF', '--surface-2': '#F0EFEB',
        '--ink': '#1A1A1A', '--ink-2': '#4A4A4A', '--ink-3': '#9A9A9A',
        '--line': 'rgba(0,0,0,0.08)', '--accent': '#00BCC8', '--accent-ink': '#FFFFFF',
        '--radius': '14px',
        background: 'var(--bg)', color: 'var(--ink)',
        fontFamily: "'Hanken Grotesk', sans-serif",
        minHeight: '100vh', WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        .tp-grid {
          display: grid;
          grid-template-columns: 1fr 364px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .tp-grid { grid-template-columns: 1fr; }
          .tp-sticky { position: static !important; top: auto !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'color-mix(in srgb, #F8F8F6 84%, transparent)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-ink)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px',
            }}>F</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '.02em', color: 'var(--ink)' }}>FARM</span>
          </Link>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            color: 'var(--ink-2)', fontWeight: 600, fontSize: '14px',
            padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
          }}>← Back to search</Link>
        </div>
      </nav>

      {/* placeholder children */}
      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '36px 32px 96px' }} />
    </div>
  )

  // Derive name safely
  const name = trainer?.profiles?.name ?? ''
  const { profile_id, specialty, bio, rate, location } = trainer ?? {}

  const bookingHref = trainer
    ? `/booking?trainerId=${profile_id}&name=${encodeURIComponent(name)}&specialty=${encodeURIComponent(specialty ?? '')}&rate=${rate}`
    : '/booking'

  if (loading) {
    return (
      <div style={{
        '--bg': '#F8F8F6', '--surface': '#FFFFFF', '--line': 'rgba(0,0,0,0.08)',
        '--ink-3': '#9A9A9A', '--accent': '#00BCC8',
        background: 'var(--bg)', minHeight: '100vh',
        fontFamily: "'Hanken Grotesk', sans-serif", WebkitFontSmoothing: 'antialiased',
      }}>
        {/* Nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'color-mix(in srgb, #F8F8F6 84%, transparent)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{
            maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px',
              }}>F</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '.02em', color: '#1A1A1A' }}>FARM</span>
            </Link>
            <Link href="/search" style={{
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
              color: '#4A4A4A', fontWeight: 600, fontSize: '14px',
              padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
            }}>← Back to search</Link>
          </div>
        </nav>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '80px 32px', textAlign: 'center', color: 'var(--ink-3)', fontSize: '15px' }}>
          Loading…
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{
        '--bg': '#F8F8F6', '--surface': '#FFFFFF', '--line': 'rgba(0,0,0,0.08)',
        '--ink': '#1A1A1A', '--ink-2': '#4A4A4A', '--ink-3': '#9A9A9A', '--accent': '#00BCC8',
        background: 'var(--bg)', minHeight: '100vh',
        fontFamily: "'Hanken Grotesk', sans-serif", WebkitFontSmoothing: 'antialiased',
      }}>
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'color-mix(in srgb, #F8F8F6 84%, transparent)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{
            maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px',
              }}>F</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '.02em', color: '#1A1A1A' }}>FARM</span>
            </Link>
            <Link href="/search" style={{
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
              color: '#4A4A4A', fontWeight: 600, fontSize: '14px',
              padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
            }}>← Back to search</Link>
          </div>
        </nav>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '96px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: '#1A1A1A', marginBottom: '12px' }}>Trainer not found</div>
          <p style={{ color: '#9A9A9A', fontSize: '15px', marginBottom: '28px' }}>This trainer profile doesn&apos;t exist or may have been removed.</p>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            background: '#00BCC8', color: '#fff', fontWeight: 700, fontSize: '15px',
            padding: '12px 24px', borderRadius: '12px',
          }}>Browse trainers</Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        '--bg': '#F8F8F6', '--surface': '#FFFFFF', '--surface-2': '#F0EFEB',
        '--ink': '#1A1A1A', '--ink-2': '#4A4A4A', '--ink-3': '#9A9A9A',
        '--line': 'rgba(0,0,0,0.08)', '--accent': '#00BCC8', '--accent-ink': '#FFFFFF',
        '--radius': '14px',
        background: 'var(--bg)', color: 'var(--ink)',
        fontFamily: "'Hanken Grotesk', sans-serif",
        minHeight: '100vh', WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        .tp-grid {
          display: grid;
          grid-template-columns: 1fr 364px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .tp-grid { grid-template-columns: 1fr; }
          .tp-sticky { position: static !important; top: auto !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'color-mix(in srgb, #F8F8F6 84%, transparent)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: '1160px', margin: '0 auto', padding: '0 32px', height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-ink)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px',
            }}>F</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '.02em', color: 'var(--ink)' }}>FARM</span>
          </Link>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            color: 'var(--ink-2)', fontWeight: 600, fontSize: '14px',
            padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
          }}>← Back to search</Link>
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '36px 32px 96px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--ink-3)', marginBottom: '28px' }}>
          <Link href="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>›</span>
          <Link href="/search" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Trainers</Link>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>›</span>
          <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{name}</span>
        </div>

        <div className="tp-grid">

          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >

            {/* Profile header */}
            <div style={card}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: '88px', height: '88px', borderRadius: '20px', flexShrink: 0,
                  background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '30px',
                  color: '#fff', letterSpacing: '-.02em', border: '1px solid var(--line)',
                }}>{getInitials(name)}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px',
                    margin: '0 0 12px', letterSpacing: '-.02em', color: 'var(--ink)',
                  }}>{name}</h1>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '12px' }}>
                    {specialty && (
                      <span style={{
                        background: 'rgba(0,188,200,0.10)',
                        color: '#00BCC8', fontSize: '12.5px', fontWeight: 700,
                        padding: '4px 12px', borderRadius: '999px',
                      }}>{specialty}</span>
                    )}
                  </div>

                  {location && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '13.5px', color: 'var(--ink-3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        {location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {bio && (
              <div style={card}>
                <h2 style={sectionHeading}>About</h2>
                <p style={{ color: 'var(--ink-2)', fontSize: '15.5px', lineHeight: 1.7, margin: 0 }}>{bio}</p>
              </div>
            )}

            {/* Intro Video */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 }}
              style={card}
            >
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                fontSize: '13px', letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'var(--ink-3)', margin: '0 0 14px',
              }}>Intro Video</h2>

              <div
                style={{ position: 'relative', paddingTop: '56.25%', background: '#0D0D0F', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setVideoPlaying((v) => !v)}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(18,18,20,0.55) 0%, rgba(5,5,6,0.88) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.018) 28px, rgba(255,255,255,0.018) 29px)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: '#00BCC8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,188,200,0.32)',
                  }}>
                    {videoPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="4" width="4" height="16" rx="1" fill="#000" />
                        <rect x="14" y="4" width="4" height="16" rx="1" fill="#000" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5.14v14l11-7-11-7z" fill="#000" />
                      </svg>
                    )}
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>0:32</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    animate={{ width: videoPlaying ? '100%' : '0%' }}
                    transition={{ duration: videoPlaying ? 32 : 0.2, ease: 'linear' }}
                    style={{ height: '100%', background: '#00BCC8' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Athlete Progress */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
              style={card}
            >
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                fontSize: '13px', letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'var(--ink-3)', margin: '0 0 16px',
              }}>Athlete Progress</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  {
                    id: 'before', label: 'BEFORE', age: 'Age 10 · Soccer',
                    quote: 'Started with no footwork fundamentals. Struggled to control a moving ball.',
                    labelBg: 'rgba(239,68,68,0.82)',
                    bg: 'linear-gradient(160deg, #1e0a0a 0%, #0d0404 100%)',
                  },
                  {
                    id: 'after', label: 'AFTER', age: 'Age 11 · Soccer',
                    quote: 'Competing at varsity level 6 months later. First touch transformed completely.',
                    labelBg: 'rgba(34,197,94,0.82)',
                    bg: 'linear-gradient(160deg, #0a1e0d 0%, #040d05 100%)',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.28 + i * 0.1 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPlayingCard(playingCard === item.id ? null : item.id)}
                  >
                    <div style={{ position: 'relative', paddingTop: '75%', background: '#0D0D0F', borderRadius: '8px', overflow: 'hidden', marginBottom: '11px' }}>
                      <div style={{ position: 'absolute', inset: 0, background: item.bg }} />
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.016) 20px, rgba(255,255,255,0.016) 21px)' }} />
                      <div style={{ position: 'absolute', top: 8, left: 8, background: item.labelBg, color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.1em' }}>{item.label}</div>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: playingCard === item.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,188,200,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s ease' }}>
                          {playingCard === item.id ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill="#fff" /><rect x="14" y="4" width="4" height="16" rx="1" fill="#fff" /></svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M8 5.14v14l11-7-11-7z" fill="#000" /></svg>
                          )}
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.08)' }}>
                        {playingCard === item.id && (
                          <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 45, ease: 'linear' }} style={{ height: '100%', background: '#00BCC8' }} />
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '6px', letterSpacing: '.09em', textTransform: 'uppercase' }}>{item.age}</div>
                    <p style={{ fontSize: '13.5px', color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>&ldquo;{item.quote}&rdquo;</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Rate */}
            <div style={{ ...card, display: 'inline-block' }}>
              <h2 style={sectionHeading}>Rate</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '34px', color: 'var(--ink)', lineHeight: 1 }}>${rate}</span>
                <span style={{ color: 'var(--ink-3)', fontSize: '15px' }}>/hr</span>
              </div>
              <p style={{ color: 'var(--ink-3)', fontSize: '13px', margin: 0, lineHeight: 1.45 }}>No subscription.<br />Pay per session.</p>
            </div>

          </motion.div>

          {/* RIGHT COLUMN — Sticky booking card */}
          <motion.div
            className="tp-sticky"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
            style={{ position: 'sticky', top: '88px' }}
          >
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              padding: '24px 24px 28px',
              boxShadow: '0 28px 64px rgba(0,0,0,0.08)',
            }}>

              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                paddingBottom: '18px', borderBottom: '1px solid var(--line)', marginBottom: '20px',
              }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--ink)', letterSpacing: '-.01em' }}>{name}</div>
                  {specialty && (
                    <div style={{ fontSize: '12.5px', color: 'var(--ink-3)', marginTop: '5px' }}>{specialty}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '24px', color: 'var(--ink)', lineHeight: 1 }}>${rate}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '3px' }}>per hour</div>
                </div>
              </div>

              {/* Date picker */}
              <div style={{ marginBottom: '18px' }}>
                <div style={labelCaps}>Select a date</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {DATES.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      style={{
                        textAlign: 'center', padding: '10px 0', borderRadius: '11px', cursor: 'pointer',
                        background: selectedDate === i ? 'var(--accent)' : 'var(--bg)',
                        border: selectedDate === i ? '1px solid var(--accent)' : '1px solid var(--line)',
                        boxShadow: selectedDate === i ? '0 6px 18px rgba(0,188,200,0.28)' : 'none',
                        transition: 'all .15s ease',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 600, color: selectedDate === i ? 'rgba(255,255,255,0.75)' : 'var(--ink-3)', marginBottom: '3px' }}>{d.day}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '17px', lineHeight: 1, color: selectedDate === i ? 'var(--accent-ink)' : 'var(--ink)' }}>{d.num}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div style={{ marginBottom: '18px' }}>
                <div style={labelCaps}>Time</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {TIMES.map((t, i) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(i)}
                      style={{
                        padding: '8px 13px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        background: selectedTime === i ? 'var(--ink)' : 'var(--bg)',
                        border: selectedTime === i ? '1px solid var(--ink)' : '1px solid var(--line)',
                        color: selectedTime === i ? 'var(--bg)' : 'var(--ink-2)',
                        transition: 'all .15s ease',
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Format toggle */}
              <div style={{ marginBottom: '22px' }}>
                <div style={labelCaps}>Format</div>
                <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '10px', padding: '3px', gap: '3px' }}>
                  {['In-Person', 'Remote Video'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: '8px',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        background: selectedFormat === f ? 'var(--surface)' : 'transparent',
                        border: selectedFormat === f ? '1px solid var(--line)' : '1px solid transparent',
                        color: selectedFormat === f ? 'var(--ink)' : 'var(--ink-3)',
                        boxShadow: selectedFormat === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all .15s ease',
                      }}
                    >{f}</button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: '18px', marginBottom: '18px', borderBottom: '1px solid var(--line)',
              }}>
                <span style={{ color: 'var(--ink-2)', fontSize: '15px' }}>Total</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', color: 'var(--ink)' }}>${rate}.00</span>
              </div>

              {/* CTA */}
              <Link href={bookingHref} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
                width: '100%', padding: '15px', borderRadius: '12px',
                background: '#00BCC8', color: '#FFFFFF',
                fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '16px',
                cursor: 'pointer', marginBottom: '12px',
              }}>
                Request session
              </Link>

              {/* Response time badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', border: '1px solid var(--line)',
                  borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  color: 'var(--ink-3)', background: 'var(--surface-2)',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Responds within 2 hrs
                </span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--ink-3)', margin: 0 }}>
                Free cancellation up to 24 hours before
              </p>

            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
