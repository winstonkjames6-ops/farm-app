'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'

// ── Sport data ────────────────────────────────────────────────────────────────

type Trainer = {
  slug: string
  name: string
  initials: string
  specialty: string
  rate: number
  rating: number
  reviewCount: number
  format: string
}

type SportMeta = {
  label: string
  tagline: string
  trainerCount: number
  avgRate: number
  sessionsBooked: number
  trainers: Trainer[]
}

const SPORTS: Record<string, SportMeta> = {
  soccer: {
    label: 'Soccer',
    tagline: 'Find the trainer who unlocks your game.',
    trainerCount: 34,
    avgRate: 62,
    sessionsBooked: 1240,
    trainers: [
      { slug: 'marcus-rivera', name: 'Marcus Rivera', initials: 'MR', specialty: 'Youth Development & Shooting', rate: 65, rating: 4.9, reviewCount: 84, format: 'In-Person' },
      { slug: 'sofia-morales', name: 'Sofia Morales', initials: 'SM', specialty: 'Goalkeeping & Distribution', rate: 58, rating: 4.6, reviewCount: 18, format: 'Remote' },
      { slug: 'carlos-vega', name: 'Carlos Vega', initials: 'CV', specialty: 'Dribbling & 1v1 Skills', rate: 60, rating: 4.8, reviewCount: 42, format: 'In-Person' },
      { slug: 'nina-osei', name: 'Nina Osei', initials: 'NO', specialty: 'Defensive Positioning', rate: 55, rating: 4.7, reviewCount: 31, format: 'In-Person' },
    ],
  },
  basketball: {
    label: 'Basketball',
    tagline: 'Train with coaches who played the game at the next level.',
    trainerCount: 28,
    avgRate: 57,
    sessionsBooked: 980,
    trainers: [
      { slug: 'jamal-brooks', name: 'Jamal Brooks', initials: 'JB', specialty: 'Ball Handling & Guard Skills', rate: 55, rating: 5.0, reviewCount: 37, format: 'In-Person' },
      { slug: 'amara-diallo', name: 'Amara Diallo', initials: 'AD', specialty: 'Post Play & Rebounding', rate: 50, rating: 4.7, reviewCount: 22, format: 'In-Person' },
      { slug: 'terrell-mason', name: 'Terrell Mason', initials: 'TM', specialty: 'Shooting Form & Range', rate: 65, rating: 4.9, reviewCount: 58, format: 'Remote' },
      { slug: 'keisha-ford', name: 'Keisha Ford', initials: 'KF', specialty: 'Footwork & Finishing', rate: 52, rating: 4.8, reviewCount: 29, format: 'In-Person' },
    ],
  },
  tennis: {
    label: 'Tennis',
    tagline: 'Sharpen every shot with a certified coach in your corner.',
    trainerCount: 19,
    avgRate: 74,
    sessionsBooked: 670,
    trainers: [
      { slug: 'priya-nair', name: 'Priya Nair', initials: 'PN', specialty: 'Fundamentals & Match Strategy', rate: 75, rating: 4.8, reviewCount: 61, format: 'In-Person' },
      { slug: 'alex-novak', name: 'Alex Novak', initials: 'AN', specialty: 'Serve Mechanics & Placement', rate: 70, rating: 4.9, reviewCount: 44, format: 'In-Person' },
      { slug: 'lin-chen', name: 'Lin Chen', initials: 'LC', specialty: 'Baseline Rally & Consistency', rate: 68, rating: 4.7, reviewCount: 19, format: 'Remote' },
      { slug: 'sara-webb', name: 'Sara Webb', initials: 'SW', specialty: 'Net Play & Volleys', rate: 80, rating: 4.9, reviewCount: 33, format: 'In-Person' },
    ],
  },
  volleyball: {
    label: 'Volleyball',
    tagline: 'Elevate every aspect of your game — one session at a time.',
    trainerCount: 16,
    avgRate: 61,
    sessionsBooked: 530,
    trainers: [
      { slug: 'elena-kowalski', name: 'Elena Kowalski', initials: 'EK', specialty: 'Serving & Defensive Positioning', rate: 60, rating: 4.7, reviewCount: 29, format: 'In-Person' },
      { slug: 'mia-santos', name: 'Mia Santos', initials: 'MS', specialty: 'Setting & Offense Systems', rate: 65, rating: 4.9, reviewCount: 41, format: 'In-Person' },
      { slug: 'dani-park', name: 'Dani Park', initials: 'DP', specialty: 'Blocking & Middle Hitter', rate: 58, rating: 4.6, reviewCount: 14, format: 'Remote' },
      { slug: 'cole-reyes', name: 'Cole Reyes', initials: 'CR', specialty: 'Libero & Passing Mechanics', rate: 62, rating: 4.8, reviewCount: 22, format: 'In-Person' },
    ],
  },
  lacrosse: {
    label: 'Lacrosse',
    tagline: 'Build elite skills with coaches who live the sport.',
    trainerCount: 12,
    avgRate: 71,
    sessionsBooked: 380,
    trainers: [
      { slug: 'devin-hayes', name: 'Devin Hayes', initials: 'DH', specialty: 'Attack & Ground Balls', rate: 70, rating: 4.9, reviewCount: 52, format: 'In-Person' },
      { slug: 'kwame-asante', name: 'Kwame Asante', initials: 'KA', specialty: 'Defensive Play & Communication', rate: 72, rating: 4.8, reviewCount: 28, format: 'In-Person' },
      { slug: 'harper-cole', name: 'Harper Cole', initials: 'HC', specialty: 'Shooting & Dodging', rate: 68, rating: 4.7, reviewCount: 18, format: 'Remote' },
      { slug: 'james-wu', name: 'James Wu', initials: 'JW', specialty: 'Goalie Positioning & Clears', rate: 75, rating: 5.0, reviewCount: 11, format: 'In-Person' },
    ],
  },
  baseball: {
    label: 'Baseball',
    tagline: 'Work with coaches who have been where you want to go.',
    trainerCount: 22,
    avgRate: 79,
    sessionsBooked: 710,
    trainers: [
      { slug: 'ryan-oconnell', name: "Ryan O'Connell", initials: 'RO', specialty: 'Pitching Mechanics & Hitting', rate: 80, rating: 4.8, reviewCount: 45, format: 'In-Person' },
      { slug: 'dante-bloom', name: 'Dante Bloom', initials: 'DB', specialty: 'Catching & Framing', rate: 75, rating: 4.7, reviewCount: 20, format: 'In-Person' },
      { slug: 'ally-cross', name: 'Ally Cross', initials: 'AC', specialty: 'Infield & Ground Ball Work', rate: 70, rating: 4.9, reviewCount: 33, format: 'Remote' },
      { slug: 'omar-bell', name: 'Omar Bell', initials: 'OB', specialty: 'Outfield Routes & Arm Strength', rate: 80, rating: 4.8, reviewCount: 27, format: 'In-Person' },
    ],
  },
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

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: `1px solid ${T.border}`,
  background: T.surface2,
  color: T.ink2,
  fontFamily: hanken,
  fontSize: '13px',
  outline: 'none',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  cursor: 'pointer',
}

// ── Stars ─────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <span style={{ display: 'inline-flex', gap: '2px', verticalAlign: 'middle' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24">
          <polygon
            points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1"
            fill={i <= filled ? T.yellow : T.surface2}
            stroke={i <= filled ? T.yellow : T.border}
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  )
}

// ── Trainer card ──────────────────────────────────────────────────────────────

function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.1 + index * 0.07 }}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: 48,
            height: 48,
            background: T.surface2,
            border: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: barlow,
            fontWeight: 700,
            fontSize: '15px',
            color: T.yellow,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {trainer.initials}
        </div>
        <div>
          <div
            style={{
              fontFamily: barlow,
              fontWeight: 700,
              fontSize: '17px',
              color: T.ink,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {trainer.name}
          </div>
          <div style={{ fontFamily: hanken, fontSize: '12px', color: T.ink3, marginTop: '2px' }}>
            {trainer.specialty}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${T.border}`,
          paddingTop: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ fontFamily: barlow, fontWeight: 700, fontSize: '20px', color: T.ink }}>
            ${trainer.rate}
            <span style={{ fontFamily: hanken, fontWeight: 400, fontSize: '12px', color: T.ink3 }}>
              /hr
            </span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            <Stars rating={trainer.rating} />
            <span style={{ fontFamily: hanken, fontSize: '12px', color: T.ink3, marginLeft: '4px' }}>
              {trainer.rating} ({trainer.reviewCount})
            </span>
          </div>
        </div>
        <span
          style={{
            fontFamily: barlow,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: T.ink3,
            textTransform: 'uppercase',
            background: T.surface2,
            padding: '4px 10px',
          }}
        >
          {trainer.format}
        </span>
      </div>

      {/* CTA */}
      <Link href="/trainer/marcus-rivera" style={{ textDecoration: 'none' }}>
        <button
          style={{
            width: '100%',
            padding: '11px',
            background: 'transparent',
            border: `1px solid ${T.yellow}`,
            color: T.yellow,
            fontFamily: barlow,
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          View Profile
        </button>
      </Link>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SportPage() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : 'soccer'
  const sport = SPORTS[slug] ?? SPORTS.soccer

  const [filters, setFilters] = useState({
    location: '',
    rate: '',
    ageGroup: '',
    availability: '',
  })

  function setFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: '80px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          padding: '56px 20px 48px',
          maxWidth: 860,
          margin: '0 auto',
        }}
      >
        {/* Back */}
        <Link
          href="/search"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: barlow,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: T.ink3,
            textDecoration: 'none',
            textTransform: 'uppercase',
            marginBottom: '36px',
          }}
        >
          ← All Sports
        </Link>

        <h1
          style={{
            fontFamily: barlow,
            fontWeight: 800,
            fontSize: 'clamp(52px, 10vw, 96px)',
            color: T.ink,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 0.95,
            margin: '0 0 16px',
          }}
        >
          {sport.label}
        </h1>

        {/* Yellow accent line */}
        <div style={{ width: 56, height: 3, background: T.yellow, marginBottom: '20px' }} />

        <p
          style={{
            fontFamily: hanken,
            fontSize: '17px',
            color: T.ink2,
            lineHeight: 1.55,
            margin: 0,
            maxWidth: 480,
          }}
        >
          {sport.tagline}
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          borderTop: `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          padding: '0 20px',
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            display: 'flex',
            gap: '0',
          }}
        >
          {[
            { label: 'Trainers Available', value: `${sport.trainerCount}` },
            { label: 'Average Rate', value: `$${sport.avgRate}/hr` },
            { label: 'Sessions Booked', value: sport.sessionsBooked.toLocaleString() },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: '18px 20px',
                borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: barlow,
                  fontWeight: 800,
                  fontSize: '26px',
                  color: T.yellow,
                  letterSpacing: '-0.01em',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: barlow,
                  fontWeight: 700,
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: T.ink3,
                  textTransform: 'uppercase',
                  marginTop: '2px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 0' }}>
        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.15 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '10px',
            marginBottom: '36px',
          }}
        >
          {[
            {
              key: 'location',
              label: 'Location',
              options: ['Any location', 'Austin, TX', 'Dallas, TX', 'Houston, TX'],
            },
            {
              key: 'rate',
              label: 'Rate',
              options: ['Any price', 'Up to $50/hr', 'Up to $75/hr', '$100+/hr'],
            },
            {
              key: 'ageGroup',
              label: 'Age Group',
              options: ['Any age', 'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Adult'],
            },
            {
              key: 'availability',
              label: 'Availability',
              options: ['Any time', 'This Weekend', 'This Week', 'Next Week'],
            },
          ].map((f) => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontFamily: barlow,
                  fontWeight: 700,
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: T.ink3,
                  textTransform: 'uppercase',
                }}
              >
                {f.label}
              </label>
              <select
                value={filters[f.key as keyof typeof filters]}
                onChange={(e) => setFilter(f.key, e.target.value)}
                style={selectStyle}
              >
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </motion.div>

        {/* Section label */}
        <div
          style={{
            fontFamily: barlow,
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: T.ink3,
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Featured Trainers
        </div>

        {/* Trainer grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {sport.trainers.map((trainer, i) => (
            <TrainerCard key={trainer.slug} trainer={trainer} index={i} />
          ))}
        </div>

        {/* See all CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/search" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '14px 36px',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                color: T.ink2,
                fontFamily: barlow,
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              See All {sport.label} Trainers →
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
