import Avatar from './Avatar'

const REVIEWS = [
  {
    quote: 'Our son’s tennis coach spotted a footwork issue in the first session that three years of clinics missed. The async video reviews between sessions have been huge too.',
    name: 'Dana Whitfield',
    role: 'Parent · Tennis',
    seed: 0,
  },
  {
    quote: 'Booking took less time than finding a babysitter. We’ve done both live remote and in-person with the same coach depending on the week.',
    name: 'Marcus Ibe',
    role: 'Parent · Soccer',
    seed: 1,
  },
  {
    quote: 'As a trainer, FARM handles the scheduling and payments so I can focus on coaching. The background check and interview process felt legitimate on both sides.',
    name: 'Priya Anand',
    role: 'Trainer · Volleyball',
    seed: 2,
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5 text-farm-cyan" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="reviews" className="scroll-mt-[88px] bg-farm-card border-t border-farm-border py-20 md:py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-block text-farm-cyan font-heading font-bold text-xs tracking-[.16em] uppercase mb-4">
            Reviews
          </span>
          <h2 className="font-heading font-extrabold text-farm-ink uppercase leading-[0.95] tracking-wide text-[clamp(32px,4.5vw,56px)] mb-3.5">
            Families and coaches on FARM
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map(({ quote, name, role, seed }) => (
            <div key={name} className="bg-farm-bg border border-farm-border rounded-2xl p-8 flex flex-col">
              <Stars />
              <p className="font-body text-farm-ink text-[15px] leading-relaxed my-6 flex-1">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-5 border-t border-farm-border">
                <Avatar seed={seed} size={40} className="rounded-full shrink-0" />
                <div>
                  <div className="font-heading font-bold text-sm tracking-wide uppercase text-farm-ink">{name}</div>
                  <div className="font-body text-xs text-farm-ink2">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
