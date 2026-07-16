// Single source of truth for turning a trainer's active preset into bookable slots.
// Used by the public booking page (app/trainer/[slug]) and the trainer's own
// schedule dashboard (app/dashboard/trainer/schedule) so both read the exact
// same generation logic instead of drifting apart.

export type PresetSlotConfig = {
  days: number[]
  start_time: string
  end_time: string
  session_length_minutes: number
  break_minutes: number
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTimeStr(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Steps from start_time by (session_length_minutes + break_minutes), stopping once
// a session starting at that point would run past end_time.
export function generateSlotsForPreset(preset: PresetSlotConfig | null | undefined): string[] {
  if (!preset) return []
  const step = preset.session_length_minutes + preset.break_minutes
  const startMin = timeToMinutes(preset.start_time)
  const endMin = timeToMinutes(preset.end_time)
  const slots: string[] = []
  let cursor = startMin
  while (cursor + preset.session_length_minutes <= endMin) {
    slots.push(minutesToTimeStr(cursor))
    cursor += step
  }
  return slots
}

export function buildSlotISO(isoDate: string, startTime: string): string {
  const parts = startTime.split(':').map(Number)
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day, parts[0], parts[1], 0).toISOString()
}
