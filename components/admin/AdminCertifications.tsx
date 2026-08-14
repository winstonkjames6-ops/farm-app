'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { Card } from '@/components/shared/Card'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

type TrainerCertification = {
  id: string
  name: string
  org: string | null
  year: string | null
}

type Trainer = {
  id: string
  name: string
  email: string
  bio: string | null
  certifications: TrainerCertification[]
  yearsExperience: number | null
  docUrl: string | null
}

export default function AdminCertifications({ initialTrainers }: { initialTrainers: Trainer[] }) {
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function decide(trainerId: string, status: 'approved' | 'rejected') {
    const note = (notes[trainerId] ?? '').trim()
    if (status === 'rejected' && !note) {
      setErrors((prev) => ({ ...prev, [trainerId]: 'A reason is required to reject.' }))
      return
    }
    setErrors((prev) => ({ ...prev, [trainerId]: '' }))
    setPendingId(trainerId)

    const supabase = createClient()
    const { error } = await supabase
      .from('trainers')
      .update({ certification_status: status, certification_notes: note || null })
      .eq('id', trainerId)

    setPendingId(null)
    if (error) {
      setErrors((prev) => ({ ...prev, [trainerId]: error.message }))
      return
    }
    setTrainers((prev) => prev.filter((t) => t.id !== trainerId))
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: hanken, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <h1 style={{
            fontFamily: barlow, fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)',
            letterSpacing: '0em', textTransform: 'uppercase', margin: 0, color: T.ink, lineHeight: 0.98,
          }}>
            Certifications
          </h1>
          <Link
            href="/dashboard/admin/reports"
            style={{
              flexShrink: 0,
              fontFamily: hanken, fontWeight: 600, fontSize: T.fontSize.sm, color: T.ink2, textDecoration: 'none',
              border: `1px solid ${T.line}`, borderRadius: T.radius.full, padding: '8px 16px',
            }}
          >
            ← Reports
          </Link>
        </div>

        {trainers.length === 0 ? (
          <Card style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: hanken, fontSize: T.fontSize.md, color: T.ink3, margin: 0 }}>No pending certification requests</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trainers.map((t) => (
              <Card key={t.id}>
                <p style={{ fontFamily: hanken, fontSize: T.fontSize.sm, color: T.ink, margin: '0 0 4px', fontWeight: 700 }}>
                  {t.name}
                </p>
                <p style={{ fontFamily: hanken, fontSize: T.fontSize.sm, color: T.ink2, margin: '0 0 12px' }}>
                  {t.email}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', fontSize: T.fontSize.sm, color: T.ink2, lineHeight: 1.5 }}>
                  <span><strong style={{ color: T.ink }}>Years of experience:</strong> {t.yearsExperience ?? 'Not provided'}</span>
                  {t.certifications.length === 0 ? (
                    <span><strong style={{ color: T.ink }}>Certifications:</strong> Not provided</span>
                  ) : (
                    <div>
                      <strong style={{ color: T.ink }}>Certifications:</strong>
                      <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
                        {t.certifications.map((c) => (
                          <li key={c.id}>{[c.name, c.org, c.year].filter(Boolean).join(' · ')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {t.bio && <span><strong style={{ color: T.ink }}>Bio:</strong> {t.bio}</span>}
                </div>

                {t.docUrl ? (
                  <a
                    href={t.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block', marginBottom: '16px',
                      fontFamily: hanken, fontWeight: 600, fontSize: T.fontSize.sm, color: T.cyan, textDecoration: 'none',
                    }}
                  >
                    View verification document →
                  </a>
                ) : (
                  <p style={{ fontFamily: hanken, fontSize: T.fontSize.sm, color: T.ink3, margin: '0 0 16px', fontStyle: 'italic' }}>
                    No document uploaded
                  </p>
                )}

                <input
                  type="text"
                  placeholder="Notes (required to reject)"
                  value={notes[t.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  style={{
                    width: '100%', height: '38px', borderRadius: T.radius.md, border: `1px solid ${T.line}`,
                    padding: '0 12px', fontSize: T.fontSize.sm, fontFamily: hanken, outline: 'none',
                    boxSizing: 'border-box', color: T.ink, background: T.bg, marginBottom: '10px',
                  }}
                />

                {errors[t.id] && (
                  <p style={{ fontFamily: hanken, fontSize: T.fontSize.xs, color: T.danger, margin: '0 0 10px' }}>
                    {errors[t.id]}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={pendingId === t.id}
                    onClick={() => decide(t.id, 'approved')}
                    style={{
                      height: '36px', padding: '0 18px', borderRadius: T.radius.full, border: 'none',
                      background: T.cyan, color: '#FFFFFF',
                      fontFamily: hanken, fontWeight: 700, fontSize: T.fontSize.sm,
                      cursor: pendingId === t.id ? 'not-allowed' : 'pointer',
                      opacity: pendingId === t.id ? 0.6 : 1,
                    }}
                  >
                    {pendingId === t.id ? 'Working…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={pendingId === t.id}
                    onClick={() => decide(t.id, 'rejected')}
                    style={{
                      height: '36px', padding: '0 18px', borderRadius: T.radius.full, border: `1px solid ${T.danger}`,
                      background: 'transparent', color: T.danger,
                      fontFamily: hanken, fontWeight: 700, fontSize: T.fontSize.sm,
                      cursor: pendingId === t.id ? 'not-allowed' : 'pointer',
                      opacity: pendingId === t.id ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
