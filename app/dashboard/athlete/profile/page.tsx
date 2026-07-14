'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

import { T } from '@/lib/theme'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { AppearanceSection } from '@/components/profile/AppearanceSection'
import { ActivityList } from '@/components/profile/ActivityList'
import { getProfileCardTokens } from '@/components/profile/theme'
import type { ActivityItem, BackgroundMode, ThemePreference } from '@/components/profile/types'

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function computeAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

interface BookingRow {
  id: string
  session_time: string
  status: string
  trainerName: string | null
  specialty: string | null
}

interface MessageRow {
  id: string
  body: string
  sent_at: string
  senderName: string | null
}

const ATHLETE_TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'trainer', label: 'Trainer' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [sport, setSport] = useState('')
  const [dob, setDob] = useState<string | null>(null)
  const [skillLevel, setSkillLevel] = useState<string | null>(null)
  const [position, setPosition] = useState<string | null>(null)
  const [parentName, setParentName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>('dark')
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('full')
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [activeTab, setActiveTab] = useState('activity')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data: athlete, error: athleteErr } = await supabase
        .from('athletes')
        .select('id, name, dob, sport, skill_level, position, goals, parent_id')
        .eq('profile_id', user.id)
        .single()

      if (athleteErr || !athlete) { setLoading(false); return }

      const row = athlete as any
      setName(row.name ?? '')
      setSport(row.sport ?? '')
      setDob(row.dob ?? null)
      setSkillLevel(row.skill_level ?? null)
      setPosition(row.position ?? null)

      const { data: ownProfile } = await supabase
        .from('profiles')
        .select('avatar_url, banner_image_url, verified, theme_preference, background_mode')
        .eq('id', user.id)
        .single()
      if (ownProfile) {
        setAvatarUrl((ownProfile as any).avatar_url ?? null)
        setBannerImageUrl((ownProfile as any).banner_image_url ?? null)
        setVerified((ownProfile as any).verified ?? false)
        setThemePreference(((ownProfile as any).theme_preference as ThemePreference) ?? 'dark')
        setBackgroundMode(((ownProfile as any).background_mode as BackgroundMode) ?? 'full')
      }

      if (row.parent_id) {
        const { data: parentProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', row.parent_id)
          .single()
        if (parentProfile) setParentName((parentProfile as any).name ?? null)
      }

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, session_time, status, trainers!trainer_id(specialty, profiles(name))')
        .eq('athlete_id', row.id)
        .order('session_time', { ascending: false })
        .limit(20)

      setBookings(
        (bookingData ?? []).map((b: any) => ({
          id: b.id,
          session_time: b.session_time,
          status: b.status,
          trainerName: b.trainers?.profiles?.name ?? null,
          specialty: b.trainers?.specialty ?? null,
        }))
      )

      const { data: messageData } = await supabase
        .from('messages')
        .select('id, sender_id, body, sent_at')
        .eq('recipient_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10)

      const senderIds = Array.from(new Set((messageData ?? []).map((m) => m.sender_id)))
      let senderNames: Record<string, string> = {}
      if (senderIds.length > 0) {
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', senderIds)
        senderNames = Object.fromEntries((senderProfiles ?? []).map((p) => [p.id, p.name]))
      }

      setMessages(
        (messageData ?? []).map((m) => ({
          id: m.id,
          body: m.body,
          sent_at: m.sent_at,
          senderName: senderNames[m.sender_id] ?? null,
        }))
      )

      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveAppearance(updates: { theme_preference?: ThemePreference; background_mode?: BackgroundMode }) {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
    if (error) throw new Error(error.message)
    if (updates.theme_preference) setThemePreference(updates.theme_preference)
    if (updates.background_mode) setBackgroundMode(updates.background_mode)
  }

  const initials = name ? getInitials(name) : '?'
  const age = dob ? computeAge(dob) : null
  const isMinor = age !== null && age < 18

  const sessionCount = bookings.length
  const sinceLabel = bookings.length > 0
    ? new Date(bookings[bookings.length - 1].session_time).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  const cardTokens = getProfileCardTokens(themePreference)
  const currentTrainer = bookings[0] ?? null

  const activityItems: ActivityItem[] = [
    ...bookings.map((b) => ({
      id: `b-${b.id}`,
      title: `Session with ${b.trainerName ?? 'trainer'}`,
      subtitle: [b.specialty, b.status].filter(Boolean).join(' · '),
      timestamp: b.session_time,
    })),
    ...messages.map((m) => ({
      id: `m-${m.id}`,
      title: `Message from ${m.senderName ?? 'trainer'}`,
      subtitle: m.body.slice(0, 64),
      timestamp: m.sent_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

  const sessionItems: ActivityItem[] = bookings.map((b) => ({
    id: `s-${b.id}`,
    title: `Session with ${b.trainerName ?? 'trainer'}`,
    subtitle: b.specialty ?? undefined,
    meta: b.status,
    timestamp: b.session_time,
  }))

  let tabContent: React.ReactNode
  if (activeTab === 'sessions') {
    tabContent = <ActivityList items={sessionItems} tokens={cardTokens} emptyLabel="No sessions booked yet" />
  } else if (activeTab === 'trainer') {
    tabContent = currentTrainer ? (
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '999px', flexShrink: 0,
            background: cardTokens.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: cardTokens.cyan,
          }}>{currentTrainer.trainerName ? getInitials(currentTrainer.trainerName) : '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: cardTokens.ink }}>
              {currentTrainer.trainerName ?? 'Trainer'}
            </div>
            <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: cardTokens.ink3, marginTop: '2px' }}>
              {currentTrainer.specialty ? `${currentTrainer.specialty} Trainer` : 'Trainer'}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: cardTokens.ink3 }}>
        No trainer yet
      </div>
    )
  } else {
    tabContent = <ActivityList items={activityItems} tokens={cardTokens} emptyLabel="No recent activity" />
  }

  return (
    <div style={{ color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 80px' }}>

        <ProfileCard
          themePreference={themePreference}
          backgroundMode={backgroundMode}
          bannerImageUrl={bannerImageUrl}
          avatarUrl={avatarUrl}
          name={name || (loading ? '' : 'Unknown')}
          verified={verified}
          verifiedLabel="Verified Athlete"
          minor={isMinor}
          metaLine={[sport, position, skillLevel].filter(Boolean).join(' · ')}
          stats={[
            { value: String(sessionCount), label: 'Sessions' },
            { value: sinceLabel, label: 'Since' },
          ]}
          contactRows={[]}
          tabs={ATHLETE_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabContent={tabContent}
          onEditProfile={() => document.getElementById('athlete-appearance')?.scrollIntoView({ behavior: 'smooth' })}
          onOpenSettings={() => document.getElementById('athlete-appearance')?.scrollIntoView({ behavior: 'smooth' })}
          profileLabel="My profile"
        />

        <div id="athlete-appearance" style={{ marginTop: '16px', scrollMarginTop: '24px' }}>
          <AppearanceSection
            themePreference={themePreference}
            backgroundMode={backgroundMode}
            hasBannerImage={!!bannerImageUrl}
            onSave={handleSaveAppearance}
          />
        </div>

        <div style={{ marginTop: '16px', fontSize: '12px', color: T.ink3, textAlign: 'center', lineHeight: 1.6 }}>
          Profile managed by your parent · Contact {parentName || 'your parent'} to make changes
        </div>

      </div>
    </div>
  )
}
