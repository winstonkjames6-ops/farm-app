import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-dark-bg min-h-screen flex items-center pt-20">
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-primary rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left: Text */}
          <div>
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
            <div className="flex flex-col sm:flex-row gap-4">
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
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 bg-dark-secondary rounded-full border border-orange-primary"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="hidden md:block relative">
            <div className="bg-gradient-to-br from-orange-primary to-orange-hover rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {/* Placeholder */}
              <div className="text-6xl">🏅</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
