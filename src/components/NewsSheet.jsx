import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fallbackPosts, getActivePosts } from '../api/posts.js'
import { openExternalLink, haptic } from '../lib/telegram.js'

function PostMedia({ src }) {
  const [ok, setOk] = useState(Boolean(src))
  useEffect(() => { setOk(Boolean(src)) }, [src])
  if (!src || !ok) return null
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => setOk(false)}
    />
  )
}

function luminance(hex) {
  const h = String(hex || '').replace('#', '')
  if (h.length < 6) return 0.55
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ReelCard({ post, dim, focused, cardRef, onCta }) {
  const bg = post.backgroundColor || '#6EE000'
  const label = post.ctaText || 'O‘qish'
  const hasImage = Boolean(post.imageUrl)
  const darkText = hasImage ? false : luminance(bg) > 0.45

  return (
    <article
      ref={cardRef}
      className="relative w-full overflow-hidden"
      style={{
        height: 'min(68vh, 500px)',
        scrollSnapAlign: 'center',
        scrollSnapStop: 'always',
        borderRadius: '1.75rem',
        background: bg,
        transform: `scale(${focused ? 1 : 0.965})`,
        transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {hasImage ? (
        <div className="absolute inset-0 pointer-events-none">
          <PostMedia src={post.imageUrl} />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </div>
      ) : null}

      <div className="relative z-[1] flex flex-col h-full p-5 pb-20">
        {post.badgeText ? (
          <span
            className={`self-start text-[10px] font-bold tracking-wider uppercase mb-2 ${
              darkText ? 'text-black/40' : 'text-white/55'
            }`}
          >
            {post.badgeText}
          </span>
        ) : null}
        <h3
          className={`font-black text-[1.55rem] leading-[1.12] tracking-tight max-w-[92%] ${
            darkText ? 'text-[#0B1B3A]' : 'text-white'
          }`}
          style={hasImage ? { textShadow: '0 1px 12px rgba(0,0,0,0.45)' } : undefined}
        >
          {post.title}
        </h3>
        {post.body ? (
          <p
            className={`mt-2.5 text-[14px] leading-snug max-w-[90%] whitespace-pre-wrap line-clamp-5 ${
              darkText ? 'text-[#0B1B3A]/70' : 'text-white/75'
            }`}
          >
            {post.body}
          </p>
        ) : null}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none rounded-[1.75rem]"
        style={{
          background: '#000',
          opacity: dim,
          transition: 'opacity 0.22s ease-out',
        }}
      />

      <div className="absolute left-5 bottom-5 z-[5]">
        <button
          type="button"
          onClick={(e) => onCta(e, post)}
          className="inline-flex items-center justify-center h-11 px-6 rounded-full text-[14px] font-bold bg-[#0B1B3A] text-white shadow-lg active:scale-[0.97] transition"
        >
          {label}
        </button>
      </div>
    </article>
  )
}

export default function NewsSheet({ onStartCefr }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [focusIdx, setFocusIdx] = useState(0)
  const [dims, setDims] = useState([])
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  const load = useCallback(async () => {
    try {
      const list = await getActivePosts()
      if (list.length >= 5) {
        setPosts(list)
      } else if (list.length > 0) {
        const pad = fallbackPosts().filter((f) => !list.some((p) => String(p.id) === String(f.id)))
        setPosts([...list, ...pad].slice(0, 5))
      } else {
        setPosts(fallbackPosts())
      }
    } catch {
      setPosts(fallbackPosts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 12000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, posts.length)
  }, [posts.length])

  useEffect(() => {
    if (!posts.length) return undefined

    const root = sectionRef.current?.closest('[data-home-scroll]') || null
    if (root) {
      root.style.scrollSnapType = 'y proximity'
      root.style.scrollPaddingTop = '8vh'
      root.style.scrollPaddingBottom = '8vh'
    }

    const update = () => {
      const rootRect = root
        ? root.getBoundingClientRect()
        : { top: 0, height: window.innerHeight }
      const focusY = rootRect.top + rootRect.height * 0.4
      const span = Math.max(120, rootRect.height * 0.38)
      let best = 0
      let bestDist = Infinity
      const next = posts.map((_, i) => {
        const el = cardRefs.current[i]
        if (!el) return i === 0 ? 0 : 0.55
        const r = el.getBoundingClientRect()
        const mid = r.top + r.height * 0.42
        const dist = Math.abs(mid - focusY)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
        const t = Math.min(1, dist / span)
        return Number((0.08 + t * t * 0.68).toFixed(3))
      })
      next[best] = 0
      setFocusIdx(best)
      setDims(next)
    }

    const target = root || window
    target.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    requestAnimationFrame(update)
    const id = setInterval(update, 200)
    return () => {
      target.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      clearInterval(id)
      if (root) {
        root.style.scrollSnapType = ''
        root.style.scrollPaddingTop = ''
        root.style.scrollPaddingBottom = ''
      }
    }
  }, [posts])

  const onCta = (e, post) => {
    e?.stopPropagation?.()
    haptic('light')
    if (post?.url) {
      openExternalLink(post.url)
      return
    }
    if (post?._startCefr || post?._local) {
      onStartCefr?.()
    }
  }

  return (
    <section ref={sectionRef} data-news-sheet className="-mx-0.5 mt-5 pb-24">
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/40">
          Yangiliklar · {posts.length} ta
        </p>
        <p className="text-[11px] text-white/30 tabular-nums">
          {focusIdx + 1}/{Math.max(1, posts.length)}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-14 text-white/35">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post, i) => (
            <ReelCard
              key={post.id}
              post={post}
              dim={dims[i] ?? (i === 0 ? 0 : 0.5)}
              focused={i === focusIdx}
              cardRef={(el) => { cardRefs.current[i] = el }}
              onCta={onCta}
            />
          ))}
        </div>
      )}
    </section>
  )
}
