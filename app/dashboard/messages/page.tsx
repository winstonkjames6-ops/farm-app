'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

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

type MsgSender = 'parent' | 'trainer'
type Message = { id: number; sender: MsgSender; text: string; time: string }
type Conversation = {
  id: number
  trainerName: string
  initials: string
  sport: string
  lastMessage: string
  timestamp: string
  unread: number
  messages: Message[]
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    trainerName: 'Marcus Rivera',
    initials: 'MR',
    sport: 'Soccer',
    lastMessage: 'Saturday works great — see you at 10am!',
    timestamp: '2m ago',
    unread: 1,
    messages: [
      { id: 1, sender: 'parent', text: 'Hey Marcus, is there any availability this Saturday morning?', time: '9:12 AM' },
      { id: 2, sender: 'trainer', text: 'Hi Sarah! Let me check my calendar real quick.', time: '9:14 AM' },
      { id: 3, sender: 'trainer', text: 'Yes, I have 10am and 11:30am open on Saturday. Which works better for Ethan?', time: '9:15 AM' },
      { id: 4, sender: 'parent', text: '10am is perfect. Can we do the same field as last time at Zilker Park?', time: '9:18 AM' },
      { id: 5, sender: 'trainer', text: 'Saturday works great — see you at 10am!', time: '9:20 AM' },
    ],
  },
  {
    id: 2,
    trainerName: 'Priya Nair',
    initials: 'PN',
    sport: 'Tennis',
    lastMessage: "I'll send over the drill sheet before Friday.",
    timestamp: '1hr ago',
    unread: 0,
    messages: [
      { id: 1, sender: 'parent', text: 'Hi Priya, could you send the warm-up drills you mentioned last session?', time: '8:02 AM' },
      { id: 2, sender: 'trainer', text: 'Of course! I always share those after the session recap.', time: '8:45 AM' },
      { id: 3, sender: 'trainer', text: "I'll send over the drill sheet before Friday.", time: '8:46 AM' },
    ],
  },
  {
    id: 3,
    trainerName: 'Jamal Brooks',
    initials: 'JB',
    sport: 'Basketball',
    lastMessage: 'Great session today, Ethan really locked in.',
    timestamp: 'Jun 4',
    unread: 0,
    messages: [
      { id: 1, sender: 'trainer', text: 'Great session today, Ethan really locked in on the crossover drills.', time: '5:18 PM' },
      { id: 2, sender: 'parent', text: 'He was talking about it all the way home! Can we book the same slot next week?', time: '6:02 PM' },
      { id: 3, sender: 'trainer', text: 'Absolutely. I just blocked it off. Looking forward to it.', time: '6:15 PM' },
    ],
  },
]

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
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [inputVal, setInputVal] = useState('')

  const active = CONVERSATIONS.find((c) => c.id === activeThread)

  if (activeThread !== null && active) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div style={{ padding: '32px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          <button
            onClick={() => setActiveThread(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, textAlign: 'left', padding: '0 0 16px 0', minHeight: '44px' }}
          >
            ← Messages
          </button>

          <div style={{ ...cardStyle, height: 'calc(100vh - 200px)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
              <Avatar initials={active.initials} size={38} />
              <div>
                <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: 15, color: T.ink }}>{active.trainerName}</div>
                <div style={{ fontSize: 12, color: T.ink3 }}>{active.sport} Trainer</div>
              </div>
            </div>

            <motion.div
              key={activeThread}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {active.messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  style={{ display: 'flex', justifyContent: msg.sender === 'parent' ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{
                    maxWidth: '66%', padding: '11px 16px',
                    background: msg.sender === 'parent' ? T.accent : T.surface2,
                    color: msg.sender === 'parent' ? '#FFFFFF' : T.ink,
                    borderRadius: msg.sender === 'parent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 14, lineHeight: 1.55,
                    fontWeight: msg.sender === 'parent' ? 500 : 400,
                  }}>
                    <div style={{ minHeight: '1em' }}>{msg.text}</div>
                    <div style={{ fontSize: 11, marginTop: 4, color: msg.sender === 'parent' ? 'rgba(255,255,255,0.65)' : T.ink3, textAlign: 'right' }}>{msg.time}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div id="tour-messages-input" style={{ padding: '14px 20px', borderTop: `1px solid ${T.line}`, flexShrink: 0, display: 'flex', gap: 10, alignItems: 'stretch', background: 'rgba(255,255,255,0.60)' }}>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, background: T.surface2, border: '1px solid rgba(0,0,0,0.10)', borderRadius: '10px', color: T.ink, padding: '11px 16px', fontSize: 14, outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif" }}
              />
              <button style={{ background: T.accent, color: '#FFFFFF', border: 'none', cursor: 'pointer', borderRadius: '10px', padding: '11px 22px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '.08em', flexShrink: 0 }}>SEND</button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const unreadCount = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink }}>Messages</div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginTop: '4px' }}>{unreadCount} unread</div>
        </div>

        <div id="tour-messages-list" style={{ ...cardStyle }}>
          {CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveThread(conv.id)}
              style={{ width: '100%', textAlign: 'left', padding: '16px 20px 16px 17px', cursor: 'pointer', border: 'none', background: 'none', minWidth: 0, overflow: 'hidden', borderLeft: '3px solid transparent', borderBottom: `1px solid ${T.line}`, backgroundColor: 'transparent' }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar initials={conv.initials} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: 14, color: T.ink }}>{conv.trainerName}</span>
                    <span style={{ fontSize: 11, color: T.ink3, flexShrink: 0, marginLeft: 6 }}>{conv.timestamp}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span style={{ background: T.accent, color: '#FFFFFF', fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
