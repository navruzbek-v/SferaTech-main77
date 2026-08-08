import React from 'react'

function linesFrom(hint, list) {
  if (Array.isArray(list) && list.length) return list
  if (typeof hint === 'string' && hint.trim()) {
    return hint.split(/\n+/).map((s) => s.trim()).filter(Boolean)
  }
  return []
}

/** Speaking 8 — ijobiy / salbiy ustunlar */
export default function SpeakingProsCons({ speakingPrompt }) {
  if (!speakingPrompt) return null
  const pros = linesFrom(speakingPrompt.prosHint, speakingPrompt.pros)
  const cons = linesFrom(speakingPrompt.consHint, speakingPrompt.cons)
  if (!pros.length && !cons.length) return null

  return (
    <div className="grid grid-cols-2 gap-2 mb-2">
      <div className="rounded-xl border border-emerald-500/55 bg-emerald-500/5 p-3">
        <p className="text-xs font-bold text-emerald-400 mb-2">+ Ijobiy tomonlari</p>
        <ul className="space-y-1.5">
          {pros.map((t) => (
            <li key={t} className="arabic q-text text-[13px] leading-relaxed">{t}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-red-500/55 bg-red-500/5 p-3">
        <p className="text-xs font-bold text-red-400 mb-2">− Salbiy tomonlari</p>
        <ul className="space-y-1.5">
          {cons.map((t) => (
            <li key={t} className="arabic q-text text-[13px] leading-relaxed">{t}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
