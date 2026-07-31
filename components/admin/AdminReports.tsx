'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

// TEMPORARY GATE — NOT A REAL PERMISSIONS SYSTEM.
// There is no admin role in this app yet. Access here is limited to a single
// hardcoded profile id (in addition to requiring role = 'trainer') as a stand-in
// until proper role-based admin access control exists.
const ADMIN_ALLOWLIST = ['d2930a19-3e35-475f-99b8-32950f4a209c']

type Report = {
  id: string
  reason: string
  createdAt: string
  reporterName: string
  postId: string | null
  postCaption: string | null
  postVideoUrl: string | null
  postThumbnailUrl: string | null
  postAuthorName: string
}

export default function AdminReports() {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setChecking(false)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isAllowed = profile?.role === 'trainer' && ADMIN_ALLOWLIST.includes(user.id)
      setAuthorized(isAllowed)
      setChecking(false)

      if (!isAllowed) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('post_reports')
        .select(`
          id,
          reason,
          created_at,
          reporter:profiles!reporter_id(name),
          post:posts!post_id(id, caption, video_url, thumbnail_url, author:profiles!author_id(name))
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[admin-reports] fetch:', error.message)
        setLoading(false)
        return
      }

      const mapped: Report[] = (data ?? []).map((row: any) => ({
        id: row.id,
        reason: row.reason,
        createdAt: row.created_at,
        reporterName: row.reporter?.name ?? 'Unknown',
        postId: row.post?.id ?? null,
        postCaption: row.post?.caption ?? null,
        postVideoUrl: row.post?.video_url ?? null,
        postThumbnailUrl: row.post?.thumbnail_url ?? null,
        postAuthorName: row.post?.author?.name ?? 'Unknown',
      }))
      setReports(mapped)
      setLoading(false)
    }

    load()
  }, [])

  async function dismissReport(reportId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('post_reports').delete().eq('id', reportId)
    if (error) {
      console.error('[admin-reports] dismiss:', error.message)
      return
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId))
  }

  if (checking) return null

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3 }}>Not authorized.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: hanken, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{
          fontFamily: barlow, fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)',
          letterSpacing: '0em', textTransform: 'uppercase', margin: '0 0 20px', color: T.ink, lineHeight: 0.98,
        }}>
          Post Reports
        </h1>

        {loading ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Loading reports&hellip;</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>No reports</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: 'flex', gap: '16px',
                  background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', padding: '16px',
                }}
              >
                {report.postVideoUrl ? (
                  <a
                    href={report.postVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flexShrink: 0, width: '96px', height: '96px', borderRadius: '10px', overflow: 'hidden', background: '#111827', display: 'block' }}
                  >
                    {report.postThumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={report.postThumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </a>
                ) : (
                  <div style={{ flexShrink: 0, width: '96px', height: '96px', borderRadius: '10px', background: T.surface2 }} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink2, margin: '0 0 4px' }}>
                    Reported by <strong style={{ color: T.ink }}>{report.reporterName}</strong>
                    {' — post by '}
                    <strong style={{ color: T.ink }}>{report.postAuthorName}</strong>
                  </p>

                  {report.postCaption && (
                    <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink3, margin: '0 0 8px', fontStyle: 'italic' }}>
                      &ldquo;{report.postCaption}&rdquo;
                    </p>
                  )}

                  <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink, margin: '0 0 8px', lineHeight: 1.4 }}>
                    {report.reason}
                  </p>

                  <p style={{ fontFamily: hanken, fontSize: '12px', color: T.ink3, margin: 0 }}>
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dismissReport(report.id)}
                  style={{
                    flexShrink: 0, alignSelf: 'flex-start',
                    height: '32px', padding: '0 14px', borderRadius: '999px',
                    border: `1px solid ${T.line}`, background: 'transparent', color: T.ink2,
                    fontFamily: hanken, fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
