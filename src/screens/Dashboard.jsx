import React, { useState } from 'react'
import {
  ListOrdered, HeartCrack, Play, Swords, Settings, Trophy,
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

function Glass({ className = '', style, children, onClick, as = 'button' }) {
  const Tag = as
  const extra = as === 'button' ? { type: 'button' } : {}
  return (
    <Tag
      {...extra}
      onClick={onClick}
      className={`relative text-left rounded-[1.35rem] ${className}`}
      style={style}
    >
      {children}
    </Tag>
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
    <div className="relative h-full overflow-hidden" style={{ background: '#0d1319' }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -right-12 w-72 h-72 rounded-full blur-[80px] opacity-[0.18]"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.35), transparent 70%)' }}
        />
        <div
          className="absolute top-36 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-[0.16]"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.3), transparent 70%)' }}
        />
        <div
          className="absolute bottom-20 -right-8 w-56 h-56 rounded-full blur-[70px] opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.3), transparent 70%)' }}
        />
      </div>

      <div
        className="home-scroll relative h-full overflow-y-auto px-3.5 pb-8"
        data-home-scroll
        style={{ paddingTop: 8 }}
      >
        <div style={{ scrollSnapAlign: 'start' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-black text-[#062016]"
                  style={{ background: 'rgba(52,211,153,0.9)' }}
                >
                  {initial}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#081018]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 className="font-extrabold text-[15px] text-white truncate">{name}</h1>
                  <BadgeCheck size={15} className="shrink-0 text-sky-300" />
                  <span className="shrink-0 px-1.5 py-[1px] rounded-md text-[10px] font-black text-white bg-sky-400/80">
                    {level}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" className="p-2 rounded-xl text-amber-200/90" aria-label="Reyting">
                <Trophy size={20} />
              </button>
              <button
                type="button"
                onClick={() => { app.signOut?.() || app.setAuthed(false) }}
                className="p-2 rounded-xl text-white/40"
                aria-label="Sozlamalar"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          <Glass
            onClick={() => setCalOpen(true)}
            className="btn-3d w-full p-4 mb-6"
            style={{
              background: 'linear-gradient(165deg, #1a3d32 0%, #142a24 100%)',
              border: '1px solid rgba(52,211,153,0.18)',
              '--btn-edge': '#0d1f1a',
              '--btn-glow': 'rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-semibold">
                <Pencil size={14} className="text-white/40" />
                {days == null ? 'Sana tanlang' : `${days} kun qoldi`}
              </span>
              <span className="flex items-center gap-1 text-white/45 text-xs font-bold">
                <Zap size={13} className="text-amber-200" />
                {days == null ? '0 kun' : `${days} kun`}
              </span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <span className="text-[2.2rem] font-black tabular-nums leading-none text-white">
                {app.progressPct}%
              </span>
              <div className="flex items-center gap-3 pb-1 text-[13px] font-bold">
                <span className="text-emerald-300">✓ {app.stats.correct}</span>
                <span className="text-rose-300">× {app.stats.wrong}</span>
                <span className="text-white/35">— {remaining}</span>
              </div>
            </div>
            <div className="mt-3 h-[6px] rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, app.progressPct)}%`,
                  background: 'linear-gradient(90deg, rgba(52,211,153,0.95), rgba(56,189,248,0.85))',
                }}
              />
            </div>
          </Glass>

          <div className="grid grid-cols-2 gap-2.5 mb-6 items-stretch">
            <div className="flex flex-col gap-3.5 min-h-0">
              <Glass
                onClick={() => setSection('all')}
                className="btn-3d flex-1 px-3.5 py-3.5 flex items-center gap-3 min-h-[56px]"
                style={{
                  background: '#16212e',
                  border: '1px solid rgba(255,255,255,0.07)',
                  '--btn-edge': '#0a1118',
                  '--btn-glow': 'rgba(0,0,0,0.45)',
                }}
              >
                <ListOrdered size={21} className="text-sky-300/90 shrink-0" />
                <p className="font-bold text-[14.5px] text-white leading-snug">Barcha testlar</p>
              </Glass>
              <Glass
                onClick={() => setSection('errors')}
                className="btn-3d flex-1 px-3.5 py-3.5 flex items-center gap-3 min-h-[56px]"
                style={{
                  background: '#16212e',
                  border: '1px solid rgba(255,255,255,0.07)',
                  '--btn-edge': '#0a1118',
                  '--btn-glow': 'rgba(0,0,0,0.45)',
                }}
              >
                {errors > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    {errors}
                  </span>
                )}
                <HeartCrack size={21} className="text-rose-400 shrink-0" />
                <p className="font-bold text-[14.5px] text-white leading-snug">Xatolarni tuzatish</p>
              </Glass>
            </div>

            <Glass
              onClick={() => app.notify?.('Premium tez orada', 'info')}
              className="btn-3d aspect-square w-full p-3 flex flex-col items-center justify-center text-center overflow-hidden"
              style={{
                background: '#16212e',
                border: '1px solid rgba(125,211,252,0.14)',
                '--btn-edge': '#0a1118',
                '--btn-glow': 'rgba(0,0,0,0.45)',
              }}
            >
              <span aria-hidden className="absolute inset-0 pointer-events-none">
                <span
                  className="absolute left-[34%] top-[6%] w-[20%] h-[44%] blur-[7px]"
                  style={{
                    background: 'rgba(41,110,128,0.75)',
                    borderRadius: '50% 50% 42% 42% / 60% 60% 40% 40%',
                    transform: 'rotate(-6deg)',
                  }}
                />
                <span
                  className="absolute left-[50%] top-[2%] w-[24%] h-[52%] blur-[8px]"
                  style={{
                    background: 'rgba(35,96,113,0.8)',
                    borderRadius: '48% 52% 40% 40% / 58% 58% 42% 42%',
                    transform: 'rotate(5deg)',
                  }}
                />
                <span
                  className="absolute left-[66%] top-[10%] w-[18%] h-[38%] blur-[7px]"
                  style={{
                    background: 'rgba(30,84,99,0.7)',
                    borderRadius: '50% 50% 44% 44% / 62% 62% 38% 38%',
                    transform: 'rotate(12deg)',
                  }}
                />
              </span>
              <p className="relative font-black text-[1.35rem] text-white leading-tight">Premium oling</p>
              <p className="relative text-[10.5px] mt-2 font-bold leading-snug text-[#3fb6e8]">
                vaqti-vaqti bilan almashib turuvchi blok
              </p>
            </Glass>
          </div>

          <Glass
            onClick={() => setExamPick(true)}
            className="btn-3d w-full mb-4 px-5 py-[18px] flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #6ee04a, #3dcc62)',
              border: '1px solid rgba(187,247,208,0.35)',
              '--btn-edge': '#2c9c33',
              '--btn-glow': 'rgba(61,204,98,0.3)',
            }}
          >
            <div>
              <p className="font-black text-[1.3rem] leading-none text-[#062016]">Imtihon topshirish</p>
              <p className="text-[11px] font-bold mt-1 tracking-wide text-[#062016]/60">CEFR • AT-TANAL</p>
            </div>
            <span className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shrink-0">
              <Play size={20} fill="#10B981" className="text-emerald-500" style={{ marginLeft: 2 }} />
            </span>
          </Glass>

          <Glass
            onClick={() => setScreen('battle')}
            className="btn-3d w-full mb-4 px-5 py-[18px] flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #8aa7b8, #6d8a9c)',
              border: '1px solid rgba(226,232,240,0.22)',
              '--btn-edge': '#4d6675',
              '--btn-glow': 'rgba(0,0,0,0.4)',
            }}
          >
            <div>
              <p className="font-black text-[1.3rem] text-white leading-none">Oktagon</p>
              <p className="text-[11px] font-semibold text-white/70 mt-1">
                Birga-bir jang. O&apos;ynab o&apos;rganing
              </p>
            </div>
            <span className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shrink-0">
              <Swords size={20} className="text-slate-600" />
            </span>
          </Glass>
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
      className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 hover:bg-white/10 transition"
    >
      <p className="font-extrabold">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </button>
  )
}
