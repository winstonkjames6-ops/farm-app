'use client'

import { motion } from 'framer-motion'
import { Play, X, Heart, Bookmark, Eye, Trash2 } from 'lucide-react'
import { T } from '@/lib/theme'

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

// ── Post card ───────────────────────────────────────────────────────────────

export function PostCard({
  post, index, isPlaying, onPlay, onClose,
  currentUserId, liked, likeCount, bookmarked, isFollowing, viewCount,
  onToggleLike, onToggleFollow, onToggleBookmark, onGiveFeedback, onDelete,
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
}) {
  const isOwnPost = currentUserId != null && post.authorId === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.05 }}
      onClick={onPlay}
      style={{
        background: '#FFFFFF',
        border: post.feedbackRequested ? `1.5px dashed ${T.cyanBorder}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: '16px',
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      {/* Thumbnail / player */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: '#111827' }}>
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

      {/* Body */}
      <div style={{ padding: '16px' }}>
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
        </div>

        {post.caption && (
          <p style={{ fontFamily: hanken, fontSize: '14px', color: '#374151', margin: '0 0 12px', lineHeight: 1.5 }}>
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
              color: liked ? '#EF4444' : T.ink3,
            }}
          >
            <Heart size={18} fill={liked ? '#EF4444' : 'none'} />
            <span style={{ fontFamily: hanken, fontSize: '13px', fontWeight: 600 }}>{likeCount}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: T.ink3 }}>
            <Eye size={18} />
            <span style={{ fontFamily: hanken, fontSize: '13px', fontWeight: 600 }}>{viewCount}</span>
          </div>

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
    </motion.div>
  )
}
