'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_MESSAGES = [
  {
    id: 1,
    parentName: 'Sarah Williams',
    parentInitials: 'SW',
    childName: 'Ethan Williams',
    sport: 'Soccer',
    lastMessage: "Will Ethan need to bring any equipment to Saturday's session?",
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    parentName: 'David Chen',
    parentInitials: 'DC',
    childName: 'Maya Chen',
    sport: 'Tennis',
    lastMessage: 'Thanks so much — Maya was so excited after the last session!',
    time: '1h ago',
    unread: false,
  },
  {
    id: 3,
    parentName: 'Lisa Blake',
    parentInitials: 'LB',
    childName: 'Jordan Blake',
    sport: 'Basketball',
    lastMessage: 'Can we move Tuesday to Wednesday this week?',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 4,
    parentName: 'Marcus Webb',
    parentInitials: 'MW',
    childName: 'Darius Webb',
    sport: 'Soccer',
    lastMessage: 'Booked — looking forward to it.',
    time: '2d ago',
    unread: false,
  },
]

// ── Design tokens ──────────────────────────────────────────────────────────────

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

// ── MessagesView ───────────────────────────────────────────────────────────────

function MessagesView() {
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const unreadCount = MOCK_MESSAGES.filter(m => m.unread).length
  const activeMessage = MOCK_MESSAGES.find(m => m.id === activeThread)

  if (activeThread !== null && activeMessage) {
    const mockConversation = [
      { from: 'parent', text: `Hi! Quick question about ${activeMessage.childName}'s upcoming session.` },
      { from: 'trainer', text: "Of course! Happy to help. What's on your mind?" },
      { from: 'parent', text: activeMessage.lastMessage },
    ]
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div style={{ padding: '32px' }}>
          <button
            onClick={() => setActiveThread(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, textAlign: 'left', padding: '0 0 16px 0', minHeight: '44px' }}
          >
            ← Messages
          </button>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '999px', background: T.cyanLight, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.cyan }}>
                  {activeMessage.parentInitials}
                </div>
                <div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink }}>{activeMessage.parentName}</div>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{activeMessage.childName} · {activeMessage.sport}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '200px', overflowY: 'auto', padding: '16px 0' }}>
                {mockConversation.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'trainer' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ padding: '12px 16px', borderRadius: msg.from === 'trainer' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.from === 'trainer' ? T.cyan : T.card, border: msg.from === 'trainer' ? 'none' : `1px solid ${T.border}`, color: msg.from === 'trainer' ? '#FFFFFF' : T.ink, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', maxWidth: '72%' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '16px 24px', borderTop: `1px solid ${T.border}`, background: T.card }}>
              <input
                type="text"
                placeholder={`Message ${activeMessage.parentName}...`}
                style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '999px', padding: '12px 20px', fontSize: '16px', fontFamily: "'Hanken Grotesk', sans-serif", outline: 'none' }}
              />
              <button style={{ width: 44, height: 44, borderRadius: '999px', flexShrink: 0, background: T.cyan, color: '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
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
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: T.ink }}>Messages</div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink2, marginTop: '4px' }}>{unreadCount} unread</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {MOCK_MESSAGES.map((message) => (
            <div
              key={message.id}
              onClick={() => setActiveThread(message.id)}
              style={{ background: T.card, border: `1px solid ${message.unread ? 'rgba(0,188,200,0.20)' : T.border}`, borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '999px', background: T.cyanLight, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: T.cyan }}>
                {message.parentInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: T.ink, marginBottom: '2px' }}>{message.parentName}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginBottom: '4px' }}>{message.childName} · {message.sport}</div>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {message.lastMessage}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{message.time}</span>
                {message.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.cyan }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerMessagesPage() {
  return <MessagesView />
}
