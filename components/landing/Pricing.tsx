const TIERS = [
  {
    name: 'Starter',
    price: 'Free',
    cadence: 'pay per session, $40–$80',
    features: ['Browse & book any vetted trainer', 'In-person or live remote sessions', 'Pay only for sessions you book', 'Rate & review after every session'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Family',
    price: '$29',
    cadence: 'per month',
    features: ['Everything in Starter', 'Discounted session rates', 'Async video review included', 'Session notes & progress history', 'Priority booking windows'],
    cta: 'Start Family plan',
    highlighted: true,
  },
  {
    name: 'All-Access',
    price: '$79',
    cadence: 'per month',
    features: ['Everything in Family', 'Unlimited async video reviews', 'Multi-sport, multi-child accounts', 'Dedicated trainer matching', 'Premium support'],
    cta: 'Start All-Access',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-[88px] bg-farm-bg py-20 md:py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-block text-farm-cyan font-heading font-bold text-xs tracking-[.16em] uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-heading font-extrabold text-farm-ink uppercase leading-[0.95] tracking-wide text-[clamp(32px,4.5vw,56px)] mb-3.5">
            Simple pricing, no surprises
          </h2>
          <p className="font-body text-farm-ink2 text-[clamp(16px,1.8vw,18px)] leading-relaxed max-w-[560px] mx-auto">
            Pay as you go, or subscribe for discounted sessions and async video coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 items-center">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.highlighted
                  ? 'relative bg-farm-ink text-white rounded-2xl p-8 md:p-9 md:scale-[1.06] shadow-[0_24px_48px_rgba(0,0,0,0.18)] z-10'
                  : 'relative bg-farm-card border border-farm-border rounded-2xl p-8 md:p-9'
              }
            >
              {tier.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-farm-cyan text-farm-on-cyan font-heading font-extrabold text-[11px] tracking-[.1em] uppercase px-4 py-1.5 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              )}
              <h3 className={`font-heading font-bold text-xl tracking-wide uppercase mb-1 ${tier.highlighted ? 'text-white' : 'text-farm-ink'}`}>
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-1 mt-4">
                <span className="font-heading font-extrabold text-5xl">{tier.price}</span>
              </div>
              <p className={`font-body text-sm mb-7 ${tier.highlighted ? 'text-white/70' : 'text-farm-ink2'}`}>{tier.cadence}</p>

              <div className={`flex flex-col gap-3.5 mb-8 pt-7 border-t ${tier.highlighted ? 'border-white/15' : 'border-farm-border'}`}>
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-full shrink-0 mt-0.5 ${tier.highlighted ? 'bg-white/15 text-white' : 'bg-farm-cyan-light text-farm-cyan'}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 13 9 18 20 6" />
                      </svg>
                    </span>
                    <span className={`font-body text-sm leading-snug ${tier.highlighted ? 'text-white/90' : 'text-farm-ink2'}`}>{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="#find-a-trainer"
                className={
                  tier.highlighted
                    ? 'block text-center no-underline rounded-full bg-farm-cyan text-farm-on-cyan font-heading font-extrabold text-[13px] tracking-[.1em] uppercase py-3.5 hover:brightness-95 transition'
                    : 'block text-center no-underline rounded-full border border-farm-ink text-farm-ink font-heading font-bold text-[13px] tracking-[.1em] uppercase py-3.5 hover:bg-farm-ink hover:text-white transition'
                }
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
