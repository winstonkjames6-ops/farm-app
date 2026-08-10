export const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  cyanDim: 'rgba(0,188,200,0.06)',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  glass: 'rgba(0,0,0,0.04)',
  border: 'rgba(0,0,0,0.08)',
  line: 'rgba(0,0,0,0.08)',
  cardBg: '#FFFFFF',
  surface2: '#F0EFEB',
  ink: '#111827',
  ink2: '#6B7280',
  // ink3 matches ink2 — on the near-white bg (#F8F8F6) the WCAG AA ceiling for
  // a distinct lighter shade is ~4.57:1, leaving no room for a visibly lighter
  // tertiary color that still passes. Use font-size / weight for hierarchy instead.
  ink3: '#6B7280',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  success: '#047857',
  successLight: '#10B981',
  warning: '#F59E0B',

  // Typography scale — 6 sizes, 2 weights
  fontSize: {
    xs: '11px',   // captions, labels
    sm: '13px',   // body, support text
    md: '16px',   // standard body, form fields
    lg: '18px',   // section headers (500 weight)
    xl: '22px',   // page headers (500 weight)
    '2xl': '28px', // hero text (500 weight)
  },
  fontWeight: {
    regular: 400,
    bold: 500,
  },

  // Border radius scale — 4 sizes
  radius: {
    sm: '6px',    // form inputs, small components
    md: '12px',   // cards, modals, standard UI
    lg: '16px',   // large modals, hero sections
    full: '999px', // pills, badges, avatars only
  },

  // Card/surface styles
  card: {
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    padding: '24px',
  },
  cardCompact: {
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    padding: '16px',
  },
}
