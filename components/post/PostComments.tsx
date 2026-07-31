'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

const hanken = "'Hanken Grotesk', sans-serif"

// First-pass, case-insensitive substring blocklist. Not comprehensive moderation.
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'piss',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'whore', 'slut',
]

function containsBlockedWord(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED_WORDS.some((word) => lower.includes(word))
}

type Comment = {
  id: string
  authorId: string
  authorName: string
  avatarUrl: string | null
  body: string
  createdAt: string
}

export function PostComments({ postId, currentUserId }: { postId: string; currentUserId: string | null }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportStatus, setReportStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle')

  useEffect(() => {
    loadComments()
  }, [postId])

  async function loadComments() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .select('id, body, created_at, author_id, profiles!author_id(name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[post-comments] load:', error.message)
      setLoading(false)
      return
    }

    setComments(
      (data ?? []).map((row: any) => ({
        id: row.id as string,
        authorId: row.author_id as string,
        authorName: (row.profiles?.name as string) ?? 'Member',
        avatarUrl: (row.profiles?.avatar_url as string) ?? null,
        body: row.body as string,
        createdAt: row.created_at as string,
      }))
    )
    setLoading(false)
  }

  async function submitComment() {
    const trimmed = newComment.trim()
    if (!currentUserId || !trimmed) return

    if (containsBlockedWord(trimmed)) {
      setSubmitStatus('error')
      setSubmitError('This comment contains blocked content')
      return
    }

    setSubmitStatus('submitting')
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: currentUserId,
      body: trimmed,
    })

    if (error) {
      console.error('[post-comments] submit:', error.message)
      setSubmitStatus('error')
      setSubmitError('Something went wrong. Try again.')
      return
    }

    setNewComment('')
    setSubmitStatus('idle')
    setSubmitError('')
    await loadComments()
  }

  async function deleteComment(commentId: string) {
    if (!window.confirm('Delete this comment?')) return
    const supabase = createClient()
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) {
      console.error('[post-comments] delete:', error.message)
      return
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  async function submitCommentReport() {
    if (!currentUserId || !reportingId || !reportReason.trim()) return
    setReportStatus('submitting')
    const supabase = createClient()
    const { error } = await supabase.from('comment_reports').insert({
      comment_id: reportingId,
      reporter_id: currentUserId,
      reason: reportReason.trim(),
    })
    if (error) {
      console.error('[post-comments] report submit:', error.message)
      setReportStatus('error')
      return
    }
    setReportStatus('submitted')
    setTimeout(() => { setReportingId(null); setReportReason(''); setReportStatus('idle') }, 1500)
  }

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${T.line}` }}>
      {loading ? (
        <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink3, margin: 0 }}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink3, margin: '0 0 10px' }}>No comments yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          {comments.map((comment) => (
            <div key={comment.id}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: hanken, fontWeight: 600, fontSize: '13px', color: T.ink }}>{comment.authorName}</span>
                <span style={{ fontFamily: hanken, fontSize: '13px', color: T.ink2 }}>{comment.body}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                {comment.authorId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => deleteComment(comment.id)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: hanken, fontSize: '11px', fontWeight: 600, color: T.ink3 }}
                  >
                    Delete
                  </button>
                )}
                {comment.authorId !== currentUserId && currentUserId && (
                  <button
                    type="button"
                    onClick={() => { setReportingId(reportingId === comment.id ? null : comment.id); setReportReason(''); setReportStatus('idle') }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: hanken, fontSize: '11px', fontWeight: 600, color: T.ink3 }}
                  >
                    Report
                  </button>
                )}
              </div>

              {reportingId === comment.id && (
                <div style={{ marginTop: '6px' }}>
                  {reportStatus === 'submitted' ? (
                    <p style={{ fontFamily: hanken, fontSize: '12px', color: T.ink2, margin: 0 }}>Report submitted</p>
                  ) : (
                    <>
                      <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Why are you reporting this comment?"
                        required
                        style={{
                          width: '100%', minHeight: '56px', borderRadius: '8px', border: '1px solid #E5E7EB',
                          padding: '8px 10px', fontSize: '12px', fontFamily: hanken, resize: 'vertical',
                          outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
                        }}
                      />
                      {reportStatus === 'error' && (
                        <p style={{ fontFamily: hanken, fontSize: '11px', color: '#EF4444', margin: '4px 0 0' }}>
                          Something went wrong. Try again.
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={submitCommentReport}
                          disabled={!reportReason.trim() || reportStatus === 'submitting'}
                          style={{
                            height: '28px', padding: '0 12px', borderRadius: '999px', border: 'none',
                            background: T.cyan, color: '#FFFFFF', fontFamily: hanken, fontWeight: 600,
                            fontSize: '11px', cursor: 'pointer',
                            opacity: !reportReason.trim() || reportStatus === 'submitting' ? 0.6 : 1,
                          }}
                        >
                          {reportStatus === 'submitting' ? 'Submitting…' : 'Submit report'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setReportingId(null); setReportReason(''); setReportStatus('idle') }}
                          style={{
                            height: '28px', padding: '0 12px', borderRadius: '999px',
                            border: `1px solid ${T.line}`, background: 'transparent', color: T.ink2,
                            fontFamily: hanken, fontWeight: 600, fontSize: '11px', cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentUserId ? (
        <>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => { setNewComment(e.target.value); if (submitStatus === 'error') { setSubmitStatus('idle'); setSubmitError('') } }}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment() }}
              placeholder="Add a comment…"
              style={{
                flex: 1, height: '34px', borderRadius: '999px', border: '1px solid #E5E7EB',
                padding: '0 14px', fontSize: '13px', fontFamily: hanken,
                outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
              }}
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={!newComment.trim() || submitStatus === 'submitting'}
              style={{
                height: '34px', padding: '0 16px', borderRadius: '999px', border: 'none',
                background: T.cyan, color: '#FFFFFF', fontFamily: hanken, fontWeight: 600,
                fontSize: '12px', cursor: 'pointer', flexShrink: 0,
                opacity: !newComment.trim() || submitStatus === 'submitting' ? 0.6 : 1,
              }}
            >
              Post
            </button>
          </div>
          {submitStatus === 'error' && (
            <p style={{ fontFamily: hanken, fontSize: '12px', color: '#EF4444', margin: '6px 0 0' }}>{submitError}</p>
          )}
        </>
      ) : (
        <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink3, margin: 0 }}>Sign in to comment.</p>
      )}
    </div>
  )
}
