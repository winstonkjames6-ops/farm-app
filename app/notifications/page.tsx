'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const T = {
  bg: '#F8F8F6',
  surface: '#FFFFFF',
  surface2: '#F3F4F6',
  border: '#E5E7EB',
  yellow: '#00BCC8',
  yellowBg: '#E8F9FA',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

type NotifType = 'Sessions' | 'Messages' | 'Reviews'
type TabType = 'All' | NotifType

type Notif = {
  id: string
  type: NotifType
  title: string
  body: string
  timestamp: string
  read: boolean
  link: string | null
  read_at: string | null
}

function mapDbType(dbType: string): NotifType {
  if (dbType === 'new_message') return 'Messages'
  if (dbType === 'booking_completed') return 'Reviews'
  return 'Sessions'
}

function formatRelativeTime(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHrs = Math.floor(diffMs / 3_600_000)

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (created >= todayStart) {
    if (diffMins < 60) return `${diffMins}m ago`
    return `${diffHrs}hr ago`
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[created.getMonth()]} ${created.getDate()}`
}

function IconCalendar({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconMessage({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconStar({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1" />
    </svg>
  )
}

function NotifIcon({ type, read }: { type: NotifType; read: boolean }) {
  const color = read ? T.ink3 : T.yellow
  return (
    <div style={{
      width: 36, height: 36, flexShrink: 0,
      background: read ? T.surface2 : '#DCF5F7',
      border: `1px solid ${read ? T.border : '#A5DEE4'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {type === 'Sessions' && <IconCalendar color={color} />}
      {type === 'Messages' && <IconMessage color={color} />}
      {type === 'Reviews' && <IconStar color={color} />}
    </div>
  )
}

const TABS: TabType[] = ['All', 'Sessions', 'Messages', 'Reviews']

export default function NotificationsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabType>('All')
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [sportKey, setSportKey] = useState('parent')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Resolve sport key from role/specialty
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'trainer') {
        const { data: trainer } = await supabase
          .from('trainers')
          .select('specialty')
          .eq('profile_id', user.id)
          .single()
        if (trainer?.specialty) {
          setSportKey(trainer.specialty.toLowerCase())
        }
      }

      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, link, read_at, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setNotifs(data.map((row) => ({
          id: row.id,
          type: mapDbType(row.type),
          title: row.title,
          body: row.body,
          timestamp: formatRelativeTime(row.created_at),
          read: row.read_at !== null,
          link: row.link,
          read_at: row.read_at,
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = tab === 'All' ? notifs : notifs.filter((n) => n.type === tab)
  const unreadCount = notifs.filter((n) => !n.read).length

  async function markAllRead() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('profile_id', user.id)
      .is('read_at', null)

    setNotifs((prev) => prev.map((n) => ({
      ...n,
      read: true,
      read_at: n.read_at ?? new Date().toISOString(),
    })))
  }

  async function handleNotifClick(notif: Notif) {
    if (!notif.read) {
      const supabase = createClient()
      const now = new Date().toISOString()
      await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('id', notif.id)

      setNotifs((prev) => prev.map((n) =>
        n.id === notif.id ? { ...n, read: true, read_at: now } : n
      ))
    }

    if (notif.link) {
      router.push(notif.link)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        color: T.ink,
        fontFamily: "'Hanken Grotesk', sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Background image — role/sport-aware */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url('/backgrounds/${sportKey}.jpg')`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
      }} />

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(248,248,246,0.60)', pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        height: 60, borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', padding: '0 24px',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22,
            color: T.yellow, letterSpacing: '.06em',
          }}>FARM</span>
        </Link>
        <Link href="/dashboard" style={{
          fontSize: 12, fontWeight: 700, color: T.ink2, textDecoration: 'none',
          padding: '7px 14px', border: `1px solid ${T.border}`,
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.08em', textTransform: 'uppercase' as const,
        }}>← Dashboard</Link>
      </nav>

      <main style={{ position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 42,
              color: T.ink, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '.04em', lineHeight: 1,
            }}>Notifications</h1>
            {unreadCount > 0 && (
              <span style={{
                background: T.yellow, color: '#fff', fontSize: 11, fontWeight: 800,
                padding: '3px 9px', fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.06em',
              }}>{unreadCount} NEW</span>
            )}
          </div>
          <button
            onClick={markAllRead}
            style={{
              background: '#FFFFFF', border: `1px solid ${T.border}`,
              color: T.ink2, cursor: 'pointer', padding: '9px 16px',
              fontSize: 12, fontWeight: 700, letterSpacing: '.08em',
              fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' as const,
            }}
          >Mark all read</button>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: `1px solid ${T.border}` }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 18px', fontSize: 12, fontWeight: 700,
                color: tab === t ? T.yellow : T.ink3,
                borderBottom: tab === t ? `2px solid ${T.yellow}` : '2px solid transparent',
                marginBottom: -1,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.08em', textTransform: 'uppercase' as const,
                transition: 'color .15s ease',
              }}
            >{t}</button>
          ))}
        </motion.div>

        {/* Notification list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: T.ink3 }}>
              <p style={{ fontSize: 13, margin: 0 }}>Loading…</p>
            </div>
          )}

          {!loading && filtered.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              onClick={() => handleNotifClick(notif)}
              style={{
                background: notif.read ? T.surface : T.yellowBg,
                borderLeft: notif.read ? `3px solid transparent` : `3px solid ${T.yellow}`,
                padding: '18px 20px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <NotifIcon type={notif.type} read={notif.read} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    gap: 12, marginBottom: 6,
                  }}>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: notif.read ? T.ink2 : T.ink,
                    }}>{notif.title}</span>
                    <span style={{ fontSize: 11, color: T.ink3, flexShrink: 0 }}>{notif.timestamp}</span>
                  </div>
                  <p style={{ fontSize: 13, color: T.ink3, margin: 0, lineHeight: 1.55 }}>{notif.body}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: T.ink3 }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18,
                letterSpacing: '.06em', textTransform: 'uppercase' as const, marginBottom: 8, color: T.ink2,
              }}>No notifications</p>
              <p style={{ fontSize: 13, margin: 0 }}>Nothing here yet for this filter.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
