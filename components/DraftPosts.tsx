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

// ── Draft posts feed ─────────────────────────────────────────────────────────────
// Own unpublished posts only — the follow button never applies here (isOwnPost is
// always true), so following state is stubbed out rather than fetched.

export default function DraftPosts() {
  const pathname = usePathname()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [playingPostId, setPlayingPostId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set())

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
        .from('posts')
        .select('id, author_type, author_id, video_url, thumbnail_url, caption, sport, created_at, booking_id, feedback_requested, view_count, profiles!author_id(name, avatar_url)')
        .eq('author_id', uid)
        .eq('published', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[drafts] posts fetch:', error.message)
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
        const [{ data: likeRows, error: likeErr }, { data: bookmarkRows }, { data: commentsEnabledRows, error: commentsEnabledErr }] = await Promise.all([
          supabase.from('post_likes').select('post_id, profile_id').in('post_id', postIds),
          supabase.from('post_bookmarks').select('post_id').eq('profile_id', uid),
          supabase.rpc('get_posts_comments_enabled', { p_post_ids: postIds }),
        ])

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
        setBookmarkedPostIds(new Set((bookmarkRows ?? []).map((r: any) => r.post_id)))

        if (!commentsEnabledErr) {
          const enabledMap: Record<string, boolean> = {}
          ;(commentsEnabledRows ?? []).forEach((r: any) => { enabledMap[r.post_id] = !!r.comments_enabled })
          setPosts((prev) => prev.map((p) => ({ ...p, commentsEnabled: enabledMap[p.id] ?? false })))
        }
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

  function openPost(postId: string) {
    if (playingPostId === postId) return
    setPlayingPostId(postId)
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, viewCount: p.viewCount + 1 } : p)))

    const supabase = createClient()
    supabase.rpc('increment_post_view', { p_post_id: postId }).then(({ error }) => {
      if (error) console.error('[drafts] view increment:', error.message)
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
      console.error('[drafts] delete post:', error.message)
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  async function publishPost(postId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ published: true }).eq('id', postId)
    if (error) {
      console.error('[drafts] publish post:', error.message)
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
          My Drafts
        </h1>

        {loading ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>Loading drafts&hellip;</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: '16px', textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: hanken, fontSize: '14px', color: T.ink3, margin: 0 }}>No drafts yet</p>
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
          bookmarked={bookmarkedPostIds.has(activePost.id)}
          isFollowing={false}
          viewCount={activePost.viewCount}
          onToggleLike={() => toggleLike(activePost.id)}
          onToggleFollow={() => {}}
          onToggleBookmark={() => toggleBookmark(activePost.id)}
          onGiveFeedback={() => giveFeedback(activePost.authorId)}
          onDelete={() => { setPlayingPostId(null); deletePost(activePost.id) }}
          onPublish={() => { setPlayingPostId(null); publishPost(activePost.id) }}
          onClose={() => setPlayingPostId(null)}
        />
      )}
    </div>
  )
}
