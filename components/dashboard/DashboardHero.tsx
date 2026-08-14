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

export type DashboardHeroBadge = {
  label: string
  show: boolean
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
  bannerImage: string
  badge?: DashboardHeroBadge
}

// All measurements below are cqw (1cqw = 1% of the hero's own rendered width),
// scaled from a ~950px desktop reference so every value shrinks proportionally
// on narrower containers instead of overflowing. Ratio-only relationships
// (banner 3.6:1, tile 1:2.15, avatar % of width) use % / aspect-ratio directly
// since those hold at any size with no reference width needed.
const px = (desktopPx: number) => (desktopPx / 950) * 100

const AVATAR_WIDTH_PCT = 19 // % of banner width — numerically equal to cqw here
const AVATAR_OVERLAP_FRACTION = 0.4 // fraction of the avatar's own height below the banner edge
const AVATAR_OVERHANG_CQW = AVATAR_WIDTH_PCT * AVATAR_OVERLAP_FRACTION // 7.6cqw
// The badge must start below the avatar's lowest point, with room to spare, so the two
// can never visually collide regardless of container width or how wide the badge's label is.
const BADGE_TOP_OFFSET_CQW = AVATAR_OVERHANG_CQW + px(20)
const BADGE_HEIGHT_ESTIMATE_CQW = px(44)

function Tile({ tile }: { tile: DashboardHeroTile }) {
  return (
    <div
      style={{
        width: `clamp(84px, ${px(118)}cqw, 118px)`,
        aspectRatio: '1 / 2.15',
        borderRadius: `clamp(11px, ${px(26)}cqw, 26px)`,
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.35)',
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
          color: '#FFFFFF',
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
          color: '#FFFFFF',
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

export function DashboardHero({
  name,
  subtitle,
  tiles,
  avatarUrl,
  avatarInitials,
  bannerImage,
  badge,
}: DashboardHeroProps) {
  const greeting = `${getTimeOfDayGreeting()}${name ? `, ${name}` : ''}`

  // Spacer below the wrapper must clear whichever hangs lower: the badge (when shown) or the avatar.
  const clearanceCqw = badge?.show
    ? BADGE_TOP_OFFSET_CQW + BADGE_HEIGHT_ESTIMATE_CQW
    : AVATAR_OVERHANG_CQW

  return (
    <div style={{ containerType: 'inline-size' } as React.CSSProperties}>
      <div style={{ marginBottom: `clamp(10px, ${px(15)}cqw, 15px)` }}>
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
            margin: `clamp(2px, ${px(5)}cqw, 5px) 0 0`,
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Wrapper exists only so the avatar and badge can escape the banner's bottom edge —
          the banner itself is normal flow, so it always matches the surrounding container's width and left edge. */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '100%',
            aspectRatio: '3.6 / 1',
            borderRadius: T.radius.lg,
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

        {/* Avatar, centered in the gap, ~40% of its height below the banner's bottom edge */}
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
                fontSize: `clamp(14px, ${px(42)}cqw, 42px)`,
                color: T.cyan,
              }}
            >
              {avatarInitials}
            </span>
          )}
        </div>

        {/* Badge — below the banner, right-aligned, positioned to clear the avatar's overhang */}
        {badge?.show && (
          <div
            style={{
              position: 'absolute',
              top: `calc(100% + ${BADGE_TOP_OFFSET_CQW}cqw)`,
              right: `clamp(12px, ${px(64)}cqw, 64px)`,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: `clamp(5px, ${px(9)}cqw, 9px)`,
                padding: `clamp(8px, ${px(12)}cqw, 12px) clamp(14px, ${px(24)}cqw, 24px)`,
                borderRadius: T.radius.full,
                background: `color-mix(in srgb, ${T.verified} 12%, transparent)`,
                color: T.verified,
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: `clamp(12px, ${px(17)}cqw, 17px)`,
                whiteSpace: 'nowrap',
              }}
            >
              <IconCheck />
              {badge.label}
            </span>
          </div>
        )}
      </div>

      {/* Spacer so following content clears the overhanging avatar/badge */}
      <div style={{ height: `calc(${clearanceCqw}cqw + 12px)` }} />
    </div>
  )
}
