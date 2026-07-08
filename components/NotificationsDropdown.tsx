'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

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

const CYAN = '#00BCC8'
const TABS: TabType[] = ['All', 'Sessions', 'Messages', 'Reviews']

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function NotifIcon({ type, read }: { type: NotifType; read: boolean }) {
  const color = read ? '#9CA3AF' : CYAN
  return (
    <div style={{
      width: 32, height: 32, flexShrink: 0,
      background: read ? '#F3F4F6' : 'rgba(0,188,200,0.08)',
      border: `1px solid ${read ? 'rgba(0,0,0,0.08)' : 'rgba(0,188,200,0.2)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {type === 'Sessions' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )}
      {type === 'Messages' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      {type === 'Reviews' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 3 14.6 9.1 21 9.7 16.1 13.9 17.7 20.5 12 16.9 6.3 20.5 7.9 13.9 3 9.7 9.4 9.1" />
        </svg>
      )}
    </div>
  )
}

export default function NotificationsDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<TabType>('All')
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Refresh unread badge on every route change
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .is('read_at', null)
        .then(({ count }) => setUnreadCount(count ?? 0))
    })
  }, [pathname])

  // Fetch notifications whenever the dropdown opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('notifications')
        .select('id, type, title, body, link, read_at, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (data) {
            setNotifs(data.map(row => ({
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
        })
    })
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function markAllRead() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('profile_id', user.id)
      .is('read_at', null)
    setNotifs(prev => prev.map(n => ({ ...n, read: true, read_at: n.read_at ?? new Date().toISOString() })))
    setUnreadCount(0)
  }

  async function handleNotifClick(notif: Notif) {
    if (!notif.read) {
      const supabase = createClient()
      const now = new Date().toISOString()
      await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('id', notif.id)
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true, read_at: now } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setOpen(false)
    if (notif.link) router.push(notif.link)
  }

  const displayed = (tab === 'All' ? notifs : notifs.filter(n => n.type === tab)).slice(0, 6)

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent', border: 'none',
          color: open ? CYAN : '#6B7280',
          cursor: 'pointer', minWidth: '44px', minHeight: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: CYAN,
          }} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 380,
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 200,
          overflow: 'hidden',
          fontFamily: "'Hanken Grotesk', sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 18, color: '#111827',
                textTransform: 'uppercase' as const, letterSpacing: '.04em',
              }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: CYAN, color: '#fff', fontSize: 10, fontWeight: 800,
                  padding: '2px 7px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: '.06em',
                }}>{unreadCount} NEW</span>
              )}
            </div>
            <button
              onClick={markAllRead}
              style={{
                background: 'none', border: '1px solid rgba(0,0,0,0.08)',
                color: '#6B7280', cursor: 'pointer', padding: '5px 10px',
                fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
                fontFamily: "'Barlow Condensed', sans-serif",
                textTransform: 'uppercase' as const,
              }}
            >Mark all read</button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0 4px' }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 14px', fontSize: 11, fontWeight: 700,
                  color: tab === t ? CYAN : '#9CA3AF',
                  borderBottom: tab === t ? `2px solid ${CYAN}` : '2px solid transparent',
                  marginBottom: -1,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: '.08em',
                  textTransform: 'uppercase' as const,
                  transition: 'color .15s ease',
                }}
              >{t}</button>
            ))}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                Loading…
              </div>
            ) : displayed.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15,
                  letterSpacing: '.06em', textTransform: 'uppercase' as const,
                  color: '#6B7280', margin: '0 0 4px',
                }}>No notifications</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>Nothing here for this filter.</p>
              </div>
            ) : (
              displayed.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  style={{
                    padding: '13px 20px',
                    cursor: 'pointer',
                    background: notif.read ? '#fff' : 'rgba(0,188,200,0.04)',
                    borderLeft: notif.read ? '3px solid transparent' : `3px solid ${CYAN}`,
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = notif.read ? '#F9FAFB' : 'rgba(0,188,200,0.08)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = notif.read ? '#fff' : 'rgba(0,188,200,0.04)'
                  }}
                >
                  <NotifIcon type={notif.type} read={notif.read} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 8, marginBottom: 3,
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: notif.read ? '#6B7280' : '#111827' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>{notif.timestamp}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, lineHeight: 1.5 }}>{notif.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              style={{
                fontSize: 12, fontWeight: 700, color: CYAN, textDecoration: 'none',
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '.06em', textTransform: 'uppercase' as const,
              }}
            >View all →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
