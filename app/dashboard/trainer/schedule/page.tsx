'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pencil, Trash2, Star, Check, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

// ── Types ──────────────────────────────────────────────────────────────────────

type AvailabilitySlot = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

type TrainerPreset = {
  id: string
  label: string
  days: number[]
  start_time: string
  end_time: string
}

type BookingRow = {
  id: string
  session_time: string
  status: string
  format: string | null
  athleteName: string
  parentName: string
  parentProfileId: string
  hasFeedback: boolean
}

type DayStatus = 'booked' | 'available' | 'blocked'

const FULL_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_MAP: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const FORMAT_MAP: Record<string, string> = {
  in_person: 'In-Person',
  'in-person': 'In-Person',
  online: 'Remote Video',
  remote: 'Remote Video',
  remote_video: 'Remote Video',
  video: 'Remote Video',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

// Postgres `time` columns come back as "HH:MM:SS" — <input type="time"> wants "HH:MM".
function toHHMM(t: string): string {
  return t.slice(0, 5)
}

function normalizeFormat(format: string | null): string {
  if (!format) return '—'
  return FORMAT_MAP[format.toLowerCase()] ?? format
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatSessionDate(sessionTime: string): string {
  const dt = new Date(sessionTime)
  return `${DAY_NAMES[dt.getDay()].slice(0, 3)}, ${MONTH_NAMES[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`
}

function shortDayLabel(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`
}

function formatSessionTime(sessionTime: string): string {
  const dt = new Date(sessionTime)
  let hours = dt.getHours()
  const minutes = dt.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minuteStr = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`
  return `${hours}${minuteStr} ${ampm}`
}

function buildMonthCells(year: number, month: number): (Date | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0 .. Sun=6
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function statusPillStyle(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'confirmed':
      return { bg: 'rgba(0,188,200,0.12)', color: '#00838C', label: 'Confirmed' }
    case 'pending':
      return { bg: 'rgba(245,158,11,0.14)', color: '#B45309', label: 'Pending' }
    case 'cancelled':
      return { bg: 'rgba(239,68,68,0.12)', color: '#B91C1C', label: 'Cancelled' }
    case 'declined':
      return { bg: 'rgba(239,68,68,0.12)', color: '#B91C1C', label: 'Declined' }
    case 'completed':
      return { bg: 'rgba(107,114,128,0.14)', color: '#4B5563', label: 'Completed' }
    default:
      return { bg: 'rgba(107,114,128,0.14)', color: '#4B5563', label: status }
  }
}

const DAY_COLORS: Record<DayStatus, { bg: string; dot: string }> = {
  booked:    { bg: 'rgba(99,102,241,0.10)', dot: '#6366F1' },
  available: { bg: 'rgba(0,188,200,0.08)',  dot: '#00BCC8' },
  blocked:   { bg: '#F3F4F6',               dot: '#9CA3AF' },
}

type HourPreset = {
  key: string
  label: string
  days: number[] // day_of_week values (Sun=0 .. Sat=6)
  start: string | null
  end: string | null
}

// Order matters — "After school" is the default/most prominent option.
const HOUR_PRESETS: HourPreset[] = [
  { key: 'after-school',     label: 'After school',         days: [1, 2, 3, 4, 5],       start: '15:00', end: '19:00' },
  { key: 'weekday-standard', label: 'Weekday standard',     days: [1, 2, 3, 4, 5],       start: '09:00', end: '17:00' },
  { key: 'mornings',         label: 'Mornings',             days: [1, 2, 3, 4, 5],       start: '06:00', end: '10:00' },
  { key: 'weekend-only',     label: 'Weekend only',         days: [6, 0],                start: '08:00', end: '14:00' },
  { key: 'same-every-day',   label: 'Same hours every day', days: [0, 1, 2, 3, 4, 5, 6], start: null,    end: null },
]

// ── Weekly hours panel (unchanged recurring-availability logic) ────────────────

function WeeklyHoursPanel({
  trainerId,
  availabilitySlots,
  setAvailabilitySlots,
}: {
  trainerId: string | null
  availabilitySlots: AvailabilitySlot[]
  setAvailabilitySlots: React.Dispatch<React.SetStateAction<AvailabilitySlot[]>>
}) {
  const [showAddForm, setShowAddForm] = useState<string | null>(null)
  const [avFormStart, setAvFormStart] = useState('')
  const [avFormEnd, setAvFormEnd] = useState('')
  const [avFormError, setAvFormError] = useState('')
  const [avSaving, setAvSaving] = useState(false)
  const [avDeleteErrors, setAvDeleteErrors] = useState<Record<string, string>>({})

  // Quick-add-with-presets — prefills day checkboxes + start/end below, then
  // reuses the exact same `availability` insert call, once per checked day.
  const [quickDays, setQuickDays] = useState<Set<number>>(new Set())
  const [quickStart, setQuickStart] = useState('')
  const [quickEnd, setQuickEnd] = useState('')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [quickError, setQuickError] = useState('')
  const [quickSaving, setQuickSaving] = useState(false)

  // Trainer-saved custom presets (trainer_presets table)
  const [customPresets, setCustomPresets] = useState<TrainerPreset[]>([])
  const [showSavePresetForm, setShowSavePresetForm] = useState(false)
  const [presetLabelInput, setPresetLabelInput] = useState('')
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null)
  const [presetSaving, setPresetSaving] = useState(false)
  const [presetError, setPresetError] = useState('')
  const [presetDeleteErrors, setPresetDeleteErrors] = useState<Record<string, string>>({})

  // Which trainer_presets row is live on the public booking page (trainers.active_preset_id) —
  // distinct from `activePreset` above, which is just which preset is loaded into the form.
  const [liveActivePresetId, setLiveActivePresetId] = useState<string | null>(null)
  const [activePresetSaving, setActivePresetSaving] = useState(false)
  const [activePresetError, setActivePresetError] = useState('')

  useEffect(() => {
    if (!trainerId) return
    async function loadPresets() {
      const supabase = createClient()
      const [presetsRes, trainerRes] = await Promise.all([
        supabase
          .from('trainer_presets')
          .select('id, label, days, start_time, end_time')
          .eq('trainer_id', trainerId)
          .order('created_at', { ascending: true }),
        supabase
          .from('trainers')
          .select('active_preset_id')
          .eq('id', trainerId)
          .single(),
      ])
      setCustomPresets(presetsRes.data ?? [])
      setLiveActivePresetId(trainerRes.data?.active_preset_id ?? null)
    }
    loadPresets()
  }, [trainerId])

  async function markPresetActive(id: string) {
    if (!trainerId) return
    setActivePresetError('')
    setActivePresetSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('trainers').update({ active_preset_id: id }).eq('id', trainerId)
    setActivePresetSaving(false)
    if (error) {
      setActivePresetError('Failed to set active preset. Try again.')
      return
    }
    setLiveActivePresetId(id)
  }

  function applyPreset(preset: HourPreset) {
    setQuickDays(new Set(preset.days))
    setQuickStart(preset.start ?? '')
    setQuickEnd(preset.end ?? '')
    setActivePreset(preset.key)
    setQuickError('')
  }

  function toggleQuickDay(day: number) {
    setQuickDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
    setActivePreset(null)
  }

  function applyCustomPreset(preset: TrainerPreset) {
    setQuickDays(new Set(preset.days))
    setQuickStart(toHHMM(preset.start_time))
    setQuickEnd(toHHMM(preset.end_time))
    setActivePreset(`custom:${preset.id}`)
    setQuickError('')
  }

  function startEditingPreset(preset: TrainerPreset) {
    applyCustomPreset(preset)
    setEditingPresetId(preset.id)
    setPresetLabelInput(preset.label)
    setShowSavePresetForm(true)
    setPresetError('')
  }

  function cancelSavePreset() {
    setShowSavePresetForm(false)
    setPresetLabelInput('')
    setEditingPresetId(null)
    setPresetError('')
  }

  async function confirmSavePreset() {
    if (!trainerId) return
    if (quickDays.size === 0 || !quickStart || !quickEnd) return
    if (!presetLabelInput.trim()) {
      setPresetError('Please enter a label.')
      return
    }
    setPresetError('')
    setPresetSaving(true)
    const supabase = createClient()
    const days = Array.from(quickDays).sort((a, b) => a - b)

    if (editingPresetId) {
      const { data, error } = await supabase
        .from('trainer_presets')
        .update({ label: presetLabelInput.trim(), days, start_time: quickStart, end_time: quickEnd })
        .eq('id', editingPresetId)
        .select('id, label, days, start_time, end_time')
        .single()
      setPresetSaving(false)
      if (error) {
        setPresetError('Failed to update preset. Try again.')
        return
      }
      setCustomPresets((prev) => prev.map((p) => (p.id === editingPresetId ? data : p)))
    } else {
      const { data, error } = await supabase
        .from('trainer_presets')
        .insert({ trainer_id: trainerId, label: presetLabelInput.trim(), days, start_time: quickStart, end_time: quickEnd })
        .select('id, label, days, start_time, end_time')
        .single()
      setPresetSaving(false)
      if (error) {
        setPresetError('Failed to save preset. Try again.')
        return
      }
      setCustomPresets((prev) => [...prev, data])
      setActivePreset(`custom:${data.id}`)
    }

    setShowSavePresetForm(false)
    setPresetLabelInput('')
    setEditingPresetId(null)
  }

  async function deletePreset(id: string) {
    if (id === liveActivePresetId) {
      setPresetDeleteErrors((prev) => ({ ...prev, [id]: "Can't delete the active preset — set another preset active first." }))
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('trainer_presets').delete().eq('id', id)
    if (error) {
      setPresetDeleteErrors((prev) => ({ ...prev, [id]: 'Failed to delete. Try again.' }))
      return
    }
    setPresetDeleteErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
    setCustomPresets((prev) => prev.filter((p) => p.id !== id))
    if (editingPresetId === id) cancelSavePreset()
  }

  async function saveQuickHours() {
    if (!trainerId) return
    if (quickDays.size === 0) {
      setQuickError('Select at least one day.')
      return
    }
    if (!quickStart || !quickEnd) {
      setQuickError('Please set both start and end times.')
      return
    }
    if (quickStart >= quickEnd) {
      setQuickError('Start time must be before end time.')
      return
    }
    setQuickError('')
    setQuickSaving(true)
    const supabase = createClient()
    const days = Array.from(quickDays)
    const results = await Promise.all(
      days.map((day) =>
        supabase
          .from('availability')
          .insert({ trainer_id: trainerId, day_of_week: day, start_time: quickStart, end_time: quickEnd })
          .select('id, day_of_week, start_time, end_time')
          .single()
      )
    )
    setQuickSaving(false)

    const newSlots = results.filter((r) => !r.error && r.data).map((r) => r.data as AvailabilitySlot)
    if (newSlots.length > 0) {
      setAvailabilitySlots((prev) => [...prev, ...newSlots])
    }

    const failedCount = results.filter((r) => r.error).length
    if (failedCount > 0) {
      setQuickError(`Saved ${newSlots.length} of ${days.length} day${days.length > 1 ? 's' : ''} — ${failedCount} failed. Try again.`)
      return
    }

    setQuickDays(new Set())
    setQuickStart('')
    setQuickEnd('')
    setActivePreset(null)
  }

  async function addAvailability() {
    if (!trainerId || !showAddForm) return
    if (!avFormStart || !avFormEnd) {
      setAvFormError('Please set both start and end times.')
      return
    }
    if (avFormStart >= avFormEnd) {
      setAvFormError('Start time must be before end time.')
      return
    }
    setAvFormError('')
    setAvSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('availability')
      .insert({ trainer_id: trainerId, day_of_week: DAY_MAP[showAddForm], start_time: avFormStart, end_time: avFormEnd })
      .select('id, day_of_week, start_time, end_time')
      .single()
    setAvSaving(false)
    if (error) {
      setAvFormError('Failed to save. Try again.')
      return
    }
    setAvailabilitySlots((prev) => [...prev, data])
    setShowAddForm(null)
    setAvFormStart('')
    setAvFormEnd('')
  }

  async function deleteAvailability(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)
    if (error) {
      setAvDeleteErrors((prev) => ({ ...prev, [id]: 'Failed to delete. Try again.' }))
      return
    }
    setAvDeleteErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
    setAvailabilitySlots((prev) => prev.filter((s) => s.id !== id))
  }

  function openForm(day: string) {
    setShowAddForm(day)
    setAvFormError('')
    setAvFormStart('')
    setAvFormEnd('')
  }

  const slotsByDay: Record<string, AvailabilitySlot[]> = {}
  FULL_WEEK.forEach((day) => {
    slotsByDay[day] = availabilitySlots.filter((s) => s.day_of_week === DAY_MAP[day])
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Quick add with presets */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink, marginBottom: '4px' }}>
          Quick add with a preset
        </div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', color: T.ink2, marginBottom: '14px' }}>
          Pick a preset to prefill the days and hours below, then review and save.
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: customPresets.length > 0 ? '10px' : '16px' }}>
          {HOUR_PRESETS.map((preset, i) => {
            const sel = activePreset === preset.key
            const isDefault = i === 0
            return (
              <button
                key={preset.key}
                onClick={() => applyPreset(preset)}
                style={{
                  height: '38px', padding: '0 16px', borderRadius: '999px', cursor: 'pointer',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
                  border: sel ? `1.5px solid ${T.cyan}` : isDefault ? `1.5px solid ${T.cyanBorder}` : `1px solid ${T.border}`,
                  background: sel ? 'rgba(0,188,200,0.12)' : isDefault ? T.cyanDim : 'transparent',
                  color: (sel || isDefault) ? T.cyan : T.ink2,
                }}
              >{preset.label}</button>
            )
          })}
        </div>

        {customPresets.length > 0 && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {customPresets.map((preset) => {
                const sel = activePreset === `custom:${preset.id}`
                const isLive = preset.id === liveActivePresetId
                return (
                  <div
                    key={preset.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '2px',
                      height: '38px', padding: '0 4px 0 16px', borderRadius: '999px',
                      border: sel ? `1.5px solid ${T.cyan}` : isLive ? `1px solid ${T.cyan}` : `1px dashed ${T.border}`,
                      background: sel ? 'rgba(0,188,200,0.12)' : 'transparent',
                    }}
                  >
                    <button
                      onClick={() => applyCustomPreset(preset)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px 0 0',
                        fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
                        color: sel ? T.cyan : T.ink2,
                      }}
                    >{preset.label}</button>
                    {isLive ? (
                      <span
                        title="This preset is live on your public booking page"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px 3px 6px', borderRadius: '999px',
                          background: 'rgba(0,188,200,0.15)', color: T.cyan,
                          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '10px',
                          letterSpacing: '.06em', textTransform: 'uppercase' as const, marginRight: '2px',
                        }}
                      ><Star size={10} fill={T.cyan} /> Active</span>
                    ) : (
                      <button
                        onClick={() => markPresetActive(preset.id)}
                        disabled={activePresetSaving}
                        title="Set as active"
                        style={{ background: 'none', border: 'none', cursor: activePresetSaving ? 'default' : 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', padding: '6px' }}
                      ><Star size={13} /></button>
                    )}
                    <button
                      onClick={() => startEditingPreset(preset)}
                      title="Edit preset"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', padding: '6px' }}
                    ><Pencil size={13} /></button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      title="Delete preset"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', padding: '6px' }}
                    ><Trash2 size={13} /></button>
                    {presetDeleteErrors[preset.id] && (
                      <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px' }}>
                        {presetDeleteErrors[preset.id]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {activePresetError && (
              <div style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', marginBottom: '8px' }}>
                {activePresetError}
              </div>
            )}
          </>
        )}

        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600, marginBottom: '6px' }}>Days</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {FULL_WEEK.map((day) => {
            const dayNum = DAY_MAP[day]
            const checked = quickDays.has(dayNum)
            return (
              <button
                key={day}
                onClick={() => toggleQuickDay(dayNum)}
                style={{
                  width: '44px', height: '36px', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 600,
                  border: checked ? `1.5px solid ${T.cyan}` : `1px solid ${T.border}`,
                  background: checked ? 'rgba(0,188,200,0.1)' : 'transparent',
                  color: checked ? T.cyan : T.ink2,
                }}
              >{day}</button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>Start</label>
            <input
              type="time"
              value={quickStart}
              onChange={(e) => { setQuickStart(e.target.value); setActivePreset(null) }}
              style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>End</label>
            <input
              type="time"
              value={quickEnd}
              onChange={(e) => { setQuickEnd(e.target.value); setActivePreset(null) }}
              style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
            />
          </div>
        </div>

        {quickDays.size > 0 && (!quickStart || !quickEnd) && !showSavePresetForm && (
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginBottom: '10px' }}>
            Enter a start and end time to save this as a preset.
          </div>
        )}

        {quickError && (
          <div style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', marginBottom: '10px' }}>
            {quickError}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={saveQuickHours}
            disabled={quickSaving}
            style={{ height: '40px', padding: '0 20px', background: T.cyan, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, cursor: quickSaving ? 'default' : 'pointer', opacity: quickSaving ? 0.7 : 1 }}
          >
            {quickSaving ? 'Saving…' : 'Save hours'}
          </button>

          {quickDays.size > 0 && quickStart && quickEnd && !showSavePresetForm && (
            <button
              onClick={() => { setShowSavePresetForm(true); setPresetError('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600 }}
            >
              {editingPresetId ? 'Update preset' : 'Save current selection as preset'}
            </button>
          )}
        </div>

        {showSavePresetForm && (
          <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>
              {editingPresetId ? 'Preset label' : 'Save this selection as a preset'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={presetLabelInput}
                onChange={(e) => setPresetLabelInput(e.target.value)}
                placeholder="e.g. Summer camp hours"
                style={{ flex: 1, minWidth: '160px', height: '40px', border: `1px solid ${T.border}`, borderRadius: '8px', padding: '0 12px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
              />
              <button
                onClick={confirmSavePreset}
                disabled={presetSaving}
                style={{ height: '40px', padding: '0 16px', background: T.cyan, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, cursor: presetSaving ? 'default' : 'pointer', opacity: presetSaving ? 0.7 : 1 }}
              >
                {presetSaving ? 'Saving…' : editingPresetId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={cancelSavePreset}
                style={{ height: '40px', padding: '0 14px', background: 'none', border: `1px solid ${T.border}`, color: T.ink2, borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
            {presetError && (
              <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px' }}>{presetError}</span>
            )}
          </div>
        )}
      </div>

      {FULL_WEEK.map((day) => {
        const daySlots = slotsByDay[day] || []
        const formOpen = showAddForm === day

        return (
          <div key={day} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: (daySlots.length > 0 || formOpen) ? '16px' : '0' }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink }}>{day}</span>
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3 }}>
                {daySlots.length > 0 ? `${daySlots.length} slot${daySlots.length > 1 ? 's' : ''}` : 'No hours set'}
              </span>
            </div>

            {daySlots.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {daySlots.map((slot) => (
                  <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: T.cyanDim, border: `1px solid ${T.cyanBorder}`, borderRadius: '8px' }}>
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, flex: 1 }}>
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </span>
                    {avDeleteErrors[slot.id] && (
                      <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px' }}>
                        {avDeleteErrors[slot.id]}
                      </span>
                    )}
                    <button
                      onClick={() => deleteAvailability(slot.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontSize: '12px', padding: '2px 6px', borderRadius: '6px', fontFamily: "'Hanken Grotesk', sans-serif" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = T.ink3 }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formOpen && (
              <div style={{ marginTop: daySlots.length > 0 ? '12px' : '0', padding: '14px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>Start</label>
                    <input
                      type="time"
                      value={avFormStart}
                      onChange={(e) => setAvFormStart(e.target.value)}
                      style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600 }}>End</label>
                    <input
                      type="time"
                      value={avFormEnd}
                      onChange={(e) => setAvFormEnd(e.target.value)}
                      style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 10px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink, background: T.card, outline: 'none' }}
                    />
                  </div>
                </div>
                {avFormError && (
                  <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px' }}>
                    {avFormError}
                  </span>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={addAvailability}
                    disabled={avSaving}
                    style={{ background: T.cyan, color: '#FFFFFF', border: 'none', cursor: avSaving ? 'default' : 'pointer', padding: '7px 16px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, opacity: avSaving ? 0.7 : 1 }}
                  >
                    {avSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(null); setAvFormError(''); setAvFormStart(''); setAvFormEnd('') }}
                    style={{ background: 'none', border: `1px solid ${T.border}`, color: T.ink2, cursor: 'pointer', padding: '7px 14px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!formOpen && daySlots.length === 0 && (
              <div
                onClick={() => openForm(day)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', border: '1px dashed rgba(0,0,0,0.10)', borderRadius: '10px', fontSize: '13px', color: T.ink3, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif" }}
              >
                + Add availability
              </div>
            )}
            {!formOpen && daySlots.length > 0 && (
              <div
                onClick={() => openForm(day)}
                style={{ marginTop: '10px', fontSize: '12px', color: T.ink3, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", textAlign: 'center' }}
              >
                + Add availability
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerSchedulePage() {
  const today = new Date()
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [exceptions, setExceptions] = useState<Record<string, 'available' | 'blocked'>>({})
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [weeklyHoursOpen, setWeeklyHoursOpen] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [pendingDay, setPendingDay] = useState<string | null>(null)
  const pendingCellRef = useRef<HTMLDivElement | null>(null)

  // Cancel a pending confirmation if the user clicks anywhere outside that day's cell.
  useEffect(() => {
    if (!pendingDay) return
    function handleOutsideClick(e: MouseEvent) {
      if (pendingCellRef.current && pendingCellRef.current.contains(e.target as Node)) return
      setPendingDay(null)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [pendingDay])

  // Load trainer id + recurring availability once
  useEffect(() => {
    async function loadTrainer() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: trainerRow } = await supabase
        .from('trainers')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!trainerRow) { setLoading(false); return }
      setTrainerId(trainerRow.id)

      const { data: avData } = await supabase
        .from('availability')
        .select('id, day_of_week, start_time, end_time')
        .eq('trainer_id', trainerRow.id)
        .order('day_of_week')
      setAvailabilitySlots(avData ?? [])
    }
    loadTrainer()
  }, [])

  // Load bookings + exceptions for the visible month whenever trainerId or monthCursor changes
  useEffect(() => {
    if (!trainerId) return
    async function loadMonth() {
      setLoading(true)
      const supabase = createClient()
      const year = monthCursor.getFullYear()
      const month = monthCursor.getMonth()
      const rangeStart = new Date(year, month, 1)
      const rangeEnd = new Date(year, month + 1, 1)

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, session_time, status, format, parent_id, athletes!athlete_id(name), profiles!parent_id(name)')
        .eq('trainer_id', trainerId)
        .gte('session_time', rangeStart.toISOString())
        .lt('session_time', rangeEnd.toISOString())
        .order('session_time', { ascending: true })

      const bookingIds = (bookingData ?? []).map((b: any) => b.id)
      let feedbackIds = new Set<string>()
      if (bookingIds.length > 0) {
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('booking_id')
          .in('booking_id', bookingIds)
        feedbackIds = new Set((reviewData ?? []).map((r) => r.booking_id as string))
      }

      setBookings(
        (bookingData ?? []).map((b: any) => ({
          id: b.id,
          session_time: b.session_time,
          status: b.status,
          format: b.format,
          athleteName: b.athletes?.name ?? 'Athlete',
          parentName: b.profiles?.name ?? 'Parent',
          parentProfileId: b.parent_id ?? '',
          hasFeedback: feedbackIds.has(b.id),
        }))
      )

      const startKey = dateKey(rangeStart)
      const endKey = dateKey(new Date(year, month + 1, 0))
      const { data: exceptionData } = await supabase
        .from('availability_exceptions')
        .select('exception_date, status')
        .eq('trainer_id', trainerId)
        .gte('exception_date', startKey)
        .lte('exception_date', endKey)

      setExceptions(
        Object.fromEntries((exceptionData ?? []).map((e: any) => [e.exception_date, e.status]))
      )

      setLoading(false)
    }
    loadMonth()
  }, [trainerId, monthCursor])

  const recurringWeekdays = useMemo(
    () => new Set(availabilitySlots.map((s) => s.day_of_week)),
    [availabilitySlots]
  )

  const bookedDateKeys = useMemo(() => {
    const set = new Set<string>()
    for (const b of bookings) {
      if (b.status === 'confirmed' || b.status === 'pending') {
        set.add(dateKey(new Date(b.session_time)))
      }
    }
    return set
  }, [bookings])

  function resolveStatus(d: Date): DayStatus {
    const key = dateKey(d)
    if (bookedDateKeys.has(key)) return 'booked'
    const exception = exceptions[key]
    if (exception) return exception
    return recurringWeekdays.has(d.getDay()) ? 'available' : 'blocked'
  }

  const [bookingActionErrors, setBookingActionErrors] = useState<Record<string, string>>({})

  async function confirmBooking(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id)
    if (error) {
      setBookingActionErrors((prev) => ({ ...prev, [id]: 'Failed to confirm. Try again.' }))
      return
    }
    setBookingActionErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'confirmed' } : b))
  }

  async function declineBooking(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status: 'declined' }).eq('id', id)
    if (error) {
      setBookingActionErrors((prev) => ({ ...prev, [id]: 'Failed to decline. Try again.' }))
      return
    }
    setBookingActionErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'declined' } : b))
  }

  function requestDayToggle(d: Date) {
    if (!trainerId) return
    if (resolveStatus(d) === 'booked') return
    setPendingDay(dateKey(d))
  }

  async function confirmDayToggle(d: Date) {
    if (!trainerId) return
    const current = resolveStatus(d)
    setPendingDay(null)
    if (current === 'booked') return
    const previous: 'available' | 'blocked' = current
    const next: 'available' | 'blocked' = current === 'available' ? 'blocked' : 'available'
    const key = dateKey(d)

    setExceptions((prev) => ({ ...prev, [key]: next })) // optimistic
    setToggleError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('availability_exceptions')
      .upsert(
        { trainer_id: trainerId, exception_date: key, status: next },
        { onConflict: 'trainer_id,exception_date' }
      )

    if (error) {
      setExceptions((prev) => ({ ...prev, [key]: previous }))
      setToggleError('Failed to save that change. Try again.')
    }
  }

  function goMonth(delta: number) {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const monthCells = useMemo(
    () => buildMonthCells(monthCursor.getFullYear(), monthCursor.getMonth()),
    [monthCursor]
  )

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(a.session_time).getTime() - new Date(b.session_time).getTime()),
    [bookings]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '672px', margin: '0 auto' }}>

        <div style={{
          background: '#FFFFFF', borderRadius: '20px', border: `1px solid ${T.border}`, overflow: 'hidden',
        }}>

          {/* Month header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 4px' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '20px', color: T.ink }}>
              {MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => goMonth(-1)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}
              ><ChevronLeft size={16} /></button>
              <button
                onClick={() => goMonth(1)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}
              ><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', padding: '8px 20px 4px', flexWrap: 'wrap' }}>
            {(['available', 'booked', 'blocked'] as DayStatus[]).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: DAY_COLORS[s].dot, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink2 }}>
                  {s === 'available' ? 'Open' : s === 'booked' ? 'Booked' : 'Blocked'}
                </span>
              </div>
            ))}
          </div>

          {/* Weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '12px 12px 0' }}>
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', fontWeight: 600, color: T.ink3, textTransform: 'uppercase' as const, letterSpacing: '.04em', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px 8px', gap: '3px' }}>
            {monthCells.map((cellDate, i) => {
              if (!cellDate) return <div key={i} />
              const status = resolveStatus(cellDate)
              const isToday = dateKey(cellDate) === dateKey(today)
              const colors = DAY_COLORS[status]
              const clickable = status !== 'booked'
              const cellKey = dateKey(cellDate)
              const isPending = pendingDay === cellKey
              return (
                <div
                  key={i}
                  ref={isPending ? pendingCellRef : undefined}
                  onClick={clickable && !isPending ? () => requestDayToggle(cellDate) : undefined}
                  style={{
                    minHeight: '52px', borderRadius: '10px', background: isPending ? '#FFF7ED' : colors.bg,
                    border: isPending ? '1.5px solid #F59E0B' : isToday ? `1.5px solid ${T.cyan}` : '1px solid transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '4px', cursor: clickable && !isPending ? 'pointer' : 'default', userSelect: 'none' as const,
                    padding: '2px',
                  }}
                >
                  {isPending ? (
                    <>
                      <span style={{
                        fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '10px', fontWeight: 600,
                        color: '#92400E', textAlign: 'center', lineHeight: 1.2,
                      }}>
                        {status === 'available' ? 'Block' : 'Open'} {shortDayLabel(cellDate)}?
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); confirmDayToggle(cellDate) }}
                          title="Confirm"
                          style={{
                            width: '20px', height: '20px', borderRadius: '5px', border: 'none',
                            background: '#10B981', color: '#FFFFFF', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                        ><Check size={12} /></button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPendingDay(null) }}
                          title="Cancel"
                          style={{
                            width: '20px', height: '20px', borderRadius: '5px', border: 'none',
                            background: '#E5E7EB', color: '#4B5563', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                        ><X size={12} /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: isToday ? 700 : 500, color: T.ink }}>
                        {cellDate.getDate()}
                      </span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.dot }} />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {toggleError && (
            <div style={{ padding: '0 20px 12px', color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px' }}>
              {toggleError}
            </div>
          )}

          {/* Weekly hours entry point */}
          <div style={{ borderTop: `1px solid ${T.border}`, padding: '16px 20px' }}>
            <button
              onClick={() => setWeeklyHoursOpen((v) => !v)}
              style={{
                width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '10px', padding: '0 16px',
                cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: T.ink,
              }}
            >
              Set your weekly hours
              <span style={{ transform: weeklyHoursOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: T.ink3 }}>⌄</span>
            </button>
            <AnimatePresence>
              {weeklyHoursOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingTop: '16px' }}>
                    <WeeklyHoursPanel
                      trainerId={trainerId}
                      availabilitySlots={availabilitySlots}
                      setAvailabilitySlots={setAvailabilitySlots}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Booked sessions this month */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 4px' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px', color: T.ink }}>
              Booked sessions this month
            </span>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: '12px' }}>
            {loading ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                Loading…
              </div>
            ) : sortedBookings.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                No sessions this month
              </div>
            ) : (
              sortedBookings.map((b, i) => {
                const pill = statusPillStyle(b.status)
                const isPast = new Date(b.session_time).getTime() < Date.now()
                return (
                  <div key={b.id} style={{
                    padding: '14px 20px',
                    borderBottom: i < sortedBookings.length - 1 ? `1px solid ${T.border}` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: T.ink }}>
                            {formatSessionDate(b.session_time)}
                          </span>
                          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                            {formatSessionTime(b.session_time)}
                          </span>
                        </div>
                        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', color: T.ink2, marginTop: '2px' }}>
                          {b.athleteName} · {b.parentName} · {normalizeFormat(b.format)}
                        </div>
                      </div>
                      <span style={{
                        flexShrink: 0, padding: '4px 10px', borderRadius: '999px',
                        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
                        letterSpacing: '.05em', textTransform: 'uppercase' as const,
                        background: pill.bg, color: pill.color,
                      }}>{pill.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <Link
                        href={`/dashboard/trainer/messages?withId=${b.parentProfileId}`}
                        style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.cyan, textDecoration: 'none', fontWeight: 600 }}
                      >
                        Message parent
                      </Link>
                      {isPast && b.hasFeedback && (
                        <Link
                          href={`/review?bookingId=${b.id}`}
                          style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink2, textDecoration: 'none', fontWeight: 600 }}
                        >
                          View feedback
                        </Link>
                      )}
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => confirmBooking(b.id)}
                            style={{ background: T.cyan, color: '#FFFFFF', border: 'none', cursor: 'pointer', padding: '5px 12px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 700 }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => declineBooking(b.id)}
                            style={{ background: 'none', border: '1px solid rgba(0,0,0,0.12)', color: T.ink2, cursor: 'pointer', padding: '5px 12px', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px' }}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {bookingActionErrors[b.id] && (
                        <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px' }}>
                          {bookingActionErrors[b.id]}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
