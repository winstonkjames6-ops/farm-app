'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null)
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
        box.style.boxShadow = '0 0 0 3px rgba(0, 188, 200, 0.30)'
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
          '--bg': '#09090B',
          '--surface': '#111113',
          '--surface-2': '#18181B',
          '--ink': '#FAFAFA',
          '--ink-2': '#A1A1AA',
          '--ink-3': '#71717A',
          '--line': 'rgba(255,255,255,0.08)',
          '--accent': '#00BCC8',
          '--accent-ink': '#09090B',
          '--radius': '12px',
          '--section-pad': '120px',
          '--photo-display': 'flex',
          '--social-display': 'flex',
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
            maxWidth: '1240px', margin: '0 auto', padding: '0 clamp(16px,4vw,32px)', height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
          }}>
            <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
              <span style={{
                width: '32px', height: '32px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-ink)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '18px',
              }}>F</span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px',
                letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink)',
              }}>FARM</span>
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{ display: isMobile ? 'flex' : 'none', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: 'auto' }}
            >
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <rect y="0" width="22" height="2" rx="1" fill="white"/>
                <rect y="7" width="22" height="2" rx="1" fill="white"/>
                <rect y="14" width="22" height="2" rx="1" fill="white"/>
              </svg>
            </button>
            <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '32px' }}>
              <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>How it works</a>
              <a href="#booking" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>Booking</a>
              <a href="#why-farm" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>Why FARM</a>
              <a href="#faq" style={{ textDecoration: 'none', color: 'var(--ink-2)', fontSize: '15px', fontWeight: 500 }}>FAQ</a>
            </div>
            <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                color: 'var(--ink)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase',
                padding: '10px 16px', border: '1px solid var(--line)', borderRadius: '8px',
              }}>Find a trainer</Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                color: 'var(--accent-ink)', background: 'var(--accent)',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase',
                padding: '11px 18px', transition: 'filter .15s ease', borderRadius: '8px',
              }}>I&apos;m a trainer</Link>
            </div>
          </div>
          {isMobile && menuOpen && (
            <div style={{
              position: 'absolute', top: '72px', left: 0, right: 0, zIndex: 49,
              background: 'var(--bg)', borderBottom: '1px solid var(--line)',
              padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 0,
            } as React.CSSProperties}>
              {[['How it works','#how-it-works'],['Booking','#booking'],['Why FARM','#why-farm'],['FAQ','#faq']].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                  display: 'block', padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--ink-2)', fontSize: '16px', fontWeight: 500, textDecoration: 'none',
                }}>{label}</a>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                display: 'block', width: '100%', padding: '13px', marginTop: '12px',
                border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)',
                textAlign: 'center', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase',
              }}>Find a trainer</Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                display: 'block', width: '100%', padding: '13px', marginTop: '8px',
                background: 'var(--accent)', borderRadius: '8px', color: 'var(--accent-ink)',
                textAlign: 'center', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase',
              }}>I&apos;m a trainer</Link>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section id="top" style={{
          position: 'relative', width: '100%', minHeight: 'clamp(560px,76vh,780px)',
          display: 'flex', alignItems: 'center', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, backgroundImage: "url('/hero-athlete.png')",
            backgroundSize: 'cover', backgroundPosition: 'left center', zIndex: 0,
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(90deg, rgba(9,9,11,0) 0%, rgba(9,9,11,0.25) 38%, rgba(9,9,11,0.88) 62%, rgba(9,9,11,0.97) 100%)',
          }} />
          <div style={{
            position: 'relative', zIndex: 2, maxWidth: '1240px', width: '100%',
            margin: '0 auto', padding: 'clamp(48px,7vw,88px) 32px',
          }}>
            <div style={{ maxWidth: '640px', marginLeft: 'auto' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '9px', color: '#fff',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase',
                padding: '8px 15px',
                border: '1px solid rgba(255,255,255,.22)', background: 'rgba(255,255,255,.06)',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                marginBottom: '26px', animation: 'fadeIn .6s ease both .1s',
              } as React.CSSProperties}>
                <span style={{ width: '6px', height: '6px', background: 'var(--accent)' }} />
                1-on-1 youth sports coaching
              </span>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                fontSize: 'clamp(44px,7vw,82px)', lineHeight: 0.95,
                letterSpacing: '.01em', textTransform: 'uppercase',
                margin: '0 0 20px', color: '#fff', animation: 'fadeUp .55s cubic-bezier(.2,.7,.2,1) both .05s',
                textWrap: 'balance',
              } as React.CSSProperties}>
                Find your kid&apos;s next great{' '}
                <span id="sport-cycle" style={{ color: 'var(--accent)', display: 'inline-block', transition: 'opacity .3s ease' }}>
                  tennis
                </span>{' '}coach.
              </h1>
              <p style={{
                fontFamily: "'Hanken Grotesk', sans-serif", color: 'rgba(255,255,255,.82)',
                fontSize: 'clamp(16px,1.6vw,19px)', fontWeight: 400, lineHeight: 1.55,
                margin: '0 0 32px', maxWidth: '520px', animation: 'fadeUp .55s cubic-bezier(.2,.7,.2,1) both .3s',
                textWrap: 'pretty',
              } as React.CSSProperties}>
                On-demand training with vetted coaches. 85% straight to your coach.
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); router.push('/search') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#18181B', border: '1px solid var(--line)',
                  padding: '6px 6px 6px 18px', maxWidth: '480px',
                  boxShadow: '0 18px 44px rgba(0,0,0,.50)',
                  transition: 'box-shadow .2s ease,border-color .2s ease',
                  animation: 'fadeUp .55s cubic-bezier(.2,.7,.2,1) both .5s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.8} strokeLinecap="round" style={{ flex: 'none' }}>
                  <circle cx="10.5" cy="10.5" r="6.5" /><line x1="20" y1="20" x2="15.5" y2="15.5" />
                </svg>
                <input
                  ref={searchRef}
                  id="hero-search" type="text" placeholder="Enter your sport or ZIP code"
                  style={{
                    flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--ink)', fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '15px', fontWeight: 500,
                  }}
                />
                <button type="submit" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase',
                  padding: '12px 22px', whiteSpace: 'nowrap',
                  cursor: 'pointer', transition: 'filter .15s ease',
                }}>Search</button>
              </form>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px',
                marginTop: '24px', animation: 'fadeUp .55s cubic-bezier(.2,.7,.2,1) both .6s',
              }}>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'var(--accent)', color: 'var(--accent-ink)',
                  padding: '14px 28px', borderRadius: '8px',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase',
                  textDecoration: 'none', transition: 'filter .15s ease',
                }}>Find a Trainer</Link>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'transparent', color: '#FAFAFA',
                  border: '1px solid rgba(255,255,255,.35)',
                  padding: '13px 26px', borderRadius: '8px',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase',
                  textDecoration: 'none', transition: 'border-color .15s ease',
                }}>Apply as a Trainer</Link>
              </div>

              <div style={{
                display: 'var(--social-display)', alignItems: 'center', gap: '14px',
                marginTop: '30px', animation: 'fadeIn .6s ease both .7s',
              } as React.CSSProperties}>
                <div style={{ display: 'flex' }}>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={{
                      width: '36px', height: '36px',
                      border: '2px solid rgba(255,255,255,.60)',
                      marginLeft: i === 0 ? 0 : '-10px',
                      background: 'repeating-linear-gradient(135deg,#27272A,#27272A 5px,#18181B 5px,#18181B 10px)',
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,.80)', fontWeight: 500 }}>
                  Joined by <span style={{ color: '#fff', fontWeight: 700 }}>30+</span> families &amp; coaches
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section style={{ background: '#111113', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            maxWidth: '1240px', margin: '0 auto', padding: 'clamp(24px,4vw,36px) clamp(16px,4vw,32px)',
            display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,5vw,72px)',
            alignItems: 'center', justifyContent: 'flex-start',
          }}>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span data-count="85" data-suffix="%" data-count-delay="0" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,6vw,46px)', lineHeight: 1, color: '#00BCC8' }}>85%</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00BCC8" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="6" /><polyline points="6 11 12 5 18 11" />
                </svg>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-3)', fontWeight: 500, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '.1em', textTransform: 'uppercase' }}>goes to your coach</div>
            </div>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span data-count="4.9" data-decimals="1" data-count-delay="120" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,6vw,46px)', lineHeight: 1, color: '#00BCC8' }}>4.9</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00BCC8" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="6" /><polyline points="6 11 12 5 18 11" />
                </svg>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-3)', fontWeight: 500, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '.1em', textTransform: 'uppercase' }}>average coach rating</div>
            </div>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span data-count="320" data-suffix="+" data-count-delay="240" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,6vw,46px)', lineHeight: 1, color: '#00BCC8' }}>320+</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00BCC8" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="6" /><polyline points="6 11 12 5 18 11" />
                </svg>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-3)', fontWeight: 500, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '.1em', textTransform: 'uppercase' }}>sessions booked</div>
            </div>
            <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,6vw,46px)', lineHeight: 1, color: '#00BCC8' }}>&lt;</span>
                <span data-count="2" data-suffix=" min" data-count-delay="360" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,6vw,46px)', lineHeight: 1, color: '#00BCC8' }}>2 min</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-3)', fontWeight: 500, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '.1em', textTransform: 'uppercase' }}>to book a session</div>
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
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>How it works</span>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4.5vw,56px)', lineHeight: 0.95, letterSpacing: '.02em', textTransform: 'uppercase', margin: '0 0 14px', color: 'var(--ink)' }}>
                Booking a trainer takes four steps
              </h2>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(16px,1.8vw,18px)', color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: '540px', margin: '0 auto' }}>
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
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '28px 26px', transition: 'border-color .18s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                    <span style={{
                      width: '48px', height: '48px',
                      background: 'rgba(0,188,200,0.10)',
                      color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '10px',
                    }}>{icon}</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '30px', color: 'rgba(255,255,255,0.12)' }}>{num}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '20px', letterSpacing: '.04em', textTransform: 'uppercase', margin: '0 0 8px', color: 'var(--ink)' }}>{title}</h3>
                  <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", color: 'var(--ink-2)', fontSize: '15px', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/parent-signup" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none',
                padding: '15px 30px',
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800,
                fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase',
                textDecoration: 'none', cursor: 'pointer', transition: 'filter .15s ease',
              }}>Browse trainers now</Link>
            </div>
          </div>
        </section>

        {/* ── BOOKING ── */}
        <section id="booking" style={{ padding: 'var(--section-pad) 0', background: 'var(--bg)' }}>
          <div style={{
            maxWidth: '1180px', margin: '0 auto', padding: '0 24px',
            display: 'grid', gridTemplateColumns: '0.92fr 1.08fr',
            gap: 'clamp(36px,5vw,64px)', alignItems: 'center',
          }}>
            <div data-reveal="left">
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Booking</span>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4.5vw,56px)', lineHeight: 0.95, letterSpacing: '.02em', textTransform: 'uppercase', margin: '0 0 16px', color: 'var(--ink)' }}>
                Lock in a session in under two minutes
              </h2>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(16px,1.8vw,18px)', color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 26px', maxWidth: '440px' }}>
                Pick a coach, choose a day and time slot, and confirm. Real-time availability — what you see is what you book.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['Transparent pricing, no platform fees for parents', 'Free cancellation up to 24 hours before', 'In-person or remote — your choice'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '22px', height: '22px',
                      background: 'rgba(0,188,200,0.12)',
                      color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 13 9 18 20 6" />
                      </svg>
                    </span>
                    <span style={{ color: 'var(--ink-2)', fontSize: '15px', fontFamily: "'Hanken Grotesk',sans-serif" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal="right" style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: 'clamp(20px,2.4vw,28px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                <span style={{
                  width: '56px', height: '56px', flex: 'none',
                  background: 'repeating-linear-gradient(135deg,var(--surface-2),var(--surface-2) 6px,var(--bg) 6px,var(--bg) 12px)',
                  border: '1px solid var(--line)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink)' }}>Coach — Tennis</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '13px', color: 'var(--ink-3)', fontFamily: "'Hanken Grotesk',sans-serif" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#00BCC8" stroke="none">
                      <polygon points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1" />
                    </svg>
                    <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>4.9</span> · 48 reviews · In-person
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '24px', color: 'var(--ink)' }}>$55</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: "'Hanken Grotesk',sans-serif" }}>per hour</div>
                </div>
              </div>
              <div style={{ padding: '20px 0 6px' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '12px' }}>Select a date</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
                  {[{ d: 'FRI', n: '7', a: false }, { d: 'SAT', n: '8', a: true }, { d: 'SUN', n: '9', a: false }, { d: 'MON', n: '10', a: false }, { d: 'TUE', n: '11', a: false }].map(({ d, n, a }) => (
                    <div key={d} style={{
                      textAlign: 'center', padding: '12px 0',
                      background: a ? 'var(--accent)' : 'var(--surface-2)',
                      border: a ? '1px solid var(--accent)' : '1px solid var(--line)',
                    }}>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '11px', letterSpacing: '.1em', color: a ? 'rgba(9,9,11,.70)' : 'var(--ink-3)', fontWeight: 700 }}>{d}</div>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '20px', color: a ? 'var(--accent-ink)' : 'var(--ink)', marginTop: '2px' }}>{n}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '18px 0 22px' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '12px' }}>Time slot</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['2:00 PM', '4:00 PM', '5:30 PM', '7:00 PM'].map((t, i) => (
                    <span key={t} style={{
                      padding: '9px 14px', fontSize: '13px', fontWeight: 700,
                      fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '.06em', textTransform: 'uppercase',
                      background: i === 1 ? 'var(--accent)' : 'var(--surface-2)',
                      border: i === 1 ? '1px solid var(--accent)' : '1px solid var(--line)',
                      color: i === 1 ? 'var(--accent-ink)' : 'var(--ink-2)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Total</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '28px', color: 'var(--ink)' }}>$55.00</div>
                </div>
                <Link href="/parent-signup" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'var(--accent)', color: 'var(--accent-ink)', textDecoration: 'none',
                  fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800,
                  fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase',
                  padding: '14px 28px', transition: 'filter .15s ease',
                }}>Book session</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY FARM ── */}
        <section id="why-farm" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', padding: 'var(--section-pad) 0' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>
            <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 'clamp(44px,6vw,64px)' }}>
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Why FARM</span>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4.5vw,56px)', lineHeight: 0.95, letterSpacing: '.02em', textTransform: 'uppercase', margin: '0 0 14px', color: 'var(--ink)' }}>
                Built for parents and coaches who want simplicity
              </h2>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(16px,1.8vw,18px)', color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: '540px', margin: '0 auto' }}>
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
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '30px 28px', transition: 'border-color .18s ease',
                }}>
                  <div style={{ width: '28px', height: '3px', background: 'var(--accent)', marginBottom: '20px' }} />
                  <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '20px', letterSpacing: '.04em', textTransform: 'uppercase', margin: '0 0 9px', color: 'var(--ink)' }}>{title}</h3>
                  <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", color: 'var(--ink-2)', fontSize: '15px', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)', padding: 'var(--section-pad) 0' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>
            <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,56px)' }}>
              <span style={{ display: 'inline-block', color: 'var(--accent)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>FAQ</span>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4.5vw,56px)', lineHeight: 0.95, letterSpacing: '.02em', textTransform: 'uppercase', margin: 0, color: 'var(--ink)' }}>
                Frequently asked questions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { q: 'How much does a session cost?', a: 'Trainers set their own rates — $40–$80 an hour is typical. You see the full price before booking. No hidden fees.', open: true },
                { q: 'Can I book in-person or remote?', a: 'Both. Trainers list availability for in-person (location-based) and remote (video call) sessions.' },
                { q: 'Do I need a contract?', a: 'No. Book one session at a time and cancel anytime. Want five sessions? Book them individually.' },
                { q: 'How do I know if a coach is good?', a: 'Every parent rates their session 1–5 stars. You see the average rating, number of reviews and trainer credentials before booking.' },
                { q: 'What if I need to cancel?', a: 'Cancel up to 24 hours before a session for a full refund. Within 24 hours, the session fee applies.' },
                { q: 'How do trainers get paid?', a: 'Trainers receive 85% of each session price via Stripe, with payouts every week.' },
              ].map(({ q, a, open }) => (
                <details key={q} open={open} style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '4px 24px', borderRadius: '8px', overflow: 'hidden' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', cursor: 'pointer', padding: '20px 0', listStyle: 'none' }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink)' }}>{q}</span>
                    <span className="faq-ind" style={{ color: 'var(--accent)', fontSize: '22px', lineHeight: 1, fontWeight: 300, transition: 'transform .2s ease', flexShrink: 0 }}>+</span>
                  </summary>
                  <p className="faq-ans" style={{ fontFamily: "'Hanken Grotesk',sans-serif", color: 'var(--ink-2)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 20px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>{a}</p>
                </details>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '44px' }}>
              <p style={{ color: 'var(--ink-3)', margin: '0 0 8px', fontSize: '15px', fontFamily: "'Hanken Grotesk',sans-serif" }}>Still have questions?</p>
              <a href="mailto:hello@farm.coach" style={{ color: 'var(--accent)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '15px', letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Email us at hello@farm.coach
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ position: 'relative', overflow: 'hidden', background: '#111113', borderTop: '1px solid rgba(255,255,255,0.08)', padding: 'var(--section-pad) 0' }}>
          <div style={{
            position: 'absolute', top: '-160px', right: '-120px', width: '560px', height: '560px',
            background: 'radial-gradient(circle,#00BCC8,transparent 60%)', opacity: 0.14, pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '880px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800,
              fontSize: 'clamp(36px,5.5vw,68px)',
              lineHeight: 0.95, letterSpacing: '.02em', textTransform: 'uppercase',
              margin: '0 0 18px', color: 'var(--ink)',
              textWrap: 'balance',
            } as React.CSSProperties}>
              Ready to get started?
            </h2>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 'clamp(16px,1.8vw,18px)', color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 auto 36px', maxWidth: '520px' }}>
              Join 30+ parents and trainers building the future of youth sports training.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
              <Link href="/parent-signup" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none',
                padding: '15px 30px',
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800,
                fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase',
                textDecoration: 'none', cursor: 'pointer', transition: 'filter .15s ease',
              }}>Find a trainer</Link>
              <Link href="/trainer-signup" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'transparent', color: 'var(--ink)',
                border: '1px solid rgba(255,255,255,.22)',
                padding: '14px 28px',
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase',
                textDecoration: 'none', cursor: 'pointer', transition: 'border-color .15s ease',
              }}>Start coaching</Link>
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
                width: '26px', height: '26px', background: 'var(--accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-ink)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '15px',
              }}>F</span>
              <span style={{ fontSize: '13px', color: 'var(--ink-3)', fontFamily: "'Hanken Grotesk',sans-serif" }}>© 2026 FARM. All rights reserved.</span>
            </div>
            <div style={{ display: 'flex', gap: '26px' }}>
              <a href="#" style={{ color: 'var(--ink-3)', textDecoration: 'none', fontSize: '13px', fontFamily: "'Hanken Grotesk',sans-serif" }}>Privacy</a>
              <a href="#" style={{ color: 'var(--ink-3)', textDecoration: 'none', fontSize: '13px', fontFamily: "'Hanken Grotesk',sans-serif" }}>Terms</a>
              <a href="mailto:hello@farm.coach" style={{ color: 'var(--ink-3)', textDecoration: 'none', fontSize: '13px', fontFamily: "'Hanken Grotesk',sans-serif" }}>Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
