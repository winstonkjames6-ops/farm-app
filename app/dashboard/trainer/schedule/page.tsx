'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pencil, Trash2, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { generateSlotsForPreset, buildSlotISO } from '@/lib/scheduling'

// ── Types ──────────────────────────────────────────────────────────────────────

type TrainerPreset = {
  id: string
  label: string
  days: number[]
  start_time: string
  end_time: string
}

// Config for the trainer's active preset — the same shape the public booking
// page reads, so slot generation can call the exact same generateSlotsForPreset().
type ActivePresetConfig = {
  days: number[]
  start_time: string
  end_time: string
  session_length_minutes: number
  break_minutes: number
}

type GeneratedSlot = {
  start_time: string
  booking: BookingRow | null
}

type ScheduleView = 'day' | 'week' | 'month'

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

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

function startOfWeek(d: Date): Date {
  const dow = (d.getDay() + 6) % 7 // Mon=0 .. Sun=6, matching buildMonthCells
  return addDays(d, -dow)
}

function formatSessionDate(sessionTime: string): string {
  const dt = new Date(sessionTime)
  return `${DAY_NAMES[dt.getDay()].slice(0, 3)}, ${MONTH_NAMES[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`
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

// ── Weekly hours panel ──────────────────────────────────────────────────────────

function WeeklyHoursPanel({
  trainerId,
  onActivePresetChanged,
}: {
  trainerId: string | null
  onActivePresetChanged: () => void
}) {
  // Quick-add-with-presets — prefills day checkboxes + start/end below; "Save hours"
  // writes this straight into the active trainer_presets row (see saveHours()).
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

  // Built-in presets a trainer has chosen to hide from their own quick-add row
  // (trainers.hidden_builtin_presets) — scoped to this trainer's row only.
  const [hiddenBuiltinPresets, setHiddenBuiltinPresets] = useState<string[]>([])
  const [builtinHideErrors, setBuiltinHideErrors] = useState<Record<string, string>>({})
  const [showRestoreBuiltins, setShowRestoreBuiltins] = useState(false)
  const [restoreSaving, setRestoreSaving] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState('')

  // Collapsed-by-default section housing built-in presets + other saved schedules —
  // the live schedule card above is the only thing shown expanded on open.
  const [showOtherSchedules, setShowOtherSchedules] = useState(false)

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
          .select('active_preset_id, hidden_builtin_presets')
          .eq('id', trainerId)
          .single(),
      ])
      const presets = presetsRes.data ?? []
      const activeId = trainerRes.data?.active_preset_id ?? null
      setCustomPresets(presets)
      setLiveActivePresetId(activeId)
      setHiddenBuiltinPresets(trainerRes.data?.hidden_builtin_presets ?? [])

      // Prefill the live-schedule card with whichever preset is actually active,
      // so it shows real days/hours on load instead of an empty form.
      const livePreset = activeId ? presets.find((p) => p.id === activeId) : null
      if (livePreset) {
        setQuickDays(new Set(livePreset.days))
        setQuickStart(toHHMM(livePreset.start_time))
        setQuickEnd(toHHMM(livePreset.end_time))
        setActivePreset(`custom:${livePreset.id}`)
      }
    }
    loadPresets()
  }, [trainerId])

  async function hideBuiltinPreset(key: string) {
    if (!trainerId) return
    setBuiltinHideErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
    const nextHidden = hiddenBuiltinPresets.includes(key) ? hiddenBuiltinPresets : [...hiddenBuiltinPresets, key]
    const supabase = createClient()
    const { error } = await supabase.from('trainers').update({ hidden_builtin_presets: nextHidden }).eq('id', trainerId)
    if (error) {
      setBuiltinHideErrors((prev) => ({ ...prev, [key]: 'Failed to hide. Try again.' }))
      return
    }
    setHiddenBuiltinPresets(nextHidden)
    if (activePreset === key) setActivePreset(null)
  }

  async function restoreBuiltinPreset(key: string) {
    if (!trainerId) return
    setRestoreError('')
    setRestoreSaving(key)
    const nextHidden = hiddenBuiltinPresets.filter((k) => k !== key)
    const supabase = createClient()
    const { error } = await supabase.from('trainers').update({ hidden_builtin_presets: nextHidden }).eq('id', trainerId)
    setRestoreSaving(null)
    if (error) {
      setRestoreError('Failed to restore. Try again.')
      return
    }
    setHiddenBuiltinPresets(nextHidden)
  }

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
    onActivePresetChanged()
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

  // Explicit "Set as active" for a saved schedule — mirrors it into the live-schedule
  // card above (its own stored days/hours, not whatever's currently in the form) and
  // flips trainers.active_preset_id. Separate from clicking the label, which only previews.
  function activateCustomPreset(preset: TrainerPreset) {
    applyCustomPreset(preset)
    markPresetActive(preset.id)
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

  // Shared by saveHours' "no active preset yet" branch and activateBuiltinPreset:
  // inserts a new trainer_presets row and immediately activates it. Always inserts —
  // never updates an already-active preset in place — so picking a different
  // schedule can never silently overwrite the one currently live.
  async function createAndActivatePreset(label: string, days: number[], start: string, end: string) {
    if (!trainerId) return null
    setQuickSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('trainer_presets')
      .insert({ trainer_id: trainerId, label, days, start_time: start, end_time: end })
      .select('id, label, days, start_time, end_time')
      .single()
    if (error) {
      setQuickSaving(false)
      setQuickError('Failed to save. Try again.')
      return null
    }

    const { error: activateError } = await supabase
      .from('trainers')
      .update({ active_preset_id: data.id })
      .eq('id', trainerId)
    setQuickSaving(false)
    setCustomPresets((prev) => [...prev, data])
    if (activateError) {
      setQuickError('Saved, but failed to set as active. Try again.')
      return null
    }
    setLiveActivePresetId(data.id)
    return data
  }

  // "Save hours" writes straight through the preset system — this IS the trainer's
  // live schedule, not a staging area. With no active preset yet, this creates and
  // activates a default "My hours" preset in one step; otherwise it updates the
  // active preset's days/start_time/end_time in place (label untouched).
  async function saveHours() {
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
    const days = Array.from(quickDays).sort((a, b) => a - b)

    if (liveActivePresetId) {
      setQuickSaving(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('trainer_presets')
        .update({ days, start_time: quickStart, end_time: quickEnd })
        .eq('id', liveActivePresetId)
        .select('id, label, days, start_time, end_time')
        .single()
      setQuickSaving(false)
      if (error) {
        setQuickError('Failed to save. Try again.')
        return
      }
      setCustomPresets((prev) => prev.map((p) => (p.id === liveActivePresetId ? data : p)))
      setActivePreset(`custom:${liveActivePresetId}`)
      onActivePresetChanged()
      return
    }

    const data = await createAndActivatePreset('My hours', days, quickStart, quickEnd)
    if (data) {
      setActivePreset(`custom:${data.id}`)
      onActivePresetChanged()
    }
  }

  // Built-in presets have no backing trainer_presets row yet — "Set as active" must
  // create one and activate it in a single action rather than routing through "Save
  // hours" (which would instead update whichever preset is currently active in place).
  // Uses the built-in's own days/hours so it doesn't depend on click order, falling
  // back to the live form's start/end for "Same hours every day" (no fixed times).
  async function activateBuiltinPreset(preset: HourPreset) {
    if (!trainerId) return
    const days = preset.days.slice().sort((a, b) => a - b)
    const start = preset.start ?? quickStart
    const end = preset.end ?? quickEnd
    if (!start || !end) {
      setQuickError('Please set both start and end times.')
      return
    }
    if (start >= end) {
      setQuickError('Start time must be before end time.')
      return
    }
    setQuickError('')
    const data = await createAndActivatePreset(preset.label, days, start, end)
    if (!data) return
    setQuickDays(new Set(days))
    setQuickStart(start)
    setQuickEnd(end)
    setActivePreset(`custom:${data.id}`)
  }

  const livePresetLabel = liveActivePresetId
    ? customPresets.find((p) => p.id === liveActivePresetId)?.label ?? null
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Your live schedule — the primary, always-visible card. Whatever's shown
          here (via quickDays/quickStart/quickEnd) is what's bookable right now. */}
      <div style={{ background: T.card, border: `1.5px solid ${T.cyanBorder}`, borderRadius: '14px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink }}>
            Your live schedule
          </span>
          {livePresetLabel && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px 3px 6px', borderRadius: '999px',
              background: 'rgba(0,188,200,0.15)', color: T.cyan,
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '10px',
              letterSpacing: '.06em', textTransform: 'uppercase' as const,
            }}>
              <Star size={10} fill={T.cyan} /> {livePresetLabel}
            </span>
          )}
        </div>
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', color: T.ink2, marginBottom: '14px' }}>
          This is what's bookable on your public page. Edit the days and hours below, then save.
        </div>

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
            onClick={saveHours}
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

      {/* Everything else — built-in presets + other saved schedules — collapsed by
          default so the live schedule above stays the primary, uncluttered focus. */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '4px 20px' }}>
        <button
          onClick={() => setShowOtherSchedules((v) => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0',
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: T.ink,
          }}
        >
          Use a different schedule
          <span style={{ transform: showOtherSchedules ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: T.ink3 }}>⌄</span>
        </button>

        {showOtherSchedules && (
          <div style={{ paddingBottom: '18px' }}>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600, marginBottom: '8px' }}>
              Built-in presets
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {HOUR_PRESETS.filter((preset) => !hiddenBuiltinPresets.includes(preset.key)).map((preset) => {
                const sel = activePreset === preset.key
                const isDefault = preset.key === HOUR_PRESETS[0].key
                return (
                  <div
                    key={preset.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '2px',
                      height: '38px', padding: '0 4px 0 16px', borderRadius: '999px',
                      border: sel ? `1.5px solid ${T.cyan}` : isDefault ? `1.5px solid ${T.cyanBorder}` : `1px solid ${T.border}`,
                      background: sel ? 'rgba(0,188,200,0.12)' : isDefault ? T.cyanDim : 'transparent',
                    }}
                  >
                    <button
                      onClick={() => applyPreset(preset)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px 0 0',
                        fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
                        color: (sel || isDefault) ? T.cyan : T.ink2,
                      }}
                    >{preset.label}</button>
                    <button
                      onClick={() => activateBuiltinPreset(preset)}
                      disabled={quickSaving}
                      title="Set as active"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', cursor: quickSaving ? 'default' : 'pointer',
                        color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 700,
                        padding: '4px 8px 4px 4px',
                      }}
                    ><Star size={12} /> Set as active</button>
                    <button
                      onClick={() => hideBuiltinPreset(preset.key)}
                      title="Hide preset"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', padding: '6px' }}
                    ><Trash2 size={13} /></button>
                    {builtinHideErrors[preset.key] && (
                      <span style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px' }}>
                        {builtinHideErrors[preset.key]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {hiddenBuiltinPresets.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => setShowRestoreBuiltins((v) => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 600, padding: 0 }}
                >
                  {showRestoreBuiltins ? 'Hide restore options' : `Restore hidden presets (${hiddenBuiltinPresets.length})`}
                </button>
                {showRestoreBuiltins && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {hiddenBuiltinPresets.map((key) => {
                      const preset = HOUR_PRESETS.find((p) => p.key === key)
                      return (
                        <div
                          key={key}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            height: '32px', padding: '0 6px 0 12px', borderRadius: '999px',
                            border: `1px dashed ${T.border}`,
                          }}
                        >
                          <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', color: T.ink2 }}>
                            {preset?.label ?? key}
                          </span>
                          <button
                            onClick={() => restoreBuiltinPreset(key)}
                            disabled={restoreSaving === key}
                            style={{
                              background: 'none', border: 'none', cursor: restoreSaving === key ? 'default' : 'pointer',
                              color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 700,
                              padding: '4px 6px',
                            }}
                          >{restoreSaving === key ? 'Adding…' : '+ Add back'}</button>
                        </div>
                      )
                    })}
                  </div>
                )}
                {restoreError && (
                  <div style={{ color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', marginTop: '6px' }}>
                    {restoreError}
                  </div>
                )}
              </div>
            )}

            {customPresets.length > 0 && (
              <>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink2, fontWeight: 600, margin: '10px 0 8px' }}>
                  Saved schedules
                </div>
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
                            title="This is your live schedule"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px 3px 6px', borderRadius: '999px',
                              background: 'rgba(0,188,200,0.15)', color: T.cyan,
                              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '10px',
                              letterSpacing: '.06em', textTransform: 'uppercase' as const, marginRight: '2px',
                            }}
                          ><Star size={10} fill={T.cyan} /> Active</span>
                        ) : (
                          <button
                            onClick={() => activateCustomPreset(preset)}
                            disabled={activePresetSaving}
                            title="Set as active"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              background: 'none', border: 'none', cursor: activePresetSaving ? 'default' : 'pointer',
                              color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 700,
                              padding: '4px 8px 4px 4px',
                            }}
                          ><Star size={12} /> Set as active</button>
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
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerSchedulePage() {
  const today = new Date()
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [view, setView] = useState<ScheduleView>('month')
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [weekCursor, setWeekCursor] = useState(startOfWeek(today))
  const [dayCursor, setDayCursor] = useState(today)
  const [activePreset, setActivePreset] = useState<ActivePresetConfig | null>(null)
  const [exceptions, setExceptions] = useState<Record<string, 'available' | 'blocked'>>({})
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [weeklyHoursOpen, setWeeklyHoursOpen] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Record<string, 'available' | 'blocked'>>({})
  const [confirmSaving, setConfirmSaving] = useState(false)

  // Moving the browsed date range (in any view) discards unsaved pending changes
  // rather than carrying or silently saving them — the batch never writes without
  // an explicit confirm click. Switching view tabs alone does not trigger this.
  useEffect(() => {
    setPendingChanges({})
  }, [monthCursor, weekCursor, dayCursor])

  // Load the trainer's active preset (same config shape + same generateSlotsForPreset
  // the public booking page uses) so Week/Day views generate the exact same slots.
  // Also re-run this on demand (see onActivePresetChanged below) whenever the panel
  // activates or edits a preset, so Week/Day don't keep showing a stale schedule.
  async function refreshActivePreset() {
    if (!trainerId) return
    const supabase = createClient()
    const { data: trainerRow } = await supabase
      .from('trainers')
      .select('active_preset_id')
      .eq('id', trainerId)
      .single()
    if (!trainerRow?.active_preset_id) { setActivePreset(null); return }
    const { data: preset } = await supabase
      .from('trainer_presets')
      .select('days, start_time, end_time, session_length_minutes, break_minutes')
      .eq('id', trainerRow.active_preset_id)
      .single()
    setActivePreset(preset ?? null)
  }

  useEffect(() => {
    refreshActivePreset()
  }, [trainerId])

  // Load trainer id once
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
    }
    loadTrainer()
  }, [])

  // Load bookings + exceptions covering the union of the current month (so the
  // "Booked sessions this month" list below always has full-month data, regardless
  // of the active view) and the active view's own visible window (so Week/Day cells
  // are covered even when they fall in a different month than monthCursor).
  async function loadRangeData() {
    if (!trainerId) return
    setLoading(true)
    const supabase = createClient()

    const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
    const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
    let viewStart: Date = monthStart
    let viewEnd: Date = monthEnd
    if (view === 'week') {
      viewStart = weekCursor
      viewEnd = addDays(weekCursor, 7)
    } else if (view === 'day') {
      viewStart = dayCursor
      viewEnd = addDays(dayCursor, 1)
    }

    const rangeStart = viewStart < monthStart ? viewStart : monthStart
    const rangeEnd = viewEnd > monthEnd ? viewEnd : monthEnd

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
    const endKey = dateKey(addDays(rangeEnd, -1))
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

  useEffect(() => {
    loadRangeData()
  }, [trainerId, view, monthCursor, weekCursor, dayCursor])

  const bookedDateKeys = useMemo(() => {
    const set = new Set<string>()
    for (const b of bookings) {
      if (b.status === 'confirmed' || b.status === 'pending') {
        set.add(dateKey(new Date(b.session_time)))
      }
    }
    return set
  }, [bookings])

  // Same booking rows Month view already loads, indexed by exact slot start time
  // so Week/Day views can label each generated slot Open vs Booked (+ client name).
  const bookingsByTime = useMemo(() => {
    const map = new Map<number, BookingRow>()
    for (const b of bookings) {
      if (b.status === 'confirmed' || b.status === 'pending') {
        map.set(new Date(b.session_time).getTime(), b)
      }
    }
    return map
  }, [bookings])

  function resolveStatus(d: Date): DayStatus {
    const key = dateKey(d)
    if (bookedDateKeys.has(key)) return 'booked'
    const exception = exceptions[key]
    if (exception) return exception
    return activePreset?.days.includes(d.getDay()) ? 'available' : 'blocked'
  }

  // Same generateSlotsForPreset() the public booking page uses, fed by the trainer's
  // active preset + the same exceptions loaded above — one source of truth for Week/Day.
  function slotsForDay(d: Date): GeneratedSlot[] {
    if (!activePreset) return []
    const iso = dateKey(d)
    if (exceptions[iso] === 'blocked') return []
    if (!activePreset.days.includes(d.getDay())) return []
    return generateSlotsForPreset(activePreset).map((start_time) => {
      const slotISO = buildSlotISO(iso, start_time)
      return { start_time, booking: bookingsByTime.get(new Date(slotISO).getTime()) ?? null }
    })
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

  // Toggling a day only edits local pending-change state — no write happens until
  // "Confirm changes" is clicked. Clicking an already-pending day un-marks it.
  function toggleDayPending(d: Date) {
    if (!trainerId) return
    const current = resolveStatus(d)
    if (current === 'booked') return
    const key = dateKey(d)
    setPendingChanges((prev) => {
      if (key in prev) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: current === 'available' ? 'blocked' : 'available' }
    })
  }

  function cancelPendingChanges() {
    setPendingChanges({})
  }

  async function confirmPendingChanges() {
    if (!trainerId) return
    const entries = Object.entries(pendingChanges)
    if (entries.length === 0) return

    setConfirmSaving(true)
    setToggleError(null)
    const supabase = createClient()
    const results = await Promise.all(
      entries.map(async ([exceptionDate, status]) => {
        const { error } = await supabase
          .from('availability_exceptions')
          .upsert(
            { trainer_id: trainerId, exception_date: exceptionDate, status },
            { onConflict: 'trainer_id,exception_date' }
          )
        return { exceptionDate, error }
      })
    )
    setConfirmSaving(false)

    const failedKeys = results.filter((r) => r.error).map((r) => r.exceptionDate)
    if (failedKeys.length > 0) {
      setPendingChanges((prev) => {
        const next: Record<string, 'available' | 'blocked'> = {}
        failedKeys.forEach((k) => { next[k] = prev[k] })
        return next
      })
      setToggleError(`Failed to save ${failedKeys.length} of ${entries.length} change${entries.length > 1 ? 's' : ''}. Try again.`)
      return
    }

    setPendingChanges({})
    await loadRangeData()
  }

  // Navigation adapts to the active view: day-by-day, week-by-week, or month-by-month.
  function goPrev() {
    if (view === 'week') setWeekCursor((prev) => addDays(prev, -7))
    else if (view === 'day') setDayCursor((prev) => addDays(prev, -1))
    else setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  function goNext() {
    if (view === 'week') setWeekCursor((prev) => addDays(prev, 7))
    else if (view === 'day') setDayCursor((prev) => addDays(prev, 1))
    else setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const headerLabel = useMemo(() => {
    if (view === 'week') {
      const end = addDays(weekCursor, 6)
      const startLabel = `${MONTH_NAMES[weekCursor.getMonth()].slice(0, 3)} ${weekCursor.getDate()}`
      const endLabel = weekCursor.getMonth() === end.getMonth()
        ? `${end.getDate()}`
        : `${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getDate()}`
      return `${startLabel}–${endLabel}, ${end.getFullYear()}`
    }
    if (view === 'day') {
      return `${DAY_NAMES[dayCursor.getDay()]}, ${MONTH_NAMES[dayCursor.getMonth()].slice(0, 3)} ${dayCursor.getDate()}`
    }
    return `${MONTH_NAMES[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`
  }, [view, weekCursor, dayCursor, monthCursor])

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekCursor, i)),
    [weekCursor]
  )

  const monthCells = useMemo(
    () => buildMonthCells(monthCursor.getFullYear(), monthCursor.getMonth()),
    [monthCursor]
  )

  // "Booked sessions this month" always reflects monthCursor's month specifically —
  // `bookings` itself may span a wider range when Week/Day view is active (see
  // loadRangeData), so this filters back down before the list renders.
  const sortedBookings = useMemo(() => {
    const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1).getTime()
    const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1).getTime()
    return bookings
      .filter((b) => {
        const t = new Date(b.session_time).getTime()
        return t >= monthStart && t < monthEnd
      })
      .sort((a, b) => new Date(a.session_time).getTime() - new Date(b.session_time).getTime())
  }, [bookings, monthCursor])

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

          {/* Calendar header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 4px' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '20px', color: T.ink }}>
              {headerLabel}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={goPrev}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}
              ><ChevronLeft size={16} /></button>
              <button
                onClick={goNext}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}
              ><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Day / Week / Month toggle */}
          <div style={{ display: 'flex', gap: '4px', padding: '10px 20px 0' }}>
            {(['day', 'week', 'month'] as ScheduleView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  flex: 1, height: '30px', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 600,
                  textTransform: 'capitalize' as const,
                  border: view === v ? `1.5px solid ${T.cyan}` : `1px solid ${T.border}`,
                  background: view === v ? 'rgba(0,188,200,0.1)' : 'transparent',
                  color: view === v ? T.cyan : T.ink2,
                }}
              >{v}</button>
            ))}
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

          {view === 'month' && (
            <>
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
                  const clickable = status !== 'booked'
                  const cellKey = dateKey(cellDate)
                  const pendingTarget = pendingChanges[cellKey]
                  const isPending = pendingTarget !== undefined
                  const colors = DAY_COLORS[isPending ? pendingTarget : status]
                  return (
                    <div
                      key={i}
                      onClick={clickable ? () => toggleDayPending(cellDate) : undefined}
                      style={{
                        minHeight: '52px', borderRadius: '10px', background: isPending ? '#FFFBEB' : colors.bg,
                        border: isPending ? '1.5px dashed #F59E0B' : isToday ? `1.5px solid ${T.cyan}` : '1px solid transparent',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '4px', cursor: clickable ? 'pointer' : 'default', userSelect: 'none' as const,
                      }}
                    >
                      <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: isToday ? 700 : 500, color: T.ink }}>
                        {cellDate.getDate()}
                      </span>
                      {isPending ? (
                        <span style={{
                          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '8.5px', fontWeight: 700,
                          textTransform: 'uppercase' as const, letterSpacing: '.03em',
                          color: pendingTarget === 'blocked' ? '#B45309' : '#00838C',
                        }}>
                          {pendingTarget === 'blocked' ? 'Block' : 'Open'}
                        </span>
                      ) : (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.dot }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {view === 'week' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 20px 8px' }}>
              {weekDays.map((d) => {
                const status = resolveStatus(d)
                const isToday = dateKey(d) === dateKey(today)
                const clickable = status !== 'booked'
                const cellKey = dateKey(d)
                const pendingTarget = pendingChanges[cellKey]
                const isPending = pendingTarget !== undefined
                const displayStatus = isPending ? pendingTarget : status
                const daySlots = slotsForDay(d)
                return (
                  <div
                    key={cellKey}
                    onClick={clickable ? () => toggleDayPending(d) : undefined}
                    style={{
                      borderRadius: '12px', padding: '12px 14px',
                      background: isPending ? '#FFFBEB' : DAY_COLORS[displayStatus].bg,
                      border: isPending ? '1.5px dashed #F59E0B' : isToday ? `1.5px solid ${T.cyan}` : `1px solid ${T.border}`,
                      cursor: clickable ? 'pointer' : 'default', userSelect: 'none' as const,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: daySlots.length > 0 ? '8px' : '0' }}>
                      <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13.5px', fontWeight: 700, color: T.ink }}>
                        {DAY_NAMES[d.getDay()].slice(0, 3)} {d.getDate()}
                      </span>
                      {isPending ? (
                        <span style={{
                          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '10px', fontWeight: 700,
                          textTransform: 'uppercase' as const, letterSpacing: '.03em',
                          color: pendingTarget === 'blocked' ? '#B45309' : '#00838C',
                        }}>
                          {pendingTarget === 'blocked' ? 'Will block' : 'Will open'}
                        </span>
                      ) : (
                        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3 }}>
                          {status === 'booked' ? 'Booked' : status === 'blocked' ? 'Blocked' : `${daySlots.length} slot${daySlots.length !== 1 ? 's' : ''}`}
                        </span>
                      )}
                    </div>
                    {daySlots.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {daySlots.map((slot) => (
                          <span
                            key={slot.start_time}
                            style={{
                              padding: '4px 9px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 600,
                              background: slot.booking ? 'rgba(99,102,241,0.12)' : 'rgba(0,188,200,0.10)',
                              color: slot.booking ? '#4F46E5' : '#00838C',
                            }}
                          >
                            {formatTime(slot.start_time)}{slot.booking ? ' · Booked' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {view === 'day' && (() => {
            const status = resolveStatus(dayCursor)
            const cellKey = dateKey(dayCursor)
            const pendingTarget = pendingChanges[cellKey]
            const isPending = pendingTarget !== undefined
            const displayStatus = isPending ? pendingTarget : status
            const clickable = status !== 'booked'
            const daySlots = slotsForDay(dayCursor)
            return (
              <div style={{ padding: '12px 20px 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  onClick={clickable ? () => toggleDayPending(dayCursor) : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderRadius: '12px', padding: '12px 14px',
                    background: isPending ? '#FFFBEB' : DAY_COLORS[displayStatus].bg,
                    border: isPending ? '1.5px dashed #F59E0B' : `1px solid ${T.border}`,
                    cursor: clickable ? 'pointer' : 'default', userSelect: 'none' as const,
                  }}
                >
                  <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: T.ink }}>
                    {displayStatus === 'booked' ? 'This day has bookings' : displayStatus === 'blocked' ? 'This day is blocked' : 'This day is open'}
                  </span>
                  {isPending ? (
                    <span style={{
                      fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '10px', fontWeight: 700,
                      textTransform: 'uppercase' as const, letterSpacing: '.03em',
                      color: pendingTarget === 'blocked' ? '#B45309' : '#00838C',
                    }}>
                      {pendingTarget === 'blocked' ? 'Will block' : 'Will open'}
                    </span>
                  ) : clickable ? (
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11.5px', color: T.cyan, fontWeight: 600 }}>
                      {status === 'available' ? 'Tap to block' : 'Tap to open'}
                    </span>
                  ) : null}
                </div>

                {daySlots.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3 }}>
                    {activePreset ? 'No bookable slots this day' : 'No active preset set — set one below to generate slots'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {daySlots.map((slot) => (
                      <div
                        key={slot.start_time}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: '10px',
                          background: slot.booking ? 'rgba(99,102,241,0.08)' : 'rgba(0,188,200,0.06)',
                          border: `1px solid ${slot.booking ? 'rgba(99,102,241,0.25)' : T.cyanBorder}`,
                        }}
                      >
                        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13.5px', fontWeight: 600, color: T.ink }}>
                          {formatTime(slot.start_time)}
                        </span>
                        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 600, color: slot.booking ? '#4F46E5' : '#00838C' }}>
                          {slot.booking ? `Booked · ${slot.booking.athleteName}` : 'Open'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

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
                      onActivePresetChanged={refreshActivePreset}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {Object.keys(pendingChanges).length > 0 && (
          <div style={{
            position: 'sticky', bottom: '16px', zIndex: 10,
            background: '#111827', borderRadius: '14px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
              {Object.keys(pendingChanges).length} day{Object.keys(pendingChanges).length > 1 ? 's' : ''} will change
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={cancelPendingChanges}
                disabled={confirmSaving}
                style={{
                  height: '34px', padding: '0 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
                  color: '#FFFFFF', borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px',
                  cursor: confirmSaving ? 'default' : 'pointer', opacity: confirmSaving ? 0.6 : 1,
                }}
              >
                Cancel all
              </button>
              <button
                onClick={confirmPendingChanges}
                disabled={confirmSaving}
                style={{
                  height: '34px', padding: '0 16px', background: T.cyan, border: 'none', color: '#FFFFFF',
                  borderRadius: '8px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 700,
                  cursor: confirmSaving ? 'default' : 'pointer', opacity: confirmSaving ? 0.7 : 1,
                }}
              >
                {confirmSaving ? 'Saving…' : 'Confirm changes'}
              </button>
            </div>
          </div>
        )}

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
