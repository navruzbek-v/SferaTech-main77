import React, { useState } from 'react'
import {
  ListChecks, HeartCrack, Play, Swords, Settings, Trophy,
  Pencil, Zap, CalendarDays, BadgeCheck,
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

/** Uyg‘un palitra — mint / teal / mist (reference layout, yumshoqroq ranglar) */
const C = {
  bg: '#10161C',
  tile: '#1B232C',
  tileDeep: '#12181F',
  mint: '#3AD68A',
  mintDeep: '#26B06C',
  mintInk: '#08301C',
  teal: '#3EB6D9',
  tealDeep: '#1A4A5C',
  mist: '#8A97A8',
  mistDeep: '#6B7888',
  ink: '#F4F7FA',
}

function Press({ bg, deep, className = '', style, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left active:translate-y-[2px] active:shadow-none transition ${className}`}
      style={{
        background: bg,
        boxShadow: `0 5px 0 ${deep}`,
        borderRadius: '1.4rem',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

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
  const errors = app.errorCount || app.stats.wrong || 0

  if (screen === 'battle') return <Battle onExit={() => setScreen('home')} />
  if (screen === 'quiz') return <QuizRunner onExit={() => setScreen('home')} />
  if (section) return <Section sectionKey={section} onExit={() => setSection(null)} />
  if (exam) return <ExamSimulator type={exam} onExit={() => setExam(null)} />

  return (
    <div className="relative h-full overflow-hidden" style={{ background: C.bg }}>
      <div
        className="relative h-full overflow-y-auto px-3.5 pb-8"
        data-home-scroll
        style={{ paddingTop: '0.65rem' }}
      >
        <div style={{ scrollSnapAlign: 'start', scrollSnapStop: 'normal' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[17px] font-black"
                  style={{ background: C.mint, color: C.mintInk }}
                >
                  {initial}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{ background: C.mint, borderColor: C.bg }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 className="font-extrabold text-[15px] text-white truncate">{name}</h1>
                  <BadgeCheck size={16} className="shrink-0" style={{ color: C.teal }} />
                  <span
                    className="shrink-0 px-1.5 py-[1px] rounded-md text-[10px] font-black text-white"
                    style={{ background: C.teal }}
                  >
                    {level}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" className="p-2 rounded-xl text-amber-300" aria-label="Reyting">
                <Trophy size={22} />
              </button>
              <button
                type="button"
                onClick={() => { app.signOut?.() || app.setAuthed(false) }}
                className="p-2 rounded-xl text-white/40"
                aria-label="Sozlamalar"
              >
                <Settings size={22} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <button
            type="button"
            onClick={() => setCalOpen(true)}
            className="w-full text-left rounded-[1.4rem] p-4 mb-2.5"
            style={{ background: C.tile }}
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-semibold">
                <Pencil size={14} className="text-white/35" />
                {days == null ? 'Sana tanlang' : `${days} kun qoldi`}
              </span>
              <span className="flex items-center gap-1 text-white/40 text-xs font-bold">
                <Zap size={13} className="text-amber-300" />
                {days == null ? '0 kun' : `${days} kun`}
              </span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <span className="text-[2.35rem] font-black tabular-nums leading-none text-white">
                {app.progressPct}%
              </span>
              <div className="flex items-center gap-3 pb-1 text-[13px] font-bold">
                <span style={{ color: C.mint }}>✓ {app.stats.correct}</span>
                <span className="text-rose-400">× {app.stats.wrong}</span>
                <span className="text-white/30">— {remaining}</span>
              </div>
            </div>
            <div className="mt-3 h-[7px] rounded-full overflow-hidden" style={{ background: '#0C1116' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, app.progressPct)}%`, background: C.mint }}
              />
            </div>
          </button>

          {/* Chap: 2 kichik · O‘ng: Premium (baland) */}
          <div className="grid grid-cols-2 gap-2.5 mb-2.5 items-stretch">
            <div className="flex flex-col gap-2.5 min-h-0">
              <Press
                bg={C.tile}
                deep={C.tileDeep}
                onClick={() => setSection('all')}
                className="flex-1 px-3.5 py-3.5 flex items-center gap-3"
              >
                <ListChecks size={22} className="text-white/80 shrink-0" />
                <p className="font-bold text-[13.5px] text-white leading-snug">Barcha testlar</p>
              </Press>
              <Press
                bg={C.tile}
                deep={C.tileDeep}
                onClick={() => setSection('errors')}
                className="flex-1 px-3.5 py-3.5 flex items-center gap-3"
              >
                {errors > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center shadow">
                    {errors}
                  </span>
                )}
                <HeartCrack size={22} className="text-rose-400 shrink-0" />
                <p className="font-bold text-[13.5px] text-white leading-snug">Xatolarni tuzatish</p>
              </Press>
            </div>

            <Press
              bg={C.tile}
              deep={C.tileDeep}
              onClick={() => app.notify?.('Premium tez orada', 'info')}
              className="h-full min-h-[118px] p-4 flex flex-col justify-end overflow-hidden"
              style={{
                background: `linear-gradient(160deg, #243542 0%, ${C.tile} 55%, #152028 100%)`,
              }}
            >
              <div
                aria-hidden
                className="absolute -right-6 -top-8 w-28 h-28 rounded-full opacity-40 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #3EB6D9 0%, transparent 70%)' }}
              />
              <div
                aria-hidden
                className="absolute right-2 top-6 w-20 h-20 rounded-full opacity-25 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #3AD68A 0%, transparent 70%)' }}
              />
              <p className="relative font-black text-[1.35rem] text-white leading-tight">Premium oling</p>
              <p className="relative text-[11px] mt-1 font-medium leading-snug" style={{ color: C.teal }}>
                vaqti-vaqti bilan almashib turuvchi blok
              </p>
            </Press>
          </div>

          {/* Imtihon — to‘liq kenglik */}
          <Press
            bg={C.mint}
            deep={C.mintDeep}
            onClick={() => setExamPick(true)}
            className="w-full mb-2.5 px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-black text-[1.35rem] leading-none" style={{ color: C.mintInk }}>
                Imtihon topshirish
              </p>
              <p className="text-[11px] font-bold mt-1 tracking-wide" style={{ color: `${C.mintInk}99` }}>
                CEFR • AT-TANAL
              </p>
            </div>
            <span
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.12)' }}
            >
              <Play size={22} fill={C.mint} style={{ color: C.mint, marginLeft: 2 }} />
            </span>
          </Press>

          {/* Oktagon — to‘liq kenglik */}
          <Press
            bg={C.mist}
            deep={C.mistDeep}
            onClick={() => setScreen('battle')}
            className="w-full mb-2.5 px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-black text-[1.35rem] text-white leading-none">Oktagon</p>
              <p className="text-[11px] font-semibold text-white/75 mt-1">
                Birga-bir jang. O&apos;ynab o&apos;rganing
              </p>
            </div>
            <span
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.12)' }}
            >
              <Swords size={22} style={{ color: C.mistDeep }} />
            </span>
          </Press>

          {/* Yangiliklar teaser */}
          <Press
            bg="#4BA3D6"
            deep="#2E7FB0"
            onClick={() => {
              const el = document.querySelector('[data-home-scroll]')
              const news = document.querySelector('[data-news-sheet]')
              news?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              if (!news) el?.scrollBy({ top: 280, behavior: 'smooth' })
            }}
            className="w-full mb-1 px-5 py-6"
          >
            <p className="font-black text-[1.45rem] leading-tight text-[#0B1B3A]">
              yangiliklar va lifehacklar
            </p>
            <p className="text-[12px] font-semibold text-[#0B1B3A]/55 mt-1">
              o&apos;qish uchun pastga torting
            </p>
          </Press>
        </div>

        <NewsSheet onStartCefr={() => setExam('CEFR')} />
      </div>

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
