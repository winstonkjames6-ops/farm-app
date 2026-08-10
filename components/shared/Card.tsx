import { T } from '@/lib/theme'

type CardProps = {
  children: React.ReactNode
  variant?: 'default' | 'compact'
  style?: React.CSSProperties
}

export function Card({ children, variant = 'default', style }: CardProps) {
  const cardStyle = variant === 'compact' ? T.cardCompact : T.card
  return (
    <div
      style={{
        background: cardStyle.background,
        border: cardStyle.border,
        borderRadius: cardStyle.borderRadius,
        padding: cardStyle.padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
