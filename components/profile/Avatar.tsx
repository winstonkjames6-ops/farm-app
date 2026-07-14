export function Avatar({
  src, initials, size = 64, border,
}: {
  src?: string | null
  initials: string
  size?: number
  border?: string
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        style={{
          width: size, height: size, borderRadius: '999px',
          objectFit: 'cover', border, flexShrink: 0,
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '999px', flexShrink: 0,
      background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
      fontSize: Math.round(size * 0.32), color: '#FFFFFF', border,
    }}>{initials}</div>
  )
}
