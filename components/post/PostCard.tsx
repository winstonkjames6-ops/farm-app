'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, X, Heart, Bookmark, Eye, Trash2, MoreVertical, MessageCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { PostComments } from './PostComments'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

export type Post = {
  id: string
  authorId: string
  authorType: 'trainer' | 'athlete'
  authorName: string
  avatarUrl: string | null
  videoUrl: string
  thumbnailUrl: string | null
  caption: string | null
  sport: string | null
  bookingId: string | null
  feedbackRequested: boolean
  viewCount: number
  commentsEnabled: boolean
}

// ── Follow button ────────────────────────────────────────────────────────────

function FollowButton({ following, onClick }: { following: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        fontFamily: hanken, fontWeight: 700, fontSize: '12px',
        padding: '6px 14px', borderRadius: '999px', cursor: 'pointer',
        border: following ? `1px solid ${T.line}` : 'none',
        background: following ? 'transparent' : T.cyan,
        color: following ? T.ink2 : '#FFFFFF',
      }}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}

// ── Post card body (shared by the feed card and the detail modal) ───────────
// Holds all the author/follow/report/like/bookmark/comments/give-feedback
// logic so it can be composed around different media presentations without
// being duplicated.

export function PostCardBody({
  post, currentUserId, liked, likeCount, bookmarked, isFollowing, viewCount,
  onToggleLike, onToggleFollow, onToggleBookmark, onGiveFeedback, onDelete, onPublish,
}: {
  post: Post
  currentUserId: string | null
  liked: boolean
  likeCount: number
  bookmarked: boolean
  isFollowing: boolean
  viewCount: number
  onToggleLike: () => void
  onToggleFollow: () => void
  onToggleBookmark: () => void
  onGiveFeedback: () => void
  onDelete: () => void
  onPublish?: () => void
}) {
  const isOwnPost = currentUserId != null && post.authorId === currentUserId

  const [menuOpen, setMenuOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportStatus, setReportStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle')

  async function submitReport() {
    if (!currentUserId || !reportReason.trim()) return
    setReportStatus('submitting')
    const supabase = createClient()
    const { error } = await supabase.from('post_reports').insert({
      post_id: post.id,
      reporter_id: currentUserId,
      reason: reportReason.trim(),
    })
    if (error) {
      console.error('[post-card] report submit:', error.message)
      setReportStatus('error')
      return
    }
    setReportStatus('submitted')
    setTimeout(() => { setReportOpen(false); setReportReason(''); setReportStatus('idle') }, 1500)
  }

  return (
    <div style={{ padding: '16px' }} onClick={() => { if (menuOpen) setMenuOpen(false) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {post.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '999px', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: '36px', height: '36px', borderRadius: '999px', flexShrink: 0,
              background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: barlow, fontWeight: 700, fontSize: '13px', color: '#FFFFFF',
            }}>
              {post.authorName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: hanken, fontWeight: 600, fontSize: '14px', color: T.ink, lineHeight: 1.3 }}>{post.authorName}</div>
            <div style={{ fontFamily: hanken, fontSize: '12px', color: T.ink3 }}>{post.authorType === 'trainer' ? 'Trainer' : 'Athlete'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!isOwnPost && currentUserId && (
            <FollowButton
              following={isFollowing}
              onClick={(e) => { e.stopPropagation(); onToggleFollow() }}
            />
          )}
          {isOwnPost && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              aria-label="Delete post"
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', padding: 0 }}
            >
              <Trash2 size={18} />
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
              aria-label="More options"
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, display: 'flex', padding: 0 }}
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '6px', zIndex: 5,
                  minWidth: '120px', background: T.cardBg, border: `1px solid ${T.line}`,
                  borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setReportOpen(true); setReportStatus('idle'); setReportReason('') }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: hanken, fontSize: '13px', color: T.ink,
                  }}
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {post.caption && (
        <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink2, margin: '0 0 12px', lineHeight: 1.5 }}>
          {post.caption}
        </p>
      )}

      {post.sport && (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          fontFamily: barlow, fontSize: '11px', fontWeight: 700,
          letterSpacing: '.08em', textTransform: 'uppercase',
          background: 'rgba(0,188,200,0.10)', color: T.cyan,
          border: `1px solid ${T.cyanBorder}`, padding: '3px 10px', borderRadius: '999px',
          marginBottom: '4px',
        }}>
          {post.sport}
        </span>
      )}

      {/* Actions: like / views / bookmark */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${T.line}`,
      }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleLike() }}
          disabled={!currentUserId}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', padding: 0,
            cursor: currentUserId ? 'pointer' : 'default',
            color: liked ? T.danger : T.ink3,
          }}
        >
          <Heart size={18} fill={liked ? T.danger : 'none'} />
          <span style={{ fontFamily: hanken, fontSize: '13px', fontWeight: 600 }}>{likeCount}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: T.ink3 }}>
          <Eye size={18} />
          <span style={{ fontFamily: hanken, fontSize: '13px', fontWeight: 600 }}>{viewCount}</span>
        </div>

        {post.commentsEnabled && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCommentsOpen((o) => !o) }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', color: commentsOpen ? T.cyan : T.ink3,
            }}
          >
            <MessageCircle size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleBookmark() }}
          disabled={!currentUserId}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', padding: 0, marginLeft: 'auto',
            cursor: currentUserId ? 'pointer' : 'default',
            color: bookmarked ? T.cyan : T.ink3,
          }}
        >
          <Bookmark size={18} fill={bookmarked ? T.cyan : 'none'} />
        </button>
      </div>

      {post.commentsEnabled && commentsOpen && (
        <PostComments postId={post.id} currentUserId={currentUserId} />
      )}

      {onPublish && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPublish() }}
          style={{
            marginTop: '12px', width: '100%', height: '38px', borderRadius: '10px',
            border: 'none', background: T.cyan, color: '#FFFFFF',
            fontFamily: hanken, fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          Publish
        </button>
      )}

      {reportOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${T.line}` }}
        >
          {reportStatus === 'submitted' ? (
            <p style={{ fontFamily: hanken, fontSize: '13px', color: T.ink2, margin: 0 }}>Report submitted</p>
          ) : (
            <>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this post?"
                required
                style={{
                  width: '100%', minHeight: '72px', borderRadius: '8px', border: `1px solid ${T.border}`,
                  padding: '10px 12px', fontSize: '13px', fontFamily: hanken, resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box', color: T.ink, background: T.cardBg,
                }}
              />
              {reportStatus === 'error' && (
                <p style={{ fontFamily: hanken, fontSize: '12px', color: T.danger, margin: '6px 0 0' }}>
                  Something went wrong. Try again.
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={!currentUserId || !reportReason.trim() || reportStatus === 'submitting'}
                  style={{
                    height: '34px', padding: '0 16px', borderRadius: '999px', border: 'none',
                    background: T.cyan, color: '#FFFFFF', fontFamily: hanken, fontWeight: 600,
                    fontSize: '12px', cursor: 'pointer',
                    opacity: !currentUserId || !reportReason.trim() || reportStatus === 'submitting' ? 0.6 : 1,
                  }}
                >
                  {reportStatus === 'submitting' ? 'Submitting…' : 'Submit report'}
                </button>
                <button
                  type="button"
                  onClick={() => { setReportOpen(false); setReportReason(''); setReportStatus('idle') }}
                  style={{
                    height: '34px', padding: '0 16px', borderRadius: '999px',
                    border: `1px solid ${T.line}`, background: 'transparent', color: T.ink2,
                    fontFamily: hanken, fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {post.feedbackRequested && !isOwnPost && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onGiveFeedback() }}
          style={{
            marginTop: '12px', width: '100%', height: '38px', borderRadius: '10px',
            border: 'none', background: T.cyan, color: '#FFFFFF',
            fontFamily: hanken, fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          Give feedback
        </button>
      )}
    </div>
  )
}

// ── Post card ───────────────────────────────────────────────────────────────

export function PostCard({
  post, index, isPlaying, onPlay, onClose,
  currentUserId, liked, likeCount, bookmarked, isFollowing, viewCount,
  onToggleLike, onToggleFollow, onToggleBookmark, onGiveFeedback, onDelete, onPublish,
}: {
  post: Post
  index: number
  isPlaying: boolean
  onPlay: () => void
  onClose: () => void
  currentUserId: string | null
  liked: boolean
  likeCount: number
  bookmarked: boolean
  isFollowing: boolean
  viewCount: number
  onToggleLike: () => void
  onToggleFollow: () => void
  onToggleBookmark: () => void
  onGiveFeedback: () => void
  onDelete: () => void
  onPublish?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.05 }}
      onClick={() => onPlay()}
      style={{
        background: T.cardBg,
        border: post.feedbackRequested ? `1.5px dashed ${T.cyanBorder}` : `1px solid ${T.border}`,
        borderRadius: '16px',
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      {/* Thumbnail / player */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: T.ink }}>
        {isPlaying ? (
          <>
            <video
              src={post.videoUrl}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose() }}
              style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 1,
                width: '28px', height: '28px', borderRadius: '999px',
                background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              }}
            >
              <X size={16} color="#FFFFFF" />
            </button>
          </>
        ) : post.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(140deg, #2A2E37 0%, #171A21 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={22} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: '2px' }} />
            </div>
          </div>
        )}

        {post.bookingId && (
          <span style={{
            position: 'absolute', top: '12px', left: '12px',
            fontFamily: barlow, fontWeight: 700, fontSize: '11px',
            letterSpacing: '.08em', textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.75)', color: '#FFFFFF',
            padding: '4px 10px', borderRadius: '999px',
          }}>
            Session progress
          </span>
        )}
      </div>

      <PostCardBody
        post={post}
        currentUserId={currentUserId}
        liked={liked}
        likeCount={likeCount}
        bookmarked={bookmarked}
        isFollowing={isFollowing}
        viewCount={viewCount}
        onToggleLike={onToggleLike}
        onToggleFollow={onToggleFollow}
        onToggleBookmark={onToggleBookmark}
        onGiveFeedback={onGiveFeedback}
        onDelete={onDelete}
        onPublish={onPublish}
      />
    </motion.div>
  )
}
