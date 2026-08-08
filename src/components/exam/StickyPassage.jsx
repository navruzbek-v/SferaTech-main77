import React, { useEffect, useRef, useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * sticky=true → savollar pastga ketganda matn ekran tepasida qoladi.
 */
export default function StickyPassage({
  title = 'Matn',
  text,
  sticky = false,
  fontSize = 20,
}) {
  const [expanded, setExpanded] = useState(false)
  const [canScrollMore, setCanScrollMore] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    const el = bodyRef.current
    if (!el || !sticky) return undefined
    const check = () => {
      setCanScrollMore(el.scrollHeight > el.clientHeight + 8
        && el.scrollTop + el.clientHeight < el.scrollHeight - 8)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      ro?.disconnect()
    }
  }, [text, sticky, expanded, fontSize])

  if (!text) return null

  const maxH = sticky
    ? (expanded ? 'min(72vh, 30rem)' : 'min(36vh, 15.5rem)')
    : undefined

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${
        sticky
          ? 'ring-1 ring-neon/30 shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
          : 'ring-1 ring-white/10'
      }`}
    >
      {/* Yuqori yorqin chiziq */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-neon/80 to-transparent" />

      <div className="bg-gradient-to-b from-[#15241c] via-[#0f1813] to-[#0c1210]">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
          <div className="w-9 h-9 rounded-xl bg-neon/15 border border-neon/25 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-neon" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white tracking-tight">{title}</p>
            {sticky && (
              <p className="text-[11px] text-white/45 truncate">
                Doim ko‘rinadi · ichida surib o‘qing
              </p>
            )}
          </div>
          {sticky && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-bold text-neon px-2.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 active:scale-95 transition"
            >
              {expanded ? 'Kamaytirish' : 'Kengaytirish'}
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* Matn body */}
        <div className="relative px-3.5 pb-3">
          <div
            ref={bodyRef}
            className={`rounded-xl bg-black/25 border border-white/[0.06] px-3.5 py-3 ${
              sticky ? 'overflow-y-auto overscroll-contain passage-scroll' : ''
            }`}
            style={sticky ? { maxHeight: maxH } : undefined}
          >
            <p
              className="arabic q-text leading-[2.05] whitespace-pre-wrap"
              style={{ fontSize: `${fontSize}px` }}
            >
              {text}
            </p>
          </div>

          {/* Pastki fade — yana matn borligini bildiradi */}
          {sticky && canScrollMore && (
            <div className="pointer-events-none absolute bottom-3 left-3.5 right-3.5 h-10 rounded-b-xl bg-gradient-to-t from-[#0c1210] via-[#0c1210]/80 to-transparent flex items-end justify-center pb-1">
              <span className="text-[10px] text-neon/70 font-medium">↓ yana</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
