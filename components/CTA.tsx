import Link from 'next/link'

export default function CTA() {
  return (
    <section className="bg-dark-bg py-24">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        
        {/* Divider */}
        <div className="divider mb-12"></div>

        <h2 className="text-h1 font-bold mb-8">Ready to get started?</h2>

        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
          Join 30+ parents and trainers building the future of youth sports training.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/auth/signup?type=parent" 
            className="btn-primary px-8 py-4 text-center text-lg font-semibold"
          >
            Find a trainer
          </Link>
          <Link 
            href="/auth/signup?type=trainer" 
            className="btn-secondary px-8 py-4 text-center text-lg font-semibold"
          >
            Start coaching
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-12 border-t border-dark-tertiary text-text-tertiary text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>© 2026 FARM. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-orange-primary transition">Privacy</a>
              <a href="/terms" className="hover:text-orange-primary transition">Terms</a>
              <a href="mailto:hello@farm.coach" className="hover:text-orange-primary transition">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
