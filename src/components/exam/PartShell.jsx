import React, { useEffect, useRef, useState } from 'react'
import { Clock, Minus, Plus } from 'lucide-react'
import { formatMs } from '../../lib/examConstants.js'

function scrollExamToTop(el) {
  const go = () => {
    let node = el
    let scrolled = false
    while (node) {
      const style = window.getComputedStyle(node)
      const oy = style.overflowY
      if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') {
        node.scrollTop = 0
        scrolled = true
      }
      node = node.parentElement
    }
    if (!scrolled) {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }
  go()
  requestAnimationFrame(go)
}

/**
 * Yuqori panel: vaqt · part chiziqlari (1-bo‘lim yozuvlari yo‘q)
 */
export default function PartShell({
  partTabs,
  activePartIdx,
  onPartChange,
  answered,
  total,
  title: _title,
  deadlineMs,
  fontSize,
  onFontSize,
  children,
}) {
  const rootRef = useRef(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!deadlineMs) return undefined
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [deadlineMs])

  // Part o‘zgaganda sahifa tepaga
  useEffect(() => {
    scrollExamToTop(rootRef.current)
  }, [activePartIdx])

  const left = deadlineMs ? Math.max(0, deadlineMs - now) : null
  const nParts = partTabs?.length || 1

  return (
    <div ref={rootRef}>
      {nParts > 1 && (
        <div className="flex items-center gap-1.5 mb-3">
          {partTabs.map((t, i) => (
            <button
              key={t.key || i}
              type="button"
              aria-label={`Part ${i + 1}`}
              onClick={() => onPartChange?.(i)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i === activePartIdx
                  ? 'bg-neon'
                  : i < activePartIdx
                    ? 'bg-neon/45'
                    : 'bg-white/15'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-neon font-bold text-base tabular-nums">
          <Clock size={18} />
          <span>{left != null ? formatMs(left) : '—:—'}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[11px] font-bold text-white/55 tabular-nums">
          {answered}/{total}
        </span>
        {onFontSize && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label="Kichikroq"
              onClick={() => onFontSize(Math.max(16, (fontSize || 22) - 2))}
              className="w-8 h-8 rounded-lg bg-cardhi border border-line flex items-center justify-center text-white/80"
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              aria-label="Kattaroq"
              onClick={() => onFontSize(Math.min(32, (fontSize || 22) + 2))}
              className="w-8 h-8 rounded-lg bg-cardhi border border-line flex items-center justify-center text-white/80"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      {children}
    </div>
  )
}
