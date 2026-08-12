import React, { useState } from 'react'
import {
  BookOpen, Headphones, PenLine, Mic, Clock, AlertTriangle, ChevronLeft,
  FileText,
} from 'lucide-react'
import { Button } from '../../ui.jsx'
import { CEFR_BRIEFINGS } from '../../data/cefrBriefing.js'
import { ATTANAL_BRIEFINGS } from '../../lib/attanalConstants.js'

const ICONS = {
  book: BookOpen,
  headphones: Headphones,
  pen: PenLine,
  mic: Mic,
}

/**
 * Skill kirish oynasi — CEFR yoki at-Tanal.
 * «Boshlash» → «Ishonchingiz komilmi?»
 */
export default function CefrBriefing({ skillKey = 'reading', onStart, onBack, variant = 'cefr' }) {
  const map = variant === 'attanal' ? ATTANAL_BRIEFINGS : CEFR_BRIEFINGS
  const b = map[skillKey] || map.reading || CEFR_BRIEFINGS.reading
  const Icon = ICONS[b.icon] || BookOpen
  const orange = b.accent === 'orange'
  const [confirmOpen, setConfirmOpen] = useState(false)
  const attanal = variant === 'attanal'

  if (attanal) {
    return (
      <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-xl mx-auto">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 mb-3 rounded-lg hover:bg-black/5 text-[#666]"
            aria-label="Ortga"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="rounded-xl border p-5 sm:p-7" style={{ background: '#FFF', borderColor: '#C4C4C4' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-white text-[11px] font-black tracking-wide" style={{ background: '#F39200' }}>
              eexam
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#666]">at-Tanal</span>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(243,146,0,0.15)', color: '#F39200' }}>
              <Icon size={24} strokeWidth={2} />
            </div>
            <div className="pt-1">
              <h1 className="text-2xl sm:text-3xl font-black leading-tight text-[#2A2A2A]">{b.titleUz}</h1>
              <p className="text-sm text-[#666] mt-1">Rasmiy imtihon · bir xil eexam joylashuvi</p>
            </div>
          </div>

          <p className="font-extrabold text-[#2A2A2A] mb-3">Bo‘lim haqida</p>
          <div className="space-y-2.5 mb-5 text-sm text-[#444]">
            <p className="flex items-center gap-2.5">
              <Clock size={17} style={{ color: '#F39200' }} />
              {b.durationLabel}
            </p>
            <p className="flex items-center gap-2.5">
              <FileText size={17} style={{ color: '#F39200' }} />
              {b.taskCountLabel}
            </p>
          </div>

          {b.warning && (
            <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-3.5 py-3 mb-5 flex gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-900/80 leading-relaxed">{b.warning}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="w-full py-3.5 rounded-md text-base font-bold text-white active:scale-[0.99] transition flex items-center justify-center gap-2"
            style={{ background: '#F39200' }}
          >
            <Icon size={20} />
            {b.cta || 'Imtihonni boshlash'}
          </button>
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-5" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
            <div className="relative w-full max-w-[360px] rounded-xl bg-white border shadow-2xl p-5" style={{ borderColor: '#C4C4C4' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={22} className="text-black" strokeWidth={2.5} />
                </div>
                <div className="pt-0.5">
                  <h2 className="text-lg font-black text-[#2A2A2A] leading-tight">Ishonchingiz komilmi?</h2>
                  <p className="text-sm text-[#666] mt-1.5 leading-relaxed">
                    Vaqt hisoblana boshlaydi. Tayyor bo‘lsangiz davom eting.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 mt-5">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2.5 rounded-md text-sm font-semibold text-[#444] border"
                  style={{ background: '#EEEEEE', borderColor: '#C4C4C4' }}
                >
                  Bekor
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirmOpen(false); onStart?.() }}
                  className="px-4 py-2.5 rounded-md text-sm font-bold text-white"
                  style={{ background: '#F39200' }}
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
          {b.cta || 'Boshlash'}
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
