'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Why FARM', href: '#why-farm' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-farm-bg border-b border-farm-border shadow-sm' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 no-underline shrink-0">
          <span className="w-8 h-8 bg-farm-cyan inline-flex items-center justify-center text-farm-on-cyan font-heading font-extrabold text-lg">F</span>
          <span className={`font-heading font-extrabold text-xl tracking-wider uppercase transition-colors ${scrolled ? 'text-farm-ink' : 'text-white'}`}>FARM</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`no-underline font-body text-[15px] font-medium transition-colors ${scrolled ? 'text-farm-ink2 hover:text-farm-ink' : 'text-white/85 hover:text-white'}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className={`no-underline font-body text-sm font-semibold transition-colors ${scrolled ? 'text-farm-ink2 hover:text-farm-ink' : 'text-white/85 hover:text-white'}`}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="no-underline rounded-full bg-farm-cyan text-farm-on-cyan font-heading font-extrabold text-[13px] tracking-[.08em] uppercase px-6 py-2.5 hover:brightness-95 transition"
          >
            Sign Up
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 bg-transparent border-none cursor-pointer"
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <rect y="0" width="22" height="2" rx="1" fill={scrolled ? '#111827' : '#fff'} />
            <rect y="7" width="22" height="2" rx="1" fill={scrolled ? '#111827' : '#fff'} />
            <rect y="14" width="22" height="2" rx="1" fill={scrolled ? '#111827' : '#fff'} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-farm-bg border-b border-farm-border px-6 pb-6 flex flex-col">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="no-underline font-body text-farm-ink2 text-base font-medium py-3.5 border-b border-black/[0.06]"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="no-underline text-center text-farm-ink font-heading font-bold text-[13px] tracking-[.08em] uppercase border border-farm-border rounded-lg py-3.5 mt-4"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className="no-underline text-center bg-farm-cyan text-farm-on-cyan font-heading font-extrabold text-[13px] tracking-[.08em] uppercase rounded-lg py-3.5 mt-2.5"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  )
}
