'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DiscoverFeed from '@/components/DiscoverFeed'
import SavedPosts from '@/components/SavedPosts'
import DraftPosts from '@/components/DraftPosts'
import { T } from '@/lib/theme'

// ── Types ──────────────────────────────────────────────────────────────────────

type TabKey = 'discover' | 'saved' | 'drafts'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'discover', label: 'Discover' },
  { key: 'saved', label: 'Saved' },
  { key: 'drafts', label: 'Drafts' },
]

// ── Tab pills ──────────────────────────────────────────────────────────────────

function TabPills({ active, onSelect }: { active: TabKey; onSelect: (t: TabKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {TABS.map(({ key, label }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              padding: '8px 16px',
              borderRadius: T.radius.full,
              background: isActive ? T.cyan : '#FFFFFF',
              border: `1px solid ${isActive ? T.cyan : T.border}`,
              color: isActive ? '#FFFFFF' : T.ink2,
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              minHeight: '40px',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

function DiscoverPageInner() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab: TabKey = tabParam === 'saved' ? 'saved' : tabParam === 'drafts' ? 'drafts' : 'discover'
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  return (
    <div style={{ background: T.bg }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 24px 0' }}>
        <TabPills active={activeTab} onSelect={setActiveTab} />
      </div>
      {activeTab === 'discover' ? <DiscoverFeed /> : activeTab === 'saved' ? <SavedPosts /> : <DraftPosts />}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <DiscoverPageInner />
    </Suspense>
  )
}
