'use client'

import { Settings } from 'lucide-react'
import { Avatar } from './Avatar'
import { MinorBadge, VerifiedBadge } from './Badges'
import { PillTabBar } from './PillTabBar'
import { getProfileCardTokens } from './theme'
import { BackgroundMode, ContactRow, StatItem, TabItem, ThemePreference } from './types'
import { getInitials } from './utils'

export interface ProfileCardProps {
  themePreference: ThemePreference
  backgroundMode: BackgroundMode
  bannerImageUrl?: string | null
  avatarUrl?: string | null
  name: string
  verified?: boolean
  verifiedLabel?: string
  minor?: boolean
  metaLine?: string
  stats: StatItem[]
  contactRows: ContactRow[]
  tabs?: TabItem[]
  activeTab?: string
  onTabChange?: (key: string) => void
  tabContent?: React.ReactNode
  onEditProfile: () => void
  onOpenSettings?: () => void
  profileLabel?: string
}

function EditButton({ onClick, dark }: { onClick: () => void; dark: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        border: dark ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid rgba(0,0,0,0.12)',
        color: dark ? '#FFFFFF' : '#6B7280',
        background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)',
        borderRadius: '10px', padding: '7px 16px',
        fontFamily: "'Archivo', sans-serif", fontWeight: 700,
        fontSize: '13px', cursor: 'pointer',
      }}
    >Edit profile</button>
  )
}

function GearButton({ onClick, dark }: { onClick?: () => void; dark: boolean }) {
  if (!onClick) return null
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, width: '36px', height: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: dark ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid rgba(0,0,0,0.12)',
        color: dark ? '#FFFFFF' : '#6B7280',
        background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)',
        borderRadius: '10px', cursor: 'pointer', padding: 0,
      }}
    ><Settings size={16} /></button>
  )
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    themePreference, backgroundMode, bannerImageUrl, avatarUrl, name,
    verified, verifiedLabel, minor, metaLine, stats, contactRows,
    tabs, activeTab, onTabChange, tabContent,
    onEditProfile, onOpenSettings, profileLabel = 'My profile',
  } = props

  const tokens = getProfileCardTokens(themePreference)
  const isDark = themePreference === 'dark'
  const initials = getInitials(name || '?')
  const hasBanner = !!bannerImageUrl
  const layout: 'hero' | 'banner' | 'no-image' =
    !hasBanner ? 'no-image' : backgroundMode === 'banner' ? 'banner' : 'hero'

  if (layout === 'banner' && bannerImageUrl) {
    return (
      <BannerCard
        tokens={tokens} isDark={isDark} bannerImageUrl={bannerImageUrl}
        avatarUrl={avatarUrl} initials={initials} name={name}
        verified={verified} verifiedLabel={verifiedLabel} minor={minor}
        metaLine={metaLine} stats={stats} contactRows={contactRows}
        onEditProfile={onEditProfile} onOpenSettings={onOpenSettings}
      />
    )
  }

  return (
    <CenteredCard
      tokens={tokens} isDark={isDark}
      bannerImageUrl={layout === 'hero' ? bannerImageUrl : null}
      avatarUrl={avatarUrl} initials={initials} name={name}
      verified={verified} verifiedLabel={verifiedLabel} minor={minor}
      metaLine={metaLine} stats={stats} contactRows={contactRows}
      tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}
      tabContent={tabContent}
      onEditProfile={onEditProfile} onOpenSettings={onOpenSettings}
      profileLabel={profileLabel}
    />
  )
}

// ── Hero + No-image layouts (share the centered structure) ────────────────────

function CenteredCard({
  tokens, isDark, bannerImageUrl, avatarUrl, initials, name,
  verified, verifiedLabel, minor, metaLine, stats, contactRows,
  tabs, activeTab, onTabChange, tabContent,
  onEditProfile, onOpenSettings, profileLabel,
}: {
  tokens: ReturnType<typeof getProfileCardTokens>
  isDark: boolean
  bannerImageUrl?: string | null
  avatarUrl?: string | null
  initials: string
  name: string
  verified?: boolean
  verifiedLabel?: string
  minor?: boolean
  metaLine?: string
  stats: StatItem[]
  contactRows: ContactRow[]
  tabs?: TabItem[]
  activeTab?: string
  onTabChange?: (key: string) => void
  tabContent?: React.ReactNode
  onEditProfile: () => void
  onOpenSettings?: () => void
  profileLabel: string
}) {
  const hasImage = !!bannerImageUrl
  const textColor = hasImage ? (isDark ? '#FFFFFF' : tokens.ink) : tokens.ink
  const subTextColor = hasImage ? (isDark ? 'rgba(255,255,255,0.72)' : tokens.ink2) : tokens.ink2
  const labelColor = hasImage ? (isDark ? 'rgba(255,255,255,0.6)' : tokens.ink3) : tokens.ink3
  const activityCardBg = isDark ? 'rgba(255,255,255,0.06)' : tokens.card
  const activityCardBorder = isDark ? 'rgba(255,255,255,0.12)' : tokens.border

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden', position: 'relative',
      background: hasImage ? undefined : tokens.bg,
      border: hasImage ? undefined : `1px solid ${tokens.border}`,
    }}>
      {hasImage && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${bannerImageUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(28px)', transform: 'scale(1.15)',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: tokens.heroOverlay }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 0',
        }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
            letterSpacing: '.1em', textTransform: 'uppercase' as const, color: labelColor,
          }}>{profileLabel}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <EditButton onClick={onEditProfile} dark={hasImage && isDark} />
            <GearButton onClick={onOpenSettings} dark={hasImage && isDark} />
          </div>
        </div>

        {/* centered identity block */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '20px 24px 8px', textAlign: 'center',
        }}>
          <Avatar
            src={avatarUrl} initials={initials} size={118}
            border={hasImage ? `3px solid rgba(255,255,255,${isDark ? 0.25 : 0.6})` : `3px solid ${tokens.border}`}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span style={{
              fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '28px', color: textColor,
            }}>{name}</span>
            {verified && <VerifiedBadge label={verifiedLabel} tokens={tokens} />}
          </div>
          {minor && <div style={{ marginTop: '8px' }}><MinorBadge tokens={tokens} /></div>}
          {stats.length > 0 && (
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: subTextColor, marginTop: '8px',
            }}>{stats.map((s) => `${s.value} ${s.label}`).join(' · ')}</div>
          )}
          {metaLine && (
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: labelColor, marginTop: '4px',
            }}>{metaLine}</div>
          )}
        </div>

        {/* divider */}
        <div style={{
          height: '1px', width: '120px', margin: '8px auto 0',
          background: hasImage ? (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)') : tokens.border,
        }} />

        {/* contact rows */}
        {contactRows.length > 0 && (
          <div style={{ padding: '14px 24px 4px' }}>
            {contactRows.map((row) => (
              <div key={row.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '5px 0',
              }}>
                <span style={{ flexShrink: 0, display: 'flex', color: labelColor }}>{row.icon}</span>
                <span style={{
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: subTextColor,
                }}>{row.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* tabs */}
        {tabs && tabs.length > 0 && onTabChange && (
          <div style={{ marginTop: '12px' }}>
            <PillTabBar tabs={tabs} active={activeTab ?? tabs[0].key} onChange={onTabChange} tokens={tokens} />
          </div>
        )}

        {/* tab content card */}
        {tabs && tabs.length > 0 && tabContent && (
          <div style={{
            background: activityCardBg, borderRadius: '16px',
            margin: '0 20px 20px', border: `1px solid ${activityCardBorder}`,
          }}>
            {tabContent}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Banner layout (1/3 background) ─────────────────────────────────────────────

function BannerCard({
  tokens, isDark, bannerImageUrl, avatarUrl, initials, name,
  verified, verifiedLabel, minor, metaLine, stats, contactRows,
  onEditProfile, onOpenSettings,
}: {
  tokens: ReturnType<typeof getProfileCardTokens>
  isDark: boolean
  bannerImageUrl: string
  avatarUrl?: string | null
  initials: string
  name: string
  verified?: boolean
  verifiedLabel?: string
  minor?: boolean
  metaLine?: string
  stats: StatItem[]
  contactRows: ContactRow[]
  onEditProfile: () => void
  onOpenSettings?: () => void
}) {
  const cardBg = isDark ? '#161616' : '#FFFFFF'
  const textColor = isDark ? '#FFFFFF' : tokens.ink
  const subTextColor = isDark ? 'rgba(255,255,255,0.65)' : tokens.ink2

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden', position: 'relative',
      background: cardBg, border: `1px solid ${tokens.border}`,
    }}>
      <div style={{
        height: '140px',
        backgroundImage: `url(${bannerImageUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />

      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ marginTop: '-48px', marginBottom: '12px' }}>
          <Avatar src={avatarUrl} initials={initials} size={96} border={`4px solid ${cardBg}`} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '22px', color: textColor,
          }}>{name}</span>
          {verified && <VerifiedBadge label={verifiedLabel} tokens={tokens} />}
        </div>
        {metaLine && (
          <div style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: subTextColor, marginTop: '3px',
          }}>{metaLine}</div>
        )}
        {minor && <div style={{ marginTop: '8px' }}><MinorBadge tokens={tokens} /></div>}

        {stats.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            border: `1px solid ${tokens.border}`, borderRadius: '12px', marginTop: '16px', overflow: 'hidden',
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                padding: '12px 0', textAlign: 'center',
                borderRight: i < stats.length - 1 ? `1px solid ${tokens.border}` : 'none',
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '20px', color: textColor,
                }}>{s.value}</div>
                <div style={{
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: subTextColor,
                  textTransform: 'uppercase' as const, letterSpacing: '.06em', marginTop: '2px',
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: '1px', background: tokens.border, margin: '16px 0' }} />

        {contactRows.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            {contactRows.map((row) => (
              <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0' }}>
                <span style={{ flexShrink: 0, display: 'flex', color: tokens.ink3 }}>{row.icon}</span>
                <span style={{
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: subTextColor,
                }}>{row.label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <EditButton onClick={onEditProfile} dark={isDark} />
          <GearButton onClick={onOpenSettings} dark={isDark} />
        </div>
      </div>
    </div>
  )
}
