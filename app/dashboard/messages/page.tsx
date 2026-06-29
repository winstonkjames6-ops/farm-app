'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const T = {
  bg: '#F8F8F6',
  surface: '#FFFFFF',
  surface2: '#F0EFEB',
  border: 'rgba(0,0,0,0.08)',
  accent: '#00BCC8',
  ink: '#1A1A1A',
  ink2: '#4A4A4A',
  ink3: '#9A9A9A',
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

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(1)
  const [mobileShowPanel, setMobileShowPanel] = useState(false)
  const [inputVal, setInputVal] = useState('')

  const active = CONVERSATIONS.find((c) => c.id === activeId)!

  function selectConversation(id: number) {
    setActiveId(id)
    setMobileShowPanel(true)
  }

  return (
    <div
      style={{
        background: T.bg,
        color: T.ink,
        height: 'calc(100vh - 52px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .msg-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          height: 100%;
        }
        @media (max-width: 720px) {
          .msg-grid { grid-template-columns: 1fr; }
          .msg-sidebar-hidden { display: none !important; }
          .msg-panel-hidden { display: none !important; }
          .msg-back-btn { display: block !important; }
        }
        .msg-back-btn { display: none; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="msg-grid" style={{ flex: 1, minHeight: 0 }}>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={mobileShowPanel ? 'msg-sidebar-hidden' : ''}
          style={{
            borderRight: `1px solid ${T.border}`,
            background: T.surface,
            display: 'flex', flexDirection: 'column', overflowY: 'auto',
          }}
        >
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22,
              color: T.ink, margin: 0, letterSpacing: '.06em', textTransform: 'uppercase' as const,
            }}>Messages</h1>
          </div>

          {CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '16px 20px',
                cursor: 'pointer', border: 'none',
                borderLeft: activeId === conv.id ? `3px solid ${T.accent}` : `3px solid transparent`,
                borderBottom: `1px solid ${T.border}`,
                backgroundColor: activeId === conv.id ? T.surface2 : 'transparent',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 42, height: 42, flexShrink: 0,
                  background: T.surface2, border: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 13, color: T.accent,
                }}>{conv.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{conv.trainerName}</span>
                    <span style={{ fontSize: 11, color: T.ink3, flexShrink: 0, marginLeft: 6 }}>{conv.timestamp}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 13, color: T.ink3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span style={{
                        background: T.accent, color: '#FFFFFF', fontSize: 10, fontWeight: 800,
                        width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Conversation panel */}
        <div
          className={!mobileShowPanel ? 'msg-panel-hidden' : ''}
          style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}
        >
          {/* Panel header */}
          <div style={{
            padding: '14px 24px', borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
            background: T.surface,
          }}>
            <button
              onClick={() => setMobileShowPanel(false)}
              className="msg-back-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: T.ink2, padding: '4px 8px', fontSize: 18, lineHeight: 1,
              }}
            >←</button>
            <div style={{
              width: 38, height: 38, flexShrink: 0, background: T.surface2,
              border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 12, color: T.accent,
            }}>{active.initials}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{active.trainerName}</div>
              <div style={{ fontSize: 12, color: T.ink3 }}>{active.sport} Trainer</div>
            </div>
          </div>

          {/* Messages thread */}
          <motion.div
            key={activeId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              flex: 1, overflowY: 'auto', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
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
                  maxWidth: '66%',
                  padding: '11px 16px',
                  background: msg.sender === 'parent' ? T.accent : T.surface2,
                  color: msg.sender === 'parent' ? '#FFFFFF' : T.ink,
                  fontSize: 14, lineHeight: 1.55,
                  fontWeight: msg.sender === 'parent' ? 500 : 400,
                }}>
                  <div>{msg.text}</div>
                  <div style={{
                    fontSize: 11, marginTop: 5,
                    color: msg.sender === 'parent' ? 'rgba(255,255,255,0.65)' : T.ink3,
                    textAlign: 'right',
                  }}>{msg.time}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Input bar */}
          <div style={{
            padding: '14px 24px', borderTop: `1px solid ${T.border}`, flexShrink: 0,
            display: 'flex', gap: 10, alignItems: 'stretch', background: T.surface,
          }}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1, background: T.surface2, border: '1px solid rgba(0,0,0,0.10)',
                color: T.ink, padding: '11px 16px', fontSize: 14, outline: 'none',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            />
            <button style={{
              background: T.accent, color: '#FFFFFF', border: 'none', cursor: 'pointer',
              padding: '11px 22px', fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 14, letterSpacing: '.08em', flexShrink: 0,
            }}>SEND</button>
          </div>
        </div>

      </div>
    </div>
  )
}
