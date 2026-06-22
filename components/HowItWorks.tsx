export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Browse curated trainers',
      description: 'See 20+ coaches in your sport, location, and budget. All verified.',
      icon: '👀',
    },
    {
      num: 2,
      title: 'Pick a time that works',
      description: 'Check real-time availability. Book in seconds.',
      icon: '📅',
    },
    {
      num: 3,
      title: 'Pay once, train once',
      description: 'No subscriptions. $40–$80/hr. Transparent pricing.',
      icon: '💳',
    },
    {
      num: 4,
      title: 'Rate your session',
      description: 'Share feedback. Help other parents find great coaches.',
      icon: '⭐',
    },
  ]

  return (
    <section id="how-it-works" className="bg-dark-secondary">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h1 font-bold mb-4">How FARM works</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Booking a trainer takes 4 simple steps. Get started in minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {steps.map((step) => (
            <div key={step.num} className="card group">
              
              {/* Step number */}
              <div className="w-12 h-12 rounded-full bg-orange-primary text-dark-bg flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition">
                {step.num}
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4">{step.icon}</div>

              {/* Content */}
              <h3 className="text-h3 font-semibold mb-3">{step.title}</h3>
              <p className="text-text-secondary text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-text-secondary mb-6">Ready to start?</p>
          <a href="#" className="btn-primary px-8 py-4 inline-block text-lg">
            Browse trainers now
          </a>
        </div>
      </div>
    </section>
  )
}
