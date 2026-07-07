'use client'

import { useState, useEffect } from 'react'
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

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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

export default function MessagesPage() {
  const [trainerName, setTrainerName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [parentId, setParentId] = useState<string | null>(null)
  const [hasTrainer, setHasTrainer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Fetch athlete row for parent_id
      const { data: athlete } = await supabase
        .from('athletes')
        .select('id, parent_id')
        .eq('profile_id', user.id)
        .single()

      if (!athlete) { setLoading(false); return }

      const row = athlete as any
      const athleteParentId: string | null = row.parent_id ?? null
      setParentId(athleteParentId)

      // Most recent booking's trainer (same pattern as profile page)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('trainers!trainer_id(profile_id, profiles(name))')
        .eq('athlete_id', row.id)
        .order('session_time', { ascending: false })
        .limit(1)

      if (!bookings || bookings.length === 0) { setLoading(false); return }

      const booking = bookings[0] as any
      const trainerProfileId: string | null = booking.trainers?.profile_id ?? null
      const trainerNameVal: string = booking.trainers?.profiles?.name ?? 'Trainer'

      setTrainerName(trainerNameVal)
      setHasTrainer(true)

      if (!athleteParentId || !trainerProfileId) { setLoading(false); return }

      // Fetch the parent↔trainer thread
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, sender_id, body, sent_at')
        .or(
          `and(sender_id.eq.${athleteParentId},recipient_id.eq.${trainerProfileId}),` +
          `and(sender_id.eq.${trainerProfileId},recipient_id.eq.${athleteParentId})`
        )
        .order('sent_at', { ascending: true })

      if (msgs) setMessages(msgs as Message[])
      setLoading(false)
    }
    load()
  }, [])

  const trainerInitials = trainerName ? getInitials(trainerName) : '?'

  if (loading) {
    return (
      <div style={{ padding: '32px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink }}>Messages</div>
      </div>
    )
  }

  if (!hasTrainer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div style={{ padding: '32px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink, marginBottom: '4px' }}>Messages</div>
          <div style={{ ...cardStyle, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: T.ink3, marginBottom: '6px' }}>No trainer yet</div>
            <div style={{ fontSize: '12px', color: T.ink3 }}>Messages will appear here once your parent books a session</div>
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
        <div style={{ ...cardStyle, height: 'calc(100vh - 140px)' }}>

          {/* Thread header */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <Avatar initials={trainerInitials} size={38} />
            <div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: 15, color: T.ink }}>{trainerName}</div>
              <div style={{ fontSize: 12, color: T.ink3 }}>Trainer</div>
            </div>
          </div>

          {/* Message bubbles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: T.ink3, fontSize: 13, paddingTop: '16px' }}>
                No messages yet
              </div>
            ) : (
              messages.map((msg, i) => {
                const isParent = msg.sender_id === parentId
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    style={{ display: 'flex', justifyContent: isParent ? 'flex-end' : 'flex-start' }}
                  >
                    <div style={{
                      maxWidth: '66%', padding: '11px 16px',
                      background: isParent ? T.accent : T.surface2,
                      color: isParent ? '#FFFFFF' : T.ink,
                      borderRadius: isParent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: 14, lineHeight: 1.55,
                      fontWeight: isParent ? 500 : 400,
                    }}>
                      <div style={{ minHeight: '1em' }}>{msg.body}</div>
                      <div style={{ fontSize: 11, marginTop: 4, color: isParent ? 'rgba(255,255,255,0.65)' : T.ink3, textAlign: 'right' }}>
                        {formatTime(msg.sent_at)}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>

          {/* Read-only notice */}
          <div style={{ background: 'rgba(0,188,200,0.06)', padding: '8px 20px', fontSize: 11, color: T.ink3, textAlign: 'center', flexShrink: 0 }}>
            Messaging managed by your parent account
          </div>

        </div>
      </div>
    </motion.div>
  )
}
