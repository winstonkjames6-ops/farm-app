'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Post, PostCardBody } from './PostCard'

// Instagram-style overlay for a single post's full detail. Composes the
// already-built like/bookmark/follow/comments/report logic in PostCardBody
// around a full, controllable video — no action logic is duplicated here.
export function PostDetailModal({
  post, currentUserId, liked, likeCount, bookmarked, isFollowing, viewCount,
  onToggleLike, onToggleFollow, onToggleBookmark, onGiveFeedback, onDelete, onPublish, onClose,
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
  onClose: () => void
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: '480px', maxHeight: '92vh',
          background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 2,
            width: '32px', height: '32px', borderRadius: '999px',
            background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          }}
        >
          <X size={18} color="#FFFFFF" />
        </button>

        <div style={{ width: '100%', background: '#000000', flexShrink: 0 }}>
          <video
            key={post.id}
            src={post.videoUrl}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '60vh', display: 'block', objectFit: 'contain' }}
          />
        </div>

        <div style={{ overflowY: 'auto' }}>
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
        </div>
      </div>
    </div>,
    document.body
  )
}
