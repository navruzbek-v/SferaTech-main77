import React, { useState } from 'react'
import {
  ListChecks, HeartCrack, Play, Swords, Settings, Trophy,
  Pencil, Zap, CalendarDays, Sparkles,
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

/** Jonli palitra — lime / sky / slate, bir-biriga mos */
const C = {
  bg: '#12151c',
  tile: '#1e2430',
  tileDeep: '#171b24',
  lime: '#6EE000',
  limeDeep: '#4FAD00',
  sky: '#3BBFF5',
  skyDeep: '#1E9FD4',
  slate: '#8B95A8',
  slateDeep: '#6B7588',
}

function Tile3D({ bg, deep, className = '', children, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`relative text-left active:translate-y-[2px] active:shadow-none transition ${className}`}
      style={{
        background: bg,
        boxShadow: `0 5px 0 ${deep}`,
        borderRadius: '1.35rem',
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

  if (screen === 'battle') return <Battle onExit={() => setScreen('home')} />
  if (screen === 'quiz') return <QuizRunner onExit={() => setScreen('home')} />
  if (section) return <Section sectionKey={section} onExit={() => setSection(null)} />
  if (exam) return <ExamSimulator type={exam} onExit={() => setExam(null)} />

  return (
    <div className="relative h-full overflow-hidden" style={{ background: C.bg }}>
      <div className="relative h-full overflow-y-auto px-3.5 pt-4 pb-8" data-home-scroll>
        {/* Bosh blok — snap nuqtasi (postlarga sakrab ketmasin) */}
        <div style={{ scrollSnapAlign: 'start', scrollSnapStop: 'normal' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-base font-black shrink-0 text-[#0B1B3A]"
              style={{ background: C.lime }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-[15px] text-white truncate">{name}</h1>
              <p className="text-[11px] font-bold tracking-wide" style={{ color: C.lime }}>
                {level} · O‘QUVCHI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button type="button" className="p-2.5 rounded-xl text-amber-300 hover:bg-white/5" aria-label="Reyting">
              <Trophy size={22} />
            </button>
            <button
              type="button"
              onClick={() => { app.signOut?.() || app.setAuthed(false) }}
              className="p-2.5 rounded-xl text-white/45 hover:bg-white/5"
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
          className="w-full text-left rounded-[1.35rem] p-4 mb-3"
          style={{ background: C.tile }}
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-1.5 text-white/90 font-semibold">
              <Pencil size={14} className="text-white/40" />
              {days == null ? 'Sana tanlang' : `${days} kun qoldi`}
            </span>
            <span className="flex items-center gap-1 text-white/40 text-xs font-bold">
              <Zap size={13} style={{ color: C.lime }} />
              {days == null ? '—' : `${days} kun`}
            </span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black tabular-nums leading-none text-white">{app.progressPct}%</span>
            <div className="flex items-center gap-3 pb-1 text-sm font-bold">
              <span style={{ color: C.lime }}>✓ {app.stats.correct}</span>
              <span className="text-rose-400">× {app.stats.wrong}</span>
              <span className="text-white/30">— {remaining}</span>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#0d1016' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, app.progressPct)}%`, background: C.lime }}
            />
          </div>
        </button>

        {/* 2 kichik tile */}
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <Tile3D
            bg={C.tile}
            deep={C.tileDeep}
            onClick={() => setSection('all')}
            className="p-3.5"
          >
            <span
              className="inline-flex w-9 h-9 rounded-full items-center justify-center mb-2"
              style={{ background: `${C.sky}33` }}
            >
              <ListChecks size={18} style={{ color: C.sky }} />
            </span>
            <p className="font-bold text-[13px] text-white leading-snug">Barcha testlar</p>
          </Tile3D>
          <Tile3D
            bg={C.tile}
            deep={C.tileDeep}
            onClick={() => setSection('errors')}
            className="p-3.5 relative"
          >
            {app.errorCount > 0 && (
              <span className="absolute top-2.5 right-2.5 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {app.errorCount}
              </span>
            )}
            <span className="inline-flex w-9 h-9 rounded-full items-center justify-center mb-2 bg-rose-500/20">
              <HeartCrack size={18} className="text-rose-400" />
            </span>
            <p className="font-bold text-[13px] text-white leading-snug">Xatolarni tuzatish</p>
          </Tile3D>
        </div>

        {/* Premium — sky */}
        <Tile3D
          bg={C.sky}
          deep={C.skyDeep}
          onClick={() => app.notify?.('Premium tez orada', 'info')}
          className="w-full px-4 py-4 mb-2.5 flex items-center justify-between"
        >
          <div>
            <p className="text-xl font-black text-white leading-tight">Premium oling</p>
            <p className="text-[11px] text-white/80 mt-0.5 font-medium">
              vaqti-vaqti bilan almashib turuvchi blok
            </p>
          </div>
          <span className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-white" />
          </span>
        </Tile3D>

        {/* Imtihon + Oktagon */}
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <Tile3D
            bg={C.lime}
            deep={C.limeDeep}
            onClick={() => setExamPick(true)}
            className="min-h-[118px] p-4 flex flex-col justify-between"
          >
            <span className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center">
              <Play size={20} fill="#0B1B3A" className="text-[#0B1B3A]" />
            </span>
            <div>
              <p className="font-black text-[16px] text-[#0B1B3A] leading-tight">Imtihon</p>
              <p className="text-[10px] font-bold text-[#0B1B3A]/55 uppercase tracking-wide mt-0.5">
                CEFR · AT-TANAL
              </p>
            </div>
          </Tile3D>
          <Tile3D
            bg={C.slate}
            deep={C.slateDeep}
            onClick={() => setScreen('battle')}
            className="min-h-[118px] p-4 flex flex-col justify-between"
          >
            <span className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center">
              <Swords size={20} className="text-white" />
            </span>
            <div>
              <p className="font-black text-[16px] text-white leading-tight">Oktagon</p>
              <p className="text-[10px] font-bold text-white/70 mt-0.5">Birga-bir jang</p>
            </div>
          </Tile3D>
        </div>
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
