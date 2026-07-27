import { ProfileCardTokens, ThemePreference, ThemeSetting } from './types'

const LIGHT: ProfileCardTokens = {
  bg: '#F8F8F6',
  card: '#FFFFFF',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#6B7280',
  border: 'rgba(0,0,0,0.08)',
  surface2: '#F0EFEB',
  cyan: '#00BCC8',
  heroOverlay: 'rgba(255,255,255,0.72)',
}

const DARK: ProfileCardTokens = {
  bg: '#161616',
  card: '#161616',
  ink: '#FFFFFF',
  ink2: 'rgba(255,255,255,0.65)',
  ink3: 'rgba(255,255,255,0.45)',
  border: 'rgba(255,255,255,0.12)',
  surface2: 'rgba(255,255,255,0.06)',
  cyan: '#00BCC8',
  heroOverlay: 'rgba(10,20,18,0.62)',
}

export function prefersDarkOS(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Collapse a stored setting ('light' | 'dark' | 'system') to the theme to render. */
export function resolveThemeSetting(setting: ThemeSetting | null | undefined): ThemePreference {
  if (setting === 'dark') return 'dark'
  if (setting === 'system') return prefersDarkOS() ? 'dark' : 'light'
  return 'light'
}

export function getProfileCardTokens(theme: ThemeSetting): ProfileCardTokens {
  return resolveThemeSetting(theme) === 'light' ? LIGHT : DARK
}
