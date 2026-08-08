import React, { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { Card } from '../../ui.jsx'
import { OPTION_LETTERS } from '../../lib/examConstants.js'

/**
 * Matching: har savolda to‘liq variant matni (tepaga scroll qilish shart emas).
 * Exclusive — band variant boshqa savolda tanlanmaydi.
 */
export default function ExclusiveMatchPart({
  items,
  options,
  answers,
  disabled,
  onPick,
  onClear,
  instruction,
  bankTitle = 'Variantlar',
  showBank = true,
  fontSize = 20,
  /** 'grid' = 2 ustun (part 2), 'list' = vertikal (part 3 sarlavhalar) */
  layout = 'grid',
}) {
  const usedBy = useMemo(() => {
    const map = {}
    for (const it of items || []) {
      const oid = answers?.[it.id]?.selectedOptionId
      if (oid != null) map[oid] = it.id
    }
    return map
  }, [items, answers])

  return (
    <div className="space-y-4">
      {instruction && (
        <div className="rounded-xl border border-neon/30 bg-neon/5 px-3 py-2.5 text-sm text-white/85">
          {instruction}
        </div>
      )}

      {/* Qisqa ma’lumotnoma — asosiy tanlov pastida */}
      {showBank && (
        <Card className="p-3 border-white/10 bg-[#121816]">
          <p className="text-sm font-bold text-white/55 mb-2">
            {bankTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(options || []).map((opt, i) => {
              const letter = opt.label || OPTION_LETTERS[i]
              const taken = usedBy[opt.id] != null || opt.isLocked
              return (
                <div
                  key={opt.id}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-sm ${
                    taken
                      ? 'border-neon/45 bg-neon/10'
                      : 'border-white/10 bg-[#0e1411]'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-neon/15 text-neon/90 border border-neon/25 text-xs font-black flex items-center justify-center shrink-0">
                    {letter}
                  </span>
                  <span
                    className="arabic flex-1 leading-snug"
                    style={{ fontSize: `${Math.max(14, fontSize - 4)}px` }}
                  >
                    {opt.text}
                  </span>
                  {taken && <Check size={14} className="text-neon shrink-0" />}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {(items || []).map((item) => {
        const selectedId = answers?.[item.id]?.selectedOptionId
        const selectedOpt = options?.find((o) => o.id === selectedId)

        return (
          <Card
            key={item.id}
            className={`p-4 ${selectedOpt ? 'border-neon/40' : 'border-white/10'}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-9 h-9 rounded-lg bg-neon text-black text-sm font-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(61,220,151,0.35)]">
                {item.displayNumber}
              </span>
              {selectedOpt && (
                <span className="text-sm font-bold text-neon">
                  {selectedOpt.label}
                </span>
              )}
              {selectedOpt && onClear && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onClear(item)}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-red-400 font-semibold"
                >
                  <X size={14} /> O‘chirish
                </button>
              )}
            </div>

            {/* Abzas / paragraf matni */}
            <p
              className="arabic q-text leading-[1.95] mb-3 whitespace-pre-wrap"
              style={{ fontSize: `${fontSize}px` }}
            >
              {item.promptText}
            </p>

            {item.subtitle && (
              <p className="arabic text-sm text-white/50 mb-2 font-bold">{item.subtitle}</p>
            )}

            {/* Har savolda to‘liq variantlar — tepaga chiqish shart emas */}
            <div className={layout === 'list' ? 'space-y-2' : 'grid grid-cols-1 gap-2'}>
              {(options || []).map((opt, i) => {
                const letter = opt.label || OPTION_LETTERS[i]
                const selected = selectedId === opt.id
                const takenByOther = usedBy[opt.id] != null && usedBy[opt.id] !== item.id
                const lockedApi = opt.isLocked && opt.lockedByItemId !== item.id
                const blocked = takenByOther || lockedApi

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled || blocked}
                    onClick={() => onPick(item, opt)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-right transition ${
                      selected
                        ? 'border-neon bg-neon/20 shadow-[0_0_0_1px_rgba(61,220,151,0.35)]'
                        : blocked
                          ? 'opacity-25 border-white/5 bg-black/20 cursor-not-allowed'
                          : 'border-line bg-cardhi active:border-neon/40'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-md text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                        selected
                          ? 'bg-neon text-black'
                          : 'bg-neon/15 text-neon border border-neon/30'
                      }`}
                    >
                      {selected ? <Check size={14} strokeWidth={3} /> : letter}
                    </span>
                    <span
                      className={`arabic flex-1 leading-snug ${selected ? 'text-neon font-semibold' : ''}`}
                      style={{ fontSize: `${Math.max(14, fontSize - 2)}px` }}
                    >
                      {opt.text}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
