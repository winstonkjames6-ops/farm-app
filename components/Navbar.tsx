'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '#why-farm', label: 'Why FARM' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold" onClick={() => setIsOpen(false)}>
            <span className="text-orange-primary">FARM</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-8 items-center">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-text-secondary hover:text-orange-primary transition"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex gap-4">
            <Link href="/auth/signup?type=parent" className="btn-secondary text-sm">
              I&apos;m looking for a trainer
            </Link>
            <Link href="/trainer-dashboard" className="btn-primary text-sm">
              I&apos;m a trainer
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setIsOpen((o) => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00BCC8' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
              {isOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.60)',
                zIndex: 98,
              }}
            />

            {/* Slide-in panel from right */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(320px, 88vw)',
                background: '#09090B',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                zIndex: 99,
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  height: '64px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: '22px',
                    letterSpacing: '0.04em',
                    color: '#00BCC8',
                  }}
                >
                  FARM
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.50)',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <div
                style={{
                  flex: 1,
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  overflowY: 'auto',
                }}
              >
                {NAV_LINKS.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: 'block',
                        padding: '14px 0',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        fontSize: '22px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.70)',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px' }}
                >
                  <Link
                    href="/auth/signup?type=parent"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FAFAFA',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      textAlign: 'center',
                    }}
                  >
                    Looking for a trainer
                  </Link>
                  <Link
                    href="/trainer-dashboard"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      background: '#00BCC8',
                      borderRadius: '8px',
                      color: '#09090B',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: '14px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      textAlign: 'center',
                    }}
                  >
                    I&apos;m a trainer
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
