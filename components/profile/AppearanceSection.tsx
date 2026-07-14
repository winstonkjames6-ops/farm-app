'use client'

import { useState } from 'react'
import { T } from '@/lib/theme'
import { BackgroundMode, ThemePreference } from './types'

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '999px',
        background: on ? T.cyan : '#E5E7EB', position: 'relative', cursor: 'pointer',
        flexShrink: 0, transition: 'background 0.2s ease',
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF',
        position: 'absolute', top: '2px', left: on ? '22px' : '2px',
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
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
  themePreference: ThemePreference
  backgroundMode: BackgroundMode
  hasBannerImage: boolean
  onSave: (updates: { theme_preference?: ThemePreference; background_mode?: BackgroundMode }) => Promise<void>
  cardStyle?: React.CSSProperties
}) {
  const [theme, setTheme] = useState(themePreference)
  const [bgMode, setBgMode] = useState(backgroundMode)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggleTheme() {
    const next: ThemePreference = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setSaving(true); setSaved(false); setError(null)
    try {
      await onSave({ theme_preference: next })
      setSaved(true)
    } catch (e) {
      setTheme(theme)
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

  return (
    <div style={cardStyle ?? {
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '14px', padding: '24px',
      border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
        letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.ink3, marginBottom: '16px',
      }}>Appearance</div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        padding: '14px 0', borderBottom: hasBannerImage ? `1px solid ${T.line}` : 'none',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>Dark mode</div>
          <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
            Controls how your public profile card looks
          </div>
        </div>
        <Toggle on={theme === 'dark'} onChange={handleToggleTheme} />
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
        <div style={{ fontSize: '12px', color: '#059669', fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '10px' }}>Saved</div>
      )}
    </div>
  )
}
