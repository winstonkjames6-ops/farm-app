'use client'

import { useEffect, useRef } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { T } from '@/lib/theme'
import { Post } from './PostCard'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

const gridBadgeStyle: React.CSSProperties = {
  position: 'absolute', top: '8px', left: '8px', zIndex: 1,
  fontFamily: barlow, fontWeight: 700, fontSize: '10px',
  letterSpacing: '.08em', textTransform: 'uppercase',
  background: 'rgba(0,0,0,0.75)', color: '#FFFFFF',
  padding: '4px 8px', borderRadius: '999px',
}

// Muted, looping ~2.5s preview of a post's video, playing only while the tile
// is actually visible in the viewport. Tapping anywhere opens the full detail
// modal instead of expanding inline.

export function PostGridTile({
  post, likeCount, showTrendingBadge, onOpen,
}: {
  post: Post
  likeCount: number
  showTrendingBadge: boolean
  onOpen: () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video || post.feedbackRequested) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = true
          if (video.readyState === 0) video.load()
          video.currentTime = 0
          video.play().catch(() => {})
        } else {
          video.pause()
          video.currentTime = 0
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [post.feedbackRequested])

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const el = e.currentTarget
    if (el.currentTime > 2.5) el.currentTime = 0
  }

  return (
    <div
      ref={containerRef}
      onClick={onOpen}
      style={{
        position: 'relative', width: '100%', aspectRatio: '3 / 4',
        borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
        background: '#111827',
        border: post.feedbackRequested ? `1.5px dashed ${T.cyanBorder}` : 'none',
      }}
    >
      {post.feedbackRequested ? (
        <div style={{
          position: 'absolute', inset: 0, background: T.cyanDim,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageCircle size={32} color={T.cyan} />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={post.videoUrl}
          poster={post.thumbnailUrl || undefined}
          preload="metadata"
          muted
          loop
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onError={() => {}}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {post.bookingId ? (
        <span style={gridBadgeStyle}>Session</span>
      ) : showTrendingBadge ? (
        <span style={gridBadgeStyle}>Trending</span>
      ) : null}

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {post.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.avatarUrl} alt="" style={{ width: '22px', height: '22px', borderRadius: '999px', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: '22px', height: '22px', borderRadius: '999px', flexShrink: 0,
            background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: barlow, fontWeight: 700, fontSize: '10px', color: '#FFFFFF',
          }}>
            {post.authorName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span style={{
          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: hanken, fontWeight: 600, fontSize: '12px', color: '#FFFFFF',
        }}>
          {post.authorName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, color: '#FFFFFF' }}>
          <Heart size={13} fill="#FFFFFF" />
          <span style={{ fontFamily: hanken, fontWeight: 600, fontSize: '11px' }}>{likeCount}</span>
        </div>
      </div>
    </div>
  )
}
