import React, { useState } from 'react'
import {
  BookOpen, Headphones, PenLine, Mic, Clock, AlertTriangle, ChevronLeft,
  FileText,
} from 'lucide-react'
import { Button } from '../../ui.jsx'
import { CEFR_BRIEFINGS } from '../../data/cefrBriefing.js'

const ICONS = {
  book: BookOpen,
  headphones: Headphones,
  pen: PenLine,
  mic: Mic,
}

/**
 * Skill kirish oynasi — faqat skill, vaqt, vazifalar soni.
 * «Boshlash» → «Ishonchingiz komilmi?»
 */
export default function CefrBriefing({ skillKey = 'reading', onStart, onBack }) {
  const b = CEFR_BRIEFINGS[skillKey] || CEFR_BRIEFINGS.reading
  const Icon = ICONS[b.icon] || BookOpen
  const orange = b.accent === 'orange'
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain bg-[#0B1210]">
      <div className="px-5 pt-4 pb-10 max-w-lg mx-auto">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 mb-2 rounded-xl hover:bg-white/5 text-white/60"
            aria-label="Ortga"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="flex items-start gap-3 mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              orange ? 'bg-orange-500/15 text-orange-400' : 'bg-neon/15 text-neon'
            }`}
          >
            <Icon size={24} strokeWidth={2} />
          </div>
          <div className="pt-2">
            <h1 className="text-2xl font-black text-white leading-none">{b.titleUz}</h1>
          </div>
        </div>

        <p className="font-extrabold text-white mb-3">Test haqida:</p>
        <div className="space-y-2.5 mb-6 text-sm text-white/75">
          <p className="flex items-center gap-2.5">
            <Clock size={17} className={orange ? 'text-orange-400' : 'text-neon'} />
            {b.durationLabel}
          </p>
          <p className="flex items-center gap-2.5">
            <FileText size={17} className={orange ? 'text-orange-400' : 'text-neon'} />
            {b.taskCountLabel}
          </p>
        </div>

        {b.warning && (
          <div className="rounded-xl border border-white/12 bg-[#121816] px-3.5 py-3 mb-5 flex gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[13px] text-white/70 leading-relaxed">{b.warning}</p>
          </div>
        )}

        <Button
          type="button"
          variant={orange ? 'tg' : 'primary'}
          className={`w-full py-3.5 text-base font-bold ${
            orange ? '!bg-[#2AABEE] !text-white hover:!brightness-110' : ''
          }`}
          onClick={() => setConfirmOpen(true)}
        >
          <Icon size={20} />
          {b.cta}
        </Button>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-start-title"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative w-full max-w-[340px] rounded-2xl bg-[#1c1c1e] border border-white/10 shadow-2xl p-5 animate-pop">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="text-black" strokeWidth={2.5} />
              </div>
              <div className="pt-0.5">
                <h2 id="confirm-start-title" className="text-lg font-black text-white leading-tight">
                  Ishonchingiz komilmi?
                </h2>
                <p className="text-sm text-white/55 mt-1.5 leading-relaxed">
                  Test boshlanadi. Tayyor bo‘lsangiz, davom eting.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/85 bg-[#2c2c2e] border border-white/10 hover:bg-[#353538]"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false)
                  onStart?.()
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2AABEE] hover:brightness-110"
              >
                Ha, boshlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
