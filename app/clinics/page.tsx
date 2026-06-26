'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Design tokens ──────────────────────────────────────────────────────────
const D = {
  bg:        '#09090B',
  surface:   '#111113',
  surface2:  '#18181B',
  border:    'rgba(255,255,255,0.08)',
  accent:    '#00BCC8',
  accentDim: 'rgba(0,188,200,0.10)',
  muted:     'rgba(255,255,255,0.40)',
  muted2:    'rgba(255,255,255,0.20)',
  text:      '#F0F0F0',
} as const

// ── Sport stripe colors — the aesthetic signature of these pages ───────────
const SPORT_STRIPE: Record<string, string> = {
  Basketball: '#F97316',
  Soccer:     '#22C55E',
  Tennis:     '#A78BFA',
  Volleyball: '#38BDF8',
  Lacrosse:   '#FB7185',
}

// ── Mock data ──────────────────────────────────────────────────────────────
const CLINICS = [
  {
    id: 1,
    name: 'Summer Shooting Clinic',
    trainer: 'Coach Wells',
    sport: 'Basketball',
    dateRange: 'Jul 14–16',
    location: 'In-Person · Newark, NJ',
    ageGroup: 'U12–U16',
    price: 120,
    spotsTotal: 20,
    spotsLeft: 8,
    soldOut: false,
  },
  {
    id: 2,
    name: 'Technical Touch Camp',
    trainer: 'Marcus Reid',
    sport: 'Soccer',
    dateRange: 'Jul 21–23',
    location: 'In-Person · Brooklyn, NY',
    ageGroup: 'U10–U14',
    price: 95,
    spotsTotal: 16,
    spotsLeft: 4,
    soldOut: false,
  },
  {
    id: 3,
    name: 'Remote Serve & Return',
    trainer: 'Lisa Chen',
    sport: 'Tennis',
    dateRange: 'Aug 4–5',
    location: 'Remote',
    ageGroup: 'U14–U18',
    price: 75,
    spotsTotal: 12,
    spotsLeft: 0,
    soldOut: true,
  },
  {
    id: 4,
    name: 'Elite Volleyball Intensive',
    trainer: 'Jordan Park',
    sport: 'Volleyball',
    dateRange: 'Aug 11–13',
    location: 'In-Person · Jersey City, NJ',
    ageGroup: 'U16–U18',
    price: 140,
    spotsTotal: 10,
    spotsLeft: 3,
    soldOut: false,
  },
]

const SPORT_PILLS    = ['All', 'Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Lacrosse']
const LOCATION_PILLS = ['All', 'In-Person', 'Remote']
const DATE_PILLS     = ['All', 'This Week', 'This Month', 'July', 'August']

// ── Shared styles ──────────────────────────────────────────────────────────
const barlow = "'Barlow Condensed', sans-serif"
const hanken  = "'Hanken Grotesk', sans-serif"

function pillStyle(active: boolean) {
  return {
    display: 'inline-block',
    padding: '5px 12px',
    fontFamily: barlow,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '.1em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    border: active ? 'none' : `1px solid ${D.muted2}`,
    background: active ? D.accent : 'transparent',
    color: active ? D.bg : D.muted,
    transition: 'background .14s ease, color .14s ease, border-color .14s ease',
    userSelect: 'none' as const,
  }
}

function metaBadge(label: string) {
  return (
    <span
      key={label}
      style={{
        fontFamily: barlow,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        background: D.surface2,
        border: `1px solid ${D.border}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: D.muted,
      }}
    >
      {label}
    </span>
  )
}

// ── Nav ────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: D.bg,
        borderBottom: `1px solid ${D.border}`,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: barlow,
            fontWeight: 800,
            fontSize: '22px',
            letterSpacing: '.04em',
            color: D.accent,
            textDecoration: 'none',
          }}
        >
          FARM
        </Link>
        <Link
          href="/search"
          style={{
            fontFamily: hanken,
            fontSize: '14px',
            color: D.muted,
            textDecoration: 'none',
            transition: 'color .14s ease',
          }}
        >
          Find a trainer →
        </Link>
      </div>
    </nav>
  )
}

// ── Filter group ────────────────────────────────────────────────────────────
function FilterGroup({
  label,
  options,
  active,
  onSelect,
}: {
  label: string
  options: string[]
  active: string
  onSelect: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span
        style={{
          fontFamily: barlow,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: D.muted2,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              ...pillStyle(active === opt),
              background: active === opt ? D.accent : 'transparent',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Clinic card ─────────────────────────────────────────────────────────────
function ClinicCard({ clinic }: { clinic: typeof CLINICS[number] }) {
  const stripe = SPORT_STRIPE[clinic.sport] ?? D.muted2

  return (
    <div
      style={{
        background: D.surface,
        border: `1px solid ${D.border}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sport stripe — the aesthetic risk: a left-edge color bar encodes sport identity */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          bottom: 0,
          background: stripe,
        }}
      />

      {/* Left */}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: '8px' }}>
        <div
          style={{
            fontFamily: barlow,
            fontSize: '22px',
            fontWeight: 700,
            color: D.text,
            marginBottom: '4px',
            lineHeight: 1.1,
          }}
        >
          {clinic.name}
        </div>
        <div
          style={{
            fontFamily: hanken,
            fontSize: '13px',
            color: D.muted,
          }}
        >
          by {clinic.trainer}
        </div>

        {/* Meta badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '12px',
          }}
        >
          {metaBadge(clinic.sport)}
          {metaBadge(clinic.dateRange)}
          {metaBadge(clinic.location)}
          {metaBadge(clinic.ageGroup)}
        </div>

        {/* Spots */}
        <div style={{ marginTop: '8px' }}>
          {clinic.soldOut ? (
            <span
              style={{
                fontFamily: barlow,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: '#EF4444',
              }}
            >
              SOLD OUT
            </span>
          ) : (
            <span
              style={{
                fontFamily: hanken,
                fontSize: '12px',
                color: D.muted,
              }}
            >
              {clinic.spotsLeft} spot{clinic.spotsLeft !== 1 ? 's' : ''} left
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '6px',
          flex: 'none',
        }}
      >
        <div
          style={{
            fontFamily: barlow,
            fontSize: '28px',
            fontWeight: 800,
            color: D.accent,
            lineHeight: 1,
          }}
        >
          ${clinic.price}
        </div>
        <div
          style={{
            fontFamily: hanken,
            fontSize: '12px',
            color: D.muted,
          }}
        >
          per athlete
        </div>

        {clinic.soldOut ? (
          <button
            disabled
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              fontFamily: barlow,
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              background: 'transparent',
              border: `1px solid ${D.muted2}`,
              color: D.muted,
              cursor: 'not-allowed',
              opacity: 0.6,
            }}
          >
            SOLD OUT
          </button>
        ) : (
          <button
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              fontFamily: barlow,
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              background: D.accent,
              border: 'none',
              color: D.bg,
              cursor: 'pointer',
              transition: 'opacity .14s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            REGISTER
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ClinicsPage() {
  const [sportFilter,    setSportFilter]    = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [dateFilter,     setDateFilter]     = useState('All')

  const filtered = CLINICS.filter((c) => {
    if (sportFilter    !== 'All' && c.sport    !== sportFilter) return false
    if (locationFilter !== 'All') {
      if (locationFilter === 'In-Person' && !c.location.startsWith('In-Person')) return false
      if (locationFilter === 'Remote'    && c.location !== 'Remote') return false
    }
    if (dateFilter !== 'All') {
      if (dateFilter === 'July'       && !c.dateRange.startsWith('Jul')) return false
      if (dateFilter === 'August'     && !c.dateRange.startsWith('Aug')) return false
      if (dateFilter === 'This Week'  && !c.dateRange.startsWith('Jul 14')) return false
      if (dateFilter === 'This Month' && !c.dateRange.startsWith('Jul')) return false
    }
    return true
  })

  const listVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.09 } },
  }
  const itemVariants = {
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.2, 0.7, 0.2, 1] } },
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: D.bg,
        color: D.text,
        fontFamily: hanken,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Nav />

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.2, 0.7, 0.2, 1] }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '24px',
            marginBottom: '36px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: barlow,
                fontSize: 'clamp(32px,6vw,52px)',
                fontWeight: 800,
                letterSpacing: '.02em',
                textTransform: 'uppercase',
                margin: '0 0 8px',
                color: D.text,
                lineHeight: 1,
              }}
            >
              Clinics & Camps
            </h1>
            <p
              style={{
                fontFamily: hanken,
                fontSize: '16px',
                color: D.muted,
                margin: 0,
              }}
            >
              One-time group events posted by FARM trainers.
            </p>
          </div>

          <Link
            href="/clinics/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: barlow,
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: `1.5px solid ${D.accent}`,
              color: D.accent,
              background: 'transparent',
              textDecoration: 'none',
              transition: 'background .14s ease',
              alignSelf: 'flex-start',
              marginTop: '6px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = D.accentDim }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
          >
            POST A CLINIC
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px',
            padding: '20px',
            background: D.surface,
            border: `1px solid ${D.border}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <FilterGroup
            label="Sport"
            options={SPORT_PILLS}
            active={sportFilter}
            onSelect={setSportFilter}
          />
          <FilterGroup
            label="Location"
            options={LOCATION_PILLS}
            active={locationFilter}
            onSelect={setLocationFilter}
          />
          <FilterGroup
            label="Date"
            options={DATE_PILLS}
            active={dateFilter}
            onSelect={setDateFilter}
          />
        </motion.div>

        {/* Results count */}
        <div
          style={{
            fontFamily: hanken,
            fontSize: '13px',
            color: D.muted,
            marginBottom: '16px',
          }}
        >
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Clinic list */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              fontFamily: hanken,
              fontSize: '15px',
              color: D.muted,
              border: `1px solid ${D.border}`,
            }}
          >
            No clinics match your filters.{' '}
            <button
              onClick={() => {
                setSportFilter('All')
                setLocationFilter('All')
                setDateFilter('All')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: D.accent,
                cursor: 'pointer',
                fontFamily: hanken,
                fontSize: '15px',
                padding: 0,
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {filtered.map((clinic) => (
              <motion.div key={clinic.id} variants={itemVariants}>
                <ClinicCard clinic={clinic} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
