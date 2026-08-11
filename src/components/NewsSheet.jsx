import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { fallbackPosts, getActivePosts } from '../api/posts.js'
import { openExternalLink, haptic } from '../lib/telegram.js'

const PEEK = 78
const EXPANDED_RATIO = 0.88

/**
 * Pastki sheet — GET /post/getactive feed.
 * CTA: url bo‘lsa → Telegram.WebApp.openLink
 */
export default function NewsSheet({ onStartCefr }) {
  const sheetRef = useRef(null)
  const startY = useRef(0)
  const startH = useRef(PEEK)
  const heightRef = useRef(PEEK)
  const dragging = useRef(false)
  const [height, setHeight] = useState(PEEK)
  const [maxH, setMaxH] = useState(() => Math.round(window.innerHeight * EXPANDED_RATIO))
  const [draggingUi, setDraggingUi] = useState(false)
  const [posts, setPosts] = useState(() => fallbackPosts())
  const [loading, setLoading] = useState(true)

  const setH = (h) => {
    heightRef.current = h
    setHeight(h)
  }

  useEffect(() => {
    const onResize = () => setMaxH(Math.round(window.innerHeight * EXPANDED_RATIO))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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

  const expanded = height > PEEK + 40

  const clamp = useCallback((h) => Math.min(maxH, Math.max(PEEK, h)), [maxH])

  const snap = useCallback((h) => {
    const mid = (PEEK + maxH) / 2
    setH(h >= mid ? maxH : PEEK)
  }, [maxH])

  const openUp = (e) => {
    e?.stopPropagation?.()
    setH(maxH)
  }

  const closeDown = (e) => {
    e?.stopPropagation?.()
    setH(PEEK)
  }

  const onPointerDown = (e) => {
    dragging.current = true
    setDraggingUi(true)
    startY.current = e.clientY
    startH.current = heightRef.current
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    const dy = startY.current - e.clientY
    setH(clamp(startH.current + dy))
  }

  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    setDraggingUi(false)
    snap(heightRef.current)
  }

  const onCta = (e, post) => {
    e?.stopPropagation?.()
    haptic('light')
    if (post.url) {
      openExternalLink(post.url)
      return
    }
    if (post._startCefr || post._local) {
      onStartCefr?.()
    }
  }

  return (
    <div
      ref={sheetRef}
      className="news-sheet absolute left-0 right-0 bottom-0 z-30 flex flex-col rounded-t-2xl overflow-hidden border-t border-white/10"
      style={{
        height,
        transition: draggingUi ? 'none' : 'height 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
        background: 'linear-gradient(180deg, #161b20 0%, #101418 55%, #0c1014 100%)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.35)',
        touchAction: 'none',
      }}
    >
      <div
        className="shrink-0 px-4 pt-2 pb-2 select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="mx-auto mb-1.5 h-1 w-9 rounded-full bg-white/25" />
        <div className="flex justify-center">
          <button
            type="button"
            aria-label={expanded ? 'Pastga yopish' : 'Tepaga ochish'}
            onClick={expanded ? closeDown : openUp}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 text-white/80 bg-white/5 active:scale-95 transition"
          >
            {expanded ? (
              <ChevronDown size={20} strokeWidth={2.5} />
            ) : (
              <ChevronUp size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3.5 pb-10 overscroll-contain"
        style={{ touchAction: expanded ? 'pan-y' : 'none' }}
        onTouchStart={(e) => {
          if (!expanded) e.preventDefault()
        }}
      >
        {loading && (
          <div className="flex justify-center py-8 text-white/40">
            <Loader2 className="animate-spin" size={22} />
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {posts.map((post) => {
              const showCta = Boolean(post.url || post.ctaText || post._startCefr || post._local)
              return (
                <article
                  key={post.id}
                  className="rounded-[1.35rem] bg-[#1a2026] border border-white/[0.07] overflow-hidden"
                >
                  <div className="px-4 pt-4 pb-3">
                    <h3 className="font-black text-[1.15rem] leading-snug text-white tracking-tight">
                      {post.title}
                    </h3>
                    {post.body ? (
                      <p className="text-[13px] text-white/50 leading-relaxed mt-1.5 whitespace-pre-wrap">
                        {post.body}
                      </p>
                    ) : null}
                  </div>

                  {post.imageUrl && (
                    <div className="px-3">
                      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#0e1318]">
                        <img
                          src={post.imageUrl}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {showCta && (
                    <div className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => onCta(e, post)}
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[13px] font-bold bg-neon text-black active:scale-[0.98] transition"
                      >
                        {post.ctaText || (post.url ? 'Batafsil' : 'Imtihon topshirish')}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
