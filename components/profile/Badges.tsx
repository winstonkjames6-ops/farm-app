import { ProfileCardTokens } from './types'

export function VerifiedBadge({
  label = 'Verified', tokens,
}: {
  label?: string
  tokens: ProfileCardTokens
}) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px 3px 8px',
      border: `1.5px solid ${tokens.cyan}`, borderRadius: '999px',
      background: 'rgba(0,188,200,0.1)',
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
           stroke={tokens.cyan} strokeWidth={2.2}
           strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
        fontSize: '10.5px', letterSpacing: '.1em', textTransform: 'uppercase' as const,
        color: tokens.cyan,
      }}>{label}</span>
    </div>
  )
}

export function MinorBadge({ tokens }: { tokens: ProfileCardTokens }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', border: `1.5px solid ${tokens.cyan}`,
      borderRadius: '999px', background: 'rgba(0,188,200,0.10)',
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
        fontSize: '10.5px', letterSpacing: '.1em', textTransform: 'uppercase' as const,
        color: '#00838C',
      }}>Under 18</span>
    </div>
  )
}
