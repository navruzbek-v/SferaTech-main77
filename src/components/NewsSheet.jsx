import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { HOME_NEWS } from '../data/homeNews.js'

const PEEK = 78
const EXPANDED_RATIO = 0.88

/**
 * Pastki sheet — faqat Arabosfera kartasi.
 * «Imtihon topshirish» → CEFR.
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

  const card = HOME_NEWS[0]

  const setH = (h) => {
    heightRef.current = h
    setHeight(h)
  }

  useEffect(() => {
    const onResize = () => setMaxH(Math.round(window.innerHeight * EXPANDED_RATIO))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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

  const startExam = (e) => {
    e?.stopPropagation?.()
    onStartCefr?.()
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
        {card && (
          <article className="rounded-[1.35rem] bg-[#1a2026] border border-white/[0.07] overflow-hidden">
            <div className="px-4 pt-4 pb-3">
                <span
                className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md mb-2.5"
                style={{
                  color: card.accent || '#3DDC97',
                  background: `${card.accent || '#3DDC97'}22`,
                }}
              >
                {card.tag}
              </span>
              <h3 className="font-black text-[1.15rem] leading-snug text-white tracking-tight">
                {card.title}
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed mt-1.5">
                {card.body}
              </p>
            </div>

            {card.image && (
              <div className="px-3">
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#0e1318]">
                  <img
                    src={card.image}
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

            <div className="px-4 py-3.5">
              <button
                type="button"
                onClick={startExam}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[13px] font-bold bg-neon text-black active:scale-[0.98] transition"
              >
                {card.cta || 'Imtihon topshirish'}
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
