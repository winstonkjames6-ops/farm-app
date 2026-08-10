'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

import { T } from '@/lib/theme'
import { Card } from '@/components/shared/Card'

const cardStyle: React.CSSProperties = {
  padding: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

type Message = {
  id: string
  sender_id: string
  body: string
  sent_at: string
  read_at: string | null
}

type ConversationThread = {
  otherId: string
  otherName: string
  lastBody: string
  lastSentAt: string
}

type MinorTrainerThread = {
  trainerId: string
  trainerName: string
  lastBody: string
  lastSentAt: string
}

type MinorAthleteGroup = {
  athleteId: string
  athleteName: string
  threads: MinorTrainerThread[]
}

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dateSeparatorLabel(iso: string): string {
  const msgKey = dayKey(iso)
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  if (msgKey === todayKey) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yestKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`
  if (msgKey === yestKey) return 'Yesterday'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function onlineStatus(lastActive: string | null): string {
  if (!lastActive) return ''
  const diff = Math.floor((Date.now() - new Date(lastActive).getTime()) / 1000)
  if (diff < 120) return 'Online'
  if (diff < 3600) return `Last seen ${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'Last seen yesterday'
  return `Last seen ${Math.floor(diff / 86400)}d ago`
}

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: T.radius.full, flexShrink: 0,
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
  const router = useRouter()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('')
  const [otherLastActive, setOtherLastActive] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputVal, setInputVal] = useState('')
  const [sendError, setSendError] = useState('')
  const [ready, setReady] = useState(false)
  const [threads, setThreads] = useState<ConversationThread[]>([])
  const [inboxLoading, setInboxLoading] = useState(false)
  const [minorAthleteGroups, setMinorAthleteGroups] = useState<MinorAthleteGroup[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Heartbeat: keep own last_active fresh while thread is open
  useEffect(() => {
    if (!withId) return
    const supabase = createClient()
    async function beat() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ last_active: new Date().toISOString() }).eq('id', user.id)
    }
    beat()
    const id = setInterval(beat, 60000)
    return () => clearInterval(id)
  }, [withId])

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
            const readAt = new Date().toISOString()
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev
              return [...prev, { ...row, read_at: readAt }]
            })
            supabase.from('messages').update({ read_at: readAt }).eq('id', row.id)
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
        supabase.from('profiles').select('name, last_active').eq('id', withId).single(),
        supabase
          .from('messages')
          .select('id, sender_id, body, sent_at, read_at')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${withId}),and(sender_id.eq.${withId},recipient_id.eq.${user.id})`)
          .order('sent_at', { ascending: true }),
      ])
      if (profile) {
        setOtherName(profile.name)
        setOtherLastActive((profile as any).last_active ?? null)
      }
      if (msgs) {
        const readNow = new Date().toISOString()
        const unreadIds = (msgs as Message[])
          .filter((m) => m.sender_id === withId && m.read_at === null)
          .map((m) => m.id)
        if (unreadIds.length > 0) {
          supabase.from('messages').update({ read_at: readNow }).in('id', unreadIds)
        }
        setMessages((msgs as Message[]).map((m) => unreadIds.includes(m.id) ? { ...m, read_at: readNow } : m))
      }
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

  // Read-only oversight: minor athletes' trainer conversations. Separate
  // effect/state from the parent's own inbox above — RLS ("parents can view
  // their minor athletes' trainer messages") already restricts this to
  // exactly athlete<->trainer rows for the parent's own minor athletes, so no
  // extra client-side filtering is needed beyond grouping for display.
  useEffect(() => {
    if (withId) return
    const supabase = createClient()
    async function loadMinorAthleteThreads() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: minors } = await supabase
        .from('athletes')
        .select('id, name, profile_id')
        .eq('parent_id', user.id)
        .eq('is_minor', true)
        .not('profile_id', 'is', null)

      const athleteList = (minors ?? []) as { id: string; name: string; profile_id: string }[]
      if (athleteList.length === 0) { setMinorAthleteGroups([]); return }

      const orClause = athleteList.map((a) => `sender_id.eq.${a.profile_id},recipient_id.eq.${a.profile_id}`).join(',')
      const { data: minorMsgs } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, body, sent_at')
        .or(orClause)
        .order('sent_at', { ascending: false })

      if (!minorMsgs || minorMsgs.length === 0) { setMinorAthleteGroups([]); return }

      const athleteByProfileId = new Map(athleteList.map((a) => [a.profile_id, a]))

      // One entry per (athlete, trainer) pair, keeping only the most recent
      // message per pair (results are already newest-first).
      const pairs = new Map<string, { athleteProfileId: string; trainerId: string; lastBody: string; lastSentAt: string }>()
      for (const msg of minorMsgs) {
        const athleteProfileId = athleteByProfileId.has(msg.sender_id) ? msg.sender_id : msg.recipient_id
        const trainerId = athleteProfileId === msg.sender_id ? msg.recipient_id : msg.sender_id
        const key = `${athleteProfileId}:${trainerId}`
        if (!pairs.has(key)) {
          pairs.set(key, { athleteProfileId, trainerId, lastBody: msg.body, lastSentAt: msg.sent_at })
        }
      }

      const trainerIds = Array.from(new Set(Array.from(pairs.values()).map((p) => p.trainerId)))
      const { data: trainerProfiles } = await supabase.from('profiles').select('id, name').in('id', trainerIds)
      const trainerNameMap = new Map<string, string>()
      if (trainerProfiles) trainerProfiles.forEach((p: { id: string; name: string }) => trainerNameMap.set(p.id, p.name))

      const groups = new Map<string, MinorAthleteGroup>()
      for (const pair of pairs.values()) {
        const athlete = athleteByProfileId.get(pair.athleteProfileId)
        if (!athlete) continue
        if (!groups.has(athlete.id)) {
          groups.set(athlete.id, { athleteId: athlete.id, athleteName: athlete.name, threads: [] })
        }
        groups.get(athlete.id)!.threads.push({
          trainerId: pair.trainerId,
          trainerName: trainerNameMap.get(pair.trainerId) ?? 'Unknown',
          lastBody: pair.lastBody,
          lastSentAt: pair.lastSentAt,
        })
      }

      setMinorAthleteGroups(Array.from(groups.values()))
    }
    loadMinorAthleteThreads()
  }, [withId])

  async function sendMessage() {
    if (!inputVal.trim() || !withId || !currentUserId) return
    setSendError('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: currentUserId, recipient_id: withId, body: inputVal.trim() })
      .select('id, sender_id, body, sent_at, read_at')
      .single()
    if (error) {
      setSendError('Failed to send. Try again.')
      return
    }
    setMessages((prev) => [...prev, data as Message])
    setInputVal('')
  }

  const otherInitials = otherName.split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()
  const statusText = onlineStatus(otherLastActive)

  if (!withId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div style={{ padding: '32px', color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: T.fontSize.xl, color: T.ink, marginBottom: 20 }}>Messages</div>
          <Card style={cardStyle}>
            {inboxLoading ? (
              <div style={{ padding: '32px', color: T.ink3, fontSize: T.fontSize.md }}>Loading…</div>
            ) : threads.length === 0 ? (
              <div style={{ padding: '32px', color: T.ink3, fontSize: T.fontSize.md }}>No messages yet.</div>
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
                      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: T.fontSize.md, color: T.ink }}>{thread.otherName}</div>
                      <div style={{ fontSize: T.fontSize.sm, color: T.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.lastBody}</div>
                    </div>
                    <div style={{ fontSize: T.fontSize.xs, color: T.ink3, flexShrink: 0 }}>{relativeTime(thread.lastSentAt)}</div>
                  </a>
                )
              })
            )}
          </Card>

          {minorAthleteGroups.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: T.fontSize.lg, color: T.ink, marginBottom: 4 }}>
                Your Athletes&apos; Trainer Messages
              </div>
              <div style={{ fontSize: T.fontSize.sm, color: T.ink3, marginBottom: 16 }}>
                Read-only oversight — you&apos;re viewing your minor athlete&apos;s conversations, not replying as them.
              </div>
              {minorAthleteGroups.map((group) => (
                <div key={group.athleteId} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: T.fontSize.xs, fontWeight: 700, color: T.ink3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {group.athleteName}
                  </div>
                  <Card style={cardStyle}>
                    {group.threads.map((thread, i) => {
                      const initials = thread.trainerName.split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()
                      return (
                        <div
                          key={thread.trainerId}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                            borderBottom: i < group.threads.length - 1 ? `1px solid ${T.line}` : 'none',
                          }}
                        >
                          <Avatar initials={initials || '?'} size={42} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: T.fontSize.md, color: T.ink }}>
                              {group.athleteName}&apos;s messages with {thread.trainerName}
                            </div>
                            <div style={{ fontSize: T.fontSize.sm, color: T.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.lastBody}</div>
                          </div>
                          <div style={{ fontSize: T.fontSize.xs, color: T.ink3, flexShrink: 0 }}>{relativeTime(thread.lastSentAt)}</div>
                        </div>
                      )
                    })}
                  </Card>
                </div>
              ))}
            </div>
          )}
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
        <Card style={{ ...cardStyle, height: 'calc(100vh - 120px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <button
              onClick={() => router.push('/dashboard/messages')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: T.ink3, flexShrink: 0 }}
              aria-label="Back to conversations"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <Avatar initials={otherInitials || '?'} size={38} />
            <div>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: T.fontSize.sm, color: T.ink }}>{otherName || '…'}</div>
              {statusText && (
                <div style={{ fontSize: T.fontSize.xs, color: statusText === 'Online' ? T.cyan : T.ink3, marginTop: 1 }}>
                  {statusText}
                </div>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {(() => {
              const items: React.ReactNode[] = []
              let lastKey = ''
              messages.forEach((msg, i) => {
                const key = dayKey(msg.sent_at)
                if (key !== lastKey) {
                  lastKey = key
                  items.push(
                    <div key={`sep-${key}`} style={{ textAlign: 'center', margin: '2px 0' }}>
                      <span style={{ fontSize: T.fontSize.xs, color: T.ink3, background: 'rgba(0,0,0,0.05)', borderRadius: T.radius.full, padding: '3px 10px' }}>
                        {dateSeparatorLabel(msg.sent_at)}
                      </span>
                    </div>
                  )
                }
                const isMine = msg.sender_id === currentUserId
                const time = new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                items.push(
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}
                  >
                    <div style={{
                      maxWidth: '66%', padding: '11px 16px',
                      background: isMine ? T.cyan : T.surface2,
                      color: isMine ? '#FFFFFF' : T.ink,
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: T.fontSize.md, lineHeight: 1.55,
                      fontWeight: isMine ? 500 : 400,
                    }}>
                      <div style={{ minHeight: '1em' }}>{msg.body}</div>
                      <div style={{ fontSize: T.fontSize.xs, marginTop: 4, color: isMine ? 'rgba(255,255,255,0.65)' : T.ink3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
                        <span>{time}</span>
                        {isMine && (
                          msg.read_at ? (
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                              <path d="M1 5 L4 8 L9 1" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 5 L8 8 L13 1" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                              <path d="M1 5 L4 8 L11 1" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
              return items
            })()}
            <div ref={bottomRef} />
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
                style={{ flex: 1, background: T.surface2, border: '1px solid rgba(0,0,0,0.10)', borderRadius: T.radius.md, color: T.ink, padding: '11px 16px', fontSize: T.fontSize.md, outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif", opacity: ready ? 1 : 0.45, cursor: ready ? 'text' : 'not-allowed' }}
              />
              <button
                onClick={sendMessage}
                disabled={!ready}
                style={{ background: T.cyan, color: '#FFFFFF', border: 'none', cursor: ready ? 'pointer' : 'not-allowed', borderRadius: T.radius.md, padding: '11px 22px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: T.fontSize.md, letterSpacing: '.08em', flexShrink: 0, opacity: ready ? 1 : 0.45 }}
              >
                SEND
              </button>
            </div>
            {sendError && <div style={{ color: '#EF4444', fontSize: T.fontSize.xs, fontFamily: "'Hanken Grotesk', sans-serif" }}>{sendError}</div>}
          </div>
        </Card>
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
