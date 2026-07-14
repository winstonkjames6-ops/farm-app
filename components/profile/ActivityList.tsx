import { ActivityItem, ProfileCardTokens } from './types'
import { formatRelativeTime } from './utils'

export function ActivityList({
  items, tokens, emptyLabel = 'Nothing to show yet',
}: {
  items: ActivityItem[]
  tokens: ProfileCardTokens
  emptyLabel?: string
}) {
  if (items.length === 0) {
    return (
      <div style={{
        padding: '28px 24px', textAlign: 'center',
        fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: tokens.ink3,
      }}>{emptyLabel}</div>
    )
  }
  return (
    <div style={{ padding: '4px 20px' }}>
      {items.map((item, i) => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 4px',
          borderBottom: i < items.length - 1 ? `1px solid ${tokens.border}` : 'none',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
              fontSize: '14px', color: tokens.ink,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{item.title}</div>
            {item.subtitle && (
              <div style={{
                fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: tokens.ink3,
                marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{item.subtitle}</div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {item.meta && (
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '13px', color: tokens.cyan,
              }}>{item.meta}</div>
            )}
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: tokens.ink3, marginTop: '2px',
            }}>{formatRelativeTime(item.timestamp)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
