import React from 'react'
import { Card } from '../../ui.jsx'
import { OPTION_LETTERS } from '../../lib/examConstants.js'

export default function McqOptions({
  item,
  options,
  selectedOptionId,
  disabled,
  onSelect,
  fontSize = 18,
}) {
  const list = options || item?.options || []
  return (
    <Card className="p-4">
      <p
        className="arabic q-text font-semibold leading-snug mb-3"
        style={{ fontSize: `${fontSize}px` }}
      >
        {item.displayNumber != null ? `${item.displayNumber}. ` : ''}
        {item.promptText || 'Savol'}
      </p>
      <div className="space-y-2">
        {list.map((opt, i) => {
          const selected = selectedOptionId === opt.id
          const letter = opt.label || OPTION_LETTERS[i] || String(i + 1)
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-sm transition ${
                selected ? 'border-neon bg-neon/10' : 'border-line bg-cardhi'
              }`}
            >
              <span
                className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black ${
                  selected ? 'bg-neon text-black border-neon' : 'bg-base text-slate-400 border-line'
                }`}
              >
                {letter}
              </span>
              <span
                className={`flex-1 text-right arabic leading-snug ${selected ? 'q-opt-correct font-medium' : 'q-opt'}`}
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
}
