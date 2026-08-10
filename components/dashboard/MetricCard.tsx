import { T } from '@/lib/theme'

type MetricCardProps = {
  label: string
  value: string | number
  icon: 'calendar' | 'trending-up' | 'clock' | 'star'
  opacity: number
}

export function MetricCard({ label, value, icon, opacity }: MetricCardProps) {
  return (
    <div
      style={{
        background: `rgba(0, 188, 200, ${opacity})`,
        borderRadius: T.radius.md,
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div
          style={{
            fontSize: T.fontSize.xs,
            fontWeight: T.fontWeight.bold,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: T.fontSize['2xl'],
            fontWeight: T.fontWeight.bold,
            color: '#FFFFFF',
          }}
        >
          {value}
        </div>
      </div>
      <img
        src={`/icons/metric-${icon}.png`}
        alt=""
        style={{
          width: '64px',
          height: '64px',
          opacity: 0.6,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
    </div>
  )
}
