'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'
import { Post } from '@/components/post/PostCard'
import { PostGridTile } from '@/components/post/PostGridTile'
import { PostDetailModal } from '@/components/post/PostDetailModal'

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

// ── Saved posts feed ────────────────────────────────────────────────────────────

export default function SavedPosts() {
  const pathname = usePathname()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [playingPostId, setPlayingPostId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id ?? null
      setCurrentUserId(uid)

      if (!uid) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('post_id, created_at, posts!post_id(id, author_type, author_id, video_url, thumbnail_url, caption, sport, booking_id, feedback_requested, view_count, profiles!author_id(name, avatar_url))')
        .eq('profile_id', uid)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[saved] bookmarks fetch:', error.message)
        setLoading(false)
        return
      }

      const mapped: Post[] = (data ?? [])
        .filter((row: any) => row.posts)
        .map((row: any) => {
          const p = row.posts
          return {
            id: p.id,
            authorId: p.author_id,
            authorType: p.author_type,
            authorName: p.profiles?.name ?? 'Unknown',
            avatarUrl: p.profiles?.avatar_url ?? null,
            videoUrl: p.video_url,
            thumbnailUrl: p.thumbnail_url,
            caption: p.caption,
            sport: p.sport,
            bookingId: p.booking_id,
            feedbackRequested: !!p.feedback_requested,
            viewCount: p.view_count ?? 0,
            commentsEnabled: false,
          }
        })
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
            if (r.profile_id === uid) likedByMe.add(r.post_id)
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

      const { data: followRows } = await supabase.from('follows').select('followed_id').eq('follower_id', uid)
      setFollowingIds(new Set((followRows ?? []).map((r: any) => r.followed_id)))
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

  // Every post shown here is, by definition, already bookmarked — the button only unsaves it.
  async function unbookmark(postId: string) {
    if (!currentUserId) return
    const supabase = createClient()
    const { error } = await supabase.from('post_bookmarks').delete().eq('post_id', postId).eq('profile_id', currentUserId)
    if (error) {
      console.error('[saved] unbookmark:', error.message)
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  function openPost(postId: string) {
    if (playingPostId === postId) return
    setPlayingPostId(postId)
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, viewCount: p.viewCount + 1 } : p)))

    const supabase = createClient()
    supabase.rpc('increment_post_view', { p_post_id: postId }).then(({ error }) => {
      if (error) console.error('[saved] view increment:', error.message)
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
      console.error('[saved] delete post:', error.message)
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const activePost = playingPostId ? posts.find((p) => p.id === playingPostId) ?? null : null

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: hanken, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{
          fontFamily: barlow, fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)',
          letterSpacing: '0em', textTransform: 'uppercase', margin: '0 0 20px', color: T.ink, lineHeight: 0.98,
        }}>
          Saved
        </h1>

        {loading ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Loading posts&hellip;</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>No saved posts yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {posts.map((post) => (
              <PostGridTile
                key={post.id}
                post={post}
                likeCount={likeCounts[post.id] ?? 0}
                showTrendingBadge={false}
                onOpen={() => openPost(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {activePost && (
        <PostDetailModal
          post={activePost}
          currentUserId={currentUserId}
          liked={likedPostIds.has(activePost.id)}
          likeCount={likeCounts[activePost.id] ?? 0}
          bookmarked={true}
          isFollowing={followingIds.has(activePost.authorId)}
          viewCount={activePost.viewCount}
          onToggleLike={() => toggleLike(activePost.id)}
          onToggleFollow={() => toggleFollow(activePost.authorId)}
          onToggleBookmark={() => unbookmark(activePost.id)}
          onGiveFeedback={() => giveFeedback(activePost.authorId)}
          onDelete={() => { setPlayingPostId(null); deletePost(activePost.id) }}
          onClose={() => setPlayingPostId(null)}
        />
      )}
    </div>
  )
}
