import React, { useState } from 'react'
import {
  ListChecks, HeartCrack, Play, Swords, Settings, Trophy,
  Pencil, Zap, CalendarDays,
} from 'lucide-react'
import { useApp } from '../App.jsx'
import { Modal } from '../ui.jsx'
import { selectExamDate, fetchExamDates } from '../api/student.js'
import { hasAuthToken } from '../api/client.js'
import Calendar from './Calendar.jsx'
import Battle from './Battle.jsx'
import ExamSimulator from './ExamSimulator.jsx'
import QuizRunner from './QuizRunner.jsx'
import Section from './Section.jsx'
import NewsSheet from '../components/NewsSheet.jsx'

export default function Dashboard() {
  const app = useApp()
  const [screen, setScreen] = useState('home')
  const [exam, setExam] = useState(null)
  const [section, setSection] = useState(null)
  const [calOpen, setCalOpen] = useState(false)
  const [examPick, setExamPick] = useState(false)

  const name = app.user?.name || 'Mehmon'
  const level = app.user?.level || 'B2'
  const initial = (name[0] || 'M').toUpperCase()
  const remaining = Math.max(0, 1200 - (app.stats.correct + app.stats.wrong))
  const days = app.daysLeft

  if (screen === 'battle') return <Battle onExit={() => setScreen('home')} />
  if (screen === 'quiz') return <QuizRunner onExit={() => setScreen('home')} />
  if (section) return <Section sectionKey={section} onExit={() => setSection(null)} />
  if (exam) return <ExamSimulator type={exam} onExit={() => setExam(null)} />

  return (
    <div className="relative h-full bg-[#0B1210] overflow-hidden">
      <div className="h-full overflow-y-auto px-4 pt-5 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400/40 to-sky-500/30 border border-white/15 flex items-center justify-center text-base font-black shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-[15px] truncate">{name}</h1>
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-sky-500 text-white text-[10px] font-black">
                  {level}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="p-2.5 rounded-xl text-amber-400 hover:bg-white/5" aria-label="Reyting">
              <Trophy size={22} />
            </button>
            <button
              type="button"
              onClick={() => { app.signOut?.() || app.setAuthed(false) }}
              className="p-2.5 rounded-xl text-white/50 hover:bg-white/5"
              aria-label="Sozlamalar"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>

        {/* Progress card */}
        <button
          type="button"
          onClick={() => setCalOpen(true)}
          className="w-full text-left rounded-2xl border border-neon/35 bg-[#0E1A16] p-4 mb-3"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-1.5 text-white/85 font-medium">
              <Pencil size={14} className="text-white/50" />
              {days == null ? 'Sana tanlang' : `${days} kun qoldi`}
            </span>
            <span className="flex items-center gap-1 text-white/45 text-xs">
              <Zap size={13} className="text-amber-400" />
              {days == null ? '—' : `${days} kun`}
            </span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black tabular-nums leading-none">{app.progressPct}%</span>
            <div className="flex items-center gap-3 pb-1 text-sm font-bold">
              <span className="text-neon">✓ {app.stats.correct}</span>
              <span className="text-red-400">× {app.stats.wrong}</span>
              <span className="text-white/35">— {remaining}</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-neon transition-all"
              style={{ width: `${Math.min(100, app.progressPct)}%` }}
            />
          </div>
        </button>

        {/* Grid: tests + mistakes | premium */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setSection('all')}
              className="flex-1 rounded-2xl bg-[#152028] border border-white/8 p-4 text-left active:scale-[0.98] transition"
            >
              <ListChecks size={22} className="text-sky-300 mb-2" />
              <p className="font-bold text-sm leading-snug">Barcha testlar</p>
            </button>
            <button
              type="button"
              onClick={() => setSection('errors')}
              className="relative flex-1 rounded-2xl bg-[#152028] border border-white/8 p-4 text-left active:scale-[0.98] transition"
            >
              {app.errorCount > 0 && (
                <span className="absolute top-2.5 right-2.5 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center">
                  {app.errorCount}
                </span>
              )}
              <HeartCrack size={22} className="text-red-400 mb-2" />
              <p className="font-bold text-sm leading-snug">Xatolarni tuzatish</p>
            </button>
          </div>
          <button
            type="button"
            onClick={() => app.notify?.('Premium tez orada', 'info')}
            className="rounded-2xl bg-gradient-to-b from-[#1a2744] to-[#121c30] border border-sky-500/25 p-4 text-left flex flex-col justify-between min-h-[168px] active:scale-[0.98] transition"
          >
            <p className="text-2xl font-black leading-tight text-white">
              Premium<br />oling
            </p>
            <p className="text-[11px] text-sky-300/80 italic leading-snug mt-3">
              vaqti-vaqti bilan almashib turuvchi blok
            </p>
          </button>
        </div>

        {/* Imtihon topshirish */}
        <button
          type="button"
          onClick={() => setExamPick(true)}
          className="w-full rounded-2xl bg-neon text-black px-4 py-4 flex items-center justify-between mb-2.5 active:scale-[0.99] transition shadow-[0_8px_28px_rgba(61,220,151,0.25)]"
        >
          <div className="text-left">
            <p className="font-black text-lg leading-none">Imtihon topshirish</p>
            <p className="text-xs font-bold text-black/55 mt-1 uppercase tracking-wide">CEFR · AT-TANAL</p>
          </div>
          <span className="w-11 h-11 rounded-full bg-black/15 flex items-center justify-center">
            <Play size={22} fill="currentColor" />
          </span>
        </button>

        {/* Oktagon */}
        <button
          type="button"
          onClick={() => setScreen('battle')}
          className="w-full rounded-2xl bg-[#2A3238] text-white px-4 py-4 flex items-center justify-between active:scale-[0.99] transition"
        >
          <div className="text-left">
            <p className="font-black text-lg leading-none">Oktagon</p>
            <p className="text-xs text-white/45 mt-1">Birga-bir jang. O‘ynab o‘rganing</p>
          </div>
          <span className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <Swords size={20} />
          </span>
        </button>

        {/* Postlar — oddiy scroll, pastga stack (sheet yo‘q) */}
        <NewsSheet onStartCefr={() => setExam('CEFR')} />
      </div>

      {/* Imtihon tanlash */}
      <Modal open={examPick} onClose={() => setExamPick(false)} title="Imtihon turini tanlang">
        <div className="space-y-2">
          <ExamPickRow
            title="CEFR"
            sub="Xalqaro CEFR (A1–C2)"
            onClick={() => { setExamPick(false); setExam('CEFR') }}
          />
          <ExamPickRow
            title="at-Tanal"
            sub="Milliy sertifikat imtihoni"
            onClick={() => { setExamPick(false); setExam('at-Tanal') }}
          />
        </div>
      </Modal>

      <Modal open={calOpen} onClose={() => setCalOpen(false)} title="Imtihon sanasini tanlang">
        <p className="text-slate-400 text-sm mb-4 flex items-center gap-2">
          <CalendarDays size={16} /> CEFR / at-Tanal kunini belgilang
        </p>
        <Calendar
          onSelect={async (date) => {
            app.setExamDate(date)
            if (hasAuthToken()) {
              try {
                const list = await fetchExamDates()
                const match = (list || []).find((d) => String(d.examDateValue || '').startsWith(date))
                if (match?.id) await selectExamDate(match.id)
              } catch { /* */ }
            }
            setCalOpen(false)
            app.notify(`Imtihon sanasi: ${date}`)
          }}
        />
      </Modal>
    </div>
  )
}

function ExamPickRow({ title, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-line bg-cardhi px-4 py-3.5 hover:border-neon/40 transition"
    >
      <p className="font-extrabold">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </button>
  )
}
