import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Why FARM', href: '#why-farm' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Sports',
    links: [
      { label: 'Tennis', href: '/search' },
      { label: 'Soccer', href: '/search' },
      { label: 'Volleyball', href: '/search' },
      { label: 'Lacrosse', href: '/search' },
      { label: 'Basketball', href: '/search' },
      { label: 'Track', href: '/search' },
    ],
  },
  {
    title: 'For trainers',
    links: [
      { label: 'Apply as a trainer', href: '/login' },
      { label: 'How payouts work', href: '#pricing' },
      { label: 'Trainer requirements', href: '#why-farm' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-farm-bg border-t border-farm-border">
      <div className="max-w-[1240px] mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1">
          <a href="#top" className="flex items-center gap-2.5 no-underline mb-4">
            <span className="w-7 h-7 bg-farm-cyan inline-flex items-center justify-center text-farm-on-cyan font-heading font-extrabold text-base">F</span>
            <span className="font-heading font-extrabold text-lg tracking-wider uppercase text-farm-ink">FARM</span>
          </a>
          <p className="font-body text-farm-ink2 text-sm leading-relaxed max-w-[240px]">
            Vetted 1-on-1 youth sports coaching — in-person, live remote, or async video, on your schedule.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-heading font-bold text-xs tracking-[.14em] uppercase text-farm-ink mb-4">{col.title}</h3>
            <div className="flex flex-col gap-3">
              {col.links.map((l) => (
                <a key={l.label} href={l.href} className="no-underline text-farm-ink2 hover:text-farm-ink text-sm font-body transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-farm-border">
        <div className="max-w-[1240px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <span className="text-farm-ink2 text-xs font-body">© 2026 FARM. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="no-underline text-farm-ink2 hover:text-farm-ink text-xs font-body">Privacy</Link>
            <Link href="/terms" className="no-underline text-farm-ink2 hover:text-farm-ink text-xs font-body">Terms</Link>
            <a href="mailto:hello@farm.coach" className="no-underline text-farm-ink2 hover:text-farm-ink text-xs font-body">Safety</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
