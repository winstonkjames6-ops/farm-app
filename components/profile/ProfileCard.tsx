'use client'

import { Settings } from 'lucide-react'
import { Avatar } from './Avatar'
import { MinorBadge, VerifiedBadge } from './Badges'
import { Chip } from './Chip'
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
  specialtyTags?: string[]
  stats: StatItem[]
  contactRows: ContactRow[]
  tabs?: TabItem[]
  activeTab?: string
  onTabChange?: (key: string) => void
  tabContent?: React.ReactNode
  onEditProfile: () => void
  onOpenSettings?: () => void
  profileLabel?: string
  /** Skip the avatar/banner identity block — for pages that already render their own avatar+banner elsewhere (e.g. DashboardHero) and only need the edit/gear controls, stats, and tabs. */
  hideIdentity?: boolean
}

function EditButton({ onClick, dark, glass }: { onClick: () => void; dark: boolean; glass?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        border: glass ? '1px solid rgba(255,255,255,0.35)' : dark ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid rgba(0,0,0,0.12)',
        color: dark || glass ? '#FFFFFF' : '#6B7280',
        background: glass ? 'rgba(255,255,255,0.18)' : dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)',
        backdropFilter: glass ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: glass ? 'blur(12px)' : undefined,
        borderRadius: glass ? '999px' : '10px', padding: '7px 16px',
        fontFamily: "'Archivo', sans-serif", fontWeight: 700,
        fontSize: '13px', cursor: 'pointer',
      }}
    >Edit profile</button>
  )
}

function GearButton({ onClick, dark, glass }: { onClick?: () => void; dark: boolean; glass?: boolean }) {
  if (!onClick) return null
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, width: '36px', height: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: glass ? '1px solid rgba(255,255,255,0.35)' : dark ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid rgba(0,0,0,0.12)',
        color: dark || glass ? '#FFFFFF' : '#6B7280',
        background: glass ? 'rgba(255,255,255,0.18)' : dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)',
        backdropFilter: glass ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: glass ? 'blur(12px)' : undefined,
        borderRadius: glass ? '999px' : '10px', cursor: 'pointer', padding: 0,
      }}
    ><Settings size={16} /></button>
  )
}

function ChipRow({
  contactRows, specialtyTags, tokens, justify,
}: {
  contactRows: ContactRow[]
  specialtyTags: string[]
  tokens: ReturnType<typeof getProfileCardTokens>
  justify: 'center' | 'flex-start'
}) {
  if (contactRows.length === 0 && specialtyTags.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: justify }}>
      {contactRows.map((row) => (
        <Chip key={row.key} icon={row.icon} label={row.label} tokens={tokens} />
      ))}
      {specialtyTags.map((tag) => (
        <Chip key={tag} label={tag} tokens={tokens} tone="cyan" />
      ))}
    </div>
  )
}

// Render mode is fully determined by theme_preference + banner_image_url:
// a banner photo always wins, regardless of any other saved toggle.
export function ProfileCard(props: ProfileCardProps) {
  const {
    themePreference, bannerImageUrl, avatarUrl, name,
    verified, verifiedLabel, minor, metaLine, specialtyTags = [], stats, contactRows,
    tabs, activeTab, onTabChange, tabContent,
    onEditProfile, onOpenSettings, profileLabel = 'My profile',
    hideIdentity = false,
  } = props

  const tokens = getProfileCardTokens(themePreference)
  const isDark = themePreference === 'dark'
  const initials = getInitials(name || '?')

  if (hideIdentity) {
    return (
      <HeadlessCard
        tokens={tokens} isDark={isDark}
        verified={verified} verifiedLabel={verifiedLabel} minor={minor}
        metaLine={metaLine} specialtyTags={specialtyTags} stats={stats} contactRows={contactRows}
        tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} tabContent={tabContent}
        onEditProfile={onEditProfile} onOpenSettings={onOpenSettings} profileLabel={profileLabel}
      />
    )
  }

  if (bannerImageUrl) {
    return (
      <BannerCard
        tokens={tokens} isDark={isDark} bannerImageUrl={bannerImageUrl}
        avatarUrl={avatarUrl} initials={initials} name={name}
        verified={verified} verifiedLabel={verifiedLabel} minor={minor}
        metaLine={metaLine} specialtyTags={specialtyTags} stats={stats} contactRows={contactRows}
        onEditProfile={onEditProfile} onOpenSettings={onOpenSettings}
      />
    )
  }

  return (
    <CenteredCard
      tokens={tokens} isDark={isDark}
      avatarUrl={avatarUrl} initials={initials} name={name}
      verified={verified} verifiedLabel={verifiedLabel} minor={minor}
      metaLine={metaLine} specialtyTags={specialtyTags} stats={stats} contactRows={contactRows}
      tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}
      tabContent={tabContent}
      onEditProfile={onEditProfile} onOpenSettings={onOpenSettings}
      profileLabel={profileLabel}
    />
  )
}

// ── Headless (identity block hidden — caller renders its own avatar/banner) ────

function HeadlessCard({
  tokens, isDark, verified, verifiedLabel, minor, metaLine, specialtyTags, stats, contactRows,
  tabs, activeTab, onTabChange, tabContent,
  onEditProfile, onOpenSettings, profileLabel,
}: {
  tokens: ReturnType<typeof getProfileCardTokens>
  isDark: boolean
  verified?: boolean
  verifiedLabel?: string
  minor?: boolean
  metaLine?: string
  specialtyTags: string[]
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
  const activityCardBg = isDark ? 'rgba(255,255,255,0.06)' : tokens.card
  const activityCardBorder = isDark ? 'rgba(255,255,255,0.12)' : tokens.border
  const hasIdentityLine = !!verified || !!minor || stats.length > 0 || !!metaLine || contactRows.length > 0 || specialtyTags.length > 0

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden', position: 'relative',
      background: tokens.bg, border: `1px solid ${tokens.border}`,
    }}>
      {/* header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 0',
      }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
          letterSpacing: '.1em', textTransform: 'uppercase' as const, color: tokens.ink3,
        }}>{profileLabel}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <EditButton onClick={onEditProfile} dark={isDark} />
          <GearButton onClick={onOpenSettings} dark={isDark} />
        </div>
      </div>

      {/* compact identity line — no avatar/banner, those already render via DashboardHero */}
      {hasIdentityLine && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '16px 24px 8px', textAlign: 'center',
        }}>
          {verified && <VerifiedBadge label={verifiedLabel} tokens={tokens} />}
          {minor && <div style={{ marginTop: verified ? '8px' : 0 }}><MinorBadge tokens={tokens} /></div>}
          {stats.length > 0 && (
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: tokens.ink2, marginTop: '8px',
            }}>{stats.map((s) => `${s.value} ${s.label}`).join(' · ')}</div>
          )}
          {metaLine && (
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: tokens.ink3, marginTop: '4px',
            }}>{metaLine}</div>
          )}
          {(contactRows.length > 0 || specialtyTags.length > 0) && (
            <div style={{ marginTop: '14px' }}>
              <ChipRow contactRows={contactRows} specialtyTags={specialtyTags} tokens={tokens} justify="center" />
            </div>
          )}
        </div>
      )}

      {/* divider */}
      <div style={{ height: '1px', width: '120px', margin: '16px auto 0', background: tokens.border }} />

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
  )
}

// ── Light / dark modes (no banner image) ───────────────────────────────────────

function CenteredCard({
  tokens, isDark, avatarUrl, initials, name,
  verified, verifiedLabel, minor, metaLine, specialtyTags, stats, contactRows,
  tabs, activeTab, onTabChange, tabContent,
  onEditProfile, onOpenSettings, profileLabel,
}: {
  tokens: ReturnType<typeof getProfileCardTokens>
  isDark: boolean
  avatarUrl?: string | null
  initials: string
  name: string
  verified?: boolean
  verifiedLabel?: string
  minor?: boolean
  metaLine?: string
  specialtyTags: string[]
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
  const activityCardBg = isDark ? 'rgba(255,255,255,0.06)' : tokens.card
  const activityCardBorder = isDark ? 'rgba(255,255,255,0.12)' : tokens.border

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden', position: 'relative',
      background: tokens.bg, border: `1px solid ${tokens.border}`,
    }}>
      {/* header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 0',
      }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
          letterSpacing: '.1em', textTransform: 'uppercase' as const, color: tokens.ink3,
        }}>{profileLabel}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <EditButton onClick={onEditProfile} dark={isDark} />
          <GearButton onClick={onOpenSettings} dark={isDark} />
        </div>
      </div>

      {/* centered identity block */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 24px 8px', textAlign: 'center',
      }}>
        <Avatar src={avatarUrl} initials={initials} size={96} border={`3px solid ${tokens.border}`} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <span style={{
            fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '24px', color: tokens.ink,
          }}>{name}</span>
          {verified && <VerifiedBadge label={verifiedLabel} tokens={tokens} />}
        </div>
        {minor && <div style={{ marginTop: '8px' }}><MinorBadge tokens={tokens} /></div>}
        {stats.length > 0 && (
          <div style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: tokens.ink2, marginTop: '8px',
          }}>{stats.map((s) => `${s.value} ${s.label}`).join(' · ')}</div>
        )}
        {metaLine && (
          <div style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: tokens.ink3, marginTop: '4px',
          }}>{metaLine}</div>
        )}
        {(contactRows.length > 0 || specialtyTags.length > 0) && (
          <div style={{ marginTop: '14px' }}>
            <ChipRow contactRows={contactRows} specialtyTags={specialtyTags} tokens={tokens} justify="center" />
          </div>
        )}
      </div>

      {/* divider */}
      <div style={{ height: '1px', width: '120px', margin: '16px auto 0', background: tokens.border }} />

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
  )
}

// ── Banner mode (identity content overlaid directly on the banner image) ───────

function BannerCard({
  tokens, isDark, bannerImageUrl, avatarUrl, initials, name,
  verified, verifiedLabel, minor, metaLine, specialtyTags, contactRows,
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
  specialtyTags: string[]
  stats: StatItem[]
  contactRows: ContactRow[]
  onEditProfile: () => void
  onOpenSettings?: () => void
}) {
  const avatarRing = isDark ? '#161616' : '#FFFFFF'
  const textShadow = isDark ? '0 1px 3px rgba(0,0,0,0.45)' : '0 1px 2px rgba(255,255,255,0.85)'

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden', position: 'relative',
      border: `1px solid ${tokens.border}`,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${bannerImageUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      {/* bottom-to-top scrim so the overlaid identity content stays legible over an arbitrary photo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to top, ${tokens.heroOverlay} 0%, ${tokens.heroOverlay} 38%, transparent 88%)`,
      }} />

      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2, display: 'flex', gap: '8px' }}>
        <EditButton onClick={onEditProfile} dark={isDark} glass />
        <GearButton onClick={onOpenSettings} dark={isDark} glass />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: '120px 24px 28px',
      }}>
        <Avatar src={avatarUrl} initials={initials} size={96} border={`4px solid ${avatarRing}`} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <span style={{
            fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '24px', color: tokens.ink, textShadow,
          }}>{name}</span>
          {verified && <VerifiedBadge label={verifiedLabel} tokens={tokens} />}
        </div>
        {minor && <div style={{ marginTop: '8px' }}><MinorBadge tokens={tokens} /></div>}
        {metaLine && (
          <div style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: tokens.ink2, marginTop: '4px', textShadow,
          }}>{metaLine}</div>
        )}

        {(contactRows.length > 0 || specialtyTags.length > 0) && (
          <div style={{ marginTop: '14px' }}>
            <ChipRow contactRows={contactRows} specialtyTags={specialtyTags} tokens={tokens} justify="center" />
          </div>
        )}
      </div>
    </div>
  )
}
