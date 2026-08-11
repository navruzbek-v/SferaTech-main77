import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fallbackPosts, getActivePosts } from '../api/posts.js'
import { openExternalLink, haptic } from '../lib/telegram.js'

const CARD_TONES = [
  'bg-[#2a2a2e]',
  'bg-[#1e3a2f]',
  'bg-[#2a2520]',
  'bg-[#1a2740]',
  'bg-[#2e2433]',
]

function PostMedia({ src }) {
  const [ok, setOk] = useState(Boolean(src))

  useEffect(() => {
    setOk(Boolean(src))
  }, [src])

  if (!src || !ok) return null

  return (
    <div className="mx-4 mb-4 rounded-[1.15rem] overflow-hidden bg-black/25 aspect-[16/10]">
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={() => setOk(false)}
      />
    </div>
  )
}

function PostCard({ post, index, onCta }) {
  const tone = CARD_TONES[index % CARD_TONES.length]
  const showCta = Boolean(post.url || post.ctaText || post._startCefr || post._local)

  return (
    <article className={`w-full overflow-hidden rounded-[1.75rem] ${tone}`}>
      <div className="px-5 pt-5 pb-3">
        {post.badgeText ? (
          <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-white/45 mb-2">
            {post.badgeText}
          </span>
        ) : null}
        <h3 className="font-black text-[1.35rem] leading-[1.2] text-white tracking-tight">
          {post.title}
        </h3>
        {post.body ? (
          <p className="mt-2 text-[14px] leading-snug text-white/55 whitespace-pre-wrap">
            {post.body}
          </p>
        ) : null}
      </div>

      <PostMedia src={post.imageUrl} />

      {showCta ? (
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={(e) => onCta(e, post)}
            className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-white text-black text-[14px] font-bold active:scale-[0.98] transition"
          >
            {post.ctaText || (post.url ? 'O‘qish' : 'Imtihon topshirish')}
          </button>
        </div>
      ) : (
        <div className="h-4" />
      )}
    </article>
  )
}

/** Inline post feed — sheet yo‘q, scroll pastga */
export default function NewsSheet({ onStartCefr }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        const list = await getActivePosts()
        if (!alive) return
        setPosts(list.length ? list : fallbackPosts())
      } catch {
        if (!alive) return
        setPosts(fallbackPosts())
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const onCta = (e, post) => {
    e?.stopPropagation?.()
    haptic('light')
    if (post.url) {
      openExternalLink(post.url)
      return
    }
    if (post._startCefr || post._local) onStartCefr?.()
  }

  return (
    <section className="mt-5 pb-8">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/35 mb-3 px-0.5">
        Yangiliklar
      </p>

      {loading ? (
        <div className="flex justify-center py-10 text-white/35">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="space-y-3.5">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onCta={onCta} />
          ))}
        </div>
      )}
    </section>
  )
}
