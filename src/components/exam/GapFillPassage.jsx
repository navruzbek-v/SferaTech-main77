import React, { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { Card } from '../../ui.jsx'
import { OPTION_LETTERS } from '../../lib/examConstants.js'

/**
 * Matn + {{1}}…{{n}} blanklar.
 * Exclusive: bir variant faqat bitta joyga — boshqa joyda chiqmaydi.
 */
export default function GapFillPassage({
  passageText,
  items,
  options,
  answers,
  disabled,
  onPick,
  onClear,
  instruction,
  fontSize = 22,
}) {
  const [pickerBlank, setPickerBlank] = useState(null) // blankIndex or null
  const [focusBlank, setFocusBlank] = useState(0)

  const byBlank = useMemo(() => {
    const m = {}
    for (const it of items || []) {
      const bi = it.blankIndex != null ? it.blankIndex : (it.displayNumber - 1)
      m[bi] = it
    }
    return m
  }, [items])

  /** optionId → itemId (kim egallagan) */
  const usedBy = useMemo(() => {
    const map = {}
    for (const it of items || []) {
      const oid = answers?.[it.id]?.selectedOptionId
      if (oid != null) map[oid] = it.id
    }
    return map
  }, [items, answers])

  const parts = useMemo(() => splitPassage(passageText), [passageText])

  const sortedItems = useMemo(
    () => [...(items || [])].sort((a, b) => (a.blankIndex ?? 0) - (b.blankIndex ?? 0)),
    [items],
  )

  const pickerItem = pickerBlank != null ? byBlank[pickerBlank] : null

  /** Modalda faqat bo‘sh variantlar (+ joriy joydagi tanlov) */
  const availableOptions = useMemo(() => {
    if (!pickerItem) return []
    return (options || []).filter((opt) => {
      const owner = usedBy[opt.id]
      return owner == null || owner === pickerItem.id
    })
  }, [options, usedBy, pickerItem])

  useEffect(() => {
    if (pickerBlank == null) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setPickerBlank(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickerBlank])

  const pick = (opt) => {
    if (!pickerItem || disabled) return
    onPick(pickerItem, opt)
    setFocusBlank(pickerItem.blankIndex ?? 0)
    setPickerBlank(null)
  }

  const clearGap = (item, e) => {
    e?.stopPropagation?.()
    if (disabled || !onClear) return
    onClear(item)
  }

  return (
    <div className="space-y-4">
      {instruction && (
        <div className="rounded-xl border border-neon/35 bg-neon/5 px-3 py-2.5 text-sm text-white/85 flex gap-2">
          <span className="w-5 h-5 rounded-full border border-neon/50 text-neon text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
            i
          </span>
          <span>{instruction}</span>
        </div>
      )}

      <Card className="p-4 border-white/10 bg-[#0e1411]">
        <p
          className="arabic q-text leading-[2.15] whitespace-pre-wrap"
          style={{ fontSize: `${fontSize}px` }}
        >
          {parts.map((p, i) => {
            if (p.type === 'text') return <span key={i}>{p.value}</span>
            const n = p.n
            const item = byBlank[n - 1]
            const a = item ? answers?.[item.id] : null
            const opt = options?.find((o) => o.id === a?.selectedOptionId)
            const focused = focusBlank === n - 1
            if (opt) {
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md align-middle border border-neon/55 bg-neon/15 ${
                    focused ? 'ring-1 ring-neon/60' : ''
                  }`}
                  style={{ fontSize: `${Math.max(14, fontSize - 2)}px` }}
                >
                  {onClear && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={(e) => clearGap(item, e)}
                      className="w-4 h-4 rounded-full bg-red-500/90 text-white flex items-center justify-center shrink-0"
                      aria-label="O‘chirish"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={disabled || !item}
                    onClick={() => {
                      setFocusBlank(n - 1)
                      setPickerBlank(n - 1)
                    }}
                    className="inline-flex items-center gap-1 text-neon font-semibold"
                  >
                    <span className="text-neon/90 font-black">({opt.label})</span>
                    <span className="arabic">{opt.text}</span>
                  </button>
                </span>
              )
            }
            return (
              <button
                key={i}
                type="button"
                disabled={disabled || !item}
                onClick={() => {
                  setFocusBlank(n - 1)
                  setPickerBlank(n - 1)
                }}
                className={`inline-flex items-center gap-0.5 mx-0.5 px-2 py-0.5 rounded-md align-middle border border-amber-600/80 bg-[#1a1510] text-white font-bold ${
                  focused ? 'ring-1 ring-amber-400/70' : ''
                }`}
                style={{ fontSize: `${Math.max(13, fontSize - 4)}px` }}
              >
                {n}
                <ChevronDown size={12} className="opacity-70" />
              </button>
            )
          })}
        </p>
      </Card>

      {/* Variantlar banki — ishlatilganlar ✓, lekin qayta tanlash uchun emas */}
      <Card className="p-4 border-amber-700/40 bg-[#12100e]">
        <p className="text-sm font-bold text-amber-400/90 mb-3">
          Variantlar (A–{OPTION_LETTERS[(options?.length || 1) - 1] || 'J'})
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(options || []).map((opt, i) => {
            const letter = opt.label || OPTION_LETTERS[i]
            const taken = usedBy[opt.id] != null
            return (
              <div
                key={opt.id}
                className={`arabic text-right px-2.5 py-2 rounded-lg border text-sm flex items-center gap-2 ${
                  taken
                    ? 'border-neon/60 bg-neon/20 text-white'
                    : 'border-amber-700/50 bg-[#0e1411]'
                }`}
              >
                {taken && <Check size={14} className="text-neon shrink-0" />}
                <span className="flex-1">{opt.text}</span>
                <span className="w-6 h-6 rounded-md bg-amber-700/80 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {letter}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Joylar holati — bitta qator */}
      <div className="flex flex-wrap justify-center gap-2">
        {sortedItems.map((it) => {
          const n = (it.blankIndex ?? 0) + 1
          const opt = options?.find((o) => o.id === answers?.[it.id]?.selectedOptionId)
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setFocusBlank(it.blankIndex ?? 0)
                setPickerBlank(it.blankIndex ?? 0)
              }}
              className={`min-w-[2.5rem] h-10 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border ${
                opt
                  ? 'bg-neon text-black border-neon'
                  : 'bg-cardhi text-white/70 border-line'
              }`}
            >
              {opt ? `${n}:${opt.label}` : n}
            </button>
          )
        })}
      </div>

      {/* Modal: faqat hali band bo‘lmagan variantlar */}
      {pickerItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPickerBlank(null)}
        >
          <div
            className="w-full max-w-sm max-h-[70vh] overflow-y-auto rounded-2xl border border-amber-800/40 bg-[#1a1a1a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-4 pt-4 pb-2 text-sm text-white/60 font-medium">
              {(pickerItem.blankIndex ?? 0) + 1}-joy uchun variant tanlang
            </p>
            <div className="px-2 pb-3 space-y-1">
              {availableOptions.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-white/40">
                  Bo‘sh variant qolmadi
                </p>
              )}
              {availableOptions.map((opt, i) => {
                const letter = opt.label || OPTION_LETTERS[i]
                const selected = answers?.[pickerItem.id]?.selectedOptionId === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(opt)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition ${
                      selected ? 'bg-amber-900/40' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="arabic flex-1 text-base leading-relaxed">{opt.text}</span>
                    <span className="w-8 h-8 rounded-lg bg-amber-700/85 text-white text-sm font-black flex items-center justify-center shrink-0">
                      {letter}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function splitPassage(text) {
  if (!text) return []
  const re = /\{\{(\d+)\}\}/g
  const out = []
  let last = 0
  let m
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) })
    out.push({ type: 'blank', n: Number(m[1]) })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) })
  return out
}
