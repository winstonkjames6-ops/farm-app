import { T } from '@/lib/theme'

const buttonBase: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', sans-serif",
  fontSize: T.fontSize.sm,
  fontWeight: T.fontWeight.bold,
  borderRadius: T.radius.sm,
  padding: '10px 16px',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.2s ease',
}

export const primaryBtnStyle: React.CSSProperties = {
  ...buttonBase,
  background: T.cyan,
  color: '#FFFFFF',
}

export const secondaryBtnStyle: React.CSSProperties = {
  ...buttonBase,
  background: T.surface2,
  color: T.ink,
  border: `1px solid ${T.line}`,
}

export const dangerBtnStyle: React.CSSProperties = {
  ...buttonBase,
  background: T.danger,
  color: '#FFFFFF',
}
