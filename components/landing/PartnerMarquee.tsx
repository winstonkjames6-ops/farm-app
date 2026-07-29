const SLOTS = Array.from({ length: 8 }, (_, i) => i)

export default function PartnerMarquee() {
  return (
    <section className="bg-farm-card border-t border-farm-border py-14 overflow-hidden">
      <p className="text-center font-heading font-bold text-xs tracking-[.16em] uppercase text-farm-ink2 mb-8">
        Partner &amp; sponsor spotlight — coming soon
      </p>

      <div
        className="relative w-full overflow-hidden"
        style={{ maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)' }}
      >
        <div className="marquee-track flex w-max gap-4">
          {[...SLOTS, ...SLOTS].map((i, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center w-40 h-16 shrink-0 rounded-xl border border-farm-border bg-farm-bg text-farm-ink2 font-heading font-bold text-sm tracking-wide uppercase"
            >
              Partner {(i % SLOTS.length) + 1}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
