'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Mock data ─────────────────────────────────────────────────────────────────

const CLUB = {
  name: 'Bethesda SC',
  sport: 'Soccer',
  athleteCount: 24,
}

const TRAINERS = [
  {
    id: 1,
    slug: 'marcus-rivera',
    name: 'Marcus Rivera',
    initials: 'MR',
    specialty: 'Youth Development & Shooting',
    sessionsWithClub: 18,
    rating: 4.9,
    reviewCount: 84,
  },
  {
    id: 2,
    slug: 'sofia-morales',
    name: 'Sofia Morales',
    initials: 'SM',
    specialty: 'Goalkeeping & Distribution',
    sessionsWithClub: 9,
    rating: 4.6,
    reviewCount: 18,
  },
  {
    id: 3,
    slug: 'carlos-vega',
    name: 'Carlos Vega',
    initials: 'CV',
    specialty: 'Dribbling & 1v1 Skills',
    sessionsWithClub: 14,
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: 4,
    slug: 'nina-osei',
    name: 'Nina Osei',
    initials: 'NO',
    specialty: 'Defensive Positioning',
    sessionsWithClub: 6,
    rating: 4.7,
    reviewCount: 31,
  },
  {
    id: 5,
    slug: 'devin-hayes',
    name: 'Devin Hayes',
    initials: 'DH',
    specialty: 'Conditioning & Footwork',
    sessionsWithClub: 11,
    rating: 4.9,
    reviewCount: 52,
  },
]

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

function TrainerCard({ trainer, index }: { trainer: typeof TRAINERS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.08 + index * 0.07 }}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: 52,
            height: 52,
            background: T.surface2,
            border: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: barlow,
            fontWeight: 700,
            fontSize: '16px',
            color: T.yellow,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {trainer.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: barlow,
              fontWeight: 700,
              fontSize: '18px',
              color: T.ink,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {trainer.name}
          </div>
          <div
            style={{
              fontFamily: hanken,
              fontSize: '12px',
              color: T.ink3,
              marginTop: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {trainer.specialty}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          border: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            padding: '12px 14px',
            borderRight: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              fontFamily: barlow,
              fontWeight: 800,
              fontSize: '22px',
              color: T.ink,
              letterSpacing: '-0.01em',
            }}
          >
            {trainer.sessionsWithClub}
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
            Club Sessions
          </div>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            <Stars rating={trainer.rating} />
          </div>
          <div
            style={{
              fontFamily: hanken,
              fontSize: '12px',
              color: T.ink3,
            }}
          >
            {trainer.rating} · {trainer.reviewCount} reviews
          </div>
        </div>
      </div>

      {/* Book button */}
      <Link href="/booking" style={{ textDecoration: 'none' }}>
        <button
          style={{
            width: '100%',
            padding: '12px',
            background: T.yellow,
            border: 'none',
            color: '#09090B',
            fontFamily: barlow,
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Book Session
        </button>
      </Link>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RosterPage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: '80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 0' }}>
        {/* Back */}
        <Link
          href="/dashboard"
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
          ← Dashboard
        </Link>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '32px' }}
        >
          <h1
            style={{
              fontFamily: barlow,
              fontWeight: 800,
              fontSize: 'clamp(44px, 9vw, 80px)',
              color: T.ink,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              margin: '0 0 12px',
            }}
          >
            Team
            <br />
            Roster
          </h1>
          <p
            style={{
              fontFamily: hanken,
              fontSize: '15px',
              color: T.ink2,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            FARM-verified trainers working with your club.
          </p>
        </motion.div>

        {/* Club info bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            padding: '0',
            display: 'flex',
            marginBottom: '36px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Club', value: CLUB.name },
            { label: 'Sport', value: CLUB.sport },
            { label: 'Athletes', value: `${CLUB.athleteCount} members` },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: '16px 24px',
                borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                flex: '1 1 120px',
              }}
            >
              <div
                style={{
                  fontFamily: barlow,
                  fontWeight: 700,
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: T.ink3,
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                {item.label}
              </div>
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
                {item.value}
              </div>
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
          {TRAINERS.length} Trainers on Roster
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
          {TRAINERS.map((trainer, i) => (
            <TrainerCard key={trainer.id} trainer={trainer} index={i} />
          ))}
        </div>

        {/* Suggest a trainer */}
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            paddingTop: '28px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: hanken,
              fontSize: '14px',
              color: T.ink3,
            }}
          >
            Want to add a trainer to your roster?{' '}
          </span>
          <Link
            href="#"
            style={{
              fontFamily: barlow,
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.06em',
              color: T.yellow,
              textDecoration: 'none',
              textTransform: 'uppercase',
              borderBottom: `1px solid ${T.yellow}`,
              paddingBottom: '1px',
            }}
          >
            → Suggest a Trainer
          </Link>
        </div>
      </div>
    </div>
  )
}
