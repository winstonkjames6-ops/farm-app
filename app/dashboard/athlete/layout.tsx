'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_ATHLETE = {
  name: 'Liam Chen',
  initials: 'LC',
  sport: 'Soccer',
  parentName: 'Sarah Chen',
}

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  cyanDim: 'rgba(0,188,200,0.06)',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  glass: 'rgba(0,0,0,0.04)',
  border: 'rgba(0,0,0,0.08)',
  card: '#FFFFFF',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const IconHome = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconUser = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconCalendar = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ── Nav items ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'home',     label: 'Home',     Icon: IconHome,      badge: false },
  { key: 'sessions', label: 'Sessions', Icon: IconCalendar,  badge: false },
  { key: 'messages', label: 'Messages', Icon: MessageSquare, badge: true  },
  { key: 'profile',  label: 'Profile',  Icon: IconUser,      badge: false },
]

const NAV_HREFS: Record<string, string> = {
  home:     '/dashboard/athlete',
  sessions: '/dashboard/athlete/sessions',
  messages: '/dashboard/athlete/messages',
  profile:  '/dashboard/athlete/profile',
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({
  active,
  sidebarOpen,
  onToggle,
}: {
  active: string
  sidebarOpen: boolean
  onToggle: () => void
}) {
  return (
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
        <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: '6px', background: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: '#FFFFFF', lineHeight: 1 }}>F</span>
          </div>
          {sidebarOpen && (
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', color: T.cyan, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              FARM
            </span>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '8px', flexShrink: 0 }} />

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', flexShrink: 0 }}>
          {NAV_ITEMS.map(({ key, label, Icon, badge }) => {
            const isActive = key === active
            const navStyle: React.CSSProperties = {
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: sidebarOpen ? '12px' : '0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: sidebarOpen ? '14px 24px' : '14px 0',
              borderRadius: '10px',
              background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent',
              color: isActive ? T.cyan : T.ink2,
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
                href={NAV_HREFS[key]}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = '#F3F4F6' }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                style={navStyle}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 20 }}>
                  <Icon size={20} />
                </span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {badge && (
                  <span style={{ position: 'absolute', top: '10px', right: '20px', width: '8px', height: '8px', borderRadius: '50%', background: '#00BCC8', flexShrink: 0 }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Next session section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ height: '1px', background: '#E5E7EB', margin: '16px 0', flexShrink: 0 }} />
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '11px', letterSpacing: '0.08em', color: T.ink3, textTransform: 'uppercase', padding: '0 24px', marginBottom: '12px' }}>
                Next Session
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', color: T.cyan }}>
                <IconCalendar size={16} />
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: '#374151' }}>
                  Mon, Jun 30 · 9:00 AM
                </span>
              </div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, padding: '0 24px' }}>
                with Marcus Rivera
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', color: T.cyan }}>
              <IconCalendar size={16} />
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

        {/* Athlete info */}
        <div style={{ padding: '16px 12px 24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: sidebarOpen ? 'flex-start' : 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: '999px', background: T.cyanLight, border: `2px solid ${T.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.cyan, flexShrink: 0 }}>
            {MOCK_ATHLETE.initials}
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: T.ink, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{MOCK_ATHLETE.name}</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, whiteSpace: 'nowrap' }}>Athlete</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '11px', color: T.ink3, whiteSpace: 'nowrap', marginTop: '2px' }}>Parent: {MOCK_ATHLETE.parentName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Protruding toggle tab */}
      <button
        onClick={onToggle}
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
  )
}

// ── Desktop header ─────────────────────────────────────────────────────────────

function DesktopHeader({ sidebarOpen }: { sidebarOpen: boolean }) {
  return (
    <motion.header
      animate={{ left: sidebarOpen ? 240 : 72, width: `calc(100% - ${sidebarOpen ? 240 : 72}px)` }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{ position: 'fixed', top: 0, right: 0, height: '52px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 40 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: T.ink3, display: 'flex', alignItems: 'center' }}>
          <IconHome size={16} />
        </span>
        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: '#374151', fontWeight: 500 }}>
          Athlete Dashboard
        </span>
      </div>
      <button style={{ background: 'transparent', border: 'none', color: T.ink2, cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconBell />
      </button>
    </motion.header>
  )
}

// ── Mobile header with dropdown ────────────────────────────────────────────────

function MobileHeader({ activeNav }: { activeNav: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 50 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', color: T.cyan, letterSpacing: '0.12em', textTransform: 'uppercase' }}>FARM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '13px', color: '#FFFFFF', letterSpacing: '0.04em' }}>
            {MOCK_ATHLETE.initials}
          </div>
          <button onClick={() => setIsOpen((o) => !o)} style={{ background: 'transparent', border: 'none', color: '#374151', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', top: '52px', left: 0, right: 0, background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '12px', zIndex: 45 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {NAV_ITEMS.map(({ key, label, Icon }) => {
                const isActive = key === activeNav
                const mobileStyle: React.CSSProperties = {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(0,188,200,0.2)' : 'rgba(0,0,0,0.08)'}`,
                  color: isActive ? T.cyan : T.ink2,
                  cursor: 'pointer',
                  minHeight: '80px',
                  textDecoration: 'none',
                }
                return (
                  <Link
                    key={key}
                    href={NAV_HREFS[key]}
                    onClick={() => setIsOpen(false)}
                    style={mobileStyle}
                  >
                    <Icon size={22} />
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 500 }}>
                      {label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function AthleteLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const sidebarWidth = isMobile ? 0 : sidebarOpen ? 240 : 72

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const getActiveNav = () => {
    if (pathname === '/dashboard/athlete') return 'home'
    if (pathname.startsWith('/dashboard/athlete/sessions')) return 'sessions'
    if (pathname.startsWith('/dashboard/athlete/messages')) return 'messages'
    if (pathname.startsWith('/dashboard/athlete/profile')) return 'profile'
    return 'home'
  }
  const activeNav = getActiveNav()

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url('/backgrounds/parent.jpg')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(248,248,246,0.60)', pointerEvents: 'none',
      }} />
      {isMobile ? (
        <MobileHeader activeNav={activeNav} />
      ) : (
        <>
          <Sidebar
            active={activeNav}
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((o) => !o)}
          />
          <DesktopHeader sidebarOpen={sidebarOpen} />
        </>
      )}
      <main
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: '52px',
          paddingBottom: '40px',
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: 'margin-left 0.25s ease-in-out',
        }}
      >
        {children}
      </main>
    </div>
  )
}
