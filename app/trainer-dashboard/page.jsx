'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Mock data ────────────────────────────────────────────────────────────────

const BOOKINGS = [
  {
    id: 1,
    parentName: 'James Okafor',
    parentInitials: 'JO',
    sport: 'Soccer',
    date: 'Monday, Jun 23',
    time: '9:00 AM',
    format: 'In-Person',
    status: 'upcoming',
    amountEarned: 65,
  },
  {
    id: 2,
    parentName: 'Linda Park',
    parentInitials: 'LP',
    sport: 'Tennis',
    date: 'Saturday, Jun 14',
    time: '11:00 AM',
    format: 'In-Person',
    status: 'completed',
    amountEarned: 60,
  },
  {
    id: 3,
    parentName: 'Darius Webb',
    parentInitials: 'DW',
    sport: 'Basketball',
    date: 'Wednesday, Jun 4',
    time: '4:00 PM',
    format: 'Remote Video',
    status: 'completed',
    amountEarned: 55,
  },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ACTIVE_DAYS = new Set(['Mon', 'Wed', 'Fri', 'Sat'])

// ── Analytics design tokens ───────────────────────────────────────────────────

const A = {
  bg: '#09090B',
  surface: '#111113',
  border: 'rgba(255,255,255,0.08)',
  accent: '#00BCC8',
  muted: 'rgba(255,255,255,0.40)',
  text: '#EFEFEF',
}

const SPARKLINE_DATA = [18, 32, 25, 40, 38, 55, 76]
const SPARK_MAX = Math.max(...SPARKLINE_DATA)
const SPARK_H = 32
const BAR_W = 8
const BAR_GAP = 3

const analyticsContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
const analyticsCard = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.2, 0.7, 0.2, 1] } },
}

// ── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg: '#09090B',
  surface: '#111113',
  surface2: '#18181B',
  ink: '#F0F0F0',
  ink2: 'rgba(255,255,255,0.60)',
  ink3: 'rgba(255,255,255,0.40)',
  line: 'rgba(255,255,255,0.08)',
  accent: '#00BCC8',
  accentInk: '#09090B',
  green: '#22C55E',
  greenSurface: 'rgba(34,197,94,0.10)',
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ initials }) {
  return (
    <div
      className="flex-none flex items-center justify-center font-black"
      style={{
        width: 48, height: 48,
        background: T.accent,
        color: T.accentInk,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 17,
        flexShrink: 0,
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
      className="text-[11px] font-bold uppercase px-2 py-[3px]"
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        background: 'rgba(0,188,200,0.10)',
        color: T.accent,
        border: '1px solid rgba(0,188,200,0.20)',
        letterSpacing: '.1em',
      }}
    >
      {sport}
    </span>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <h2
      className="text-[13px] font-bold uppercase mb-4"
      style={{ color: T.ink3, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.14em' }}
    >
      {children}
    </h2>
  )
}

// ── Upcoming session card ─────────────────────────────────────────────────────

function UpcomingCard({ booking, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 + index * 0.08 }}
      className="p-6"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div className="td-card-row flex items-start gap-4">
        <Avatar initials={booking.parentInitials} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="font-bold text-[17px] leading-tight"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: T.ink }}
            >
              {booking.parentName}
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

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className="inline-block text-[12.5px] font-semibold px-3 py-1"
              style={{ border: `1px solid ${T.line}`, color: T.ink2 }}
            >
              {booking.format}
            </span>
            <span
              className="inline-block text-[12.5px] font-bold px-3 py-1"
              style={{ background: T.greenSurface, color: '#4ade80' }}
            >
              +${booking.amountEarned}
            </span>
          </div>
        </div>

        <div className="td-card-actions flex-none flex flex-col items-end gap-2 pt-1">
          <button
            className="font-bold text-sm px-5 py-2.5 transition-[border-color] duration-150"
            style={{ background: 'transparent', color: T.ink2, border: `1px solid ${T.line}`, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.08em' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line }}
          >
            Message parent
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
      className="p-6"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div className="flex items-start gap-4">
        <Avatar initials={booking.parentInitials} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="font-bold text-[17px] leading-tight"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: T.ink }}
            >
              {booking.parentName}
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
        </div>

        <div className="flex-none pt-1">
          <span
            className="inline-block text-[13px] font-bold px-4 py-2"
            style={{ background: T.greenSurface, color: '#4ade80' }}
          >
            +${booking.amountEarned}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Availability section ──────────────────────────────────────────────────────

function AvailabilitySection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1], delay: 0.45 }}
    >
      <SectionHeading>Your availability</SectionHeading>
      <div
        className="p-6"
        style={{ background: T.surface, border: `1px solid ${T.line}` }}
      >
        <div className="flex flex-wrap gap-2 mb-5">
          {DAYS.map((day) => {
            const active = ACTIVE_DAYS.has(day)
            return (
              <button
                key={day}
                className="text-[13px] font-bold px-4 py-2 transition-all duration-150"
                style={
                  active
                    ? { background: T.accent, color: T.accentInk, border: `1px solid ${T.accent}`, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.1em' }
                    : { background: 'transparent', color: T.ink3, border: `1px solid ${T.line}`, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.1em' }
                }
              >
                {day}
              </button>
            )
          })}
        </div>
        <button
          className="text-[13px] font-bold px-5 py-2.5 transition-[border-color] duration-150"
          style={{ background: 'transparent', border: `1px solid ${T.line}`, color: T.ink2, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.1em' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line }}
        >
          Edit Availability
        </button>
      </div>
    </motion.section>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline() {
  const svgW = SPARKLINE_DATA.length * BAR_W + (SPARKLINE_DATA.length - 1) * BAR_GAP
  return (
    <svg width={svgW} height={SPARK_H + 4} viewBox={`0 0 ${svgW} ${SPARK_H + 4}`} aria-hidden="true">
      {SPARKLINE_DATA.map((val, i) => {
        const barH = Math.max(2, Math.round((val / SPARK_MAX) * SPARK_H))
        const x = i * (BAR_W + BAR_GAP)
        const y = SPARK_H - barH + 2
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={BAR_W}
            height={barH}
            fill={i === SPARKLINE_DATA.length - 1 ? A.accent : 'rgba(255,255,255,0.15)'}
          />
        )
      })}
    </svg>
  )
}

// ── Analytics section ─────────────────────────────────────────────────────────

function AnalyticsSection() {
  return (
    <section style={{ background: A.bg }}>
      <div className="max-w-2xl mx-auto px-6 py-12">

        <h2
          className="text-[30px] font-bold uppercase mb-8"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.text, letterSpacing: '.06em' }}
        >
          Your Analytics
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={analyticsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >

          {/* Card 1 — Profile Views */}
          <motion.div
            variants={analyticsCard}
            className="p-6"
            style={{ background: A.surface, border: `1px solid ${A.border}` }}
          >
            <p
              className="text-[11px] font-bold uppercase mb-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted, letterSpacing: '.14em' }}
            >
              Profile Views
            </p>
            <p
              className="text-[56px] font-bold leading-none mb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.accent }}
            >
              284
            </p>
            <p className="text-[13px] mb-5" style={{ color: A.muted }}>+12 this week</p>
            <Sparkline />
          </motion.div>

          {/* Card 2 — Booking Conversion */}
          <motion.div
            variants={analyticsCard}
            className="p-6"
            style={{ background: A.surface, border: `1px solid ${A.border}` }}
          >
            <p
              className="text-[11px] font-bold uppercase mb-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted, letterSpacing: '.14em' }}
            >
              Booking Conversion
            </p>
            <p
              className="text-[56px] font-bold leading-none mb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.accent }}
            >
              18%
            </p>
            <p className="text-[13px] mb-5" style={{ color: A.muted }}>284 views → 51 bookings</p>
            <div className="h-[5px] w-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
              <div className="h-full" style={{ width: '18%', background: A.accent }} />
            </div>
          </motion.div>

          {/* Card 3 — Earnings Forecast */}
          <motion.div
            variants={analyticsCard}
            className="p-6"
            style={{ background: A.surface, border: `1px solid ${A.border}` }}
          >
            <p
              className="text-[11px] font-bold uppercase mb-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted, letterSpacing: '.14em' }}
            >
              Projected This Month
            </p>
            <p
              className="text-[56px] font-bold leading-none mb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.accent }}
            >
              $2,340
            </p>
            <p className="text-[13px] mb-5" style={{ color: A.muted }}>Based on 12 confirmed sessions</p>
            <div className="flex gap-6">
              <div>
                <p
                  className="text-[10px] uppercase mb-1"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted, letterSpacing: '.12em' }}
                >
                  This week
                </p>
                <p
                  className="text-[22px] font-bold"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.text }}
                >
                  $480
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] uppercase mb-1"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted, letterSpacing: '.12em' }}
                >
                  Last month
                </p>
                <p
                  className="text-[22px] font-bold"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.text }}
                >
                  $1,890
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4 — Review Sentiment */}
          <motion.div
            variants={analyticsCard}
            className="p-6"
            style={{ background: A.surface, border: `1px solid ${A.border}` }}
          >
            <p
              className="text-[11px] font-bold uppercase mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted, letterSpacing: '.14em' }}
            >
              Review Sentiment
            </p>
            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: 'Positive', pct: 78, fill: A.accent },
                { label: 'Neutral',  pct: 16, fill: 'rgba(255,255,255,0.50)' },
                { label: 'Negative', pct: 6,  fill: '#7F1D1D' },
              ].map(({ label, pct, fill }) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="w-[62px] text-[12px] flex-none"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted }}
                  >
                    {label}
                  </span>
                  <div className="flex-1 h-[5px]" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full" style={{ width: `${pct}%`, background: fill }} />
                  </div>
                  <span
                    className="w-8 text-right text-[12px] flex-none"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted }}
                  >
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[12px] mb-4" style={{ color: A.muted }}>Based on 43 reviews</p>
            <blockquote
              className="pl-3 text-[13px] leading-snug"
              style={{ borderLeft: `2px solid ${A.accent}`, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}
            >
              &ldquo;Marcus completely transformed my son&apos;s first touch.&rdquo;
              <span
                className="not-italic block mt-1.5 text-[10px] uppercase tracking-wider"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: A.muted, letterSpacing: '.12em' }}
              >
                — Parent, U14 Soccer
              </span>
            </blockquote>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TrainerDashboardPage() {
  const upcoming = BOOKINGS.filter((b) => b.status === 'upcoming')
  const past = BOOKINGS.filter((b) => b.status === 'completed')
  const totalEarned = BOOKINGS.reduce((sum, b) => sum + b.amountEarned, 0)

  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: T.bg, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: T.bg,
          borderColor: T.line,
        }}
      >
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span
              className="font-black"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: T.accent, letterSpacing: '.04em' }}
            >
              FARM
            </span>
          </Link>
          <Link
            href="/search"
            className="text-sm font-semibold px-4 py-2 no-underline transition-[border-color] duration-150"
            style={{ border: `1px solid ${T.line}`, color: T.ink2 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line }}
          >
            View profile
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-10 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
          className="mb-8"
        >
          <div className="td-header-row flex items-center gap-4 mb-3">
            <Avatar initials="MR" />
            <div>
              <h1
                className="td-heading font-black leading-tight"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 800, color: T.ink, letterSpacing: '.02em', textTransform: 'uppercase', margin: 0 }}
              >
                Welcome back, Marcus
              </h1>
              <p className="text-[15px]" style={{ color: T.ink3, margin: 0 }}>
                Here&apos;s what&apos;s on your schedule
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { label: `${BOOKINGS.length} sessions` },
              { label: `$${totalEarned} earned` },
              { label: '4.9 rating' },
            ].map(({ label }) => (
              <span
                key={label}
                className="text-[12px] font-bold px-4 py-2"
                style={{ background: T.surface, border: `1px solid ${T.line}`, color: T.ink2, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.08em', textTransform: 'uppercase' }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Trainer actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/clinics/create"
              className="inline-block no-underline text-[13px] font-bold px-4 py-2"
              style={{
                border: `1.5px solid #00BCC8`,
                color: '#00BCC8',
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              + Create Clinic
            </Link>
          </div>
        </motion.div>

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

          {/* Availability */}
          <AvailabilitySection />

        </div>
      </main>

      <AnalyticsSection />

      <style>{`
        @media (max-width: 480px) {
          .td-card-row {
            flex-wrap: wrap;
          }
          .td-card-actions {
            flex-direction: row !important;
            width: 100%;
            padding-top: 12px;
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .td-header-row {
            flex-wrap: wrap;
          }
          .td-heading {
            font-size: clamp(28px, 7vw, 40px) !important;
          }
        }
      `}</style>
    </div>
  )
}
