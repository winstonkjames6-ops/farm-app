export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-farm-ink py-20 md:py-28">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/landing/hero-full-bleed.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 15%',
          opacity: 0.28,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-farm-ink via-farm-ink/95 to-farm-ink/80" />

      <div className="relative z-10 max-w-[880px] mx-auto px-6 text-center">
        <h2 className="font-heading font-extrabold text-white uppercase leading-[0.95] tracking-wide text-[clamp(36px,5.5vw,68px)] mb-4.5 text-balance">
          Ready to find your kid&apos;s coach?
        </h2>
        <p className="font-body text-white/75 text-[clamp(16px,1.8vw,18px)] leading-relaxed max-w-[520px] mx-auto mb-9">
          Join families and vetted trainers already coaching on FARM — in-person, live remote, or async video.
        </p>
        <div className="flex flex-wrap gap-3.5 justify-center">
          <a
            href="/signup"
            className="no-underline inline-flex items-center justify-center rounded-full bg-farm-cyan text-farm-on-cyan font-heading font-extrabold text-sm tracking-[.1em] uppercase px-8 py-4 hover:brightness-95 transition"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="no-underline inline-flex items-center justify-center rounded-full border border-white/25 text-white font-heading font-bold text-sm tracking-[.1em] uppercase px-8 py-4 hover:bg-white hover:text-farm-ink transition"
          >
            Log In
          </a>
        </div>
      </div>
    </section>
  )
}
