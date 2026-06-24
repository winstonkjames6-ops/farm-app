'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const ACCENT = '#00BCC8'

export default function ConsentPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#09090B', color: '#fff',
      fontFamily: "'Hanken Grotesk', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '8px', background: '#22C55E',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '16px', color: '#000',
          }}>F</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '.02em' }}>FARM</span>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          style={{
            width: '100%', maxWidth: '480px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '18px', padding: '40px 36px',
          }}
        >
          {/* Icon */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(0,188,200,0.08)', border: '1px solid rgba(0,188,200,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase',
              color: ACCENT, margin: '0 0 10px',
            }}>Session recording</p>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: '26px', letterSpacing: '.04em', textTransform: 'uppercase',
              color: '#fff', margin: '0 0 10px', lineHeight: 1.1,
            }}>
              Recording Consent
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>
              Before your remote session begins, please review how recordings are handled.
            </p>
          </div>

          {/* Points */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '16px',
            padding: '24px', marginBottom: '28px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
          }}>
            {[
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                ),
                text: 'Sessions may be recorded for safety and quality assurance purposes.',
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                text: 'Recordings are stored securely and are only accessible to FARM Trust & Safety staff.',
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
                  </svg>
                ),
                text: 'Either party may request deletion of their recording at any time via support.',
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ),
                text: 'Recordings are never shared with third parties or used for marketing.',
              },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                  background: 'rgba(0,188,200,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/booking"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '13px', borderRadius: '11px', textDecoration: 'none',
                background: ACCENT, color: '#000', border: 'none',
                fontSize: '13px', fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.1em', textTransform: 'uppercase',
                boxSizing: 'border-box',
                transition: 'filter .15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.92)' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
            >
              I agree
            </Link>
            <Link
              href="/booking"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '13px', borderRadius: '11px', textDecoration: 'none',
                background: 'transparent', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.18)',
                fontSize: '13px', fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.1em', textTransform: 'uppercase',
                boxSizing: 'border-box',
                transition: 'border-color .15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.38)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            >
              Decline
            </Link>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: '16px 0 0', lineHeight: 1.5 }}>
            By clicking &ldquo;I agree&rdquo; you consent to the recording policy above for this session only.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
