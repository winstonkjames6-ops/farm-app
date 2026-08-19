'use client'

import { T } from '@/lib/theme'

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export type DashboardHeroTile = {
  value: string
  label: string
  /** Only the rating-style tile should pass this — a centered icon above the number. */
  icon?: React.ReactNode
}

export type DashboardHeroProps = {
  /** First name, e.g. "Winston" — combined with a time-of-day greeting. */
  name: string
  /** One-line status line under the greeting, e.g. "3 sessions this week" */
  subtitle: string
  /** Exactly 4 tiles: rendered 2 left / 2 right with the avatar in the gap between them. */
  tiles: [DashboardHeroTile, DashboardHeroTile, DashboardHeroTile, DashboardHeroTile]
  avatarUrl?: string | null
  avatarInitials: string
  /** Required when showBanner is true (the default); unused otherwise. */
  bannerImage?: string
  /** Set false to drop the banner image entirely — the avatar then sits in normal
   *  flow on the page background instead of overlapping a banner. Defaults to true. */
  showBanner?: boolean
  // Trainer-specific footer panel — all optional so non-trainer heroes (parent/athlete
  // dashboards) keep rendering banner + tiles + avatar only, with no footer at all.
  // Provide `onEditProfile` to opt in to the full footer.
  certified?: boolean
  reviewCount?: number
  rate?: number | null
  activeTab?: string
  onTabChange?: (key: string) => void
  onEditProfile?: () => void
  onOpenSettings?: () => void
  onBecomeCertified?: () => void
}

// All measurements below are cqw (1cqw = 1% of the hero's own rendered width),
// scaled from a ~950px desktop reference so every value shrinks proportionally
// on narrower containers instead of overflowing. Ratio-only relationships
// (banner 3.6:1, tile 1:2.15, avatar % of width) use % / aspect-ratio directly
// since those hold at any size with no reference width needed.
const px = (desktopPx: number) => (desktopPx / 950) * 100

const AVATAR_WIDTH_PCT = 25 // % of banner width — numerically equal to cqw here
const AVATAR_OVERLAP_FRACTION = 0.4 // fraction of the avatar's own height below the banner edge
const AVATAR_OVERHANG_CQW = AVATAR_WIDTH_PCT * AVATAR_OVERLAP_FRACTION // 7.6cqw
// Intentionally less than the full overhang — the action row overlaps the avatar's
// overhang band, sitting beside its lower portion rather than fully below it, the way
// the banner and avatar already overlap. The avatar is centered and the buttons sit at
// the left/right edges, so they don't collide.
const FOOTER_TOP_PADDING_CQW = AVATAR_OVERHANG_CQW * 0.15

const TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'reviews', label: 'Reviews' },
]

function Tile({ tile, translucent = true }: { tile: DashboardHeroTile; translucent?: boolean }) {
  return (
    <div
      style={{
        width: `clamp(84px, ${px(110)}cqw, 118px)`,
        aspectRatio: '1 / 2.15',
        borderRadius: `clamp(11px, ${px(26)}cqw, 26px)`,
        // translucent=true (default, used over the banner photo) reproduces the exact
        // original glass styling. translucent=false (no-banner case) swaps it for a
        // plain surface — the blur/glass treatment only makes sense over a photo.
        background: translucent ? 'rgba(255,255,255,0.22)' : T.surface2,
        backdropFilter: translucent ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: translucent ? 'blur(12px)' : undefined,
        border: translucent ? '1px solid rgba(255,255,255,0.35)' : `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: `clamp(3px, ${px(6)}cqw, 6px)`,
        padding: `0 clamp(5px, ${px(10)}cqw, 10px)`,
        flexShrink: 0,
      }}
    >
      {tile.icon && <div style={{ lineHeight: 0 }}>{tile.icon}</div>}
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: `clamp(16px, ${px(38)}cqw, 38px)`,
          color: translucent ? '#FFFFFF' : T.ink,
          lineHeight: 1,
        }}
      >
        {tile.value}
      </div>
      <div
        style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: `clamp(10px, ${px(13)}cqw, 13px)`,
          textTransform: 'uppercase',
          color: translucent ? '#FFFFFF' : T.ink2,
          lineHeight: 1.05,
        }}
      >
        {tile.label}
      </div>
    </div>
  )
}

const IconCheck = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconGear = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

function ActionPillButton({
  onClick, children,
}: {
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: `clamp(36px, ${px(44)}cqw, 44px)`,
        padding: `0 clamp(14px, ${px(20)}cqw, 20px)`,
        borderRadius: T.radius.full,
        border: 'none',
        background: '#FFFFFF',
        color: T.ink2,
        fontFamily: "'Hanken Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: `clamp(12px, ${px(14)}cqw, 14px)`,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

export function DashboardHero({
  name,
  subtitle,
  tiles,
  avatarUrl,
  avatarInitials,
  bannerImage,
  showBanner = true,
  certified = false,
  reviewCount = 0,
  rate = null,
  activeTab = 'activity',
  onTabChange,
  onEditProfile,
  onOpenSettings,
  onBecomeCertified,
}: DashboardHeroProps) {
  const greeting = `${getTimeOfDayGreeting()}${name ? `, ${name}` : ''}`
  const showFooter = onEditProfile !== undefined

  return (
    <div style={{ containerType: 'inline-size' } as React.CSSProperties}>
      <div style={{ marginBottom: '4px' }}>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: `clamp(18px, ${px(34)}cqw, 34px)`,
            color: T.ink,
            margin: 0,
          }}
        >
          {greeting}
        </h1>
        <p
          style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: `clamp(12px, ${px(16)}cqw, 16px)`,
            color: T.ink2,
            margin: '2px 0 0',
          }}
        >
          {subtitle}
        </p>
      </div>

      {showBanner ? (
        /* Banner wrapper exists only so the avatar can escape the banner's bottom edge —
           the banner itself is normal flow, so it always matches the surrounding container's width and left edge.
           The footer panel is a true sibling directly below, so there is no gap between the two. */
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '3.6 / 1',
              borderTopLeftRadius: T.radius.lg,
              borderTopRightRadius: T.radius.lg,
              backgroundImage: `url(${bannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

            {/* Tiles */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `0 clamp(9px, ${px(30)}cqw, 30px)`,
              }}
            >
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', gap: `clamp(8px, ${px(30)}cqw, 30px)` }}>
                <Tile tile={tiles[0]} />
                <Tile tile={tiles[1]} />
              </div>
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', gap: `clamp(8px, ${px(30)}cqw, 30px)` }}>
                <Tile tile={tiles[2]} />
                <Tile tile={tiles[3]} />
              </div>
            </div>
          </div>

          {/* Avatar, centered in the gap, ~40% of its height below the banner's bottom edge.
              It stays position:absolute (not position:relative/z-indexed) so it naturally
              paints above the static-positioned footer panel below, per normal stacking order. */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: `-${AVATAR_OVERHANG_CQW}cqw`,
              width: `${AVATAR_WIDTH_PCT}%`,
              aspectRatio: '1 / 1',
              borderRadius: T.radius.full,
              border: `clamp(6px, ${px(11)}cqw, 11px) solid #FFFFFF`,
              background: T.surface2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: `clamp(14px, ${px(100)}cqw, 100px)`,
                  color: T.cyan,
                }}
              >
                {avatarInitials}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* No banner — the avatar sits in normal flow on the page background instead of
           overlapping anything (no absolute positioning or overhang math), centered
           above a plain row of the same tiles, de-glossed since there's no photo to sit on. */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `clamp(12px, ${px(20)}cqw, 20px)` }}>
          <div
            style={{
              width: `${AVATAR_WIDTH_PCT}%`,
              aspectRatio: '1 / 1',
              borderRadius: T.radius.full,
              border: `clamp(6px, ${px(11)}cqw, 11px) solid #FFFFFF`,
              background: T.surface2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: `clamp(14px, ${px(100)}cqw, 100px)`,
                  color: T.cyan,
                }}
              >
                {avatarInitials}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: `clamp(8px, ${px(16)}cqw, 16px)`,
            }}
          >
            <Tile tile={tiles[0]} translucent={false} />
            <Tile tile={tiles[1]} translucent={false} />
            <Tile tile={tiles[2]} translucent={false} />
            <Tile tile={tiles[3]} translucent={false} />
          </div>
        </div>
      )}

      {showFooter ? (
        <div
          style={{
            background: T.surface2,
            borderBottomLeftRadius: T.radius.lg,
            borderBottomRightRadius: T.radius.lg,
            paddingTop: showBanner ? `clamp(20px, ${FOOTER_TOP_PADDING_CQW}cqw, 36px)` : '16px',
            paddingLeft: `clamp(12px, ${px(16)}cqw, 16px)`,
            paddingRight: `clamp(12px, ${px(16)}cqw, 16px)`,
            paddingBottom: `clamp(16px, ${px(24)}cqw, 24px)`,
          }}
        >
          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, ${px(8)}cqw, 8px)` }}>
              <button
                onClick={onOpenSettings}
                aria-label="Settings"
                style={{
                  width: `clamp(36px, ${px(44)}cqw, 44px)`,
                  height: `clamp(36px, ${px(44)}cqw, 44px)`,
                  borderRadius: T.radius.full,
                  border: 'none',
                  background: '#FFFFFF',
                  color: T.ink2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `clamp(14px, ${px(18)}cqw, 18px)`,
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <IconGear />
              </button>
              <ActionPillButton onClick={onEditProfile}>Edit profile</ActionPillButton>
            </div>

            {certified ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: `clamp(5px, ${px(7)}cqw, 7px)`,
                  height: `clamp(36px, ${px(44)}cqw, 44px)`,
                  padding: `0 clamp(14px, ${px(20)}cqw, 20px)`,
                  borderRadius: T.radius.full,
                  background: '#FFFFFF',
                  color: T.verified,
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: `clamp(12px, ${px(14)}cqw, 14px)`,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <IconCheck />
                Certified Trainer
              </span>
            ) : (
              <button
                onClick={onBecomeCertified}
                style={{
                  height: `clamp(36px, ${px(44)}cqw, 44px)`,
                  padding: `0 clamp(14px, ${px(20)}cqw, 20px)`,
                  borderRadius: T.radius.full,
                  border: 'none',
                  background: '#FFFFFF',
                  color: T.verified,
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: `clamp(12px, ${px(14)}cqw, 14px)`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Become Certified
              </button>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              width: '100%',
              background: T.border,
              marginTop: `clamp(24px, ${px(40)}cqw, 40px)`,
            }}
          />

          {/* Meta line */}
          <p
            style={{
              textAlign: 'center',
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: `clamp(13px, ${px(16)}cqw, 16px)`,
              color: T.ink3,
              margin: `clamp(10px, ${px(14)}cqw, 14px) 0 0`,
            }}
          >
            {reviewCount} Reviews{rate != null ? ` · $${rate} Rate` : ''}
          </p>

          {/* Tab bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: `clamp(6px, ${px(10)}cqw, 10px)`,
              marginTop: `clamp(10px, ${px(14)}cqw, 14px)`,
            }}
          >
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange?.(tab.key)}
                  style={{
                    height: `clamp(30px, ${px(36)}cqw, 36px)`,
                    padding: `0 clamp(14px, ${px(20)}cqw, 20px)`,
                    borderRadius: T.radius.full,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: `clamp(12px, ${px(13)}cqw, 13px)`,
                    fontWeight: isActive ? 700 : 600,
                    background: isActive ? T.cyan : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : T.ink2,
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        // No footer opted in (e.g. parent/athlete dashboards) — just clear the avatar overhang,
        // or a small fixed gap when there's no banner for the avatar to overhang from.
        <div style={{ height: showBanner ? `calc(${AVATAR_OVERHANG_CQW}cqw + 12px)` : '16px' }} />
      )}
    </div>
  )
}
