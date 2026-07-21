'use client'

import { Search, Bell } from 'lucide-react'

const barlow = "'Barlow Condensed', sans-serif"

// ── Hardcoded placeholder data ─────────────────────────────────────────────

const SPORTS = ['All', 'Basketball', 'Soccer', 'Track', 'Baseball', 'Tennis']

const AVATAR_GRADIENTS = [
  'from-orange-primary to-[#00E0EE]',
  'from-[#F59E0B] to-[#F97316]',
  'from-[#8B5CF6] to-[#6366F1]',
  'from-[#10B981] to-[#059669]',
  'from-[#EC4899] to-[#DB2777]',
]

const TRAINERS_TO_WATCH = [
  { name: 'Marcus Reed' },
  { name: 'Elena Cruz' },
  { name: 'Jordan Blake' },
  { name: 'Priya Shah' },
  { name: 'Devon Lee' },
]

const LATEST_CARDS = [
  { title: 'Building explosive first-step speed', byline: 'Coach Marcus Reed · Verified' },
  { title: 'My road to the state finals', byline: 'Elena Cruz · Athlete' },
  { title: '5 drills every point guard needs', byline: 'Coach Jordan Blake · Verified' },
  { title: 'Recovering from a hamstring pull', byline: 'Priya Shah · Athlete' },
  { title: 'Off-season strength fundamentals', byline: 'Coach Devon Lee · Verified' },
  { title: 'Finding your swing under pressure', byline: 'Amara Johnson · Athlete' },
]

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F6] text-black" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div className="max-w-[560px] mx-auto px-4 pt-8 pb-16">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className="font-black uppercase text-4xl leading-none"
            style={{ fontFamily: barlow }}
          >
            Discover
          </h1>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Search" className="text-black">
              <Search size={22} strokeWidth={2} />
            </button>
            <button type="button" aria-label="Notifications" className="text-black">
              <Bell size={22} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Sport tab row */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-4 px-4 scrollbar-none">
          {SPORTS.map((sport, i) => {
            const active = i === 0
            return (
              <button
                key={sport}
                type="button"
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  active
                    ? 'bg-orange-primary text-white'
                    : 'border border-black/10 text-text-tertiary'
                }`}
              >
                {sport}
              </button>
            )
          })}
        </div>

        {/* Featured card */}
        <div className="rounded-2xl overflow-hidden relative h-[200px] bg-gradient-to-br from-[#e8e6de] to-[#d8d5ca]">
          <span
            className="absolute top-3 left-3 bg-black/80 text-white text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ fontFamily: barlow }}
          >
            Featured
          </span>
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
            <h2 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: barlow }}>
              Rising talent: Amara Johnson
            </h2>
            <p className="text-white/80 text-sm mt-0.5">Track &amp; Field · Watch her journey</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 mb-8">Featured spot — rotation logic TBD</p>

        {/* Trainers to watch */}
        <h3
          className="uppercase font-bold text-sm mb-3"
          style={{ fontFamily: barlow }}
        >
          Trainers to watch
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-1 mb-8 -mx-4 px-4 scrollbar-none">
          {TRAINERS_TO_WATCH.map((trainer, i) => (
            <div key={trainer.name} className="shrink-0 w-16 flex flex-col items-center gap-1.5">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}`} />
              <span className="text-xs text-center leading-tight truncate w-full">{trainer.name}</span>
            </div>
          ))}
        </div>

        {/* Latest */}
        <h3
          className="uppercase font-bold text-sm mb-3"
          style={{ fontFamily: barlow }}
        >
          Latest
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {LATEST_CARDS.map((card) => (
            <div key={card.title} className="rounded-2xl border border-black/10 bg-white overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300" />
              <div className="p-3">
                <p className="text-sm font-semibold leading-snug">{card.title}</p>
                <p className="text-xs text-text-tertiary mt-1">{card.byline}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
