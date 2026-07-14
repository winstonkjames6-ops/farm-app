import { ProfileCardTokens, TabItem } from './types'

export function PillTabBar({
  tabs, active, onChange, tokens,
}: {
  tabs: TabItem[]
  active: string
  onChange: (key: string) => void
  tokens: ProfileCardTokens
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '4px 24px 16px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {tabs.map((t) => {
        const sel = t.key === active
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              height: '36px', padding: '0 16px', borderRadius: '999px',
              border: 'none', cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
              background: sel ? tokens.cyan : tokens.surface2,
              color: sel ? '#FFFFFF' : tokens.ink2,
            }}
          >{t.label}</button>
        )
      })}
    </div>
  )
}
