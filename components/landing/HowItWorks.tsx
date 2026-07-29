import Image from 'next/image'

const SearchIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" /><line x1="20" y1="20" x2="15.5" y2="15.5" />
  </svg>
)
const CalendarIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" /><line x1="3.5" y1="9.5" x2="20.5" y2="9.5" /><line x1="8" y1="3" x2="8" y2="6.5" /><line x1="16" y1="3" x2="16" y2="6.5" />
  </svg>
)

const STEPS = [
  {
    num: '01',
    title: 'Search & filter',
    desc: 'Browse vetted trainers by sport, location, format, and budget.',
    type: 'icon',
    icon: SearchIcon,
  },
  {
    num: '02',
    title: 'Book a session',
    desc: 'Pick in-person, live remote, or async video — confirm a time in minutes.',
    type: 'solid',
    icon: CalendarIcon,
  },
  {
    num: '03',
    title: 'Train together',
    desc: 'Your coach runs the session live or reviews submitted video on your schedule.',
    type: 'photo',
    image: '/backgrounds/volleyball.jpg',
  },
  {
    num: '04',
    title: 'Get feedback that sticks',
    desc: 'Receive notes and a follow-up plan, then rate the session for other families.',
    type: 'photo',
    image: '/backgrounds/track.jpg',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-[88px] bg-farm-bg py-20 md:py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-block text-farm-cyan font-heading font-bold text-xs tracking-[.16em] uppercase mb-4">
            How it works
          </span>
          <h2 className="font-heading font-extrabold text-farm-ink uppercase leading-[0.95] tracking-wide text-[clamp(32px,4.5vw,56px)] mb-3.5">
            From search to real progress
          </h2>
          <p className="font-body text-farm-ink2 text-[clamp(16px,1.8vw,18px)] leading-relaxed max-w-[560px] mx-auto">
            One flow for live sessions and async video coaching — no back-and-forth to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => {
            if (step.type === 'photo') {
              return (
                <div
                  key={step.num}
                  className="relative min-h-[280px] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.16)]"
                >
                  <Image src={step.image!} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-0 p-7 flex flex-col justify-between">
                    <span className="font-heading font-extrabold text-3xl text-white/50">{step.num}</span>
                    <div>
                      <h3 className="font-heading font-bold text-xl tracking-wide uppercase text-white mb-2">{step.title}</h3>
                      <p className="font-body text-white/85 text-[15px] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              )
            }

            if (step.type === 'solid') {
              return (
                <div
                  key={step.num}
                  className="relative min-h-[280px] bg-farm-ink rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.16)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-xl bg-farm-cyan text-farm-on-cyan inline-flex items-center justify-center">
                      {step.icon}
                    </span>
                    <span className="font-heading font-extrabold text-3xl text-white/15">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl tracking-wide uppercase text-white mb-2">{step.title}</h3>
                    <p className="font-body text-white/70 text-[15px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={step.num}
                className="relative min-h-[280px] bg-farm-card border border-farm-border rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-xl bg-farm-cyan text-farm-on-cyan inline-flex items-center justify-center">
                    {step.icon}
                  </span>
                  <span className="font-heading font-extrabold text-3xl text-black/10">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl tracking-wide uppercase text-farm-ink mb-2">{step.title}</h3>
                  <p className="font-body text-farm-ink2 text-[15px] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
