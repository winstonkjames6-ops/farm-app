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

  useEffect(() => {
    if (!withId) return
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
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
    }
    load()
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
      <div style={{ padding: '32px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif" }}>
        No conversation selected.
      </div>
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
                style={{ flex: 1, background: T.surface2, border: '1px solid rgba(0,0,0,0.10)', borderRadius: '10px', color: T.ink, padding: '11px 16px', fontSize: 14, outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif" }}
              />
              <button
                onClick={sendMessage}
                style={{ background: T.accent, color: '#FFFFFF', border: 'none', cursor: 'pointer', borderRadius: '10px', padding: '11px 22px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '.08em', flexShrink: 0 }}
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
