'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ── Mock data ─────────────────────────────────────────────────────────────────

const SESSIONS = [
  {
    id: 1,
    trainerName: 'Marcus Rivera',
    initials: 'MR',
    sport: 'Soccer',
    date: 'Mon, Jul 7, 2025',
    time: '9:00 AM',
    duration: '60 min',
    type: 'In-Person',
    status: 'upcoming',
    price: 65,
    reviewed: false,
  },
  {
    id: 2,
    trainerName: 'Priya Nair',
    initials: 'PN',
    sport: 'Tennis',
    date: 'Sat, Jun 21, 2025',
    time: '11:00 AM',
    duration: '90 min',
    type: 'In-Person',
    status: 'completed',
    price: 112,
    reviewed: true,
  },
  {
    id: 3,
    trainerName: 'Jamal Brooks',
    initials: 'JB',
    sport: 'Basketball',
    date: 'Wed, Jun 11, 2025',
    time: '4:00 PM',
    duration: '60 min',
    type: 'Remote',
    status: 'completed',
    price: 55,
    reviewed: false,
  },
  {
    id: 4,
    trainerName: 'Sofia Delgado',
    initials: 'SD',
    sport: 'Volleyball',
    date: 'Fri, May 30, 2025',
    time: '3:00 PM',
    duration: '60 min',
    type: 'In-Person',
    status: 'cancelled',
    price: 70,
    reviewed: false,
  },
  {
    id: 5,
    trainerName: 'Kwame Asante',
    initials: 'KA',
    sport: 'Lacrosse',
    date: 'Tue, Jul 15, 2025',
    time: '8:00 AM',
    duration: '90 min',
    type: 'In-Person',
    status: 'upcoming',
    price: 95,
    reviewed: false,
  },
  {
    id: 6,
    trainerName: 'Elena Morozova',
    initials: 'EM',
    sport: 'Swimming',
    date: 'Thu, Jun 5, 2025',
    time: '6:30 PM',
    duration: '45 min',
    type: 'Remote',
    status: 'completed',
    price: 48,
    reviewed: false,
  },
]

type Tab = 'all' | 'upcoming' | 'completed' | 'cancelled'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: '#09090B',
  surface: '#111113',
  surface2: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  ink: '#FAFAFA',
  ink2: '#A1A1AA',
  ink3: '#71717A',
  yellow: '#DFE104',
  green: '#22C55E',
  red: '#EF4444',
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: 'COMPLETED', color: T.green, bg: 'rgba(34,197,94,0.12)' },
    upcoming: { label: 'UPCOMING', color: T.yellow, bg: 'rgba(223,225,4,0.12)' },
    cancelled: { label: 'CANCELLED', color: T.red, bg: 'rgba(239,68,68,0.12)' },
  }
  const c = config[status]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        background: c.bg,
        color: c.color,
        fontSize: '10px',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        letterSpacing: '0.08em',
      }}
    >
      {c.label}
    </span>
  )
}

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({ session, index }: { session: typeof SESSIONS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            background: T.surface2,
            border: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '15px',
            color: T.yellow,
            letterSpacing: '0.04em',
          }}
        >
          {session.initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: T.ink,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {session.trainerName}
            </span>
            <StatusBadge status={session.status} />
          </div>
          <div
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px',
              color: T.ink2,
              marginTop: '3px',
            }}
          >
            {session.sport}
          </div>
        </div>

        {/* Price */}
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            color: T.ink,
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
        >
          ${session.price}
        </div>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          borderTop: `1px solid ${T.border}`,
          paddingTop: '12px',
        }}
      >
        {[
          { label: 'DATE', value: session.date },
          { label: 'TIME', value: session.time },
          { label: 'DURATION', value: session.duration },
          { label: 'TYPE', value: session.type },
        ].map((m) => (
          <div key={m.label}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: T.ink3,
                marginBottom: '2px',
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '13px',
                color: T.ink2,
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Action row */}
      {(session.status === 'completed' || session.status === 'upcoming') && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {session.status === 'completed' && (
            session.reviewed ? (
              <span
                style={{
                  padding: '8px 16px',
                  background: 'rgba(34,197,94,0.10)',
                  color: T.green,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                }}
              >
                REVIEWED ✓
              </span>
            ) : (
              <Link href="/review" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    padding: '9px 18px',
                    background: 'transparent',
                    border: `1px solid ${T.yellow}`,
                    color: T.yellow,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                  }}
                >
                  LEAVE REVIEW
                </button>
              </Link>
            )
          )}

          {session.status === 'upcoming' && (
            <>
              <button
                style={{
                  padding: '9px 18px',
                  background: 'transparent',
                  border: `1px solid rgba(255,255,255,0.18)`,
                  color: T.ink3,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
              <button
                style={{
                  padding: '9px 18px',
                  background: 'transparent',
                  border: `1px solid rgba(255,255,255,0.18)`,
                  color: T.ink2,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                MESSAGE TRAINER
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        textAlign: 'center',
        padding: '64px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth="1.4">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: '16px',
          color: T.ink3,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        No cancelled sessions
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const filtered = activeTab === 'all'
    ? SESSIONS
    : SESSIONS.filter((s) => s.status === activeTab)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Back */}
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: T.ink3,
            textDecoration: 'none',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          ← Dashboard
        </Link>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(40px, 8vw, 64px)',
            color: T.ink,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            margin: '0 0 32px',
          }}
        >
          Session
          <br />
          History
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            marginBottom: '28px',
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${T.yellow}` : '2px solid transparent',
                  color: isActive ? T.yellow : T.ink3,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  transition: 'color 0.15s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Cards or empty */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            <div key={activeTab} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((session, i) => (
                <SessionCard key={session.id} session={session} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
