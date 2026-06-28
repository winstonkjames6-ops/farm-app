'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Eye,
  Camera,
  MapPin,
  Phone,
  Video,
  Plus,
  Trash2,
  Award,
  Check,
  X as XIcon,
  CheckCircle,
  Circle,
  Star,
  Music,
  PlayCircle,
} from 'lucide-react'

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="#E1306C" stroke="none" />
  </svg>
)

const IconTwitterX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 4l16 16M20 4L4 20" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const IconYoutube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="3" fill="#FF0000" />
    <polygon points="10,8.5 10,15.5 16,12" fill="#FFFFFF" />
  </svg>
)

// ── Mock data ──────────────────────────────────────────────────────────────────

type Certification = { id: number; name: string; org: string; year: string }
type Affiliation = { id: number; name: string; role: string; years: string }

const INITIAL_CERTS: Certification[] = [
  { id: 1, name: 'UEFA B License', org: 'UEFA', year: '2019' },
  { id: 2, name: 'Youth Soccer Coach', org: 'US Soccer Federation', year: '2021' },
]

const INITIAL_AFFS: Affiliation[] = [
  { id: 1, name: 'Green Valley FC', role: 'Head Coach', years: '2018–present' },
  { id: 2, name: 'Riverside Academy', role: 'Skills Trainer', years: '2020–2022' },
]

const MOCK_REVIEWS = [
  {
    id: 1, initials: 'SM', parentName: 'Sarah M.', date: 'Jun 12, 2026', rating: 5,
    text: "Marcus is incredible with our 11-year-old. His patience and technical expertise have transformed her game in just 8 weeks. She went from struggling with basic passes to confidently executing combination plays. Highly recommend for any youth soccer player serious about improving.",
  },
  {
    id: 2, initials: 'DK', parentName: 'David K.', date: 'May 28, 2026', rating: 5,
    text: "Best investment we've made for our son's soccer development. Marcus creates a structured yet fun environment that keeps kids engaged. He communicates clearly with both parents and players about goals and progress. Our son looks forward to every session.",
  },
  {
    id: 3, initials: 'JR', parentName: 'Jennifer R.', date: 'May 10, 2026', rating: 4,
    text: "Great trainer who clearly knows the game. Marcus tailored drills specifically to our daughter's weak points — her first touch and shooting accuracy. She's made real strides. The only thing I'd suggest is slightly more communication after sessions about what was covered.",
  },
]

const PROFILE_ITEMS = [
  { key: 'photo',         label: 'Profile photo',                boost: '+10%', sectionId: 'section-photo',         completed: true  },
  { key: 'bio',           label: 'Bio',                          boost: '+15%', sectionId: 'section-basic-info',     completed: true  },
  { key: 'specialties',   label: 'Specialties set',              boost: '+10%', sectionId: 'section-specialties',    completed: true  },
  { key: 'availability',  label: 'Availability set',             boost: '+20%', sectionId: 'section-availability',   completed: true  },
  { key: 'rate',          label: 'Rate set',                     boost: '+10%', sectionId: 'section-rate',           completed: true  },
  { key: 'certification', label: 'At least 1 certification',     boost: '+10%', sectionId: 'section-credentials',    completed: true  },
  { key: 'video',         label: 'Intro video added',            boost: '+10%', sectionId: 'section-intro-video',    completed: false },
  { key: 'social',        label: 'Social link added',            boost: '+5%',  sectionId: 'section-social',         completed: true  },
  { key: 'notifications', label: 'Notification preferences set', boost: '+5%',  sectionId: 'section-notifications',  completed: false },
  { key: 'location',      label: 'Location set',                 boost: '+5%',  sectionId: 'section-basic-info',     completed: true  },
]

const NOTIF_ROWS = [
  { key: 'newBooking',       name: 'New booking',        description: 'When a parent books a session with you' },
  { key: 'bookingCancelled', name: 'Booking cancelled',  description: 'When a parent cancels a session' },
  { key: 'newMessage',       name: 'New message',        description: 'When a parent sends you a message' },
  { key: 'sessionReminder',  name: 'Session reminder',   description: '2 hours before each session' },
  { key: 'payoutSent',       name: 'Payout sent',        description: 'When your weekly payout is processed' },
  { key: 'newReview',        name: 'New review',         description: 'When a parent leaves a review' },
]

// ── Constants ──────────────────────────────────────────────────────────────────

const SPORTS = ['Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Lacrosse', 'Baseball', 'Swimming', 'Track']
const AGE_GROUPS = ['U6-U8', 'U9-U10', 'U11-U12', 'U13-U14', 'U15-U16', 'U17-U18', 'Adults']
const DURATIONS = ['30 min', '60 min', '90 min']
const NOTICE_OPTIONS = ['1 hour', '2 hours', '4 hours', '24 hours', '48 hours']
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TRAVEL_OPTIONS = ['No travel', 'Up to 5 miles', 'Up to 10 miles', 'Up to 20 miles', 'Up to 30 miles']

const TIME_SLOTS: string[] = []
for (let h = 6; h <= 21; h++) {
  const d = h === 12 ? 12 : h > 12 ? h - 12 : h
  const ap = h >= 12 ? 'PM' : 'AM'
  TIME_SLOTS.push(`${d}:00 ${ap}`)
  if (h < 21) TIME_SLOTS.push(`${d}:30 ${ap}`)
}

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  cyan: '#00BCC8',
  cyanBorder: 'rgba(0,188,200,0.25)',
  cyanLight: 'rgba(0,188,200,0.08)',
  border: 'rgba(0,0,0,0.08)',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

// ── Inline SVG icons ───────────────────────────────────────────────────────────

const IconHome = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconCalendar = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconDollarSign = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const IconUser = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const IconXSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ── Nav items ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'home',     label: 'Home',     Icon: IconHome,       badge: false },
  { key: 'schedule', label: 'Schedule', Icon: IconCalendar,   badge: false },
  { key: 'earnings', label: 'Earnings', Icon: IconDollarSign, badge: false },
  { key: 'messages', label: 'Messages', Icon: MessageSquare,  badge: true  },
  { key: 'profile',  label: 'Profile',  Icon: IconUser,       badge: false },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= rating ? '#F59E0B' : '#E5E7EB'} color={i <= rating ? '#F59E0B' : '#E5E7EB'} />
      ))}
    </div>
  )
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function SectionCard({ children, dangerBorder, id }: { children: React.ReactNode; dangerBorder?: boolean; id?: string }) {
  return (
    <div
      id={id}
      style={{
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '14px',
        padding: '24px',
        border: dangerBorder ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </div>
  )
}

function CardLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 600,
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: danger ? '#EF4444' : T.ink3,
        textTransform: 'uppercase',
        marginBottom: '16px',
      }}
    >
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '13px',
        color: '#374151',
        fontFamily: "'Hanken Grotesk', sans-serif",
        fontWeight: 500,
        marginBottom: '6px',
      }}
    >
      {children}
    </div>
  )
}

function SaveButton() {
  return (
    <button
      style={{
        width: '100%',
        height: '44px',
        background: T.cyan,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 500,
        fontFamily: "'Hanken Grotesk', sans-serif",
        cursor: 'pointer',
        marginTop: '20px',
      }}
    >
      Save changes
    </button>
  )
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '999px',
        background: on ? T.cyan : '#E5E7EB',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: on ? '22px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function formatTodayDate() {
  const now = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`
}

function Sidebar({
  active, onSelect, sidebarOpen, onToggle,
}: {
  active: string; onSelect: (k: string) => void; sidebarOpen: boolean; onToggle: () => void
}) {
  return (
    <motion.div
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, overflow: 'visible' }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
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

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', flexShrink: 0 }}>
          {NAV_ITEMS.map(({ key, label, Icon, badge }) => {
            const isActive = key === active
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6' }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center',
                  gap: sidebarOpen ? '12px' : '0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  padding: sidebarOpen ? '14px 24px' : '14px 0',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent',
                  border: 'none', color: isActive ? T.cyan : T.ink2,
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px',
                  fontWeight: isActive ? 600 : 500, cursor: 'pointer', textAlign: 'left',
                  width: '100%', minHeight: '44px', transition: 'background 0.15s', flexShrink: 0,
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 20 }}><Icon size={20} /></span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {badge && (
                  <span style={{ position: 'absolute', top: '10px', right: '20px', width: '8px', height: '8px', borderRadius: '50%', background: T.cyan, flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ height: '1px', background: '#E5E7EB', margin: '16px 0', flexShrink: 0 }} />
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '11px', letterSpacing: '0.08em', color: T.ink3, textTransform: 'uppercase', padding: '0 24px', marginBottom: '12px' }}>Today</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: '#374151', padding: '0 24px', marginBottom: '4px' }}>{formatTodayDate()}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', color: T.cyan }}>
                <IconCalendar size={16} />
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: '#374151' }}>2 sessions today</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>Weekly goal</span>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>7/10</span>
              </div>
              <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden', margin: '6px 24px 0' }}>
                <div style={{ width: '70%', height: '100%', background: T.cyan, borderRadius: '999px' }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', color: T.cyan }}>
              <IconCalendar size={16} />
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />
        <div style={{ padding: '16px 12px 24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: sidebarOpen ? 'flex-start' : 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: '999px', background: T.cyanLight, border: `2px solid ${T.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: T.cyan, flexShrink: 0 }}>MT</div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: T.ink, lineHeight: 1.3, whiteSpace: 'nowrap' }}>Marcus Torres</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, whiteSpace: 'nowrap' }}>Trainer</div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onToggle}
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
        <span style={{ color: T.ink3, display: 'flex', alignItems: 'center' }}><IconHome size={16} /></span>
        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink3 }}>Dashboard</span>
        <span style={{ color: T.ink3, fontSize: '14px' }}>/</span>
        <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: '#374151', fontWeight: 500 }}>Profile</span>
      </div>
      <button style={{ background: 'transparent', border: 'none', color: T.ink2, cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconBell />
      </button>
    </motion.header>
  )
}

// ── Mobile header ──────────────────────────────────────────────────────────────

function MobileHeader({ activeNav, onSelect }: { activeNav: string; onSelect: (k: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 50 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '22px', color: T.cyan, letterSpacing: '0.12em', textTransform: 'uppercase' }}>FARM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '13px', color: '#FFFFFF', letterSpacing: '0.04em' }}>MT</div>
          <button onClick={() => setIsOpen((o) => !o)} style={{ background: 'transparent', border: 'none', color: '#374151', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isOpen ? <IconXSvg /> : <IconMenu />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            style={{ position: 'fixed', top: '52px', left: 0, right: 0, background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '12px', zIndex: 45 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {NAV_ITEMS.map(({ key, label, Icon }) => {
                const isActive = key === activeNav
                return (
                  <button key={key} onClick={() => { onSelect(key); setIsOpen(false) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderRadius: '12px', background: isActive ? 'rgba(0,188,200,0.08)' : 'transparent', border: `1px solid ${isActive ? 'rgba(0,188,200,0.2)' : 'rgba(0,0,0,0.08)'}`, color: isActive ? T.cyan : T.ink2, cursor: 'pointer', minHeight: '80px' }}>
                    <Icon size={22} />
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', fontWeight: 500 }}>{label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Section: Profile photo ─────────────────────────────────────────────────────

function ProfilePhotoSection() {
  const profileStrength = PROFILE_ITEMS.filter((i) => i.completed).reduce((sum, i) => sum + parseInt(i.boost), 0)
  const [strengthExpanded, setStrengthExpanded] = useState(false)

  return (
    <SectionCard id="section-photo">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 120, height: 120, borderRadius: '999px', background: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '36px', color: '#FFFFFF' }}>MT</div>
          <button style={{ position: 'absolute', bottom: '4px', right: '4px', width: '32px', height: '32px', borderRadius: '999px', background: T.cyan, border: '2px solid #FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            <Camera size={16} color="#FFFFFF" />
          </button>
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '24px', color: T.ink, marginBottom: '8px' }}>Marcus Torres</div>
          <div style={{ display: 'inline-block', background: 'rgba(0,188,200,0.1)', color: T.cyan, borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '12px' }}>Soccer</div>
          <div
            onClick={() => setStrengthExpanded((e) => !e)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer', maxWidth: '320px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ width: '140px', height: '4px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: `${profileStrength}%`, height: '100%', background: T.cyan, borderRadius: '999px' }} />
              </div>
              <span style={{ fontSize: '13px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif" }}>{profileStrength}% complete</span>
            </div>
            <ChevronDown
              size={16}
              color="#9CA3AF"
              style={{ transform: strengthExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
            />
          </div>
          <AnimatePresence>
            {strengthExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ width: '100%', maxWidth: '320px' }}>
                  {PROFILE_ITEMS.map((item, i) => (
                    <div
                      key={item.key}
                      onClick={() => !item.completed && scrollTo(item.sectionId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 0',
                        borderBottom: i < PROFILE_ITEMS.length - 1 ? '1px solid #F3F4F6' : 'none',
                        cursor: item.completed ? 'default' : 'pointer',
                      }}
                    >
                      {item.completed
                        ? <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />
                        : <Circle size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />}
                      <span style={{
                        flex: 1,
                        fontSize: '13px',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                        color: item.completed ? '#6B7280' : '#374151',
                        textDecoration: item.completed ? 'line-through' : 'none',
                      }}>
                        {item.label}
                      </span>
                      {!item.completed && (
                        <span style={{ fontSize: '12px', color: T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, flexShrink: 0 }}>
                          {item.boost}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button style={{ height: '44px', padding: '0 20px', background: T.cyan, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer' }}>Upload photo</button>
        <button style={{ height: '44px', padding: '0 20px', background: 'transparent', color: T.ink2, border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer' }}>Remove photo</button>
      </div>
    </SectionCard>
  )
}

// ── Section: Basic info ────────────────────────────────────────────────────────

function BasicInfoSection() {
  const [fullName, setFullName] = useState('Marcus Torres')
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [phone, setPhone] = useState('')

  const inputBase: React.CSSProperties = {
    width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
    padding: '0 14px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
  }

  return (
    <SectionCard id="section-basic-info">
      <CardLabel>Basic Info</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <FieldLabel>Full name</FieldLabel>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Marcus Torres" style={inputBase} />
        </div>
        <div>
          <FieldLabel>Tagline</FieldLabel>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Elite soccer trainer for ages 8-18" style={inputBase} />
        </div>
        <div>
          <FieldLabel>Bio</FieldLabel>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell parents about your training philosophy, background, and what makes your sessions unique..." style={{ width: '100%', minHeight: '120px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '14px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF' }} />
        </div>
        <div>
          <FieldLabel>Location</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><MapPin size={16} /></span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" style={{ ...inputBase, paddingLeft: '40px' }} />
          </div>
        </div>
        <div>
          <FieldLabel>Years of experience</FieldLabel>
          <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="0" style={{ ...inputBase, width: '120px' }} />
        </div>
        <div>
          <FieldLabel>Phone number</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><Phone size={16} /></span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" style={{ ...inputBase, paddingLeft: '40px' }} />
          </div>
        </div>
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Social links ──────────────────────────────────────────────────────

function SocialLinksSection() {
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')

  const inputBase: React.CSSProperties = {
    width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
    padding: '0 14px 0 40px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
  }

  const rows = [
    { value: instagram, onChange: setInstagram, icon: <IconInstagram />,              placeholder: 'instagram.com/yourhandle' },
    { value: twitter,   onChange: setTwitter,   icon: <IconTwitterX />,               placeholder: 'x.com/yourhandle' },
    { value: youtube,   onChange: setYoutube,   icon: <IconYoutube />,                placeholder: 'youtube.com/yourchannel' },
    { value: tiktok,    onChange: setTiktok,    icon: <Music size={16} color="#000" />, placeholder: 'tiktok.com/@yourhandle' },
  ]

  return (
    <SectionCard id="section-social">
      <CardLabel>Social &amp; Media</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((row, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
              {row.icon}
            </span>
            <input
              value={row.value}
              onChange={(e) => row.onChange(e.target.value)}
              placeholder={row.placeholder}
              style={inputBase}
            />
          </div>
        ))}
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Intro video ───────────────────────────────────────────────────────

function IntroVideoSection() {
  const [videoUrl, setVideoUrl] = useState('')

  return (
    <SectionCard id="section-intro-video">
      <CardLabel>Intro Video</CardLabel>
      <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px', lineHeight: 1.5 }}>
        A short video dramatically increases parent bookings. Link a YouTube or Instagram reel of you training.
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}>
          <Video size={16} />
        </span>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or instagram.com/reel/..."
          style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '0 14px 0 40px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF' }}
        />
      </div>
      <div style={{ marginTop: '16px' }}>
        {videoUrl ? (
          <div style={{ height: '120px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <PlayCircle size={24} color={T.cyan} />
            <span style={{ fontSize: '13px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif" }}>Video linked</span>
          </div>
        ) : (
          <div style={{ height: '120px', borderRadius: '12px', border: '2px dashed #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <PlayCircle size={32} color="#D1D5DB" />
            <span style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: "'Hanken Grotesk', sans-serif" }}>Your video preview will appear here</span>
          </div>
        )}
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Specialties ───────────────────────────────────────────────────────

function SpecialtiesSection({ primarySport, setPrimarySport }: { primarySport: string; setPrimarySport: (s: string) => void }) {
  const [selectedSports, setSelectedSports] = useState<string[]>(['Soccer'])
  const [selectedAges, setSelectedAges] = useState<string[]>(['U9-U10', 'U11-U12'])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['In-Person'])
  const [pillPopover, setPillPopover] = useState<string | null>(null)

  function toggle(arr: string[], setArr: (a: string[]) => void, item: string) {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item])
  }

  function pillStyle(selected: boolean): React.CSSProperties {
    return {
      borderRadius: '999px', padding: '6px 16px', fontSize: '13px',
      fontFamily: "'Hanken Grotesk', sans-serif",
      border: selected ? '1px solid rgba(0,188,200,0.3)' : '1px solid #E5E7EB',
      background: selected ? 'rgba(0,188,200,0.1)' : 'transparent',
      color: selected ? T.cyan : T.ink2,
      cursor: 'pointer', minHeight: '44px', display: 'flex', alignItems: 'center',
    }
  }

  function handleSportClick(sport: string) {
    if (sport.toLowerCase() === primarySport) return
    const isSelected = selectedSports.includes(sport)
    if (!isSelected) {
      setSelectedSports((prev) => [...prev, sport])
    } else {
      setPillPopover(pillPopover === sport ? null : sport)
    }
  }

  return (
    <SectionCard id="section-specialties">
      <CardLabel>Specialties</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <FieldLabel>Sports</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
            {SPORTS.map((sport) => {
              const isPrimary = sport.toLowerCase() === primarySport
              const isSelected = selectedSports.includes(sport)
              return (
                <div key={sport} style={{ position: 'relative' }}>
                  <motion.button
                    whileTap={isPrimary ? {} : { scale: 0.95 }}
                    onClick={() => handleSportClick(sport)}
                    title={isPrimary ? 'This is your primary sport' : undefined}
                    style={isPrimary ? {
                      borderRadius: '999px', padding: '6px 16px', fontSize: '13px',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      border: '2px solid #00BCC8',
                      background: 'rgba(0,188,200,0.15)',
                      color: '#00BCC8',
                      cursor: 'default', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '4px',
                    } : pillStyle(isSelected)}
                  >
                    {isPrimary && <Star size={12} fill="#00BCC8" color="#00BCC8" />}
                    {sport}
                  </motion.button>
                  {pillPopover === sport && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#111827', color: '#FFFFFF', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', zIndex: 20, whiteSpace: 'nowrap', display: 'flex', gap: '12px' }}>
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setPrimarySport(sport.toLowerCase()); setPillPopover(null) }}
                      >
                        Set as primary
                      </span>
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedSports((prev) => prev.filter((s) => s !== sport)); setPillPopover(null) }}
                      >
                        Remove
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '8px' }}>
            Your primary sport sets your profile background image.
          </div>
        </div>
        <div>
          <FieldLabel>Age groups</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
            {AGE_GROUPS.map((age) => (
              <motion.button key={age} whileTap={{ scale: 0.95 }} onClick={() => toggle(selectedAges, setSelectedAges, age)} style={pillStyle(selectedAges.includes(age))}>
                {age}
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Session types</FieldLabel>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            {(['In-Person', 'Remote'] as const).map((type) => {
              const sel = selectedTypes.includes(type)
              return (
                <button key={type} onClick={() => toggle(selectedTypes, setSelectedTypes, type)} style={{ flex: 1, borderRadius: '12px', padding: '16px', border: sel ? `2px solid ${T.cyan}` : '1px solid #E5E7EB', background: sel ? 'rgba(0,188,200,0.06)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', minHeight: '80px' }}>
                  {type === 'In-Person' ? <MapPin size={18} color={sel ? T.cyan : T.ink3} /> : <Video size={18} color={sel ? T.cyan : T.ink3} />}
                  <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 500, color: sel ? T.cyan : T.ink2 }}>{type}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Rate ──────────────────────────────────────────────────────────────

function RateSection() {
  const [hourlyRate, setHourlyRate] = useState('85')
  const [selectedDurations, setSelectedDurations] = useState<string[]>(['60 min'])
  const [noticeTime, setNoticeTime] = useState('24 hours')

  function toggleDur(dur: string) {
    setSelectedDurations((prev) => prev.includes(dur) ? prev.filter((d) => d !== dur) : [...prev, dur])
  }

  return (
    <SectionCard id="section-rate">
      <CardLabel>Rate &amp; Session</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <FieldLabel>Hourly rate</FieldLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '20px', color: T.ink3 }}>$</span>
            <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} style={{ width: '160px', border: 'none', borderBottom: '2px solid #E5E7EB', fontSize: '32px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: T.ink, outline: 'none', background: 'transparent', padding: '0 4px' }} />
          </div>
          <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '6px' }}>You keep 85% — FARM takes 15%</div>
        </div>
        <div>
          <FieldLabel>Session length</FieldLabel>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {DURATIONS.map((dur) => {
              const sel = selectedDurations.includes(dur)
              return (
                <motion.button key={dur} whileTap={{ scale: 0.95 }} onClick={() => toggleDur(dur)} style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", border: sel ? '1px solid rgba(0,188,200,0.3)' : '1px solid #E5E7EB', background: sel ? 'rgba(0,188,200,0.1)' : 'transparent', color: sel ? T.cyan : T.ink2, cursor: 'pointer', minHeight: '44px' }}>
                  {dur}
                </motion.button>
              )
            })}
          </div>
        </div>
        <div>
          <FieldLabel>Minimum notice</FieldLabel>
          <select value={noticeTime} onChange={(e) => setNoticeTime(e.target.value)} style={{ height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", padding: '0 14px', outline: 'none', color: T.ink, background: '#FFFFFF', cursor: 'pointer' }}>
            {NOTICE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Availability ──────────────────────────────────────────────────────

type DayState = { enabled: boolean; from: string; to: string }

function AvailabilitySection() {
  const [avail, setAvail] = useState<Record<string, DayState>>({
    Monday:    { enabled: true,  from: '9:00 AM',  to: '5:00 PM'  },
    Tuesday:   { enabled: false, from: '9:00 AM',  to: '5:00 PM'  },
    Wednesday: { enabled: true,  from: '9:00 AM',  to: '5:00 PM'  },
    Thursday:  { enabled: false, from: '9:00 AM',  to: '5:00 PM'  },
    Friday:    { enabled: true,  from: '3:00 PM',  to: '7:00 PM'  },
    Saturday:  { enabled: true,  from: '8:00 AM',  to: '12:00 PM' },
    Sunday:    { enabled: false, from: '9:00 AM',  to: '5:00 PM'  },
  })

  function toggleDay(day: string) {
    setAvail((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))
  }

  const dropdownStyle: React.CSSProperties = {
    height: '40px', width: '110px', borderRadius: '8px', border: '1px solid #E5E7EB',
    fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    padding: '0 8px', outline: 'none', color: T.ink, background: '#FFFFFF', cursor: 'pointer',
  }

  return (
    <SectionCard id="section-availability">
      <CardLabel>Availability</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {DAYS_OF_WEEK.map((day, i) => {
          const d = avail[day]
          return (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: i < DAYS_OF_WEEK.length - 1 ? '1px solid #E5E7EB' : 'none', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', fontWeight: 500, color: T.ink, width: '100px', flexShrink: 0, opacity: d.enabled ? 1 : 0.45 }}>{day}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {d.enabled && (
                  <>
                    <select value={d.from} onChange={(e) => setAvail((prev) => ({ ...prev, [day]: { ...prev[day], from: e.target.value } }))} style={dropdownStyle}>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>to</span>
                    <select value={d.to} onChange={(e) => setAvail((prev) => ({ ...prev, [day]: { ...prev[day], to: e.target.value } }))} style={dropdownStyle}>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </>
                )}
                <div
                  onClick={() => toggleDay(day)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    background: d.enabled ? '#00BCC8' : '#E5E7EB',
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background 0.2s ease',
                    display: 'inline-block',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      position: 'absolute',
                      top: '2px',
                      left: d.enabled ? '22px' : '2px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <button style={{ background: 'transparent', border: 'none', color: T.cyan, cursor: 'pointer', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, padding: '8px 0', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Plus size={16} /> Add exception date
      </button>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Credentials ───────────────────────────────────────────────────────

function CredentialsSection() {
  const [certs, setCerts] = useState<Certification[]>(INITIAL_CERTS)
  const [affs, setAffs] = useState<Affiliation[]>(INITIAL_AFFS)
  const [addingCert, setAddingCert] = useState(false)
  const [newCert, setNewCert] = useState({ name: '', org: '', year: '' })
  const [addingAff, setAddingAff] = useState(false)
  const [newAff, setNewAff] = useState({ name: '', role: '', years: '' })

  const inlineInput: React.CSSProperties = {
    flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #E5E7EB',
    padding: '0 12px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', color: T.ink, background: '#FFFFFF', minWidth: '80px',
  }

  function confirmCert() {
    if (!newCert.name) return
    setCerts((prev) => [...prev, { id: Date.now(), ...newCert }])
    setNewCert({ name: '', org: '', year: '' })
    setAddingCert(false)
  }

  function confirmAff() {
    if (!newAff.name) return
    setAffs((prev) => [...prev, { id: Date.now(), ...newAff }])
    setNewAff({ name: '', role: '', years: '' })
    setAddingAff(false)
  }

  return (
    <SectionCard id="section-credentials">
      <CardLabel>Credentials</CardLabel>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, marginBottom: '12px' }}>Certifications</div>
        {certs.map((cert, i) => (
          <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: (i < certs.length - 1 || addingCert) ? '1px solid #E5E7EB' : 'none' }}>
            <Award size={18} color={T.cyan} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500 }}>{cert.name}</div>
              <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>{cert.org} · {cert.year}</div>
            </div>
            <button onClick={() => setCerts((prev) => prev.filter((c) => c.id !== cert.id))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {addingCert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', flexWrap: 'wrap' }}>
            <input value={newCert.name} onChange={(e) => setNewCert((p) => ({ ...p, name: e.target.value }))} placeholder="Certification name" style={{ ...inlineInput, minWidth: '140px' }} />
            <input value={newCert.org} onChange={(e) => setNewCert((p) => ({ ...p, org: e.target.value }))} placeholder="Issuing org" style={inlineInput} />
            <input value={newCert.year} onChange={(e) => setNewCert((p) => ({ ...p, year: e.target.value }))} placeholder="Year" style={{ ...inlineInput, flex: '0 0 80px' }} />
            <button onClick={confirmCert} style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#10B981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={16} color="#FFFFFF" />
            </button>
            <button onClick={() => setAddingCert(false)} style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'transparent', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <XIcon size={16} color={T.ink3} />
            </button>
          </div>
        )}
        {!addingCert && (
          <button onClick={() => setAddingCert(true)} style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px dashed #E5E7EB', background: 'transparent', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <Plus size={16} /> Add certification
          </button>
        )}
      </div>

      <div>
        <div style={{ fontSize: '13px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, marginBottom: '12px' }}>Affiliations</div>
        {affs.map((aff, i) => (
          <div key={aff.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: (i < affs.length - 1 || addingAff) ? '1px solid #E5E7EB' : 'none' }}>
            <Award size={18} color={T.cyan} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500 }}>{aff.name}</div>
              <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>{aff.role} · {aff.years}</div>
            </div>
            <button onClick={() => setAffs((prev) => prev.filter((a) => a.id !== aff.id))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {addingAff && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', flexWrap: 'wrap' }}>
            <input value={newAff.name} onChange={(e) => setNewAff((p) => ({ ...p, name: e.target.value }))} placeholder="School or club name" style={{ ...inlineInput, minWidth: '140px' }} />
            <input value={newAff.role} onChange={(e) => setNewAff((p) => ({ ...p, role: e.target.value }))} placeholder="Role" style={inlineInput} />
            <input value={newAff.years} onChange={(e) => setNewAff((p) => ({ ...p, years: e.target.value }))} placeholder="Years active" style={{ ...inlineInput, flex: '0 0 110px' }} />
            <button onClick={confirmAff} style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#10B981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={16} color="#FFFFFF" />
            </button>
            <button onClick={() => setAddingAff(false)} style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'transparent', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <XIcon size={16} color={T.ink3} />
            </button>
          </div>
        )}
        {!addingAff && (
          <button onClick={() => setAddingAff(true)} style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px dashed #E5E7EB', background: 'transparent', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <Plus size={16} /> Add affiliation
          </button>
        )}
      </div>

      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Reviews ───────────────────────────────────────────────────────────

function ReviewsSection() {
  const avgRating = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1)

  return (
    <SectionCard>
      <CardLabel>Your Reviews</CardLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '48px', fontWeight: 700, color: T.ink, lineHeight: 1 }}>{avgRating}</span>
          <Star size={24} fill="#F59E0B" color="#F59E0B" />
        </div>
        <span style={{ fontSize: '14px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>from {MOCK_REVIEWS.length} reviews</span>
      </div>
      {MOCK_REVIEWS.map((review) => (
        <div key={review.id} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '999px', background: 'rgba(0,188,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: T.cyan, flexShrink: 0 }}>
                {review.initials}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>{review.parentName}</span>
            </div>
            <span style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", flexShrink: 0 }}>{review.date}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <StarRow rating={review.rating} size={16} />
          </div>
          <p style={{ fontSize: '14px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif", lineHeight: 1.6, margin: 0, marginBottom: '8px' }}>{review.text}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              style={{ background: 'transparent', border: 'none', fontSize: '12px', color: T.ink3, cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", padding: '4px 0' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.ink3 }}
            >
              Flag review
            </button>
          </div>
        </div>
      ))}
    </SectionCard>
  )
}

// ── Section: Session setup ─────────────────────────────────────────────────────

function SessionSetupSection() {
  const [location, setLocation] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [travelRadius, setTravelRadius] = useState('No travel')
  const [equipment, setEquipment] = useState('')

  const inputBase: React.CSSProperties = {
    width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB',
    fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif",
    outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
  }

  return (
    <SectionCard>
      <CardLabel>Session Setup</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <FieldLabel>In-person location</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><MapPin size={16} /></span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Default training location or address" style={{ ...inputBase, paddingLeft: '40px', paddingRight: '14px' }} />
          </div>
        </div>
        <div>
          <FieldLabel>Zoom link</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.ink3, display: 'flex', pointerEvents: 'none' }}><Video size={16} /></span>
            <input value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/j/..." style={{ ...inputBase, paddingLeft: '40px', paddingRight: '14px' }} />
          </div>
        </div>
        <div>
          <FieldLabel>Travel radius</FieldLabel>
          <select value={travelRadius} onChange={(e) => setTravelRadius(e.target.value)} style={{ height: '44px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", padding: '0 14px', outline: 'none', color: T.ink, background: '#FFFFFF', cursor: 'pointer' }}>
            {TRAVEL_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Equipment provided</FieldLabel>
          <textarea value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="List any equipment you bring or require parents to have..." style={{ width: '100%', minHeight: '80px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '14px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF' }} />
        </div>
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Notifications ─────────────────────────────────────────────────────

type NotifChannels = { email: boolean; sms: boolean }

function NotificationsSection() {
  const [notifState, setNotifState] = useState<Record<string, NotifChannels>>({
    newBooking:        { email: true, sms: false },
    bookingCancelled:  { email: true, sms: false },
    newMessage:        { email: true, sms: false },
    sessionReminder:   { email: true, sms: false },
    payoutSent:        { email: true, sms: false },
    newReview:         { email: true, sms: false },
  })

  function toggle(key: string, channel: 'email' | 'sms') {
    setNotifState((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: !prev[key][channel] } }))
  }

  const colHeaderStyle: React.CSSProperties = {
    fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif",
    fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', width: '52px', flexShrink: 0,
  }

  return (
    <SectionCard id="section-notifications">
      <CardLabel>Notifications</CardLabel>
      <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '16px', lineHeight: 1.5 }}>
        Choose how you want to be notified about activity on your account.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ flex: 1 }} />
        <div style={colHeaderStyle}>Email</div>
        <div style={colHeaderStyle}>SMS</div>
      </div>
      {NOTIF_ROWS.map((row, i) => (
        <div key={row.key} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < NOTIF_ROWS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, marginBottom: '2px' }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>{row.description}</div>
          </div>
          <div style={{ width: '52px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => toggle(row.key, 'email')}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '999px',
                background: notifState[row.key].email ? '#00BCC8' : '#E5E7EB',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.2s ease',
                display: 'inline-block',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  position: 'absolute',
                  top: '2px',
                  left: notifState[row.key].email ? '22px' : '2px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </div>
          </div>
          <div style={{ width: '52px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => toggle(row.key, 'sms')}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '999px',
                background: notifState[row.key].sms ? '#00BCC8' : '#E5E7EB',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.2s ease',
                display: 'inline-block',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  position: 'absolute',
                  top: '2px',
                  left: notifState[row.key].sms ? '22px' : '2px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Danger zone ───────────────────────────────────────────────────────

function DangerZoneSection({ paused, setPaused }: { paused: boolean; setPaused: (v: boolean) => void }) {
  return (
    <SectionCard dangerBorder>
      <CardLabel danger>Account</CardLabel>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <div style={{ fontSize: '14px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500, marginBottom: '2px' }}>Pause my profile</div>
            <div style={{ fontSize: '12px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>Your profile won&apos;t appear in search while paused</div>
          </div>
          <ToggleSwitch on={paused} onChange={() => setPaused(!paused)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0' }}>
          <div style={{ fontSize: '14px', color: '#EF4444', fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 500 }}>Delete account</div>
          <button style={{ padding: '8px 16px', border: '1px solid #EF4444', color: '#EF4444', background: 'transparent', borderRadius: '8px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', minHeight: '44px' }}>
            Request deletion
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerProfilePage() {
  const [activeNav, setActiveNav] = useState('profile')
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [paused, setPaused] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [primarySport, setPrimarySport] = useState('soccer')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sidebarWidth = isMobile ? 0 : sidebarOpen ? 240 : 72

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('/backgrounds/${primarySport}.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(248,248,246,0.78)', pointerEvents: 'none' }} />

      {isMobile ? (
        <MobileHeader activeNav={activeNav} onSelect={setActiveNav} />
      ) : (
        <>
          <Sidebar active={activeNav} onSelect={setActiveNav} sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
          <DesktopHeader sidebarOpen={sidebarOpen} />
        </>
      )}

      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ position: 'relative', zIndex: 2, paddingTop: '52px', paddingBottom: '40px' }}
      >
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Status banner */}
          {!bannerDismissed && (
          <div
            style={{
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              position: 'sticky',
              top: '60px',
              zIndex: 10,
              flexWrap: 'wrap',
              ...(paused
                ? { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }
                : { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: paused ? '#F59E0B' : '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: '#374151', fontFamily: "'Hanken Grotesk', sans-serif" }}>
                {paused ? "Your profile is paused — you won't appear in search" : 'Your profile is live — parents can find and book you'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {paused ? (
                <button
                  onClick={() => setPaused(false)}
                  style={{ background: '#F59E0B', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer', flexShrink: 0, minHeight: '44px' }}
                >
                  Resume profile
                </button>
              ) : (
                <button
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(0,0,0,0.12)', color: '#374151', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontFamily: "'Hanken Grotesk', sans-serif", background: 'transparent', cursor: 'pointer', flexShrink: 0, minHeight: '44px' }}
                >
                  <Eye size={14} /> View public profile
                </button>
              )}
              <button
                onClick={() => setBannerDismissed(true)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', marginLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XIcon size={16} color="#6B7280" />
              </button>
            </div>
          </div>
          )}

          {/* Page title */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '28px', color: T.ink }}>Your profile</div>
            <div style={{ fontSize: '14px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '4px' }}>This is what parents see when they find you.</div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(0,0,0,0.12)', color: '#374151', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif", background: 'transparent', cursor: 'pointer', minHeight: '44px', marginTop: '12px' }}>
              <Eye size={16} /> View public profile
            </button>
          </div>

          <ProfilePhotoSection />
          <BasicInfoSection />
          <SocialLinksSection />
          <IntroVideoSection />
          <SpecialtiesSection primarySport={primarySport} setPrimarySport={setPrimarySport} />
          <RateSection />
          <AvailabilitySection />
          <CredentialsSection />
          <ReviewsSection />
          <SessionSetupSection />
          <NotificationsSection />
          <DangerZoneSection paused={paused} setPaused={setPaused} />
        </div>
      </motion.main>
    </div>
  )
}
