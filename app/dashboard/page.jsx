'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Mock data ────────────────────────────────────────────────────────────────

const BOOKINGS = [
  {
    id: 1,
    trainerName: 'Marcus Rivera',
    trainerInitials: 'MR',
    sport: 'Soccer',
    date: 'Monday, Jun 23',
    time: '9:00 AM',
    format: 'In-Person',
    status: 'upcoming',
    totalPaid: 65,
    rating: null,
  },
  {
    id: 2,
    trainerName: 'Priya Nair',
    trainerInitials: 'PN',
    sport: 'Tennis',
    date: 'Saturday, Jun 14',
    time: '11:00 AM',
    format: 'In-Person',
    status: 'completed',
    totalPaid: 75,
    rating: 5,
  },
  {
    id: 3,
    trainerName: 'Jamal Brooks',
    trainerInitials: 'JB',
    sport: 'Basketball',
    date: 'Wednesday, Jun 4',
    time: '4:00 PM',
    format: 'Remote Video',
    status: 'completed',
    totalPaid: 55,
    rating: 4,
  },
]

// ── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  surface: '#FFFFFF',
  surface2: '#F0EFEB',
  ink: '#1A1A1A',
  ink2: '#4A4A4A',
  ink3: '#9A9A9A',
  line: 'rgba(0,0,0,0.08)',
  accent: '#00BCC8',
  accentInk: '#FFFFFF',
  green: '#00BCC8',
  radius: '14px',
}

// ── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }) {
  return (
    <span className="inline-flex gap-[3px] align-middle">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <polygon
            points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1"
            fill={i <= rating ? T.accent : 'rgba(0,0,0,0.10)'}
          />
        </svg>
      ))}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ initials }) {
  return (
    <div
      className="flex-none flex items-center justify-center rounded-xl text-white font-black text-lg"
      style={{
        width: 52, height: 52,
        background: `linear-gradient(140deg, ${T.accent} 0%, #00D4E2 100%)`,
        fontFamily: "'Archivo', sans-serif",
      }}
    >
      {initials}
    </div>
  )
}

// ── Sport badge ───────────────────────────────────────────────────────────────

function SportBadge({ sport }) {
  return (
    <span
      className="text-[11px] font-bold tracking-wide uppercase px-2 py-[3px] rounded-full"
      style={{
        background: `color-mix(in srgb, ${T.accent} 12%, ${T.surface2})`,
        color: T.accent,
        letterSpacing: '.08em',
      }}
    >
      {sport}
    </span>
  )
}

// ── Upcoming session card ─────────────────────────────────────────────────────

function UpcomingCard({ booking, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 + index * 0.08 }}
      className="rounded-2xl p-6"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div className="dash-card-row flex items-start gap-4">
        <Avatar initials={booking.trainerInitials} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="font-bold text-[17px] leading-tight"
              style={{ fontFamily: "'Archivo', sans-serif", color: T.ink }}
            >
              {booking.trainerName}
            </span>
            <SportBadge sport={booking.sport} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[13.5px]" style={{ color: T.ink3 }}>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {booking.date}
            </span>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {booking.time}
            </span>
          </div>

          <span
            className="inline-block mt-3 text-[12.5px] font-semibold px-3 py-1 rounded-full"
            style={{ border: `1.5px solid ${T.line}`, color: T.ink2 }}
          >
            {booking.format}
          </span>
        </div>

        <div className="dash-card-actions flex-none flex flex-col items-end gap-2 pt-1">
          <button
            className="font-bold text-sm px-5 py-2.5 rounded-xl transition-[filter] duration-150"
            style={{ background: T.green, color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            Join session
          </button>
          <button
            className="text-[12.5px] font-medium transition-colors duration-150"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = T.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.ink3 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Past session card ─────────────────────────────────────────────────────────

function PastCard({ booking, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1], delay: 0.25 + index * 0.08 }}
      className="rounded-2xl p-6"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div className="flex items-start gap-4">
        <Avatar initials={booking.trainerInitials} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="font-bold text-[17px] leading-tight"
              style={{ fontFamily: "'Archivo', sans-serif", color: T.ink }}
            >
              {booking.trainerName}
            </span>
            <SportBadge sport={booking.sport} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[13.5px]" style={{ color: T.ink3 }}>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {booking.date}
            </span>
            <span>{booking.format}</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            {booking.rating !== null && <Stars rating={booking.rating} />}
            <span className="text-[13px] font-semibold" style={{ color: T.ink }}>
              ${booking.totalPaid}.00 paid
            </span>
          </div>
        </div>

        <div className="flex-none pt-1">
          <Link
            href="/trainer/marcus-rivera"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-[border-color] duration-150"
            style={{
              border: `1.5px solid ${T.line}`,
              color: T.ink2,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.26)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line }}
          >
            Book again
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="text-center py-20"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: T.surface2 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <p className="text-[17px] font-semibold mb-1" style={{ color: T.ink }}>No sessions yet</p>
      <p className="text-[14.5px] mb-6" style={{ color: T.ink3 }}>Book your first session to get started</p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 font-bold text-[15px] px-6 py-3 rounded-xl transition-[filter] duration-150"
        style={{ background: T.accent, color: T.accentInk, textDecoration: 'none' }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.07)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
      >
        Find a trainer
      </Link>
    </motion.div>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '12px' }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: '11px',
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        background: 'rgba(0,0,0,0.38)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '3px 10px',
        borderRadius: '999px',
      }}>
        {children}
      </span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [showReviewNudge, setShowReviewNudge] = useState(true)

  const upcoming = BOOKINGS.filter((b) => b.status === 'upcoming')
  const past = BOOKINGS.filter((b) => b.status === 'completed')
  const isEmpty = BOOKINGS.length === 0

  const sportsSet = new Set(BOOKINGS.map((b) => b.sport))

  return (
    <div
      className="min-h-screen antialiased"
      style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {/* Main */}
      <div className="max-w-2xl mx-auto px-6 py-10 pb-24">

        {/* Review nudge banner */}
        {showReviewNudge && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            style={{
              background: '#F8F8F6',
              border: '1px solid rgba(0,0,0,0.08)',
              borderLeft: '3px solid #00BCC8',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '16px', flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '14px',
                color: '#1A1A1A', margin: '0 0 4px',
              }}>
                How was your session with Marcus Rivera on Tuesday?
              </p>
              <p style={{ fontSize: '13px', color: '#9A9A9A', margin: 0 }}>
                Your feedback helps other parents find great trainers.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
              <Link
                href="/review"
                style={{
                  background: '#00BCC8', color: '#FFFFFF', textDecoration: 'none',
                  padding: '9px 16px', fontSize: '12px', fontWeight: 800,
                  fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.1em',
                  textTransform: 'uppercase',
                }}
              >LEAVE REVIEW</Link>
              <button
                onClick={() => setShowReviewNudge(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9A9A9A', fontSize: '13px', fontWeight: 600, padding: '4px 8px',
                }}
              >Dismiss</button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1
              className="font-black text-[30px] leading-tight tracking-tight"
              style={{ fontFamily: "'Archivo', sans-serif", color: T.ink, letterSpacing: '-.025em', margin: 0 }}
            >
              Welcome back, Sarah
            </h1>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px 3px 8px',
              border: '1.5px solid #00BCC8',
              borderRadius: '999px',
              background: 'rgba(0,188,200,0.07)',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00BCC8" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '10.5px', letterSpacing: '.1em', textTransform: 'uppercase',
                color: '#00838C',
              }}>Verified Parent</span>
            </div>
          </div>
          <p className="text-[15px] mb-5" style={{ color: T.ink3 }}>
            Manage your sessions and track your athlete&apos;s progress
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: `${BOOKINGS.length} sessions booked` },
              { label: `${sportsSet.size} sport${sportsSet.size !== 1 ? 's' : ''}` },
            ].map(({ label }) => (
              <span
                key={label}
                className="text-[13.5px] font-semibold px-4 py-2 rounded-full"
                style={{ background: T.surface, border: `1px solid ${T.line}`, color: T.ink2 }}
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-10">

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <SectionHeading>Upcoming</SectionHeading>
                <div className="flex flex-col gap-4">
                  {upcoming.map((b, i) => (
                    <UpcomingCard key={b.id} booking={b} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Past sessions */}
            {past.length > 0 && (
              <section>
                <SectionHeading>Past sessions</SectionHeading>
                <div className="flex flex-col gap-4">
                  {past.map((b, i) => (
                    <PastCard key={b.id} booking={b} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Athletes */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1], delay: 0.35 }}
            >
              <SectionHeading>Athletes</SectionHeading>
              <Link
                href="/child/create"
                className="flex items-center gap-4 rounded-2xl p-5 no-underline transition-[border-color] duration-150"
                style={{ background: T.surface, border: `1.5px dashed ${T.line}`, color: T.ink2 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.26)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line }}
              >
                <div
                  className="flex-none flex items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: T.surface2 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[15px] mb-0.5" style={{ color: T.ink }}>Add an athlete</p>
                  <p className="text-[13px]" style={{ color: T.ink3 }}>Create a profile for your child to find the right coach</p>
                </div>
              </Link>
            </motion.section>

          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) {
          .dash-card-row {
            flex-wrap: wrap;
          }
          .dash-card-actions {
            flex-direction: row !important;
            width: 100%;
            padding-top: 12px;
            border-top: 1px solid rgba(0,0,0,0.08);
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  )
}
