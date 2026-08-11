type MetricCardProps = {
  /** Big number/amount, rendered first. e.g. "7", "$485", "4.9" */
  value: string
  /** Optional glyph rendered inline after value in muted gray. e.g. "★" */
  valueSuffix?: string
  /** Color override for value. Defaults to black. Pass T.money for currency. */
  valueColor?: string
  /** Label line 1 — rendered BLACK, uppercase. e.g. "SESSIONS" */
  labelPrimary: string
  /** Label line 2 — rendered MUTED, uppercase. e.g. "THIS WEEK" */
  labelSecondary: string
  /** Icon filename stem: 'calendar' | 'trending-up' | 'clock' | 'star' */
  icon: string
  /** Link text next to the circle. e.g. "View Schedule" */
  actionLabel: string
  onActionClick?: () => void
  /** Card background. Pass T.metricTeal[1..4] */
  background: string
}

export function MetricCard({
  value,
  valueSuffix,
  valueColor,
  labelPrimary,
  labelSecondary,
  icon,
  actionLabel,
  onActionClick,
  background,
}: MetricCardProps) {
  const primaryText = '#000000'
  const mutedText = 'rgba(0, 0, 0, 0.55)'
  const circleBg = '#000000'
  const arrowColor = '#FFFFFF'

  return (
    <div
      style={{
        background,
        borderRadius: '16px',
        // overflow hidden is REQUIRED — it's what crops the bleeding icon
        overflow: 'hidden',
        position: 'relative',
        // wide, short card — roughly 2.2:1
        minHeight: '170px',
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      {/* ICON — absolutely positioned, bleeds off the top and right edges */}
      <img
        src={`/icons/metric-${icon}.png`}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '160px',
          height: '160px',
          top: '64.5%',
          transform: 'translateY(-50%)',
          right: '1px',
          opacity: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* CONTENT COLUMN — left side, sits above the icon */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          // no gap here — each block controls its own spacing
        }}
      >
        {/* 1. VALUE — first in the stack, largest */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1,
            color: valueColor ?? primaryText,
            marginBottom: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
          {valueSuffix && (
            <span
              style={{
                fontSize: '24px',
                color: mutedText,
                marginLeft: '6px',
              }}
            >
              {valueSuffix}
            </span>
          )}
        </div>

        {/* 2 + 3. LABEL — two lines, white then muted */}
        <div
          style={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}
        >
          <div style={{ color: primaryText }}>{labelPrimary}</div>
          <div style={{ color: mutedText }}>{labelSecondary}</div>
        </div>

        {/* 4. ACTION ROW — white circle + separate underlined link */}
        <div
          onClick={onActionClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onActionClick?.()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          {/* white circle with knocked-out diagonal arrow */}
          <span
            style={{
              width: '27px',
              height: '27px',
              borderRadius: '50%',
              background: circleBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              {/* diagonal up-right arrow, colored in the card's own bg */}
              <path
                d="M3 9L9 3M9 3H4M9 3V8"
                stroke={arrowColor}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span
            style={{
              fontSize: '13.5px',
              fontWeight: 500,
              color: primaryText,
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            {actionLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
