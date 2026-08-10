'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

// Superseded by the admin_roles table check in app/dashboard/admin/reports/page.tsx
// (the Server Component that renders this). Left unused rather than deleted —
// remove once the new check has been confirmed working.
// const ADMIN_ALLOWLIST = ['d2930a19-3e35-475f-99b8-32950f4a209c']

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

type CommentReport = {
  id: string
  reason: string
  createdAt: string
  reporterName: string
  commentId: string | null
  commentBody: string | null
  commentAuthorName: string
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [commentReports, setCommentReports] = useState<CommentReport[]>([])

  useEffect(() => {
    const supabase = createClient()

    async function load() {
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

      const { data: commentData, error: commentErr } = await supabase
        .from('comment_reports')
        .select(`
          id,
          reason,
          created_at,
          reporter:profiles!reporter_id(name),
          comment:comments!comment_id(id, body, author:profiles!author_id(name))
        `)
        .order('created_at', { ascending: false })

      if (commentErr) {
        console.error('[admin-reports] comment reports fetch:', commentErr.message)
        setLoading(false)
        return
      }

      const mappedComments: CommentReport[] = (commentData ?? []).map((row: any) => ({
        id: row.id,
        reason: row.reason,
        createdAt: row.created_at,
        reporterName: row.reporter?.name ?? 'Unknown',
        commentId: row.comment?.id ?? null,
        commentBody: row.comment?.body ?? null,
        commentAuthorName: row.comment?.author?.name ?? 'Unknown',
      }))
      setCommentReports(mappedComments)
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

  async function dismissCommentReport(reportId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('comment_reports').delete().eq('id', reportId)
    if (error) {
      console.error('[admin-reports] dismiss comment report:', error.message)
      return
    }
    setCommentReports((prev) => prev.filter((r) => r.id !== reportId))
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: hanken, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <h1 style={{
            fontFamily: barlow, fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)',
            letterSpacing: '0em', textTransform: 'uppercase', margin: 0, color: T.ink, lineHeight: 0.98,
          }}>
            Reports
          </h1>
          <Link
            href="/dashboard/admin/certifications"
            style={{
              flexShrink: 0,
              fontFamily: hanken, fontWeight: 600, fontSize: '13px', color: T.ink2, textDecoration: 'none',
              border: `1px solid ${T.line}`, borderRadius: '999px', padding: '8px 16px',
            }}
          >
            Certifications →
          </Link>
        </div>

        <h2 style={{
          fontFamily: barlow, fontWeight: 700, fontSize: '20px',
          textTransform: 'uppercase', margin: '0 0 16px', color: T.ink,
        }}>
          Post Reports
        </h2>

        {loading ? (
          <div style={{ background: T.cardBg, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Loading reports&hellip;</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ background: T.cardBg, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>No reports</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: 'flex', gap: '16px',
                  background: T.cardBg, border: `1px solid ${T.line}`, borderRadius: '16px', padding: '16px',
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

        <h2 style={{
          fontFamily: barlow, fontWeight: 700, fontSize: '20px',
          textTransform: 'uppercase', margin: '40px 0 16px', color: T.ink,
        }}>
          Comment Reports
        </h2>

        {loading ? (
          <div style={{ background: T.cardBg, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Loading reports&hellip;</p>
          </div>
        ) : commentReports.length === 0 ? (
          <div style={{ background: T.cardBg, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>No reports</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {commentReports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: 'flex', gap: '16px',
                  background: T.cardBg, border: `1px solid ${T.line}`, borderRadius: '16px', padding: '16px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink2, margin: '0 0 4px' }}>
                    Reported by <strong style={{ color: T.ink }}>{report.reporterName}</strong>
                    {' — comment by '}
                    <strong style={{ color: T.ink }}>{report.commentAuthorName}</strong>
                  </p>

                  {report.commentBody && (
                    <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink3, margin: '0 0 8px', fontStyle: 'italic' }}>
                      &ldquo;{report.commentBody}&rdquo;
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
                  onClick={() => dismissCommentReport(report.id)}
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
