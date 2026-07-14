export type ThemePreference = 'light' | 'dark'
export type BackgroundMode = 'full' | 'banner'

export interface ProfileCardTokens {
  bg: string
  card: string
  ink: string
  ink2: string
  ink3: string
  border: string
  surface2: string
  cyan: string
  heroOverlay: string
}

export interface StatItem {
  value: string
  label: string
}

export interface ContactRow {
  key: string
  icon: React.ReactNode
  label: string
}

export interface TabItem {
  key: string
  label: string
}

export interface ActivityItem {
  id: string
  title: string
  subtitle?: string
  meta?: string
  timestamp: string
}
