'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
  line: 'rgba(0,0,0,0.08)',
}

// ── Slide data ─────────────────────────────────────────────────────────────────

const PARENT_SLIDES = [
  {
    icon: 'search',
    headline: 'Find the right trainer',
    body: 'Browse vetted trainers by sport, location, and availability. Every trainer on FARM is background-checked and credential-verified.',
    cta: 'Next',
  },
  {
    icon: 'calendar',
    headline: 'Book in under 2 minutes',
    body: 'Pick a date, choose in-person or remote, and pay securely through Stripe. Your trainer gets notified instantly.',
    cta: 'Next',
  },
  {
    icon: 'athlete',
    headline: "Track your athlete's progress",
    body: "After each session, trainers leave notes and ratings. You'll always know how your athlete is improving.",
    cta: 'Find a trainer →',
  },
]

const TRAINER_SLIDES = [
  {
    icon: 'profile',
    headline: 'Get discovered by parents',
    body: 'Your profile shows your credentials, availability, and rates. Parents in your area can find and book you directly.',
    cta: 'Next',
  },
  {
    icon: 'calendar',
    headline: 'You control your schedule',
    body: 'Set your weekly availability once. Parents can only book during your open slots — no surprises, no double-bookings.',
    cta: 'Next',
  },
  {
    icon: 'money',
    headline: 'Get paid every week',
    body: 'You keep 85% of every session. Stripe deposits hit your bank account weekly, automatically.',
    cta: 'Set up my schedule →',
  },
]

// ── Icons ──────────────────────────────────────────────────────────────────────

function SlideIcon({ type }: { type: string }) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    athlete: (
      <>
        <circle cx="12" cy="5" r="2" />
        <path d="M8 21l2-8-2-3h8l-2 3 2 8" />
        <path d="M6 11l2-2m8 2l-2-2" />
      </>
    ),
    profile: (
      <>
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <circle cx="8" cy="10" r="2" />
        <path d="M14 9h4M14 13h4M8 17h10" />
      </>
    ),
    money: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="6" x2="12" y2="18" />
        <path d="M15 9H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8" />
      </>
    ),
  }

  return (
    <div style={{
      width: 80, height: 80, borderRadius: '50%',
      background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 32px', boxShadow: '0 12px 32px rgba(0,188,200,0.25)',
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
        stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </svg>
    </div>
  )
}

function DotProgress({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: i === active ? T.cyan : 'rgba(0,0,0,0.12)',
          transition: 'background .2s ease',
        }} />
      ))}
    </div>
  )
}

// ── Inner page (needs useSearchParams) ────────────────────────────────────────

function OnboardingInner() {
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') as 'parent' | 'trainer') ?? 'parent'
  const [slide, setSlide] = useState(0)
  const router = useRouter()

  const destination = role === 'trainer' ? '/dashboard/trainer/schedule' : '/dashboard/search'
  const slides = role === 'parent' ? PARENT_SLIDES : TRAINER_SLIDES

  function advance() {
    if (slide < slides.length - 1) {
      setSlide(slide + 1)
    } else {
      router.push(destination)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px', background: T.cyan,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>F</span>
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', color: T.cyan, letterSpacing: '0.12em' }}>FARM</span>
        </div>
        <button
          onClick={() => router.push(destination)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '14px', fontWeight: 500, fontFamily: "'Hanken Grotesk', sans-serif" }}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ textAlign: 'center', paddingTop: '60px' }}
          >
            <SlideIcon type={slides[slide].icon} />

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 'clamp(28px, 5vw, 38px)',
              letterSpacing: '-0.02em', color: T.ink,
              margin: '0 0 16px', lineHeight: 1.1,
            }}>
              {slides[slide].headline}
            </h1>

            <p style={{
              fontSize: '16px', lineHeight: 1.65, color: T.ink2,
              maxWidth: '400px', margin: '0 auto 48px',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>
              {slides[slide].body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom controls */}
        <DotProgress total={slides.length} active={slide} />

        <button
          onClick={advance}
          style={{
            display: 'block', width: '100%', maxWidth: '400px', margin: '0 auto',
            height: '52px', background: T.cyan, color: '#FFFFFF',
            fontSize: '16px', fontWeight: 700, borderRadius: '12px', border: 'none',
            cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
            transition: 'filter .15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.93)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
        >
          {slides[slide].cta}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: T.ink3, marginTop: '16px' }}>
          {slide + 1} of {slides.length}
        </p>
      </div>
    </div>
  )
}

// ── Page export with Suspense boundary ────────────────────────────────────────

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F8F8F6' }} />}>
      <OnboardingInner />
    </Suspense>
  )
}
