const ITEMS = ['Background checked', 'Video interviewed', 'Verified credentials']

export default function CredentialBar() {
  return (
    <section className="bg-farm-card border-b border-farm-border">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        <span className="font-heading font-bold text-xs tracking-[.14em] uppercase text-farm-ink2">
          Every FARM trainer is
        </span>
        {ITEMS.map((item) => (
          <span key={item} className="inline-flex items-center gap-2 text-[15px] font-medium text-farm-ink font-body">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-farm-cyan-light text-farm-cyan shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 13 9 18 20 6" />
              </svg>
            </span>
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}
