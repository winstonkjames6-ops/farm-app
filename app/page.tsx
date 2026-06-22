'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null)
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Scroll reveals
    const revealMap: Record<string, string> = {
      up: 'translateY(24px)', left: 'translateX(-30px)',
      right: 'translateX(30px)', scale: 'scale(.94)',
    }
    if (!reduce) {
      const reveals = root.querySelectorAll('[data-reveal]')
      reveals.forEach((el) => {
        const h = el as HTMLElement
        h.style.opacity = '0'
        h.style.transform = revealMap[h.dataset.reveal ?? ''] ?? 'translateY(24px)'
        h.style.transition = 'opacity .45s ease, transform .45s cubic-bezier(.2,.7,.2,1)'
        h.style.willChange = 'opacity, transform'
      })
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          const sibs = [...el.parentElement!.children].filter((c) => c.hasAttribute('data-reveal'))
          const idx = Math.max(0, sibs.indexOf(el))
          setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none' }, idx * 100)
          io.unobserve(el)
        })
      }, { threshold: 0.15 })
      reveals.forEach((el) => io.observe(el))
    }

    // Counters
    const counters = root.querySelectorAll('[data-count]')
    const runCounter = (el: Element) => {
      const target = parseFloat(el.getAttribute('data-count') ?? '0')
      const dec = parseInt(el.getAttribute('data-decimals') ?? '0', 10)
      const pre = el.getAttribute('data-prefix') ?? ''
      const suf = el.getAttribute('data-suffix') ?? ''
      if (reduce) { el.textContent = pre + target.toFixed(dec) + suf; return }
      const dur = 1900; const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1)
        el.textContent = pre + (target * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suf
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    if (counters.length) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const delay = parseInt(e.target.getAttribute('data-count-delay') ?? '0', 10)
          setTimeout(() => runCounter(e.target), delay)
          io2.unobserve(e.target)
        })
      }, { threshold: 0.4 })
      counters.forEach((el) => io2.observe(el))
    }

    // Sport cycle
    const cycleEl = root.querySelector('#sport-cycle')
    if (cycleEl && !reduce) {
      const sports = ['tennis', 'soccer', 'volleyball', 'lacrosse', 'basketball', 'track']
      let si = 0
      cycleTimer.current = setInterval(() => {
        si = (si + 1) % sports.length
        const el = cycleEl as HTMLElement
        el.style.opacity = '0'
        setTimeout(() => { el.textContent = sports[si]; el.style.opacity = '1' }, 300)
      }, 2400)
    }

    // Search focus ring
    const search = root.querySelector<HTMLInputElement>('#hero-search')
    if (search?.parentElement) {
      const box = search.parentElement
      search.addEventListener('focus', () => {
        box.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 45%, transparent)'
        box.style.borderColor = 'var(--accent)'
      })
      search.addEventListener('blur', () => {
        box.style.boxShadow = 'none'
        box.style.borderColor = 'var(--line)'
      })
    }

    return () => {
      if (cycleTimer.current) clearInterval(cycleTimer.current)
    }
  }, [])

  return (
    <>
      <div
        ref={rootRef}
        style={{
          '--bg': '#F4F1EA', '--surface': '#FBF9F5', '--surface-2': '#ECE6DA',
          '--ink': '#1A1814', '--ink-2': '#4C473E', '--ink-3': '#8C8678',
          '--line': 'rgba(26,24,20,0.10)', '--accent': '#D6532A', '--accent-ink': '#FFF8F2',
          '--radius': '14px', '--section-pad': '120px',
          '--photo-display': 'flex', '--social-display': 'flex',
          background: 'var(--bg)', color: 'var(--ink)',
          fontFamily: "'Hanken Grotesk', sans-serif",
          height: '100vh', WebkitFontSmoothing: 'antialiased',
          overflowX: 'hidden', overflowY: 'auto',
        } as React.CSSProperties}
      >

        {/* ── NAV ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'color-mix(in srgb, var(--bg) 84%, transparent)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--line)',
        } as React.CSSProperties}>
          <div style={{
            maxWidth: '1240px', margin: '0 auto', padding: '0 32px', height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
          }}>
            <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-ink)', fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '17px',
              }}>F</span>
              <span style={{
                fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '22px',
                letterSpacing: '.02em', color: 'var(--ink)',
              }}>FARM</span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>How it works</a>
              <a href="#booking" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>Booking</a>
              <a href="#why-farm" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>Why FARM</a>
              <a href="#faq" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>FAQ</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                color: 'var(--ink)', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '14px',
                padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: '999px',
              }}>Find a trainer</a>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                color: 'var(--accent-ink)', background: 'var(--accent)',
                fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '14px',
                padding: '11px 18px', borderRadius: '999px', transition: 'transform .15s ease,filter .15s ease',
              }}>I&apos;m a trainer</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section id="top" style={{
          position: 'relative', width: '100%', minHeight: 'clamp(560px,76vh,780px)',
          display: 'flex', alignItems: 'center', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, backgroundImage: "url('/hero-bg.png')",
            backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0,
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(90deg,rgba(26,26,26,0.82) 0%,rgba(26,26,26,0.66) 34%,rgba(26,26,26,0.38) 62%,rgba(26,26,26,0.12) 100%)',
          }} />
          <div style={{
            position: 'relative', zIndex: 2, maxWidth: '1240px', width: '100%',
            margin: '0 auto', padding: 'clamp(48px,7vw,88px) 32px',
          }}>
            <div style={{ maxWidth: '640px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '9px', color: '#fff',
                fontWeight: 600, fontSize: '13.5px', padding: '8px 15px',
                border: '1px solid rgba(255,255,255,.28)', background: 'rgba(255,255,255,.08)',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                borderRadius: '999px', marginBottom: '26px', animation: 'fadeIn .6s ease both .1s',
              } as React.CSSProperties}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)' }} />
                1-on-1 youth sports coaching
              </span>
              <h1 style={{
                fontFamily: "'Archivo', sans-serif", fontWeight: 900,
                fontSize: 'clamp(40px,6vw,68px)', lineHeight: 0.98, letterSpacing: '-.035em',
                margin: '0 0 20px', color: '#fff', animation: 'fadeUp .55s cubic-bezier(.2,.7,.2,1) both .05s',
                textWrap: 'balance',
              } as React.CSSProperties}>
                Find your kid&apos;s next great{' '}
                <span id="sport-cycle" style={{ color: 'var(--accent)', display: 'inline-block', transition: 'opacity .3s ease' }}>
                  tennis
                </span>{' '}coach.
              </h1>
              <p style={{
                fontFamily: "'Hanken Grotesk', sans-serif", color: 'rgba(255,255,255,.86)',
                fontSize: 'clamp(17px,1.6vw,20px)', fontWeight: 400, lineHeight: 1.55,
                margin: '0 0 32px', maxWidth: '520px', animation: 'fadeUp .55s cubic-bezier(.2,.7,.2,1) both .3s',
                textWrap: 'pretty',
              } as React.CSSProperties}>
                On-demand training with vetted coaches. 85% straight to your coach.
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '999px',
                padding: '7px 7px 7px 20px', maxWidth: '480px',
                boxShadow: '0 18px 44px rgba(0,0,0,.28)', transition: 'box-shadow .2s ease,border-color .2s ease',
                animation: 'fadeUp .55s cubic-bezier(.2,.7,.2,1) both .5s',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.8} strokeLinecap="round" style={{ flex: 'none' }}>
                  <circle cx="10.5" cy="10.5" r="6.5" /><line x1="20" y1="20" x2="15.5" y2="15.5" />
                </svg>
                <input
                  id="hero-search" type="text" placeholder="Enter your sport or ZIP code"
                  style={{
                    flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--ink)', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '15.5px', fontWeight: 500,
                  }}
                />
                <a href="#" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--accent)', color: 'var(--accent-ink)', textDecoration: 'none',
                  fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '15px',
                  padding: '12px 22px', borderRadius: '999px', whiteSpace: 'nowrap',
                  transition: 'transform .15s ease,filter .15s ease',
                }}>Search</a>
              </div>
              <div style={{
                display: 'var(--social-display)', alignItems: 'center', gap: '14px',
                marginTop: '30px', animation: 'fadeIn .6s ease both .7s',
              } as React.CSSProperties}>
                <div style={{ display: 'flex' }}>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,.85)',
                      marginLeft: i === 0 ? 0 : '-12px',
                      background: 'repeating-linear-gradient(135deg,#d9d3c7,#d9d3c7 5px,#f0ebe1 5px,#f0ebe1 10px)',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>
                  Joined by <span style={{ color: '#fff', fontWeight: 700 }}>30+</span> families &amp; coaches
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section style={{ backgroundColor: '#d6532a' }}>
          <div style={{
            maxWidth: '1240px', margin: '0 auto', padding: '36px 32px',
            display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,5vw,72px)',
            alignItems: 'center', justifyContent: 'flex-start',
          }}>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span data-count="85" data-suffix="%" data-count-delay="0" style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '46px', lineHeight: 1, color: '#fbf9f5' }}>85%</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbf9f5" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="6" /><polyline points="6 11 12 5 18 11" />
                </svg>
              </div>
              <div style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.62)', fontWeight: 500 }}>goes to your coach</div>
            </div>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span data-count="4.9" data-decimals="1" data-count-delay="120" style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '46px', lineHeight: 1, color: '#fbf9f5' }}>4.9</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="6" /><polyline points="6 11 12 5 18 11" />
                </svg>
              </div>
              <div style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.62)', fontWeight: 500 }}>average coach rating</div>
            </div>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span data-count="320" data-suffix="+" data-count-delay="240" style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '46px', lineHeight: 1, color: '#fbf9f5' }}>320+</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="6" /><polyline points="6 11 12 5 18 11" />
                </svg>
              </div>
              <div style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.62)', fontWeight: 500 }}>sessions booked</div>
            </div>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '46px', lineHeight: 1, color: '#fbf9f5' }}>&lt;</span>
                <span data-count="2" data-suffix=" min" data-count-delay="360" style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '46px', lineHeight: 1, color: '#fbf9f5' }}>2 min</span>
              </div>
              <div style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.62)', fontWeight: 500 }}>to book a session</div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{
          background: 'var(--surface)', borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)', padding: 'var(--section-pad) 0',
        }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>
            <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 'clamp(44px,6vw,64px)' }}>
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>How it works</span>
              <h2 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 14px', color: 'var(--ink)' }}>
                Booking a trainer takes four steps
              </h2>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(17px,2vw,20px)', color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: '540px', margin: '0 auto' }}>
                From browsing to your first session in minutes — no back-and-forth, no commitments.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '20px', marginBottom: '48px' }}>
              {[
                { num: '01', title: 'Browse curated trainers', desc: 'See 20+ verified coaches in your sport, location and budget.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="6.5" /><line x1="20" y1="20" x2="15.5" y2="15.5" /></svg> },
                { num: '02', title: 'Pick a time that works', desc: 'Check real-time availability and book your slot in seconds.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><line x1="3.5" y1="9.5" x2="20.5" y2="9.5" /><line x1="8" y1="3" x2="8" y2="6.5" /><line x1="16" y1="3" x2="16" y2="6.5" /></svg> },
                { num: '03', title: 'Pay once, train once', desc: 'No subscriptions. $40–$80 an hour, with fully transparent pricing.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2.5" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="7" y1="14.5" x2="11" y2="14.5" /></svg> },
                { num: '04', title: 'Rate your session', desc: 'Share honest feedback and help other parents find great coaches.',
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1" /></svg> },
              ].map(({ num, title, desc, icon }) => (
                <div key={num} data-reveal="scale" style={{
                  background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)',
                  padding: '28px 26px', transition: 'transform .18s ease,box-shadow .18s ease,border-color .18s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                    <span style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: 'color-mix(in srgb,var(--accent) 13%,transparent)',
                      color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{icon}</span>
                    <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '30px', color: 'color-mix(in srgb,var(--ink-3) 50%,transparent)' }}>{num}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: '20px', letterSpacing: '-.01em', margin: '0 0 8px', color: 'var(--ink)' }}>{title}</h3>
                  <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", color: 'var(--ink-2)', fontSize: '15.5px', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none',
                padding: '16px 30px', borderRadius: 'var(--radius)',
                fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: '16px',
                textDecoration: 'none', cursor: 'pointer', transition: 'transform .15s ease,filter .15s ease',
              }}>Browse trainers now</a>
            </div>
          </div>
        </section>

        {/* ── BOOKING ── */}
        <section id="booking" style={{ padding: 'var(--section-pad) 0' }}>
          <div style={{
            maxWidth: '1180px', margin: '0 auto', padding: '0 24px',
            display: 'grid', gridTemplateColumns: '0.92fr 1.08fr',
            gap: 'clamp(36px,5vw,64px)', alignItems: 'center',
          }}>
            <div data-reveal="left">
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Booking</span>
              <h2 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 16px', color: 'var(--ink)' }}>
                Lock in a session in under two minutes
              </h2>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(17px,2vw,20px)', color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 26px', maxWidth: '440px' }}>
                Pick a coach, choose a day and time slot, and confirm. Real-time availability — what you see is what you book.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['Transparent pricing, no platform fees for parents', 'Free cancellation up to 24 hours before', 'In-person or remote — your choice'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'color-mix(in srgb,var(--accent) 15%,transparent)',
                      color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 13 9 18 20 6" />
                      </svg>
                    </span>
                    <span style={{ color: 'var(--ink-2)', fontSize: '16px' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal="right" style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: '20px', padding: 'clamp(20px,2.4vw,30px)',
              boxShadow: '0 30px 70px rgba(26,24,20,.10)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                <span style={{
                  width: '56px', height: '56px', borderRadius: '14px', flex: 'none',
                  background: 'repeating-linear-gradient(135deg,var(--surface-2),var(--surface-2) 6px,var(--bg) 6px,var(--bg) 12px)',
                  border: '1px solid var(--line)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: '18px', color: 'var(--ink)' }}>Coach — Tennis</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '13.5px', color: 'var(--ink-3)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                      <polygon points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1" />
                    </svg>
                    <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>4.9</span> · 48 reviews · In-person
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '22px', color: 'var(--ink)' }}>$55</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>per hour</div>
                </div>
              </div>
              <div style={{ padding: '20px 0 6px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '12px' }}>Select a date</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
                  {[{ d: 'FRI', n: '7', a: false }, { d: 'SAT', n: '8', a: true }, { d: 'SUN', n: '9', a: false }, { d: 'MON', n: '10', a: false }, { d: 'TUE', n: '11', a: false }].map(({ d, n, a }) => (
                    <div key={d} style={{
                      textAlign: 'center', padding: '12px 0', borderRadius: '11px',
                      background: a ? 'var(--accent)' : 'var(--bg)',
                      border: a ? '1px solid var(--accent)' : '1px solid var(--line)',
                      boxShadow: a ? '0 8px 20px color-mix(in srgb,var(--accent) 35%,transparent)' : 'none',
                    }}>
                      <div style={{ fontSize: '11px', color: a ? 'rgba(255,248,242,.8)' : 'var(--ink-3)', fontWeight: 600 }}>{d}</div>
                      <div style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: '18px', color: a ? 'var(--accent-ink)' : 'var(--ink)', marginTop: '2px' }}>{n}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '18px 0 22px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '12px' }}>Time slot</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['2:00 PM', '4:00 PM', '5:30 PM', '7:00 PM'].map((t, i) => (
                    <span key={t} style={{
                      padding: '10px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                      background: i === 1 ? 'var(--ink)' : 'var(--bg)',
                      border: i === 1 ? '1px solid var(--ink)' : '1px solid var(--line)',
                      color: i === 1 ? 'var(--bg)' : 'var(--ink-2)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>Total</div>
                  <div style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: '26px', color: 'var(--ink)' }}>$55.00</div>
                </div>
                <a href="#" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'var(--accent)', color: 'var(--accent-ink)', textDecoration: 'none',
                  fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: '16px',
                  padding: '15px 30px', borderRadius: '12px', transition: 'transform .15s ease,filter .15s ease',
                }}>Book session</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY FARM ── */}
        <section id="why-farm" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', padding: 'var(--section-pad) 0' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>
            <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 'clamp(44px,6vw,64px)' }}>
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Why FARM</span>
              <h2 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 14px', color: 'var(--ink)' }}>
                Built for parents and coaches who want simplicity
              </h2>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(17px,2vw,20px)', color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: '540px', margin: '0 auto' }}>
                No middlemen, no lock-in — just great coaching, fairly priced.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
              {[
                { title: 'No subscriptions', desc: 'Pay only for the sessions you book. Cancel anytime, no questions.' },
                { title: '85% to coaches', desc: 'Trainers keep 85% of every session — far more than other platforms.' },
                { title: 'Verified coaches', desc: 'Background checked, video interviewed, with real, confirmed credentials.' },
                { title: 'Real reviews', desc: 'Every parent rates their session, so feedback is honest and current.' },
                { title: 'Flexible scheduling', desc: 'In-person or remote. Mornings, evenings and weekends all work.' },
                { title: 'Instant bookings', desc: 'See live availability and confirm a session in under two minutes.' },
              ].map(({ title, desc }) => (
                <div key={title} data-reveal="scale" style={{
                  background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)',
                  padding: '30px 28px', transition: 'transform .18s ease,box-shadow .18s ease,border-color .18s ease',
                }}>
                  <div style={{ width: '30px', height: '3px', background: 'var(--accent)', borderRadius: '2px', marginBottom: '20px' }} />
                  <h3 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: '21px', letterSpacing: '-.01em', margin: '0 0 9px', color: 'var(--ink)' }}>{title}</h3>
                  <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", color: 'var(--ink-2)', fontSize: '16px', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)', padding: 'var(--section-pad) 0' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>
            <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,56px)' }}>
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>FAQ</span>
              <h2 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: 0, color: 'var(--ink)' }}>
                Frequently asked questions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { q: 'How much does a session cost?', a: 'Trainers set their own rates — $40–$80 an hour is typical. You see the full price before booking. No hidden fees.', open: true },
                { q: 'Can I book in-person or remote?', a: 'Both. Trainers list availability for in-person (location-based) and remote (video call) sessions.' },
                { q: 'Do I need a contract?', a: 'No. Book one session at a time and cancel anytime. Want five sessions? Book them individually.' },
                { q: 'How do I know if a coach is good?', a: 'Every parent rates their session 1–5 stars. You see the average rating, number of reviews and trainer credentials before booking.' },
                { q: 'What if I need to cancel?', a: 'Cancel up to 24 hours before a session for a full refund. Within 24 hours, the session fee applies.' },
                { q: 'How do trainers get paid?', a: 'Trainers receive 85% of each session price via Stripe, with payouts every week.' },
              ].map(({ q, a, open }) => (
                <details key={q} open={open} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '4px 24px' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', cursor: 'pointer', padding: '20px 0' }}>
                    <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: '18px', color: 'var(--ink)' }}>{q}</span>
                    <span className="faq-ind" style={{ color: 'var(--accent)', fontSize: '24px', lineHeight: 1, transition: 'transform .2s ease' }}>+</span>
                  </summary>
                  <p className="faq-ans" style={{ fontFamily: "'Hanken Grotesk',sans-serif", color: 'var(--ink-2)', fontSize: '16px', lineHeight: 1.6, margin: '0 0 20px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>{a}</p>
                </details>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '44px' }}>
              <p style={{ color: 'var(--ink-3)', margin: '0 0 8px', fontSize: '15px' }}>Still have questions?</p>
              <a href="mailto:hello@farm.coach" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: '16px' }}>
                Email us at hello@farm.coach
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--ink)', padding: 'var(--section-pad) 0' }}>
          <div style={{
            position: 'absolute', top: '-160px', right: '-120px', width: '560px', height: '560px',
            background: 'radial-gradient(circle,var(--accent),transparent 60%)', opacity: 0.22, pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '880px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 'clamp(34px,5vw,58px)',
              lineHeight: 1.02, letterSpacing: '-.025em', margin: '0 0 18px', color: 'var(--bg)',
              textWrap: 'balance',
            } as React.CSSProperties}>
              Ready to get started?
            </h2>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(17px,2vw,20px)', color: 'rgba(244,241,234,.78)', lineHeight: 1.55, margin: '0 auto 36px', maxWidth: '520px' }}>
              Join 30+ parents and trainers building the future of youth sports training.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none',
                padding: '16px 30px', borderRadius: 'var(--radius)',
                fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: '16px',
                textDecoration: 'none', cursor: 'pointer', transition: 'transform .15s ease,filter .15s ease',
              }}>Find a trainer</a>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'transparent', color: 'var(--bg)',
                border: '1.5px solid rgba(244,241,234,.4)',
                padding: '14.5px 28px', borderRadius: 'var(--radius)',
                fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: '16px',
                textDecoration: 'none', cursor: 'pointer', transition: 'border-color .15s ease,transform .15s ease',
              }}>Start coaching</a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
          <div style={{
            maxWidth: '1240px', margin: '0 auto', padding: '32px',
            display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '26px', height: '26px', borderRadius: '8px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-ink)', fontFamily: "'Archivo',sans-serif", fontWeight: 900, fontSize: '14px',
              }}>F</span>
              <span style={{ fontSize: '14px', color: 'var(--ink-3)' }}>© 2026 FARM. All rights reserved.</span>
            </div>
            <div style={{ display: 'flex', gap: '26px' }}>
              <a href="#" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Privacy</a>
              <a href="#" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Terms</a>
              <a href="mailto:hello@farm.coach" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
