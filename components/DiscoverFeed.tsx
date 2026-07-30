'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

type Post = {
  id: string
  authorType: 'trainer' | 'athlete'
  authorName: string
  avatarUrl: string | null
  videoUrl: string
  thumbnailUrl: string | null
  caption: string | null
  sport: string | null
  bookingId: string | null
}

// ── Post card ───────────────────────────────────────────────────────────────

function PostCard({
  post, index, isPlaying, onPlay, onClose,
}: {
  post: Post
  index: number
  isPlaying: boolean
  onPlay: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.05 }}
      onClick={onPlay}
      style={{
        background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
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
          <div>
            <div style={{ fontFamily: hanken, fontWeight: 600, fontSize: '14px', color: T.ink, lineHeight: 1.3 }}>{post.authorName}</div>
            <div style={{ fontFamily: hanken, fontSize: '12px', color: T.ink3 }}>{post.authorType === 'trainer' ? 'Trainer' : 'Athlete'}</div>
          </div>
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
          }}>
            {post.sport}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export default function DiscoverFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [playingPostId, setPlayingPostId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('posts')
      .select('id, author_type, author_id, video_url, thumbnail_url, caption, sport, created_at, booking_id, profiles!author_id(name, avatar_url)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('[discover] posts fetch:', error.message)
          setLoading(false)
          return
        }
        setPosts(
          (data ?? []).map((row: any) => ({
            id: row.id,
            authorType: row.author_type,
            authorName: row.profiles?.name ?? 'Unknown',
            avatarUrl: row.profiles?.avatar_url ?? null,
            videoUrl: row.video_url,
            thumbnailUrl: row.thumbnail_url,
            caption: row.caption,
            sport: row.sport,
            bookingId: row.booking_id,
          }))
        )
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: hanken, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{
          fontFamily: barlow, fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)',
          letterSpacing: '0em', textTransform: 'uppercase', margin: '0 0 20px', color: T.ink, lineHeight: 0.98,
        }}>
          Discover
        </h1>

        {loading ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Loading posts&hellip;</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>No posts yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                isPlaying={playingPostId === post.id}
                onPlay={() => setPlayingPostId(post.id)}
                onClose={() => setPlayingPostId(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
