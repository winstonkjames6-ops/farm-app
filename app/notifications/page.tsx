'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const T = {
  bg: '#09090B',
  surface: '#111113',
  surface2: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  yellow: '#00BCC8',
  yellowBg: 'rgba(0,188,200,0.05)',
  ink: '#FAFAFA',
  ink2: '#A1A1AA',
  ink3: '#52525B',
}

type NotifType = 'Sessions' | 'Messages' | 'Reviews'
type TabType = 'All' | NotifType

type Notif = {
  id: number
  type: NotifType
  title: string
  body: string
  timestamp: string
  read: boolean
}

const INITIAL_NOTIFS: Notif[] = [
  {
    id: 1, type: 'Sessions',
    title: 'Session tomorrow — Marcus Rivera',
    body: 'Your session with Marcus Rivera is tomorrow at 10:00 AM at Zilker Park. Don\'t forget to bring cleats.',
    timestamp: '24hr ago', read: false,
  },
  {
    id: 2, type: 'Sessions',
    title: 'Session in 1 hour — Marcus Rivera',
    body: 'Your session with Marcus Rivera starts in 1 hour. Head to Field 4 at Zilker Park.',
    timestamp: '1hr ago', read: false,
  },
  {
    id: 3, type: 'Messages',
    title: 'New message from Marcus Rivera',
    body: 'Saturday works great — see you at 10am!',
    timestamp: '2m ago', read: false,
  },
  {
    id: 4, type: 'Reviews',
    title: 'How was your session with Marcus Rivera?',
    body: 'Leave a review for your session last Tuesday to help other parents find great trainers.',
    timestamp: 'Jun 17', read: true,
  },
  {
    id: 5, type: 'Sessions',
    title: 'Slot opened — Jordan Wells',
    body: 'Jordan Wells has new availability this weekend. Saturday at 2pm and Sunday at 11am.',
    timestamp: 'Jun 16', read: true,
  },
  {
    id: 6, type: 'Messages',
    title: 'New message from Priya Nair',
    body: "I'll send over the drill sheet before Friday.",
    timestamp: 'Jun 14', read: true,
  },
  {
    id: 7, type: 'Reviews',
    title: 'Review request — Jamal Brooks session',
    body: 'Your session with Jamal Brooks on Jun 4 is still awaiting your review.',
    timestamp: 'Jun 5', read: true,
  },
  {
    id: 8, type: 'Sessions',
    title: 'Booking confirmed — Marcus Rivera',
    body: 'Your session on Saturday, Jun 28 at 10:00 AM has been confirmed.',
    timestamp: 'Jun 4', read: true,
  },
]

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
      background: read ? T.surface2 : 'rgba(0,188,200,0.08)',
      border: `1px solid ${read ? T.border : 'rgba(0,188,200,0.2)'}`,
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
  const [tab, setTab] = useState<TabType>('All')
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS)

  const filtered = tab === 'All' ? notifs : notifs.filter((n) => n.type === tab)
  const unreadCount = notifs.filter((n) => !n.read).length

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div
      style={{
        background: T.bg, color: T.ink, minHeight: '100vh',
        fontFamily: "'Hanken Grotesk', sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Nav */}
      <nav style={{
        height: 60, borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', padding: '0 24px',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
        background: T.bg,
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

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }}>

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
                background: T.yellow, color: '#000', fontSize: 11, fontWeight: 800,
                padding: '3px 9px', fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.06em',
              }}>{unreadCount} NEW</span>
            )}
          </div>
          <button
            onClick={markAllRead}
            style={{
              background: 'none', border: `1px solid ${T.border}`,
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
          {filtered.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
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

          {filtered.length === 0 && (
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
