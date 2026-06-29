'use client'

import { motion } from 'framer-motion'

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_EARNINGS = {
  pendingPayout: 212,
  nextPayoutDate: 'Friday, Jun 27',
  weeklyEarned: 340,
  weeklyGoal: 500,
  allTime: 4820,
  sessionRate: 65,
  history: [
    { id: 1, parentName: 'Sarah Williams', childName: 'Ethan Williams', sport: 'Soccer',     date: 'Mon, Jun 23', amount: 65, status: 'pending' as const },
    { id: 2, parentName: 'David Chen',     childName: 'Maya Chen',      sport: 'Tennis',     date: 'Mon, Jun 23', amount: 75, status: 'pending' as const },
    { id: 3, parentName: 'Lisa Blake',     childName: 'Jordan Blake',   sport: 'Basketball', date: 'Tue, Jun 17', amount: 55, status: 'paid'    as const },
    { id: 4, parentName: 'Priya Nair',     childName: 'Anika Nair',     sport: 'Soccer',     date: 'Sat, Jun 14', amount: 65, status: 'paid'    as const },
    { id: 5, parentName: 'James Okafor',   childName: 'Kofi Okafor',    sport: 'Soccer',     date: 'Wed, Jun 11', amount: 65, status: 'paid'    as const },
  ],
}

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

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', color: '#111827', textTransform: 'uppercase', marginBottom: '12px' }}>
      {children}
    </div>
  )
}

// ── EarningsView ───────────────────────────────────────────────────────────────

function EarningsView() {
  const progress = Math.min((MOCK_EARNINGS.weeklyEarned / MOCK_EARNINGS.weeklyGoal) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Payout summary */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>Pending payout</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '36px', color: T.ink, lineHeight: 1 }}>
                ${MOCK_EARNINGS.pendingPayout}
              </div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3, marginTop: '2px' }}>
                Stripe payout {MOCK_EARNINGS.nextPayoutDate}
              </div>
            </div>
          </div>
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '16px 0' }} />
          <div style={{ display: 'flex' }}>
            {[
              { label: 'All time',   value: `$${MOCK_EARNINGS.allTime.toLocaleString()}` },
              { label: 'This week',  value: `$${MOCK_EARNINGS.weeklyEarned} / $${MOCK_EARNINGS.weeklyGoal}` },
              { label: 'Rate',       value: `$${MOCK_EARNINGS.sessionRate}/hr` },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{ flex: 1, paddingLeft: i > 0 ? '16px' : 0, paddingRight: i < arr.length - 1 ? '16px' : 0, borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '20px', color: T.ink }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly progress */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <SectionLabel>Weekly goal</SectionLabel>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ height: '6px', borderRadius: '999px', background: '#E5E7EB', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '999px', background: T.cyan }}
              />
            </div>
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink2 }}>
            ${MOCK_EARNINGS.weeklyEarned} earned of ${MOCK_EARNINGS.weeklyGoal} goal
          </div>
        </div>

        {/* Payout history */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <SectionLabel>Payout history</SectionLabel>
          <div>
            {MOCK_EARNINGS.history.map((item, i) => (
              <div key={item.id}>
                {i > 0 && <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '999px', background: T.cyanLight, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: T.cyan }}>
                    {item.parentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: T.ink, fontWeight: 500 }}>{item.childName}</div>
                    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', color: T.ink3 }}>{item.parentName}</div>
                  </div>
                  <span style={{ padding: '3px 8px', background: T.cyanLight, color: T.cyan, border: '1px solid rgba(0,188,200,0.2)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.06em', borderRadius: '6px', flexShrink: 0 }}>
                    {item.sport}
                  </span>
                  <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: T.ink3, flexShrink: 0 }}>{item.date}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: T.ink, flexShrink: 0 }}>${item.amount}</div>
                  <span style={{ padding: '4px 10px', background: item.status === 'paid' ? 'rgba(34,197,94,0.10)' : T.cyanLight, color: item.status === 'paid' ? '#16a34a' : T.cyan, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: '11px', borderRadius: '999px', flexShrink: 0 }}>
                    {item.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TrainerEarningsPage() {
  return <EarningsView />
}
