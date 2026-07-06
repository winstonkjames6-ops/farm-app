'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

// ── Constants ─────────────────────────────────────────────────────────────────

const SPORTS = ['Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Lacrosse', 'Baseball']
const RATE_OPTIONS = [
  { label: 'Any price', max: Infinity },
  { label: 'Up to $40/hr', max: 40 },
  { label: 'Up to $60/hr', max: 60 },
  { label: 'Up to $80/hr', max: 80 },
  { label: '$100+/hr', max: Infinity, min: 100 },
]
const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'name', label: 'Name (A–Z)' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

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

// ── TrainerCard ───────────────────────────────────────────────────────────────

function TrainerCard({ trainer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.07 }}
      style={{ height: '100%' }}
    >
      <Link href={`/trainer/${trainer.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
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
                {trainer.sport && (
                  <span style={{
                    fontFamily: barlow, fontSize: '11px', fontWeight: 700,
                    letterSpacing: '.1em', textTransform: 'uppercase',
                    background: 'rgba(0,188,200,0.10)', color: '#00BCC8',
                    border: '1px solid rgba(0,188,200,0.20)', padding: '2px 8px',
                  }}>{trainer.sport}</span>
                )}
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

          {/* New trainer badge */}
          <div>
            <span style={{
              fontFamily: hanken, fontSize: '12px', fontWeight: 600,
              padding: '4px 10px',
              background: 'rgba(0,188,200,0.08)',
              border: '1px solid rgba(0,188,200,0.20)',
              color: '#00838C',
            }}>New trainer</span>
          </div>

          {/* Availability placeholder */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: hanken, fontSize: '12px', fontWeight: 600, padding: '4px 10px',
              border: '1px solid rgba(0,0,0,0.10)', color: '#4A4A4A',
            }}>Contact for availability</span>
          </div>

          {/* Bio */}
          {trainer.bio && (
            <p style={{
              fontFamily: hanken, fontSize: '13px', color: '#9A9A9A',
              margin: 0, lineHeight: 1.45,
              paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)',
            }}>
              {trainer.bio}
            </p>
          )}

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
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSports, setSelectedSports] = useState([])
  const [maxRateIdx, setMaxRateIdx] = useState(0)
  const [sort, setSort] = useState('price_asc')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('trainers')
      .select('profile_id, specialty, bio, rate, location, profiles(name)')
      .then(({ data }) => {
        if (data) {
          setTrainers(data.map((row) => ({
            id: row.profile_id,
            name: row.profiles?.name ?? 'Unknown',
            sport: row.specialty ?? '',
            specialty: row.specialty ?? '',
            location: row.location ?? '',
            rate: row.rate ?? 0,
            bio: row.bio ?? null,
            initials: getInitials(row.profiles?.name ?? ''),
          })))
        }
        setLoading(false)
      })
  }, [])

  const toggleSport = (s) => {
    setSelectedSports((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSports([])
    setMaxRateIdx(0)
  }

  const rateOpt = RATE_OPTIONS[maxRateIdx]

  const filtered = useMemo(() => {
    let list = trainers.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!t.name.toLowerCase().includes(q) && !t.specialty.toLowerCase().includes(q)) return false
      }
      if (selectedSports.length && !selectedSports.includes(t.sport)) return false
      if (rateOpt.min && t.rate < rateOpt.min) return false
      if (rateOpt.max !== Infinity && t.rate > rateOpt.max) return false
      return true
    })
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.rate - b.rate)
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.rate - a.rate)
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [trainers, searchQuery, selectedSports, maxRateIdx, sort, rateOpt])

  const hasFilters = !!searchQuery || selectedSports.length > 0 || maxRateIdx !== 0
  const activeFilterCount = (searchQuery ? 1 : 0) + selectedSports.length + (maxRateIdx > 0 ? 1 : 0)

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

      {/* Max Rate */}
      <div>
        <div style={labelStyle}>Max Rate</div>
        <select value={maxRateIdx} onChange={(e) => setMaxRateIdx(Number(e.target.value))} style={selectStyle}>
          {RATE_OPTIONS.map((opt, i) => <option key={i} value={i}>{opt.label}</option>)}
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
    <div style={{ color: '#1A1A1A', fontFamily: hanken, WebkitFontSmoothing: 'antialiased' }}>

      {/* Page header */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 24px 0' }}>
        <p style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: '13px',
          color: '#9A9A9A',
          margin: '0 0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="#00BCC8" strokeWidth="2" strokeLinecap="round"
               strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Browsing as Sarah Chen
        </p>
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
        <div id="tour-search-bar" style={{ position: 'relative', maxWidth: '560px' }}>
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
        <div id="tour-search-filters" className="desktop-sidebar" style={{
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
              {loading ? 'Loading trainers…' : (
                <>
                  <strong style={{ fontFamily: barlow, fontWeight: 700, fontSize: '16px', color: '#1A1A1A', letterSpacing: '.02em' }}>
                    {filtered.length}
                  </strong>{' '}trainer{filtered.length !== 1 ? 's' : ''} near you
                </>
              )}
            </span>
            <select
              value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ ...selectStyle, width: 'auto', padding: '9px 32px 9px 12px' }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontFamily: hanken, fontSize: '14px', color: '#9A9A9A', margin: 0 }}>
                Loading trainers&hellip;
              </p>
            </div>
          ) : filtered.length === 0 ? (
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
              {filtered.map((trainer, i) => (
                <div key={trainer.id} id={i === 0 ? 'tour-search-first-card' : undefined}>
                  <TrainerCard trainer={trainer} index={i} />
                </div>
              ))}
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
