'use client'

import Link from 'next/link'
import TrainerDirectory from '@/components/search/TrainerDirectory'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

export default function SearchPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#F8F8F6', color: '#1A1A1A',
      fontFamily: hanken, WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(248,248,246,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{
          maxWidth: '1240px', margin: '0 auto', padding: '0 24px', height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            fontFamily: barlow, fontWeight: 800, fontSize: '22px',
            letterSpacing: '.04em', color: '#00BCC8', textDecoration: 'none',
          }}>
            FARM
          </Link>
          <Link
            href="/login"
            style={{
              fontFamily: barlow, fontWeight: 700, fontSize: '13px',
              letterSpacing: '.1em', textTransform: 'uppercase',
              padding: '8px 18px', border: '1.5px solid #00BCC8',
              color: '#00BCC8', textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#00BCC8'; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#00BCC8' }}
          >
            I&apos;m a trainer
          </Link>
        </div>
      </nav>

      <TrainerDirectory />
    </div>
  )
}
