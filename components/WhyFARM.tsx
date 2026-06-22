export default function WhyFARM() {
  const benefits = [
    {
      title: 'No subscriptions',
      description: 'Pay only for sessions you book. Cancel anytime.',
    },
    {
      title: '85% to coaches',
      description: 'Trainers keep 85% of every session. Better than other platforms.',
    },
    {
      title: 'Verified coaches',
      description: 'Background checked. Video interviewed. Real credentials.',
    },
    {
      title: 'Real reviews',
      description: 'Every parent rates their session. Honest feedback.',
    },
    {
      title: 'Flexible scheduling',
      description: 'In-person or remote. Morning, evening, weekends.',
    },
    {
      title: 'Instant bookings',
      description: 'See availability in real-time. Book in under 2 minutes.',
    },
  ]

  return (
    <section id="why-farm" className="bg-dark-bg">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h1 font-bold mb-4">Why FARM</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            We built FARM for parents and coaches who want simplicity.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="group cursor-pointer">
              
              {/* Accent bar */}
              <div className="h-1 w-12 bg-orange-primary mb-6 group-hover:w-24 transition-all duration-300"></div>

              {/* Content */}
              <h3 className="text-h3 font-semibold mb-3 group-hover:text-orange-primary transition">
                {benefit.title}
              </h3>
              <p className="text-text-secondary">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
