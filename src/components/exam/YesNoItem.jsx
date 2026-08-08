import React from 'react'
import { Card } from '../../ui.jsx'

/** Faqat نعم / لا */
const OPTIONS = [
  { value: 1, letter: 'A', label: 'نعم' },
  { value: 0, letter: 'B', label: 'لا' },
]

export default function YesNoItem({ item, value, disabled, onSelect }) {
  return (
    <Card className="p-3">
      <div className="flex flex-row gap-3 items-center">
        <div className="flex gap-1.5 shrink-0">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(o.value)}
              className={`w-14 h-11 rounded-xl border text-center transition ${
                value === o.value
                  ? 'border-neon bg-neon/15 text-neon'
                  : 'border-line bg-cardhi text-white'
              }`}
            >
              <span className="arabic text-base font-bold block">{o.label}</span>
            </button>
          ))}
        </div>
        <p className="arabic q-text font-semibold text-sm leading-relaxed flex-1 text-right">
          <span className="text-neon font-bold ms-1">{item.displayNumber}.</span>
          {item.promptText}
        </p>
      </div>
    </Card>
  )
}

/**
 * Listening part 2: variantlar CHAPDA, matn O‘NGDA
 */
export function YesNoPart({ items, answers, disabled, onAnswer, instruction }) {
  return (
    <div className="space-y-3">
      {instruction && (
        <p className="text-xs text-white/45 px-0.5">{instruction}</p>
      )}
      <Card className="p-3 overflow-hidden">
        {/* Chap → o‘ng: نعم | لا | الجملة */}
        <div className="grid grid-cols-[4.25rem_4.25rem_1fr] gap-1.5 text-center text-[11px] font-bold text-white/45 mb-2 px-0.5">
          <span>A نعم</span>
          <span>B لا</span>
          <span className="text-right pe-1">الجملة</span>
        </div>
        <div className="space-y-2">
          {(items || []).map((item) => {
            const v = answers?.[item.id]?.yesNoValue
            return (
              <div
                key={item.id}
                className="grid grid-cols-[4.25rem_4.25rem_1fr] gap-1.5 items-center border border-line rounded-xl p-2 bg-cardhi/40"
              >
                {OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onAnswer(item, {
                      itemId: item.id,
                      answerType: 'yes_no',
                      yesNoValue: o.value,
                    })}
                    className={`h-11 rounded-lg border text-sm font-black arabic ${
                      v === o.value
                        ? 'border-neon bg-neon text-black'
                        : 'border-line bg-base text-white/80'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
                <p className="arabic q-text text-sm leading-relaxed text-right px-1.5">
                  <span className="text-neon font-bold ms-1">{item.displayNumber}.</span>
                  {item.promptText}
                </p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
