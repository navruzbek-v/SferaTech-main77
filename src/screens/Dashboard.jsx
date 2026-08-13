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

function Glass({ className = '', style, children, onClick, as = 'button' }) {
  const Tag = as
  const extra = as === 'button' ? { type: 'button' } : {}
  return (
    <Tag
      {...extra}
      onClick={onClick}
      className={`relative text-left rounded-[1.35rem] active:scale-[0.985] transition-transform duration-150 ${className}`}
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
    <div className="relative h-full overflow-hidden" style={{ background: '#081018' }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-16 -right-10 w-64 h-64 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.35), transparent 70%)' }}
        />
        <div
          className="absolute top-40 -left-16 w-56 h-56 rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.28), transparent 70%)' }}
        />
        <div
          className="absolute bottom-24 right-0 w-48 h-48 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.28), transparent 70%)' }}
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
            className="glass w-full p-4 mb-2.5"
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

          <div className="grid grid-cols-2 gap-2.5 mb-2.5 items-stretch">
            <div className="flex flex-col gap-2.5 min-h-0">
              <Glass
                onClick={() => setSection('all')}
                className="glass flex-1 px-3.5 py-3.5 flex items-center gap-3 min-h-[56px]"
              >
                <ListChecks size={20} className="text-white/75 shrink-0" />
                <p className="font-bold text-[13.5px] text-white leading-snug">Barcha testlar</p>
              </Glass>
              <Glass
                onClick={() => setSection('errors')}
                className="glass flex-1 px-3.5 py-3.5 flex items-center gap-3 min-h-[56px]"
              >
                {errors > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500/90 text-white text-[10px] font-black flex items-center justify-center">
                    {errors}
                  </span>
                )}
                <HeartCrack size={20} className="text-rose-300 shrink-0" />
                <p className="font-bold text-[13.5px] text-white leading-snug">Xatolarni tuzatish</p>
              </Glass>
            </div>

            <Glass
              onClick={() => app.notify?.('Premium tez orada', 'info')}
              className="h-full min-h-[118px] p-4 flex flex-col justify-end overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(56,189,248,0.22), rgba(255,255,255,0.05) 55%, rgba(52,211,153,0.12))',
                border: '1px solid rgba(125,211,252,0.22)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
              }}
            >
              <p className="relative font-black text-[1.3rem] text-white leading-tight">Premium oling</p>
              <p className="relative text-[11px] mt-1 font-medium leading-snug text-sky-200/85">
                vaqti-vaqti bilan almashib turuvchi blok
              </p>
            </Glass>
          </div>

          <Glass
            onClick={() => setExamPick(true)}
            className="w-full mb-2.5 px-5 py-[18px] flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.72), rgba(16,185,129,0.42))',
              border: '1px solid rgba(167,243,208,0.35)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
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
            className="w-full mb-2.5 px-5 py-[18px] flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(148,163,184,0.38), rgba(100,116,139,0.22))',
              border: '1px solid rgba(226,232,240,0.18)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
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

          <Glass
            onClick={() => {
              const el = document.querySelector('[data-home-scroll]')
              const news = document.querySelector('[data-news-sheet]')
              news?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              if (!news) el?.scrollBy({ top: 280, behavior: 'smooth' })
            }}
            className="w-full mb-1 px-5 py-5"
            style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,0.55), rgba(14,165,233,0.28))',
              border: '1px solid rgba(186,230,253,0.35)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            <p className="font-black text-[1.35rem] leading-tight text-[#062033]">
              yangiliklar va lifehacklar
            </p>
            <p className="text-[12px] font-semibold text-[#062033]/55 mt-1">
              o&apos;qish uchun pastga torting
            </p>
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
