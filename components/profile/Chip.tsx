import { ProfileCardTokens } from './types'

export function Chip({
  icon, label, tokens, tone = 'neutral',
}: {
  icon?: React.ReactNode
  label: string
  tokens: ProfileCardTokens
  tone?: 'neutral' | 'cyan'
}) {
  const isCyan = tone === 'cyan'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: icon ? '6px 12px 6px 10px' : '6px 12px',
      borderRadius: '999px',
      border: `1px solid ${isCyan ? 'rgba(0,188,200,0.35)' : tokens.border}`,
      background: isCyan ? 'rgba(0,188,200,0.1)' : tokens.surface2,
      color: isCyan ? tokens.cyan : tokens.ink2,
      fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '12.5px',
      whiteSpace: 'nowrap' as const,
    }}>
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      {label}
    </span>
  )
}
