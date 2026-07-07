'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  cyan: '#00BCC8',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: '16px',
  overflow: 'hidden',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: T.ink3,
  display: 'block',
  marginBottom: '4px',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function computeAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [sport, setSport] = useState('')
  const [dob, setDob] = useState<string | null>(null)
  const [skillLevel, setSkillLevel] = useState<string | null>(null)
  const [position, setPosition] = useState<string | null>(null)
  const [goals, setGoals] = useState<string | null>(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [sinceLabel, setSinceLabel] = useState('—')
  const [trainerName, setTrainerName] = useState<string | null>(null)
  const [trainerSpecialty, setTrainerSpecialty] = useState<string | null>(null)
  const [parentName, setParentName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: athlete, error: athleteErr } = await supabase
        .from('athletes')
        .select('id, name, dob, sport, skill_level, position, goals, parent_id')
        .eq('profile_id', user.id)
        .single()

      if (athleteErr || !athlete) { setLoading(false); return }

      const row = athlete as any
      setName(row.name ?? '')
      setSport(row.sport ?? '')
      setDob(row.dob ?? null)
      setSkillLevel(row.skill_level ?? null)
      setPosition(row.position ?? null)
      setGoals(row.goals ?? null)

      // Fetch parent name
      if (row.parent_id) {
        const { data: parentProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', row.parent_id)
          .single()
        if (parentProfile) setParentName((parentProfile as any).name ?? null)
      }

      // Fetch bookings — most recent first
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, session_time, trainers!trainer_id(specialty, profiles(name))')
        .eq('athlete_id', row.id)
        .order('session_time', { ascending: false })

      if (bookings && bookings.length > 0) {
        const rows = bookings as any[]
        setSessionCount(rows.length)

        // Most recent booking → trainer card
        const latest = rows[0]
        setTrainerName(latest.trainers?.profiles?.name ?? null)
        setTrainerSpecialty(latest.trainers?.specialty ?? null)

        // Earliest booking → "Since" stat (no created_at column on athletes)
        const earliest = rows[rows.length - 1]
        setSinceLabel(
          new Date(earliest.session_time).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        )
      }

      setLoading(false)
    }
    load()
  }, [])

  const initials = name ? getInitials(name) : '?'
  const age = dob ? computeAge(dob) : null

  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Section 1 — Profile hero card */}
        <div style={glassCard}>
          {/* Cyan gradient header band */}
          <div style={{ height: '80px', background: 'linear-gradient(135deg, rgba(0,188,200,0.15) 0%, rgba(0,212,226,0.08) 100%)' }} />

          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '999px',
            background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: '#FFFFFF',
            marginTop: '-36px', marginLeft: '24px',
            border: '3px solid rgba(255,255,255,0.9)',
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Name */}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '24px', color: T.ink, marginTop: '8px', padding: '0 24px', lineHeight: 1.2 }}>
            {name || (loading ? '' : 'Unknown')}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 24px' }}>
            {sport && (
              <span style={{ background: 'rgba(0,188,200,0.1)', color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
                {sport}
              </span>
            )}
            {age !== null && (
              <span style={{ background: 'rgba(0,0,0,0.06)', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
                Age {age}
              </span>
            )}
            {skillLevel && (
              <span style={{ background: 'rgba(0,0,0,0.06)', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
                {skillLevel}
              </span>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 24px' }} />

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '16px 24px', gap: '8px' }}>
            {[
              { value: sessionCount.toString(), label: 'Sessions' },
              { value: sinceLabel,              label: 'Since'    },
              { value: '—',                     label: 'Rating'   },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '22px', color: T.cyan, lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3, marginTop: '3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 — About */}
        <div style={{ ...glassCard, marginTop: '16px', padding: '20px' }}>
          <span style={sectionLabel}>ABOUT</span>
          {[
            { label: 'Position', value: position || 'Not set' },
            { label: 'Goals',    value: goals    || 'Not set' },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              style={{
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.ink3, marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — Current trainer */}
        <div style={{ ...glassCard, marginTop: '16px', padding: '20px' }}>
          <span style={sectionLabel}>MY TRAINER</span>
          {trainerName ? (
            <Link
              href="/dashboard/athlete/messages"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                minHeight: '56px', textDecoration: 'none', color: 'inherit',
                marginTop: '4px',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '999px', background: T.cyanLight, border: `2px solid ${T.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.cyan, flexShrink: 0 }}>
                {getInitials(trainerName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink }}>{trainerName}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginTop: '2px' }}>
                  {trainerSpecialty ? `${trainerSpecialty} Trainer` : 'Trainer'}
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            !loading && (
              <div style={{ padding: '16px 0 4px', textAlign: 'center', color: T.ink3, fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
                No trainer yet
              </div>
            )
          )}
        </div>

        {/* Section 4 — Read-only notice */}
        <div style={{ marginTop: '16px', fontSize: '12px', color: T.ink3, textAlign: 'center', lineHeight: 1.6 }}>
          Profile managed by your parent · Contact {parentName || 'your parent'} to make changes
        </div>

      </div>
    </div>
  )
}
