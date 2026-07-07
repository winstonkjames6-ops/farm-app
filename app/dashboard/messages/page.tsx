'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

const T = {
  card: 'rgba(255,255,255,0.92)',
  surface2: '#F0EFEB',
  accent: '#00BCC8',
  ink: '#1A1A1A',
  ink2: '#4A4A4A',
  ink3: '#9A9A9A',
  line: 'rgba(0,0,0,0.08)',
}

const cardStyle: React.CSSProperties = {
  background: T.card,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid rgba(0,0,0,0.08)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

type Message = {
  id: string
  sender_id: string
  body: string
  sent_at: string
}

type ConversationThread = {
  otherId: string
  otherName: string
  lastBody: string
  lastSentAt: string
}

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '999px', flexShrink: 0,
      background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
      fontSize: size === 42 ? 13 : 12, color: '#FFFFFF',
    }}>
      {initials}
    </div>
  )
}

function MessagesPageInner() {
  const searchParams = useSearchParams()
  const withId = searchParams.get('withId')

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputVal, setInputVal] = useState('')
  const [sendError, setSendError] = useState('')
  const [ready, setReady] = useState(false)
  const [threads, setThreads] = useState<ConversationThread[]>([])
  const [inboxLoading, setInboxLoading] = useState(false)

  useEffect(() => {
    if (!withId) return
    const supabase = createClient()
    let resolvedUserId: string | null = null

    const channel = supabase
      .channel(`thread-${withId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as Message & { recipient_id: string }
          if (!resolvedUserId) return
          if (row.sender_id === withId && row.recipient_id === resolvedUserId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev
              return [...prev, row]
            })
          }
        }
      )
      .subscribe()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      resolvedUserId = user.id
      setCurrentUserId(user.id)

      const [{ data: profile }, { data: msgs }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', withId).single(),
        supabase
          .from('messages')
          .select('id, sender_id, body, sent_at')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${withId}),and(sender_id.eq.${withId},recipient_id.eq.${user.id})`)
          .order('sent_at', { ascending: true }),
      ])
      if (profile) setOtherName(profile.name)
      if (msgs) setMessages(msgs)
      setReady(true)
    }
    load()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [withId])

  useEffect(() => {
    if (withId) return
    const supabase = createClient()
    async function loadInbox() {
      setInboxLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setInboxLoading(false); return }
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, body, sent_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('sent_at', { ascending: false })
      if (!msgs || msgs.length === 0) { setThreads([]); setInboxLoading(false); return }
      const seen = new Set<string>()
      const grouped: { otherId: string; lastBody: string; lastSentAt: string }[] = []
      for (const msg of msgs) {
        const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        if (!seen.has(otherId)) { seen.add(otherId); grouped.push({ otherId, lastBody: msg.body, lastSentAt: msg.sent_at }) }
      }
      const { data: profiles } = await supabase
        .from('profiles').select('id, name').in('id', grouped.map(g => g.otherId))
      const nameMap = new Map<string, string>()
      if (profiles) profiles.forEach((p: { id: string; name: string }) => nameMap.set(p.id, p.name))
      setThreads(grouped.map(g => ({
        otherId: g.otherId,
        otherName: nameMap.get(g.otherId) ?? 'Unknown',
        lastBody: g.lastBody,
        lastSentAt: g.lastSentAt,
      })))
      setInboxLoading(false)
    }
    loadInbox()
  }, [withId])

  async function sendMessage() {
    if (!inputVal.trim() || !withId || !currentUserId) return
    setSendError('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: currentUserId, recipient_id: withId, body: inputVal.trim() })
      .select('id, sender_id, body, sent_at')
      .single()
    if (error) {
      setSendError('Failed to send. Try again.')
      return
    }
    setMessages((prev) => [...prev, data])
    setInputVal('')
  }

  const otherInitials = otherName.split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()

  if (!withId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div style={{ padding: '32px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 20 }}>Messages</div>
          <div style={{ ...cardStyle }}>
            {inboxLoading ? (
              <div style={{ padding: '32px', color: T.ink3, fontSize: 14 }}>Loading…</div>
            ) : threads.length === 0 ? (
              <div style={{ padding: '32px', color: T.ink3, fontSize: 14 }}>No messages yet.</div>
            ) : (
              threads.map((thread, i) => {
                const initials = thread.otherName.split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()
                return (
                  <a
                    key={thread.otherId}
                    href={`/dashboard/messages?withId=${thread.otherId}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                      borderBottom: i < threads.length - 1 ? `1px solid ${T.line}` : 'none',
                      textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <Avatar initials={initials || '?'} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: 14, color: T.ink }}>{thread.otherName}</div>
                      <div style={{ fontSize: 13, color: T.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.lastBody}</div>
                    </div>
                    <div style={{ fontSize: 11, color: T.ink3, flexShrink: 0 }}>{relativeTime(thread.lastSentAt)}</div>
                  </a>
                )
              })
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <div style={{ ...cardStyle, height: 'calc(100vh - 120px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <Avatar initials={otherInitials || '?'} size={38} />
            <div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: 15, color: T.ink }}>{otherName || '…'}</div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === currentUserId
              const time = new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{
                    maxWidth: '66%', padding: '11px 16px',
                    background: isMine ? T.accent : T.surface2,
                    color: isMine ? '#FFFFFF' : T.ink,
                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 14, lineHeight: 1.55,
                    fontWeight: isMine ? 500 : 400,
                  }}>
                    <div style={{ minHeight: '1em' }}>{msg.body}</div>
                    <div style={{ fontSize: 11, marginTop: 4, color: isMine ? 'rgba(255,255,255,0.65)' : T.ink3, textAlign: 'right' }}>{time}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          <div id="tour-messages-input" style={{ padding: '14px 20px', borderTop: `1px solid ${T.line}`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(255,255,255,0.60)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                placeholder="Type a message..."
                disabled={!ready}
                style={{ flex: 1, background: T.surface2, border: '1px solid rgba(0,0,0,0.10)', borderRadius: '10px', color: T.ink, padding: '11px 16px', fontSize: 14, outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif", opacity: ready ? 1 : 0.45, cursor: ready ? 'text' : 'not-allowed' }}
              />
              <button
                onClick={sendMessage}
                disabled={!ready}
                style={{ background: T.accent, color: '#FFFFFF', border: 'none', cursor: ready ? 'pointer' : 'not-allowed', borderRadius: '10px', padding: '11px 22px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '.08em', flexShrink: 0, opacity: ready ? 1 : 0.45 }}
              >
                SEND
              </button>
            </div>
            {sendError && <div style={{ color: '#EF4444', fontSize: 12, fontFamily: "'Hanken Grotesk', sans-serif" }}>{sendError}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPageInner />
    </Suspense>
  )
}
