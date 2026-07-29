'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import Avatar from './Avatar'

const SPORTS = ['tennis', 'soccer', 'volleyball', 'lacrosse', 'basketball', 'track']

function RotatingWord() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SPORTS.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="relative inline-block overflow-hidden align-top h-[1em]">
      <AnimatePresence initial={false}>
        <motion.span
          key={SPORTS[i]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className="inline-block text-farm-cyan absolute left-0 top-0 whitespace-nowrap"
        >
          {SPORTS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function JoinedCount() {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const target = 30
    const dur = 1400
    const t0 = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setCount(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView])

  return <span ref={ref}>{count}+</span>
}

export default function Hero() {
  const [query, setQuery] = useState('')

  return (
    <section id="top" className="relative w-full min-h-[clamp(620px,88vh,880px)] flex items-center overflow-hidden pt-[72px]">
      <Image
        src="/images/landing/hero-full-bleed.png"
        alt="Youth athlete training outdoors"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,.48) 32%, rgba(0,0,0,.52) 60%, rgba(0,0,0,.7) 100%)' }}
      />

      <div className="relative z-10 max-w-[1240px] w-full mx-auto px-6 md:px-8 py-16">
        <div className="max-w-[640px] mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-white font-heading font-bold text-xs tracking-[.14em] uppercase px-4 py-2 border border-white/25 bg-white/10 backdrop-blur-sm mb-6">
            <span className="w-1.5 h-1.5 bg-farm-cyan" />
            Vetted youth sports trainers
          </span>

          <h1 className="font-heading font-extrabold text-white uppercase leading-[0.95] tracking-wide text-[clamp(38px,6.4vw,72px)] mb-5 text-balance">
            Find the perfect coach for your kid&apos;s <RotatingWord />
          </h1>

          <p className="font-body text-white/85 text-[clamp(16px,1.6vw,19px)] leading-relaxed max-w-[440px] mx-auto mb-8">
            In-person, live remote, or async video — book background-checked trainers your family can trust, on your schedule.
          </p>

          <form
            id="find-a-trainer"
            onSubmit={(e) => {
              e.preventDefault()
              console.log('hero search query:', query)
            }}
            className="scroll-mt-[88px] flex items-center gap-2 bg-white border border-white/10 rounded-full pl-5 pr-1.5 py-1.5 max-w-[480px] mx-auto shadow-[0_18px_44px_rgba(0,0,0,.35)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={1.8} strokeLinecap="round" className="shrink-0">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <line x1="20" y1="20" x2="15.5" y2="15.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              autoComplete="off"
              placeholder="Enter a sport or ZIP code"
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-farm-ink font-body text-[15px] font-medium placeholder:text-farm-ink2"
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-farm-cyan text-farm-on-cyan font-heading font-extrabold text-[13px] tracking-[.1em] uppercase px-6 py-3 hover:brightness-95 transition"
            >
              Find a trainer
            </button>
          </form>

          <div className="flex items-center justify-center gap-3.5 mt-7">
            <div className="flex">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`rounded-full ring-2 ring-white/70 bg-white overflow-hidden ${i === 0 ? '' : '-ml-2.5'}`}>
                  <Avatar seed={i} size={36} />
                </span>
              ))}
            </div>
            <span className="text-sm text-white/85 font-medium font-body">
              Joined by <span className="text-white font-bold"><JoinedCount /></span> families &amp; coaches
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
