'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Data ──────────────────────────────────────────────────────────────────────

const TRAINERS = [
  {
    id: 1, slug: 'marcus-rivera', name: 'Marcus Rivera', sport: 'Soccer',
    specialty: 'Youth Development & Shooting Technique', location: 'Austin, TX',
    rate: 65, rating: 4.9, reviewCount: 84, formats: ['In-Person', 'Remote Video'],
    credentials: 'USSF B License · 6 yrs coaching', initials: 'MR',
    positions: ['Midfielder', 'Striker'],
    ageGroups: ['U8', 'U10', 'U12', 'U14', 'U16'],
    availability: 'This Weekend',
  },
  {
    id: 2, slug: 'priya-nair', name: 'Priya Nair', sport: 'Tennis',
    specialty: 'Fundamentals & Match Strategy', location: 'Austin, TX',
    rate: 75, rating: 4.8, reviewCount: 61, formats: ['In-Person'],
    credentials: 'USPTA Certified · Former D1 player', initials: 'PN',
    positions: ['All Positions'],
    ageGroups: ['U12', 'U14', 'U16', 'U18', 'Adult'],
    availability: 'This Week',
  },
  {
    id: 3, slug: 'jamal-brooks', name: 'Jamal Brooks', sport: 'Basketball',
    specialty: 'Ball Handling & Guard Skills', location: 'Austin, TX',
    rate: 55, rating: 5.0, reviewCount: 37, formats: ['In-Person', 'Remote Video'],
    credentials: 'AAU Coach · Former college starter', initials: 'JB',
    positions: ['Point Guard', 'Shooting Guard'],
    ageGroups: ['U10', 'U12', 'U14', 'U16'],
    availability: 'This Weekend',
  },
  {
    id: 4, slug: 'elena-kowalski', name: 'Elena Kowalski', sport: 'Volleyball',
    specialty: 'Serving & Defensive Positioning', location: 'Austin, TX',
    rate: 60, rating: 4.7, reviewCount: 29, formats: ['In-Person'],
    credentials: 'AVP Certified · Club coach 4 yrs', initials: 'EK',
    positions: ['Libero', 'Outside Hitter'],
    ageGroups: ['U12', 'U14', 'U16', 'U18'],
    availability: 'Next Week',
  },
  {
    id: 5, slug: 'devin-hayes', name: 'Devin Hayes', sport: 'Lacrosse',
    specialty: 'Attack & Ground Balls', location: 'Austin, TX',
    rate: 70, rating: 4.9, reviewCount: 52, formats: ['In-Person', 'Remote Video'],
    credentials: 'USA Lacrosse Level 2 · 5 yrs exp', initials: 'DH',
    positions: ['Attack', 'Midfield'],
    ageGroups: ['U10', 'U12', 'U14', 'U16', 'U18'],
    availability: 'This Weekend',
  },
  {
    id: 6, slug: 'sofia-morales', name: 'Sofia Morales', sport: 'Soccer',
    specialty: 'Goalkeeping & Distribution', location: 'Austin, TX',
    rate: 58, rating: 4.6, reviewCount: 18, formats: ['Remote Video'],
    credentials: 'USSF GK Specialist · 3 yrs coaching', initials: 'SM',
    positions: ['Goalkeeper'],
    ageGroups: ['U8', 'U10', 'U12', 'U14'],
    availability: 'This Week',
  },
  {
    id: 7, slug: 'ryan-oconnell', name: "Ryan O'Connell", sport: 'Baseball',
    specialty: 'Pitching Mechanics & Hitting', location: 'Austin, TX',
    rate: 80, rating: 4.8, reviewCount: 45, formats: ['In-Person'],
    credentials: 'ABCA Member · Former minor leaguer', initials: 'RO',
    positions: ['Pitcher', 'Outfielder'],
    ageGroups: ['U12', 'U14', 'U16', 'U18', 'Adult'],
    availability: 'Next Week',
  },
  {
    id: 8, slug: 'amara-diallo', name: 'Amara Diallo', sport: 'Basketball',
    specialty: 'Post Play & Rebounding', location: 'Austin, TX',
    rate: 50, rating: 4.7, reviewCount: 22, formats: ['In-Person', 'Remote Video'],
    credentials: 'IBCA Certified · Youth league head coach', initials: 'AD',
    positions: ['Forward', 'Center'],
    ageGroups: ['U8', 'U10', 'U12', 'U14'],
    availability: 'This Week',
  },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const SPORTS = ['Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Lacrosse', 'Baseball']
const FORMATS = ['In-Person', 'Remote Video']
const RATE_OPTIONS = [
  { label: 'Any price', max: Infinity },
  { label: 'Up to $40/hr', max: 40 },
  { label: 'Up to $60/hr', max: 60 },
  { label: 'Up to $80/hr', max: 80 },
  { label: '$100+/hr', max: Infinity, min: 100 },
]
const SORT_OPTIONS = [
  { value: 'reviewed', label: 'Most reviewed' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'rated', label: 'Highest rated' },
]
const POSITIONS_BY_SPORT = {
  Soccer: ['Goalkeeper', 'Defender', 'Midfielder', 'Striker'],
  Basketball: ['Point Guard', 'Shooting Guard', 'Forward', 'Center'],
  Tennis: ['All Positions'],
  Volleyball: ['Setter', 'Libero', 'Outside Hitter', 'Middle Blocker'],
  Lacrosse: ['Attack', 'Midfield', 'Defense', 'Goalkeeper'],
  Baseball: ['Pitcher', 'Catcher', 'Infielder', 'Outfielder'],
}
const AGE_GROUPS = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Adult']
const AVAILABILITY_OPTIONS = ['This Weekend', 'This Week', 'Next Week']

// ── Design tokens ─────────────────────────────────────────────────────────────

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

const ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.40)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`

const selectStyle = {
  width: '100%', padding: '9px 32px 9px 12px',
  border: '1px solid rgba(0,0,0,0.08)', background: '#FFFFFF',
  fontFamily: hanken, fontSize: '13.5px', color: '#1A1A1A',
  cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light',
}

const labelStyle = {
  display: 'block', fontFamily: barlow, fontWeight: 700,
  fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase',
  color: '#9A9A9A', marginBottom: '8px',
}

const divider = { height: '1px', background: 'rgba(0,0,0,0.08)' }

// ── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#00BCC8' : 'none'}
          stroke="#00BCC8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1" />
        </svg>
      ))}
    </span>
  )
}

// ── TrainerCard ───────────────────────────────────────────────────────────────

function TrainerCard({ trainer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.07 }}
      style={{ height: '100%' }}
    >
      <Link href={`/trainer/${trainer.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          className="glass"
          style={{
            borderRadius: '16px',
            padding: '24px', height: '100%', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', gap: '16px',
            transition: 'border-color .15s ease', cursor: 'pointer',
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)' }}
        >
          {/* Header row: avatar + name + rate */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', flexShrink: 0,
              background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: barlow, fontWeight: 800, fontSize: '17px',
              color: '#FFFFFF',
            }}>
              {trainer.initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: barlow, fontWeight: 700, fontSize: '18px', color: '#1A1A1A', lineHeight: 1.2 }}>
                  {trainer.name}
                </span>
                <span style={{
                  fontFamily: barlow, fontSize: '11px', fontWeight: 700,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  background: 'rgba(0,188,200,0.10)', color: '#00BCC8',
                  border: '1px solid rgba(0,188,200,0.20)', padding: '2px 8px',
                }}>{trainer.sport}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.40)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontFamily: hanken, fontSize: '13px', color: '#9A9A9A' }}>{trainer.location}</span>
              </div>
            </div>

            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontFamily: barlow, fontWeight: 800, fontSize: '22px', color: '#00BCC8' }}>${trainer.rate}</div>
              <div style={{ fontFamily: hanken, fontSize: '12px', color: '#9A9A9A' }}>/hr</div>
            </div>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating rating={trainer.rating} />
            <span style={{ fontFamily: barlow, fontWeight: 700, fontSize: '14px', color: '#1A1A1A' }}>{trainer.rating.toFixed(1)}</span>
            <span style={{ fontFamily: hanken, fontSize: '13px', color: '#9A9A9A' }}>({trainer.reviewCount} reviews)</span>
          </div>

          {/* Formats + availability */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {trainer.formats.map((f) => (
              <span key={f} style={{
                fontFamily: hanken, fontSize: '12px', fontWeight: 600, padding: '4px 10px',
                border: '1px solid rgba(0,0,0,0.10)', color: '#4A4A4A',
              }}>{f}</span>
            ))}
            <span style={{
              fontFamily: hanken, fontSize: '12px', fontWeight: 600, padding: '4px 10px',
              background: 'rgba(0,188,200,0.10)',
              border: '1px solid rgba(0,188,200,0.25)',
              color: '#00838C',
            }}>{trainer.availability}</span>
          </div>

          {/* Credentials */}
          <p style={{
            fontFamily: hanken, fontSize: '13px', color: '#9A9A9A',
            margin: 0, lineHeight: 1.45,
            paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)',
          }}>
            {trainer.credentials}
          </p>

          {/* CTA */}
          <div style={{ marginTop: 'auto' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: barlow, fontWeight: 700, fontSize: '14px',
              letterSpacing: '.06em', textTransform: 'uppercase', color: '#00BCC8',
            }}>
              View profile
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSports, setSelectedSports] = useState([])
  const [selectedFormats, setSelectedFormats] = useState([])
  const [maxRateIdx, setMaxRateIdx] = useState(0)
  const [sort, setSort] = useState('reviewed')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState('')

  const toggleSport = (s) => {
    setSelectedSports((prev) => {
      const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
      if (next.length !== 1) setSelectedPosition('')
      return next
    })
  }
  const toggleFormat = (f) => setSelectedFormats((prev) =>
    prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
  )
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSports([])
    setSelectedFormats([])
    setMaxRateIdx(0)
    setSelectedPosition('')
    setSelectedAgeGroup('')
    setSelectedAvailability('')
  }

  const rateOpt = RATE_OPTIONS[maxRateIdx]

  const filtered = useMemo(() => {
    let list = TRAINERS.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!t.name.toLowerCase().includes(q) && !t.specialty.toLowerCase().includes(q)) return false
      }
      if (selectedSports.length && !selectedSports.includes(t.sport)) return false
      if (selectedFormats.length && !selectedFormats.some((f) => t.formats.includes(f))) return false
      if (rateOpt.min && t.rate < rateOpt.min) return false
      if (rateOpt.max !== Infinity && t.rate > rateOpt.max) return false
      if (selectedPosition && !t.positions.includes(selectedPosition)) return false
      if (selectedAgeGroup && !t.ageGroups.includes(selectedAgeGroup)) return false
      if (selectedAvailability && t.availability !== selectedAvailability) return false
      return true
    })
    if (sort === 'reviewed') list = [...list].sort((a, b) => b.reviewCount - a.reviewCount)
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.rate - b.rate)
    if (sort === 'rated') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [searchQuery, selectedSports, selectedFormats, maxRateIdx, sort, rateOpt, selectedPosition, selectedAgeGroup, selectedAvailability])

  const hasFilters = !!searchQuery || selectedSports.length > 0 || selectedFormats.length > 0 || maxRateIdx !== 0
    || !!selectedPosition || !!selectedAgeGroup || !!selectedAvailability

  const activeFilterCount = (searchQuery ? 1 : 0) + selectedSports.length + selectedFormats.length
    + (maxRateIdx > 0 ? 1 : 0) + (selectedPosition ? 1 : 0)
    + (selectedAgeGroup ? 1 : 0) + (selectedAvailability ? 1 : 0)

  const positionOptions = selectedSports.length === 1 ? (POSITIONS_BY_SPORT[selectedSports[0]] || []) : []

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Sport */}
      <div>
        <div style={labelStyle}>Sport</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SPORTS.map((s) => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={selectedSports.includes(s)} onChange={() => toggleSport(s)}
                style={{ accentColor: '#00BCC8', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{
                fontFamily: hanken, fontSize: '14px',
                color: selectedSports.includes(s) ? '#1A1A1A' : '#4A4A4A',
                fontWeight: selectedSports.includes(s) ? 600 : 400,
              }}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* Position — only when exactly one sport is selected */}
      {selectedSports.length === 1 && (
        <>
          <div>
            <div style={labelStyle}>Position</div>
            <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} style={selectStyle}>
              <option value="">Any position</option>
              {positionOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={divider} />
        </>
      )}

      {/* Session Format */}
      <div>
        <div style={labelStyle}>Session Format</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FORMATS.map((f) => (
            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={selectedFormats.includes(f)} onChange={() => toggleFormat(f)}
                style={{ accentColor: '#00BCC8', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{
                fontFamily: hanken, fontSize: '14px',
                color: selectedFormats.includes(f) ? '#1A1A1A' : '#4A4A4A',
                fontWeight: selectedFormats.includes(f) ? 600 : 400,
              }}>{f}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* Max Rate */}
      <div>
        <div style={labelStyle}>Max Rate</div>
        <select value={maxRateIdx} onChange={(e) => setMaxRateIdx(Number(e.target.value))} style={selectStyle}>
          {RATE_OPTIONS.map((opt, i) => <option key={i} value={i}>{opt.label}</option>)}
        </select>
      </div>

      <div style={divider} />

      {/* Age Group */}
      <div>
        <div style={labelStyle}>Age Group</div>
        <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} style={selectStyle}>
          <option value="">Any age</option>
          {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div style={divider} />

      {/* Availability */}
      <div>
        <div style={labelStyle}>Availability</div>
        <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)} style={selectStyle}>
          <option value="">Any time</option>
          {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: barlow, fontWeight: 700, fontSize: '13px',
            letterSpacing: '.08em', textTransform: 'uppercase', color: '#00BCC8', textAlign: 'left',
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#F8F8F6', color: '#1A1A1A',
      fontFamily: hanken, WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(248,248,246,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{
          maxWidth: '1240px', margin: '0 auto', padding: '0 24px', height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            fontFamily: barlow, fontWeight: 800, fontSize: '22px',
            letterSpacing: '.04em', color: '#00BCC8', textDecoration: 'none',
          }}>
            FARM
          </Link>
          <Link
            href="/signup"
            style={{
              fontFamily: barlow, fontWeight: 700, fontSize: '13px',
              letterSpacing: '.1em', textTransform: 'uppercase',
              padding: '8px 18px', border: '1.5px solid #00BCC8',
              color: '#00BCC8', textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#00BCC8'; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#00BCC8' }}
          >
            I&apos;m a trainer
          </Link>
        </div>
      </nav>

      {/* Page header */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 0' }}>
        <h1 style={{
          fontFamily: barlow, fontWeight: 800,
          fontSize: 'clamp(36px, 5vw, 56px)',
          letterSpacing: '.02em', textTransform: 'uppercase',
          margin: '0 0 6px', color: '#1A1A1A', lineHeight: 1,
        }}>
          Find a trainer
        </h1>
        <p style={{ fontFamily: hanken, fontSize: '15px', color: '#9A9A9A', margin: '0 0 20px' }}>
          Austin, TX · All sports
        </p>

        {/* Search input */}
        <div style={{ position: 'relative', maxWidth: '560px' }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="rgba(0,0,0,0.40)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '11px 16px 11px 42px',
              background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.12)',
              color: '#1A1A1A', fontFamily: hanken, fontSize: '16px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Mobile filter toggle */}
      <div className="mobile-filter-bar" style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px 24px 0' }}>
        <button
          className="mobile-only"
          onClick={() => setMobileFiltersOpen((o) => !o)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px',
            border: mobileFiltersOpen ? '1px solid #00BCC8' : '1px solid rgba(0,0,0,0.08)',
            background: mobileFiltersOpen ? 'rgba(0,188,200,0.10)' : 'transparent',
            color: mobileFiltersOpen ? '#00BCC8' : '#4A4A4A',
            fontFamily: barlow, fontWeight: 700, fontSize: '13px',
            letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="mobile-only" style={{
          maxWidth: '1240px', margin: '12px 24px 0',
          background: '#F8F8F6', border: '1px solid rgba(0,0,0,0.08)', padding: '24px',
        }}>
          {sidebar}
        </div>
      )}

      {/* Main layout */}
      <div
        className="search-layout"
        style={{
          maxWidth: '1240px', margin: '0 auto', padding: '28px 24px 80px',
          display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', alignItems: 'start',
        }}
      >
        {/* Sidebar — desktop only */}
        <div className="desktop-sidebar" style={{
          background: '#F8F8F6', border: '1px solid rgba(0,0,0,0.08)',
          padding: '24px', position: 'sticky', top: '72px',
        }}>
          {sidebar}
        </div>

        {/* Right column */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px', marginBottom: '20px', flexWrap: 'wrap',
          }}>
            <span style={{ fontFamily: hanken, fontSize: '14px', color: '#9A9A9A' }}>
              <strong style={{ fontFamily: barlow, fontWeight: 700, fontSize: '16px', color: '#1A1A1A', letterSpacing: '.02em' }}>
                {filtered.length}
              </strong>{' '}trainer{filtered.length !== 1 ? 's' : ''} near you
            </span>
            <select
              value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ ...selectStyle, width: 'auto', padding: '9px 32px 9px 12px' }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <p style={{
                fontFamily: barlow, fontSize: '22px', fontWeight: 700,
                color: '#9A9A9A', textTransform: 'uppercase',
                letterSpacing: '.06em', margin: '0 0 12px',
              }}>
                No trainers match your filters
              </p>
              <button
                onClick={clearFilters}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: barlow, fontWeight: 700, fontSize: '14px',
                  letterSpacing: '.1em', textTransform: 'uppercase', color: '#00BCC8', padding: 0,
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filtered.map((trainer, i) => <TrainerCard key={trainer.id} trainer={trainer} index={i} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .search-layout { grid-template-columns: 1fr !important; }
          .desktop-sidebar { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
          .mobile-filter-bar { display: none !important; }
        }
      `}</style>
    </div>
  )
}
