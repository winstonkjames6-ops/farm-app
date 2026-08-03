'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Heart } from 'lucide-react'
import { Post, PostCardBody } from './PostCard'

const HEART_BURST_MS = 600

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

  const [burstKey, setBurstKey] = useState(0)
  const [showBurst, setShowBurst] = useState(false)
  const burstTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current)
  }, [])

  function triggerHeartBurst() {
    setBurstKey((k) => k + 1)
    setShowBurst(true)
    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current)
    burstTimeoutRef.current = setTimeout(() => setShowBurst(false), HEART_BURST_MS)
  }

  // Heart-icon button: preserves the original like/unlike toggle, only bursts
  // when the action results in a fresh like (never on unlike).
  function handleHeartButtonToggle() {
    if (!liked) triggerHeartBurst()
    onToggleLike()
  }

  // Double-tap: standard convention is like-only, never unlike — a double-tap
  // on an already-liked post is a no-op. preventDefault + the exitFullscreen
  // fallback stop Chrome's native double-click-to-fullscreen gesture on
  // <video controls> from hijacking the tap (it would hide the burst overlay,
  // which lives outside the fullscreened element).
  function handleVideoDoubleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    setTimeout(() => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }, 50)
    if (liked) return
    triggerHeartBurst()
    onToggleLike()
  }

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

        <div
          style={{ position: 'relative', width: '100%', background: '#000000', flexShrink: 0 }}
        >
          <video
            key={post.id}
            src={post.videoUrl}
            controls
            autoPlay
            playsInline
            onDoubleClick={handleVideoDoubleClick}
            style={{ width: '100%', maxHeight: '60vh', display: 'block', objectFit: 'contain' }}
          />
          {showBurst && (
            <div
              key={burstKey}
              style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', pointerEvents: 'none',
                animation: `postDetailHeartBurst ${HEART_BURST_MS}ms ease-out forwards`,
              }}
            >
              <Heart size={96} color="#FFFFFF" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.5))' }} />
            </div>
          )}
        </div>

        <style>{`
          @keyframes postDetailHeartBurst {
            0% { opacity: 0; transform: scale(0.5); }
            30% { opacity: 1; transform: scale(1.15); }
            100% { opacity: 0; transform: scale(1.4); }
          }
        `}</style>

        <div style={{ overflowY: 'auto' }}>
          <PostCardBody
            post={post}
            currentUserId={currentUserId}
            liked={liked}
            likeCount={likeCount}
            bookmarked={bookmarked}
            isFollowing={isFollowing}
            viewCount={viewCount}
            onToggleLike={handleHeartButtonToggle}
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
