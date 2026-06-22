'use client'

import { useState } from 'react'

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How much does a session cost?',
      a: 'Trainers set their own rates ($40–$80/hour is typical). You see the price before booking. No hidden fees.',
    },
    {
      q: 'Can I book in-person or remote?',
      a: 'Both. Trainers list their availability for in-person (location-based) or remote (video call) sessions.',
    },
    {
      q: 'Do I need a contract?',
      a: 'No. Book one session at a time. Cancel anytime. If you want to book 5 sessions, you can book them individually.',
    },
    {
      q: 'How do I know if a coach is good?',
      a: 'Every parent rates their session 1–5 stars. You see the average rating, number of reviews, and trainer credentials before booking.',
    },
    {
      q: 'What if I need to cancel?',
      a: 'Cancel up to 24 hours before the session for a full refund. If you cancel within 24 hours, you lose the session fee.',
    },
    {
      q: 'How do trainers get paid?',
      a: 'Trainers receive 85% of each session price via Stripe. Payouts happen every week.',
    },
  ]

  return (
    <section id="faq" className="bg-dark-secondary">
      <div className="container max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h1 font-bold mb-4">Frequently asked questions</h2>
          <p className="text-xl text-text-secondary">
            Don't see your answer? Email us at hello@farm.coach
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="card cursor-pointer"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-h3 font-semibold flex-1 hover:text-orange-primary transition">
                  {faq.q}
                </h3>
                <span className="text-orange-primary text-2xl ml-4 flex-shrink-0">
                  {open === idx ? '−' : '+'}
                </span>
              </div>

              {/* Answer */}
              {open === idx && (
                <div className="mt-4 pt-4 border-t border-dark-tertiary">
                  <p className="text-text-secondary">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-text-tertiary mb-4">Still have questions?</p>
          <a href="mailto:hello@farm.coach" className="text-orange-primary hover:underline font-semibold">
            Email us
          </a>
        </div>
      </div>
    </section>
  )
}
