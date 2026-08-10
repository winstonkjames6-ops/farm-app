// Shared by every self-service auth wizard that collects a new password
// (athlete 18+ wizard, and the minor wizard when it's built) — one scoring
// heuristic and one visual, not reimplemented per flow.

import { T } from '@/lib/theme'

export interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
}

const BANDS: Array<{ label: string; color: string }> = [
  { label: 'Too weak', color: T.danger },
  { label: 'Weak', color: T.danger },
  { label: 'Fair', color: T.warning },
  { label: 'Good', color: T.cyan },
  { label: 'Strong', color: T.successLight },
]

export function computePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return { score: 0, label: '', color: BANDS[0].color }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const idx = Math.min(score, BANDS.length - 1)
  return { score: idx, label: BANDS[idx].label, color: BANDS[idx].color }
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (password.length === 0) return null
  const { score, label, color } = computePasswordStrength(password)

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {BANDS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '999px',
            background: i <= score ? color : T.border,
            transition: 'background 0.15s',
          }} />
        ))}
      </div>
      <div style={{
        fontSize: '12px', fontWeight: 600, color, marginTop: '4px',
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}>{label}</div>
    </div>
  )
}
