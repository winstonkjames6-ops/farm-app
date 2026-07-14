// Consistent per-athlete color coding, reused anywhere athletes need a color key
// (calendar dots, filter chips, session bars). Deterministic by athlete id so the
// same athlete always gets the same color regardless of fetch order.

const PALETTE = [
  '#7C3AED', // violet
  '#2563EB', // blue
  '#16A34A', // green
  '#EA580C', // orange
  '#DB2777', // pink
  '#4F46E5', // indigo
  '#B45309', // brown
  '#475569', // slate
  '#C026D3', // fuchsia
  '#0D9488', // deep teal
]

export function getAthleteColor(athleteId: string): string {
  let hash = 0
  for (let i = 0; i < athleteId.length; i++) {
    hash = (hash * 31 + athleteId.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % PALETTE.length
  return PALETTE[index]
}
