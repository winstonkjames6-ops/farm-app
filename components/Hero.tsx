import Link from 'next/link'

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-screen flex items-center pt-20"
      style={{
        backgroundImage: "url('/hero-athlete.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(9,9,11,0.7))', zIndex: 0, pointerEvents: 'none' }} />

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex items-center min-h-screen">

          {/* Text: right column — sits in negative space */}
          <div className="w-full text-center md:w-1/2 md:ml-auto md:text-left md:pr-8">
            <div className="mb-6 inline-block">
              <span className="text-orange-primary font-semibold text-sm uppercase tracking-wide">
                ⚡ Curated Training
              </span>
            </div>

            <h1 className="text-hero font-bold mb-6 leading-tight">
              On-demand 1-on-1 sports training for kids
            </h1>

            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Book curated trainers in your sport. 85% of every session goes straight to your coach.
              No subscriptions. No long-term contracts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/auth/signup?type=parent"
                className="btn-primary px-8 py-4 text-center text-lg font-semibold"
              >
                I'm looking for a trainer
              </Link>
              <Link
                href="/auth/signup?type=trainer"
                className="btn-secondary px-8 py-4 text-center text-lg font-semibold"
              >
                I'm a trainer
              </Link>
            </div>

            {/* Social proof (add later) */}
            <div className="mt-12 pt-8 border-t border-dark-tertiary">
              <p className="text-text-tertiary text-sm mb-4">Trusted by parents and coaches</p>
              <div className="flex gap-2 justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 bg-dark-secondary rounded-full border border-orange-primary"></div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
