import React, { useEffect, useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { fallbackPosts, getActivePosts } from '../api/posts.js'
import { openExternalLink, haptic } from '../lib/telegram.js'

function PostMedia({ src }) {
  const [ok, setOk] = useState(Boolean(src))
  useEffect(() => { setOk(Boolean(src)) }, [src])
  if (!src || !ok) return null
  return (
    <div className="mt-3 rounded-[1.2rem] overflow-hidden bg-black/50 aspect-[16/10]">
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

/**
 * Payme videodagi pastki qoraygan panel:
 * blur + qorong‘i gradient, oq pill, ostida postlar pastga.
 */
export default function NewsSheet({ onStartCefr }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

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

  const featured = posts[0]
  const rest = posts.slice(1)

  const onCta = (e, post) => {
    e?.stopPropagation?.()
    haptic('light')
    if (post?.url) {
      openExternalLink(post.url)
      return
    }
    if (post?._startCefr || post?._local) {
      onStartCefr?.()
      return
    }
    setExpanded(true)
  }

  const pillLabel = featured?.ctaText
    || (featured?.url ? 'O‘qish' : null)
    || (featured?._startCefr || featured?._local ? 'Imtihon topshirish' : null)
    || 'Ko‘rish'

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end">
      {/* Yuqoridan pastga yumshoq qorayish */}
      <div
        className="h-24 w-full shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(8,10,14,0) 0%, rgba(8,10,14,0.55) 45%, rgba(8,10,14,0.92) 100%)',
        }}
      />

      <div
        className="pointer-events-auto w-full overflow-hidden"
        style={{
          borderRadius: '1.75rem 1.75rem 0 0',
          background: 'rgba(18, 14, 28, 0.78)',
          backdropFilter: 'blur(28px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.2)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.55)',
          maxHeight: expanded ? '78vh' : '42vh',
          transition: 'max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="px-4 pt-3 pb-2">
          <button
            type="button"
            aria-label={expanded ? 'Yopish' : 'Ochish'}
            onClick={() => setExpanded((v) => !v)}
            className="mx-auto block h-1 w-10 rounded-full bg-white/25 mb-3"
          />

          {/* Payme: oq pill */}
          {!loading && featured ? (
            <button
              type="button"
              onClick={(e) => onCta(e, featured)}
              className="w-full h-[52px] rounded-full bg-[#f3f3f5] text-black text-[15px] font-bold flex items-center justify-center gap-2.5 active:scale-[0.985] transition shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              <CreditCard size={18} strokeWidth={2.2} />
              {pillLabel}
            </button>
          ) : null}
        </div>

        <div
          className="px-4 pb-7 overflow-y-auto overscroll-contain"
          style={{ maxHeight: expanded ? 'calc(78vh - 5.5rem)' : 'calc(42vh - 5.5rem)' }}
        >
          {loading ? (
            <div className="flex justify-center py-8 text-white/35">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : (
            <>
              {featured ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="w-full text-left mt-3 mb-4"
                >
                  <p className="font-black text-[1.35rem] leading-snug text-white tracking-tight">
                    {featured.title}
                  </p>
                  {featured.body ? (
                    <p className="mt-1.5 text-[13px] text-white/45 leading-relaxed line-clamp-2">
                      {featured.body}
                    </p>
                  ) : null}
                  {expanded ? <PostMedia src={featured.imageUrl} /> : null}
                </button>
              ) : null}

              {expanded && rest.map((post) => (
                <article
                  key={post.id}
                  className="mb-3 rounded-[1.35rem] bg-white/[0.06] border border-white/[0.07] overflow-hidden"
                >
                  <div className="px-4 pt-4 pb-2">
                    <h3 className="font-black text-[1.05rem] text-white leading-snug">{post.title}</h3>
                    {post.body ? (
                      <p className="mt-1 text-[12px] text-white/40 line-clamp-2">{post.body}</p>
                    ) : null}
                  </div>
                  {post.imageUrl ? (
                    <div className="px-3 pb-2">
                      <PostMedia src={post.imageUrl} />
                    </div>
                  ) : null}
                  {(post.url || post.ctaText || post._local) ? (
                    <div className="px-4 pb-4">
                      <button
                        type="button"
                        onClick={(e) => onCta(e, post)}
                        className="h-9 px-4 rounded-full bg-white text-black text-[12px] font-bold"
                      >
                        {post.ctaText || (post.url ? 'O‘qish' : 'Boshlash')}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}

              {!expanded && posts.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="w-full text-center text-[12px] font-semibold text-white/40 py-1"
                >
                  Yana {posts.length - 1} ta post · pastga
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
