'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Play, X, Heart, Bookmark } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

type Post = {
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

function PostCard({
  post, index, isPlaying, onPlay, onClose,
  currentUserId, liked, likeCount, bookmarked, isFollowing,
  onToggleLike, onToggleFollow, onToggleBookmark, onGiveFeedback,
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
  onToggleLike: () => void
  onToggleFollow: () => void
  onToggleBookmark: () => void
  onGiveFeedback: () => void
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

        {/* Actions: like / bookmark */}
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

// ── Feed ──────────────────────────────────────────────────────────────────────

export default function DiscoverFeed() {
  const pathname = usePathname()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [playingPostId, setPlayingPostId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set())
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id ?? null
      setCurrentUserId(uid)

      const { data, error } = await supabase
        .from('posts')
        .select('id, author_type, author_id, video_url, thumbnail_url, caption, sport, created_at, booking_id, feedback_requested, profiles!author_id(name, avatar_url)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[discover] posts fetch:', error.message)
        setLoading(false)
        return
      }

      const mapped: Post[] = (data ?? []).map((row: any) => ({
        id: row.id,
        authorId: row.author_id,
        authorType: row.author_type,
        authorName: row.profiles?.name ?? 'Unknown',
        avatarUrl: row.profiles?.avatar_url ?? null,
        videoUrl: row.video_url,
        thumbnailUrl: row.thumbnail_url,
        caption: row.caption,
        sport: row.sport,
        bookingId: row.booking_id,
        feedbackRequested: !!row.feedback_requested,
      }))
      setPosts(mapped)
      setLoading(false)

      const postIds = mapped.map((p) => p.id)

      if (postIds.length > 0) {
        const { data: likeRows, error: likeErr } = await supabase
          .from('post_likes')
          .select('post_id, profile_id')
          .in('post_id', postIds)

        if (!likeErr) {
          const counts: Record<string, number> = {}
          const likedByMe = new Set<string>()
          ;(likeRows ?? []).forEach((r: any) => {
            counts[r.post_id] = (counts[r.post_id] ?? 0) + 1
            if (uid && r.profile_id === uid) likedByMe.add(r.post_id)
          })
          setLikeCounts(counts)
          setLikedPostIds(likedByMe)
        }
      }

      if (uid) {
        const [{ data: followRows }, { data: bookmarkRows }] = await Promise.all([
          supabase.from('follows').select('followed_id').eq('follower_id', uid),
          supabase.from('post_bookmarks').select('post_id').eq('profile_id', uid),
        ])
        setFollowingIds(new Set((followRows ?? []).map((r: any) => r.followed_id)))
        setBookmarkedPostIds(new Set((bookmarkRows ?? []).map((r: any) => r.post_id)))
      }
    }

    load()
  }, [])

  async function toggleLike(postId: string) {
    if (!currentUserId) return
    const wasLiked = likedPostIds.has(postId)

    setLikedPostIds((prev) => {
      const next = new Set(prev)
      wasLiked ? next.delete(postId) : next.add(postId)
      return next
    })
    setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + (wasLiked ? -1 : 1) }))

    const supabase = createClient()
    const { error } = wasLiked
      ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('profile_id', currentUserId)
      : await supabase.from('post_likes').insert({ post_id: postId, profile_id: currentUserId })

    if (error) {
      setLikedPostIds((prev) => {
        const next = new Set(prev)
        wasLiked ? next.add(postId) : next.delete(postId)
        return next
      })
      setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + (wasLiked ? 1 : -1) }))
    }
  }

  async function toggleBookmark(postId: string) {
    if (!currentUserId) return
    const wasBookmarked = bookmarkedPostIds.has(postId)

    setBookmarkedPostIds((prev) => {
      const next = new Set(prev)
      wasBookmarked ? next.delete(postId) : next.add(postId)
      return next
    })

    const supabase = createClient()
    const { error } = wasBookmarked
      ? await supabase.from('post_bookmarks').delete().eq('post_id', postId).eq('profile_id', currentUserId)
      : await supabase.from('post_bookmarks').insert({ post_id: postId, profile_id: currentUserId })

    if (error) {
      setBookmarkedPostIds((prev) => {
        const next = new Set(prev)
        wasBookmarked ? next.add(postId) : next.delete(postId)
        return next
      })
    }
  }

  async function toggleFollow(authorId: string) {
    if (!currentUserId || authorId === currentUserId) return
    const wasFollowing = followingIds.has(authorId)

    setFollowingIds((prev) => {
      const next = new Set(prev)
      wasFollowing ? next.delete(authorId) : next.add(authorId)
      return next
    })

    const supabase = createClient()
    const { error } = wasFollowing
      ? await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('followed_id', authorId)
      : await supabase.from('follows').insert({ follower_id: currentUserId, followed_id: authorId })

    if (error) {
      setFollowingIds((prev) => {
        const next = new Set(prev)
        wasFollowing ? next.add(authorId) : next.delete(authorId)
        return next
      })
    }
  }

  function giveFeedback(authorId: string) {
    const messagesBase = pathname.startsWith('/dashboard/trainer')
      ? '/dashboard/trainer/messages'
      : pathname.startsWith('/dashboard/athlete')
      ? '/dashboard/athlete/messages'
      : '/dashboard/messages'
    router.push(`${messagesBase}?withId=${authorId}`)
  }

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
                currentUserId={currentUserId}
                liked={likedPostIds.has(post.id)}
                likeCount={likeCounts[post.id] ?? 0}
                bookmarked={bookmarkedPostIds.has(post.id)}
                isFollowing={followingIds.has(post.authorId)}
                onToggleLike={() => toggleLike(post.id)}
                onToggleFollow={() => toggleFollow(post.authorId)}
                onToggleBookmark={() => toggleBookmark(post.id)}
                onGiveFeedback={() => giveFeedback(post.authorId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
