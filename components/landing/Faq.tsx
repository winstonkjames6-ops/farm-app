'use client'

import { useState } from 'react'

const QUESTIONS = [
  {
    q: 'How much does a session cost?',
    a: 'Trainers set their own rates — $40–$80 an hour is typical on the pay-per-session Starter plan. Family and All-Access subscribers get discounted rates. You see the full price before booking, no hidden fees.',
  },
  {
    q: 'What’s the difference between live and async video sessions?',
    a: 'Live sessions happen in-person or over video call in real time. Async video means you record your kid practicing and the coach sends back detailed feedback within an agreed window — good for busy weeks or off-schedule practice.',
  },
  {
    q: 'How are trainers vetted?',
    a: 'Every trainer passes a background check, a video interview, and credential verification before they can list a session. You can see all of this on their profile.',
  },
  {
    q: 'Can I switch between plans?',
    a: 'Yes. You can move between Starter, Family, and All-Access at any time — changes apply to your next billing cycle, and you keep any sessions already booked.',
  },
  {
    q: 'What if I need to cancel a session?',
    a: 'Cancel up to 24 hours before a live session for a full refund. Within 24 hours, the session fee applies. Async video reviews can be cancelled anytime before the coach starts recording feedback.',
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-[88px] bg-farm-bg py-20 md:py-28">
      <div className="max-w-[760px] mx-auto px-6">
        <div className="text-center mb-12 md:mb-14">
          <span className="inline-block text-farm-cyan font-heading font-bold text-xs tracking-[.16em] uppercase mb-4">
            FAQ
          </span>
          <h2 className="font-heading font-extrabold text-farm-ink uppercase leading-[0.95] tracking-wide text-[clamp(32px,4.5vw,56px)]">
            Frequently asked questions
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {QUESTIONS.map(({ q, a }, i) => {
            const open = openIndex === i
            return (
              <div key={q} className="bg-farm-card border border-farm-border rounded-xl px-6 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 py-5 bg-transparent border-none cursor-pointer text-left"
                >
                  <span className="font-heading font-bold text-lg tracking-wide uppercase text-farm-ink">{q}</span>
                  <span
                    className="shrink-0 text-farm-cyan text-2xl leading-none font-light transition-transform duration-200"
                    style={{ transform: open ? 'rotate(45deg)' : 'none' }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="font-body text-farm-ink2 text-[15px] leading-relaxed border-t border-farm-border pt-4 pb-5">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-11">
          <p className="text-farm-ink2 mb-2 text-[15px] font-body">Still have questions?</p>
          <a href="mailto:hello@farm.coach" className="text-farm-cyan font-heading font-bold text-[15px] tracking-wide uppercase no-underline">
            Email us at hello@farm.coach
          </a>
        </div>
      </div>
    </section>
  )
}
