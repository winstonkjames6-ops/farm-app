'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShieldCheck, Award, Flag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { T } from '@/lib/theme'

// Distinct from the parent dashboard's teal so it's unmistakable which mode is active.
const ADMIN_ACCENT = '#7C3AED'

const NAV_ITEMS = [
  { key: 'certifications', label: 'Certifications', href: '/dashboard/admin/certifications', Icon: Award },
  { key: 'reports', label: 'Reports', href: '/dashboard/admin/reports', Icon: Flag },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const activeKey = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.key ?? null

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <motion.div
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, overflow: 'visible' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Wordmark */}
          <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: '#FFFFFF', lineHeight: 1 }}>F</span>
            </div>
            {sidebarOpen && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', color: T.cyan, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                FARM
              </span>
            )}
          </div>

          {/* Admin badge */}
          <div style={{ padding: sidebarOpen ? '0 24px 16px' : '0 0 16px', display: 'flex', justifyContent: sidebarOpen ? 'flex-start' : 'center', flexShrink: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(124,58,237,0.1)', border: `1px solid ${ADMIN_ACCENT}4D`,
              color: ADMIN_ACCENT, borderRadius: '999px',
              padding: sidebarOpen ? '4px 12px' : '6px',
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <ShieldCheck size={14} />
              {sidebarOpen && 'Admin'}
            </span>
          </div>

          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '8px', flexShrink: 0 }} />

          {/* Nav items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', flexShrink: 0 }}>
            {NAV_ITEMS.map(({ key, label, href, Icon }) => {
              const isActive = key === activeKey
              const navStyle: React.CSSProperties = {
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: sidebarOpen ? '12px' : '0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                padding: sidebarOpen ? '14px 24px' : '14px 0',
                borderRadius: '10px',
                background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                color: isActive ? ADMIN_ACCENT : T.ink2,
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                width: '100%',
                minHeight: '44px',
                transition: 'background 0.15s',
                flexShrink: 0,
                textDecoration: 'none',
              }
              return (
                <Link
                  key={key}
                  href={href}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = '#F3F4F6' }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                  style={navStyle}
                >
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 20 }}>
                    <Icon size={20} />
                  </span>
                  {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                </Link>
              )
            })}
          </nav>

          <div style={{ flex: 1 }} />

          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

          {/* Back to my dashboard */}
          <div style={{ padding: '12px', flexShrink: 0 }}>
            <Link
              href="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: sidebarOpen ? '10px' : '0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                padding: sidebarOpen ? '10px 12px' : '10px 0',
                borderRadius: '8px',
                color: T.ink2,
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#F3F4F6' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              <ArrowLeft size={16} />
              {sidebarOpen && 'Back to my dashboard'}
            </Link>
          </div>
        </div>

        {/* Protruding toggle tab — same mechanics as the parent dashboard sidebar */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          onMouseEnter={(e) => {
            const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg')
            if (icon) icon.style.color = '#374151'
          }}
          onMouseLeave={(e) => {
            const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg')
            if (icon) icon.style.color = T.ink3
          }}
          style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '48px', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderLeft: 'none', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 0 8px rgba(0,0,0,0.06)', padding: 0 }}
        >
          {sidebarOpen ? <ChevronLeft size={14} color={T.ink3} /> : <ChevronRight size={14} color={T.ink3} />}
        </button>
      </motion.div>

      <main
        style={{
          marginLeft: sidebarOpen ? 240 : 72,
          transition: 'margin-left 0.25s ease-in-out',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  )
}
