'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { PostCard, Post } from '@/components/post/PostCard'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

// ── Feed ──────────────────────────────────────────────────────────────────────

export default function DiscoverFeed() {
  const pathname = usePathname()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [playingPostId, setPlayingPostId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all')

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
        .select('id, author_type, author_id, video_url, thumbnail_url, caption, sport, created_at, booking_id, feedback_requested, view_count, profiles!author_id(name, avatar_url)')
        .eq('published', true)
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
        viewCount: row.view_count ?? 0,
        commentsEnabled: false,
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

        const { data: commentsEnabledRows, error: commentsEnabledErr } = await supabase
          .rpc('get_posts_comments_enabled', { p_post_ids: postIds })

        if (!commentsEnabledErr) {
          const enabledMap: Record<string, boolean> = {}
          ;(commentsEnabledRows ?? []).forEach((r: any) => { enabledMap[r.post_id] = !!r.comments_enabled })
          setPosts((prev) => prev.map((p) => ({ ...p, commentsEnabled: enabledMap[p.id] ?? false })))
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

  function openPost(postId: string) {
    if (playingPostId === postId) return
    setPlayingPostId(postId)
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, viewCount: p.viewCount + 1 } : p)))

    const supabase = createClient()
    supabase.rpc('increment_post_view', { p_post_id: postId }).then(({ error }) => {
      if (error) console.error('[discover] view increment:', error.message)
    })
  }

  function giveFeedback(authorId: string) {
    const messagesBase = pathname.startsWith('/dashboard/trainer')
      ? '/dashboard/trainer/messages'
      : pathname.startsWith('/dashboard/athlete')
      ? '/dashboard/athlete/messages'
      : '/dashboard/messages'
    router.push(`${messagesBase}?withId=${authorId}`)
  }

  async function deletePost(postId: string) {
    if (!window.confirm('Delete this post?')) return
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      console.error('[discover] delete post:', error.message)
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const visiblePosts = activeTab === 'following'
    ? posts.filter((p) => followingIds.has(p.authorId))
    : posts

  const newPostHref = pathname.startsWith('/dashboard/trainer')
    ? '/dashboard/trainer/post/new'
    : pathname.startsWith('/dashboard/athlete')
    ? '/dashboard/athlete/post/new'
    : null

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: hanken, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
          <h1 style={{
            fontFamily: barlow, fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)',
            letterSpacing: '0em', textTransform: 'uppercase', margin: 0, color: T.ink, lineHeight: 0.98,
          }}>
            Discover
          </h1>

          {newPostHref && (
            <button
              type="button"
              onClick={() => router.push(newPostHref)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                height: '40px', padding: '0 18px', borderRadius: '999px', border: 'none',
                background: T.cyan, color: '#FFFFFF', fontFamily: hanken, fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,188,200,0.25)',
              }}
            >
              <Plus size={16} />
              New post
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['all', 'following'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: hanken, fontWeight: 600, fontSize: '13px',
                padding: '8px 16px', borderRadius: '999px', cursor: 'pointer',
                border: activeTab === tab ? 'none' : `1px solid ${T.line}`,
                background: activeTab === tab ? T.cyan : 'transparent',
                color: activeTab === tab ? '#FFFFFF' : T.ink2,
              }}
            >
              {tab === 'all' ? 'All' : 'Following'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Loading posts&hellip;</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>No posts yet</p>
          </div>
        ) : visiblePosts.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Follow some trainers or athletes to see their posts here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {visiblePosts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                isPlaying={playingPostId === post.id}
                onPlay={() => openPost(post.id)}
                onClose={() => setPlayingPostId(null)}
                currentUserId={currentUserId}
                liked={likedPostIds.has(post.id)}
                likeCount={likeCounts[post.id] ?? 0}
                bookmarked={bookmarkedPostIds.has(post.id)}
                isFollowing={followingIds.has(post.authorId)}
                viewCount={post.viewCount}
                onToggleLike={() => toggleLike(post.id)}
                onToggleFollow={() => toggleFollow(post.authorId)}
                onToggleBookmark={() => toggleBookmark(post.id)}
                onGiveFeedback={() => giveFeedback(post.authorId)}
                onDelete={() => deletePost(post.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
