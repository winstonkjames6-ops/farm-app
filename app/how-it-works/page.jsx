'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// ── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  surface: '#FFFFFF',
  surface2: '#F0EFEB',
  ink: '#1A1A1A',
  ink2: '#4A4A4A',
  ink3: '#9A9A9A',
  line: 'rgba(0,0,0,0.08)',
  accent: '#00BCC8',
  accentInk: '#FFFFFF',
  accentLight: 'rgba(0,188,200,0.09)',
}

// ── Data ─────────────────────────────────────────────────────────────────────

const PARENT_STEPS = [
  {
    title: 'Create your profile',
    body: 'Sign up and add your athlete\'s sport, age group, and goals. It takes under 2 minutes.',
  },
  {
    title: 'Browse vetted coaches',
    body: 'Filter by sport, location, rate, and availability. Every coach is background checked and credential verified.',
  },
  {
    title: 'Book a session',
    body: 'Pick a date, time, and format. Pay securely through the platform — no cash, no back-and-forth.',
  },
  {
    title: 'Track progress',
    body: 'After each session, your coach leaves notes on what was worked on and what\'s next.',
  },
]

const TRAINER_STEPS = [
  {
    title: 'Apply in minutes',
    body: 'Submit your credentials, set your rate, and choose your availability. We review every application.',
  },
  {
    title: 'Get matched with parents',
    body: 'We bring qualified parents to you. No cold outreach, no self-promotion required.',
  },
  {
    title: 'Run your sessions',
    body: 'In-person or remote video — your choice. Get paid weekly via Stripe, every time.',
  },
  {
    title: 'Build your reputation',
    body: 'Every session earns you a review. Great coaches rise to the top of search results.',
  },
]

const FAQS = [
  {
    q: 'How are coaches vetted?',
    a: 'Every applicant goes through a background check and credential verification before being listed. We manually review each profile — no one gets through automatically.',
  },
  {
    q: 'What does FARM charge parents?',
    a: 'Parents pay the trainer\'s listed rate plus a small platform fee of 10%. The total price is always shown before you book — no surprises.',
  },
  {
    q: 'How do trainers get paid?',
    a: 'Trainers keep 85% of each session price. Payouts are processed automatically via Stripe every week.',
  },
  {
    q: 'Can I cancel a session?',
    a: 'Yes. Cancel more than 24 hours before a session for a full refund. Cancellations within 24 hours forfeit the session fee.',
  },
]

// ── Step card with scroll-triggered animation ─────────────────────────────────

function StepCard({ step, index, isLast }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.42, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.09 }}
      className="flex gap-5"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center" style={{ width: 44 }}>
        <div
          className="flex-none flex items-center justify-center rounded-full font-black text-[15px] z-10"
          style={{
            width: 44, height: 44,
            background: T.accent,
            color: T.accentInk,
            fontFamily: "'Archivo', sans-serif",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        {!isLast && (
          <div
            className="flex-1 mt-2"
            style={{ width: 2, background: T.line, minHeight: 32 }}
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-10'}`}>
        <h3
          className="font-bold text-[18px] leading-snug mb-1.5"
          style={{ fontFamily: "'Archivo', sans-serif", color: T.ink }}
        >
          {step.title}
        </h3>
        <p className="text-[15px] leading-relaxed" style={{ color: T.ink2 }}>
          {step.body}
        </p>
      </div>
    </motion.div>
  )
}

// ── Section block ─────────────────────────────────────────────────────────────

function StepsSection({ label, steps, cta }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px 0px' })

  return (
    <section>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1] }}
        className="mb-8"
      >
        <span
          className="inline-block text-[11px] font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full"
          style={{
            background: T.accentLight,
            color: T.accent,
            letterSpacing: '.12em',
            fontFamily: "'Archivo', sans-serif",
          }}
        >
          {label}
        </span>
      </motion.div>

      <div
        className="rounded-2xl p-8"
        style={{ background: T.surface, border: `1px solid ${T.line}` }}
      >
        {steps.map((step, i) => (
          <StepCard key={step.title} step={step} index={i} isLast={i === steps.length - 1} />
        ))}

        <div
          className="mt-8 pt-7"
          style={{ borderTop: `1px solid ${T.line}` }}
        >
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 font-bold text-[15px] px-6 py-3 rounded-xl no-underline transition-[filter] duration-150"
            style={{ background: T.accent, color: T.accentInk }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.07)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            {cta.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function FAQItem({ faq, index, open, onToggle }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.36, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.07 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <span
          className="font-semibold text-[16px] flex-1 pr-4"
          style={{ fontFamily: "'Archivo', sans-serif", color: T.ink }}
        >
          {faq.q}
        </span>
        <span
          className="flex-none text-xl font-light transition-transform duration-200"
          style={{
            color: T.accent,
            transform: open ? 'rotate(45deg)' : 'none',
            lineHeight: 1,
          }}
        >
          +
        </span>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="px-6 pb-5"
          style={{ borderTop: `1px solid ${T.line}` }}
        >
          <p className="text-[14.5px] leading-relaxed pt-4" style={{ color: T.ink2 }}>
            {faq.a}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

function FAQStrip() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section>
      <div className="mb-6">
        <span
          className="inline-block text-[11px] font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full"
          style={{
            background: T.accentLight,
            color: T.accent,
            letterSpacing: '.12em',
            fontFamily: "'Archivo', sans-serif",
          }}
        >
          Common questions
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {FAQS.map((faq, i) => (
          <FAQItem
            key={faq.q}
            faq={faq}
            index={i}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: T.bg, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(248,248,246,0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderColor: T.line,
        }}
      >
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black"
              style={{ background: T.accent, color: T.accentInk, fontFamily: "'Archivo', sans-serif", fontSize: 15 }}
            >
              F
            </span>
            <span
              className="font-extrabold text-xl tracking-wide"
              style={{ fontFamily: "'Archivo', sans-serif", color: T.ink }}
            >
              FARM
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-sm font-semibold px-4 py-2 rounded-full no-underline transition-[border-color] duration-150"
              style={{ border: `1.5px solid ${T.line}`, color: T.ink2 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.24)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line }}
            >
              Find a trainer
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-12 pb-28">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.2, 0.7, 0.2, 1] }}
          className="mb-14"
        >
          <h1
            className="font-black text-[36px] sm:text-[42px] leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: "'Archivo', sans-serif", color: T.ink, letterSpacing: '-.03em' }}
          >
            How FARM works
          </h1>
          <p className="text-[17px] leading-relaxed max-w-lg" style={{ color: T.ink2 }}>
            From finding a coach to your first session — here&apos;s exactly what to expect.
          </p>
        </motion.div>

        <div className="flex flex-col gap-12">
          <StepsSection
            label="For Parents"
            steps={PARENT_STEPS}
            cta={{ label: 'Find a trainer', href: '/search' }}
          />

          <StepsSection
            label="For Trainers"
            steps={TRAINER_STEPS}
            cta={{ label: 'Apply as a trainer', href: '/trainer-signup' }}
          />

          <FAQStrip />
        </div>
      </main>
    </div>
  )
}
