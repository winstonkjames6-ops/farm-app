'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

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

type Message = {
  id: string
  sender_id: string
  body: string
  sent_at: string
}

function MessagesViewInner() {
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink }}>Messages</div>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginTop: '4px' }}>No conversation selected.</div>
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
      <div style={{ padding: '32px' }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'calc(100vh - 160px)' }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '999px', background: T.cyanLight, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.cyan }}>
              {otherInitials || '?'}
            </div>
            <div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink }}>{otherName || '…'}</div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', padding: '16px 24px' }}>
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMine ? T.cyan : T.card,
                    border: isMine ? 'none' : `1px solid ${T.border}`,
                    color: isMine ? '#FFFFFF' : T.ink,
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '14px',
                    maxWidth: '72%',
                  }}>
                    {msg.body}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px 24px', borderTop: `1px solid ${T.border}`, background: T.card, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                placeholder={`Message ${otherName || '…'}...`}
                style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '999px', padding: '12px 20px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", outline: 'none' }}
              />
              <button
                onClick={sendMessage}
                style={{ width: 44, height: 44, borderRadius: '999px', flexShrink: 0, background: T.cyan, color: '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            {sendError && <div style={{ color: '#EF4444', fontSize: 12, fontFamily: "'Hanken Grotesk', sans-serif" }}>{sendError}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TrainerMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesViewInner />
    </Suspense>
  )
}
