'use client'

import { useEffect, useState } from 'react'
import { T } from '@/lib/theme'
import { getProfileCardTokens, prefersDarkOS } from './theme'
import { BackgroundMode, ThemeSetting } from './types'

const THEME_OPTIONS: { value: ThemeSetting; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '999px',
        background: on ? T.cyan : T.border, position: 'relative', cursor: 'pointer',
        flexShrink: 0, transition: 'background 0.2s ease',
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: T.cardBg,
        position: 'absolute', top: '2px', left: on ? '22px' : '2px',
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

function ThemeSegmented({
  value, onChange, disabled,
}: {
  value: ThemeSetting
  onChange: (next: ThemeSetting) => void
  disabled?: boolean
}) {
  return (
    <div style={{
      display: 'flex', gap: '4px', flexShrink: 0,
      background: T.surface2, border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '10px', padding: '3px',
    }}>
      {THEME_OPTIONS.map(({ value: v, label }) => {
        const active = v === value
        return (
          <button
            key={v}
            onClick={() => { if (!disabled && !active) onChange(v) }}
            style={{
              minHeight: '32px', padding: '0 12px', borderRadius: '8px',
              border: active ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
              background: active ? T.cardBg : 'transparent',
              color: active ? T.ink : T.ink2,
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px', fontWeight: active ? 700 : 500,
              cursor: disabled ? 'default' : 'pointer',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'background .15s ease, color .15s ease',
            }}
          >{label}</button>
        )
      })}
    </div>
  )
}

export function AppearanceSection({
  themePreference,
  backgroundMode,
  hasBannerImage,
  onSave,
  cardStyle,
}: {
  themePreference: ThemeSetting
  backgroundMode: BackgroundMode
  hasBannerImage: boolean
  onSave: (updates: { theme_preference?: ThemeSetting; background_mode?: BackgroundMode }) => Promise<void>
  cardStyle?: React.CSSProperties
}) {
  const [theme, setTheme] = useState<ThemeSetting>(themePreference)
  const [bgMode, setBgMode] = useState(backgroundMode)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [osDark, setOsDark] = useState(false)

  // Track the OS preference so the "System" helper line stays accurate
  useEffect(() => {
    setOsDark(prefersDarkOS())
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (e: MediaQueryListEvent) => setOsDark(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  const tokens = getProfileCardTokens(theme)

  async function handleSelectTheme(next: ThemeSetting) {
    const previous = theme
    setTheme(next)
    setSaving(true); setSaved(false); setError(null)
    try {
      await onSave({ theme_preference: next })
      setSaved(true)
    } catch (e) {
      setTheme(previous)
      setError(e instanceof Error ? e.message : 'Failed to save')
    }
    setSaving(false)
  }

  async function handleToggleBg() {
    const next: BackgroundMode = bgMode === 'full' ? 'banner' : 'full'
    setBgMode(next)
    setSaving(true); setSaved(false); setError(null)
    try {
      await onSave({ background_mode: next })
      setSaved(true)
    } catch (e) {
      setBgMode(bgMode)
      setError(e instanceof Error ? e.message : 'Failed to save')
    }
    setSaving(false)
  }

  // Glass only makes sense over photography — without a banner backdrop use a solid card.
  const resolvedCardStyle: React.CSSProperties = cardStyle ?? (hasBannerImage ? {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '14px', padding: '24px',
    border: '1px solid rgba(0,0,0,0.08)',
  } : {
    background: tokens.card,
    borderRadius: '14px', padding: '24px',
    border: `1px solid ${tokens.border}`,
  })

  const themeHint = theme === 'system'
    ? `Following your device — currently ${osDark ? 'dark' : 'light'}`
    : 'Controls how your public profile card looks'

  return (
    <div style={resolvedCardStyle}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
        letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.ink3, marginBottom: '16px',
      }}>Appearance</div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        padding: '14px 0', borderBottom: hasBannerImage ? `1px solid ${T.line}` : 'none',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>Theme</div>
          <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
            {themeHint}
          </div>
        </div>
        <ThemeSegmented value={theme} onChange={handleSelectTheme} disabled={saving} />
      </div>

      {hasBannerImage && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>Banner style</div>
            <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
              {bgMode === 'full' ? 'Photo fills the whole card' : 'Photo shown as a compact top strip'}
            </div>
          </div>
          <Toggle on={bgMode === 'banner'} onChange={handleToggleBg} />
        </div>
      )}

      {error && (
        <div style={{ fontSize: '13px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '10px' }}>{error}</div>
      )}
      {saving && (
        <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '10px' }}>Saving…</div>
      )}
      {saved && !saving && !error && (
        <div style={{ fontSize: '12px', color: T.success, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '10px' }}>Saved</div>
      )}
    </div>
  )
}
