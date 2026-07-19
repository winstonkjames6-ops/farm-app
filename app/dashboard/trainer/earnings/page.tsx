'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

// ── Constants ──────────────────────────────────────────────────────────────────

const WEEKLY_GOAL = 500

// ── Types ──────────────────────────────────────────────────────────────────────

type HistoryItem = {
  id: string
  athleteId: string | null
  parentName: string
  childName: string
  sport: string
  date: string
  amount: number
}

type PastAthlete = {
  id: string
  name: string
}

type EarningsData = {
  allTime: number
  weeklyEarned: number
  sessionRate: number
  history: HistoryItem[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() + diffToMon)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: '#111827', textTransform: 'uppercase', marginBottom: '12px' }}>
      {children}
    </div>
  )
}

// ── EarningsView ───────────────────────────────────────────────────────────────

function EarningsView({
  data,
  pastAthletes,
  athleteRateInputs,
  onAthleteRateInputChange,
  athleteRateSaving,
  athleteRateErrors,
  athleteRateSaved,
  onSaveAthleteRate,
}: {
  data: EarningsData
  pastAthletes: PastAthlete[]
  athleteRateInputs: Record<string, string>
  onAthleteRateInputChange: (athleteId: string, value: string) => void
  athleteRateSaving: string | null
  athleteRateErrors: Record<string, string>
  athleteRateSaved: Record<string, boolean>
  onSaveAthleteRate: (athleteId: string) => void
}) {
  const progress = Math.min((data.weeklyEarned / WEEKLY_GOAL) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Summary card */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>Total earned</span>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '36px', color: T.ink, lineHeight: 1 }}>
              ${data.allTime.toLocaleString()}
            </div>
          </div>
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '16px 0' }} />
          <div style={{ display: 'flex' }}>
            {[
              { label: 'This week', value: `$${data.weeklyEarned} / $${WEEKLY_GOAL}` },
              { label: 'Rate',      value: `$${data.sessionRate}/hr` },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{ flex: 1, paddingLeft: i > 0 ? '16px' : 0, paddingRight: i < arr.length - 1 ? '16px' : 0, borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '20px', color: T.ink }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly progress */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <SectionLabel>Weekly goal</SectionLabel>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ height: '6px', borderRadius: '999px', background: '#E5E7EB', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '999px', background: T.cyan }}
              />
            </div>
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>
            ${data.weeklyEarned} earned of ${WEEKLY_GOAL} goal
          </div>
        </div>

        {/* Session history */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <SectionLabel>Session history</SectionLabel>
          {data.history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3 }}>
              No completed sessions yet
            </div>
          ) : (
            <div>
              {data.history.map((item, i) => (
                <div key={item.id}>
                  {i > 0 && <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '999px', background: T.cyanLight, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: T.cyan }}>
                      {item.parentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink, fontWeight: 500 }}>{item.childName}</div>
                      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{item.parentName}</div>
                    </div>
                    {item.sport && (
                      <span style={{ padding: '3px 8px', background: T.cyanLight, color: T.cyan, border: '1px solid rgba(0,188,200,0.2)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.06em', borderRadius: '6px', flexShrink: 0 }}>
                        {item.sport}
                      </span>
                    )}
                    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3, flexShrink: 0 }}>{item.date}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink, flexShrink: 0 }}>${item.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Athlete rate overrides */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <SectionLabel>Athlete rate overrides</SectionLabel>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, marginBottom: '16px' }}>
            Set a custom rate for an athlete you've worked with before — it replaces your standard rate for their future bookings.
          </div>
          {pastAthletes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
              No past-booked athletes yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pastAthletes.map((athlete) => (
                <div key={athlete.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: '100px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink }}>{athlete.name}</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Standard rate"
                    value={athleteRateInputs[athlete.id] ?? ''}
                    onChange={(e) => onAthleteRateInputChange(athlete.id, e.target.value)}
                    style={{ width: '120px', border: `1px solid ${T.border}`, borderRadius: '8px', padding: '7px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
                  />
                  <button
                    onClick={() => onSaveAthleteRate(athlete.id)}
                    disabled={athleteRateSaving === athlete.id}
                    style={{ height: '32px', padding: '0 14px', background: T.cyan, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 700, cursor: athleteRateSaving === athlete.id ? 'default' : 'pointer', opacity: athleteRateSaving === athlete.id ? 0.7 : 1 }}
                  >
                    {athleteRateSaving === athlete.id ? 'Saving…' : 'Save'}
                  </button>
                  {athleteRateSaved[athlete.id] && athleteRateSaving !== athlete.id && (
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 600, color: T.cyan }}>Saved</span>
                  )}
                  {athleteRateErrors[athlete.id] && (
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: '#EF4444' }}>{athleteRateErrors[athlete.id]}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [trainerRowId, setTrainerRowId] = useState<string | null>(null)
  const [pastAthletes, setPastAthletes] = useState<PastAthlete[]>([])
  const [athleteRateInputs, setAthleteRateInputs] = useState<Record<string, string>>({})
  const [athleteRateSaving, setAthleteRateSaving] = useState<string | null>(null)
  const [athleteRateErrors, setAthleteRateErrors] = useState<Record<string, string>>({})
  const [athleteRateSaved, setAthleteRateSaved] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: trainerRow } = await supabase
        .from('trainers')
        .select('id, rate, specialty')
        .eq('profile_id', user.id)
        .single()
      if (!trainerRow) { setLoading(false); return }
      setTrainerRowId(trainerRow.id)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, session_time, rate, athlete_id, profiles!parent_id(name), athletes!athlete_id(name), trainers!trainer_id(specialty)')
        .eq('trainer_id', trainerRow.id)
        .eq('status', 'completed')
        .order('session_time', { ascending: false })

      const rows = (bookings as any[]) ?? []
      const { start, end } = getWeekBounds()

      const resolveAmount = (r: any) => r.rate ?? trainerRow.rate ?? 0

      const allTime = rows.reduce((sum, r) => sum + resolveAmount(r), 0)
      const weeklyEarned = rows
        .filter((r) => { const dt = new Date(r.session_time); return dt >= start && dt <= end })
        .reduce((sum, r) => sum + resolveAmount(r), 0)

      const history: HistoryItem[] = rows.map((r) => ({
        id: r.id,
        athleteId: r.athlete_id ?? null,
        parentName: r.profiles?.name ?? 'Unknown',
        childName: r.athletes?.name ?? 'Unknown',
        sport: r.trainers?.specialty ?? trainerRow.specialty ?? '',
        date: formatSessionDate(r.session_time),
        amount: resolveAmount(r),
      }))

      const seen = new Set<string>()
      const athletesList: PastAthlete[] = []
      rows.forEach((r) => {
        if (r.athlete_id && !seen.has(r.athlete_id)) {
          seen.add(r.athlete_id)
          athletesList.push({ id: r.athlete_id, name: r.athletes?.name ?? 'Athlete' })
        }
      })
      setPastAthletes(athletesList)

      const { data: existingRates } = await supabase
        .from('trainer_athlete_rates')
        .select('athlete_id, rate')
        .eq('trainer_id', trainerRow.id)
      const initialInputs: Record<string, string> = {}
      ;(existingRates ?? []).forEach((r: any) => { initialInputs[r.athlete_id] = String(r.rate) })
      setAthleteRateInputs(initialInputs)

      setData({ allTime, weeklyEarned, sessionRate: trainerRow.rate ?? 0, history })
      setLoading(false)
    }
    fetchData()
  }, [])

  function handleAthleteRateInputChange(athleteId: string, value: string) {
    setAthleteRateInputs((prev) => ({ ...prev, [athleteId]: value }))
    setAthleteRateSaved((prev) => ({ ...prev, [athleteId]: false }))
  }

  async function saveAthleteRate(athleteId: string) {
    if (!trainerRowId) return
    const raw = athleteRateInputs[athleteId] ?? ''
    const parsed = parseFloat(raw)
    if (raw.trim() === '' || Number.isNaN(parsed) || parsed <= 0) {
      setAthleteRateErrors((prev) => ({ ...prev, [athleteId]: 'Enter a valid rate.' }))
      return
    }
    setAthleteRateErrors((prev) => { const next = { ...prev }; delete next[athleteId]; return next })
    setAthleteRateSaved((prev) => ({ ...prev, [athleteId]: false }))
    setAthleteRateSaving(athleteId)
    const supabase = createClient()
    const { error } = await supabase
      .from('trainer_athlete_rates')
      .upsert({ trainer_id: trainerRowId, athlete_id: athleteId, rate: parsed }, { onConflict: 'trainer_id,athlete_id' })
    setAthleteRateSaving(null)
    if (error) {
      setAthleteRateErrors((prev) => ({ ...prev, [athleteId]: 'Failed to save. Try again.' }))
      return
    }
    setAthleteRateSaved((prev) => ({ ...prev, [athleteId]: true }))
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: '#9CA3AF' }}>
        Loading earnings...
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '32px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: '#9CA3AF' }}>
        Could not load earnings.
      </div>
    )
  }

  return (
    <EarningsView
      data={data}
      pastAthletes={pastAthletes}
      athleteRateInputs={athleteRateInputs}
      onAthleteRateInputChange={handleAthleteRateInputChange}
      athleteRateSaving={athleteRateSaving}
      athleteRateErrors={athleteRateErrors}
      athleteRateSaved={athleteRateSaved}
      onSaveAthleteRate={saveAthleteRate}
    />
  )
}
