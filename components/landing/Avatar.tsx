const PALETTE = ['#00BCC8', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#3B82F6']

/**
 * Generic tinted-silhouette placeholder avatar — no external image service,
 * no real photos. Same `seed` always renders the same color.
 */
export default function Avatar({ seed, size = 40, className = '' }: { seed: number; size?: number; className?: string }) {
  const color = PALETTE[seed % PALETTE.length]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill={color} fillOpacity="0.16" />
      <circle cx="20" cy="16" r="7" fill={color} fillOpacity="0.55" />
      <path d="M6 35c1.4-8.4 7-12.5 14-12.5s12.6 4.1 14 12.5" fill={color} fillOpacity="0.55" />
    </svg>
  )
}
