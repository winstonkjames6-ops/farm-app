import Image from 'next/image'

const ShieldIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)
const TagIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41L12 22l-9-9 8.59-8.59A2 2 0 0113 4h6a2 2 0 012 2v6a2 2 0 01-.41 1.41z" />
    <circle cx="16" cy="8" r="1.5" />
  </svg>
)

const VALUES = [
  {
    key: 'vetted',
    title: 'Vetted trainers, not a free-for-all',
    desc: 'Every coach is background checked, video interviewed, and credential verified before they can list a session.',
    type: 'solid',
    icon: ShieldIcon,
  },
  {
    key: 'formats',
    title: 'Train your way',
    desc: 'In-person, live remote, or async video review — mix formats as your family’s schedule changes week to week.',
    type: 'photo',
    image: '/backgrounds/soccer.jpg',
  },
  {
    key: 'visibility',
    title: 'Visibility into every session',
    desc: 'Parents see session notes, coach feedback, and progress history — not just a calendar invite.',
    type: 'photo',
    image: '/backgrounds/parent.jpg',
  },
  {
    key: 'pricing',
    title: 'Transparent, fair pricing',
    desc: 'No hidden platform fees. Pay per session or subscribe — the price you see is the price you pay.',
    type: 'cyan',
    icon: TagIcon,
  },
]

export default function WhyFarm() {
  return (
    <section id="why-farm" className="scroll-mt-[88px] bg-farm-card border-t border-farm-border py-20 md:py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-block text-farm-cyan font-heading font-bold text-xs tracking-[.16em] uppercase mb-4">
            Why FARM
          </span>
          <h2 className="font-heading font-extrabold text-farm-ink uppercase leading-[0.95] tracking-wide text-[clamp(32px,4.5vw,56px)] mb-3.5">
            Built for how families actually train
          </h2>
          <p className="font-body text-farm-ink2 text-[clamp(16px,1.8vw,18px)] leading-relaxed max-w-[560px] mx-auto">
            No middlemen, no lock-in — just vetted coaching that fits your kid&apos;s schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((v) => {
            if (v.type === 'photo') {
              return (
                <div key={v.key} className="relative min-h-[260px] rounded-2xl overflow-hidden">
                  <Image src={v.image!} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <h3 className="font-heading font-bold text-xl tracking-wide uppercase text-white mb-2">{v.title}</h3>
                    <p className="font-body text-white/85 text-[15px] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              )
            }

            if (v.type === 'solid') {
              return (
                <div key={v.key} className="bg-farm-ink rounded-2xl p-8">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-farm-cyan mb-5">
                    {v.icon}
                  </span>
                  <h3 className="font-heading font-bold text-xl tracking-wide uppercase text-white mb-2">{v.title}</h3>
                  <p className="font-body text-white/70 text-[15px] leading-relaxed">{v.desc}</p>
                </div>
              )
            }

            return (
              <div key={v.key} className="bg-farm-cyan-light border border-farm-cyan-border rounded-2xl p-8">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-farm-cyan mb-5">
                  {v.icon}
                </span>
                <h3 className="font-heading font-bold text-xl tracking-wide uppercase text-farm-ink mb-2">{v.title}</h3>
                <p className="font-body text-farm-ink2 text-[15px] leading-relaxed">{v.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
