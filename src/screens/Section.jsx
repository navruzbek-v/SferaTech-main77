import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import { ChevronLeft, Check, Lock, ChevronRight, Play, RotateCcw, Star } from 'lucide-react'
import { useApp } from '../App.jsx'
import { Card, Button, Badge, ProgressBar } from '../ui.jsx'
import {
  MENU_TILES, TOPICS, TICKETS, KEYWORDS, HARD_QUESTIONS,
} from '../data.js'
import QuizRunner from './QuizRunner.jsx'
import ExamSimulator from './ExamSimulator.jsx'

// Barcha menyu bo'limlari uchun umumiy sahifa (Duolingo uslubida)
export default function Section({ sectionKey, onExit }) {
  const meta = MENU_TILES.find((t) => t.key === sectionKey) || { label: 'Bo‘lim', icon: 'Circle' }
  // quiz — QuizRunner API dan yuklaydi (lokal savol yo‘q)
  const [quiz, setQuiz] = useState(null)
  const [exam, setExam] = useState(null)

  if (exam) return <ExamSimulator type={exam} onExit={() => setExam(null)} />
  if (quiz) return <QuizRunner {...quiz} onExit={() => setQuiz(null)} />

  const startQuiz = (cfg) => setQuiz({
    title: cfg.title || 'Test',
    count: cfg.count || 10,
    passage: cfg.passage ?? null,
  })

  return (
    <div className="h-full min-h-0 bg-base overflow-y-auto overscroll-contain pb-16">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 sticky top-0 bg-base/95 backdrop-blur z-10 border-b border-line flex items-center gap-3">
        <button onClick={onExit} className="p-2 rounded-xl hover:bg-cardhi text-slate-300"><ChevronLeft size={20} /></button>
        <div className="flex items-center gap-2">
          <SectionIcon name={meta.icon} className={meta.color} />
          <h1 className="font-extrabold text-lg leading-none">{meta.label}</h1>
        </div>
      </div>

      <div className="px-5 mt-5">
        <Router sectionKey={sectionKey} startQuiz={startQuiz} startExam={setExam} />
      </div>
    </div>
  )
}

function SectionIcon({ name, className }) {
  const Ico = Icons[name] || Icons.Circle
  return (
    <div className={`w-9 h-9 rounded-xl bg-cardhi flex items-center justify-center ${className || ''}`}>
      <Ico size={18} />
    </div>
  )
}

// Har bir bo'lim kalitiga mos ko'rinishni tanlaydi
function Router({ sectionKey, startQuiz, startExam }) {
  switch (sectionKey) {
    case 'topics': return <TopicsPath startQuiz={startQuiz} />
    case 'tickets': return <TicketsGrid startQuiz={startQuiz} />
    case 'sets': return <SetsPicker startQuiz={startQuiz} />
    case 'errors': return <ErrorsView startQuiz={startQuiz} />
    case 'keywords': return <KeywordsCards />
    case 'saved': return <SavedView startQuiz={startQuiz} />
    case 'real': return <RealExamPicker startExam={startExam} />
    case 'distract': return <DistractView startQuiz={startQuiz} />
    case 'numbers': return <NumbersView startQuiz={startQuiz} />
    case 'all':
    default: return <AllTestsView startQuiz={startQuiz} />
  }
}

// ---------- Mavzular — Duolingo uslubidagi vertikal yo'lak ----------
function TopicsPath({ startQuiz }) {
  return (
    <div className="space-y-8">
      <p className="text-slate-400 text-sm">Har bir mavzuni bosqichma-bosqich o‘rganing. Darsni yakunlab keyingisini oching.</p>
      {TOPICS.map((unit, ui) => (
        <div key={unit.id}>
          {/* Unit sarlavhasi */}
          <div className="rounded-2xl p-4 mb-5" style={{ background: `${unit.accent}18`, border: `1px solid ${unit.accent}33` }}>
            <p className="text-[11px] uppercase tracking-wide font-bold" style={{ color: unit.accent }}>{ui + 1}-bo‘lim</p>
            <p className="font-extrabold text-lg mt-0.5">{unit.title}</p>
          </div>

          {/* Zigzag yo'lak */}
          <div className="flex flex-col items-center gap-6">
            {unit.lessons.map((les, li) => {
              const prev = li === 0 ? true : unit.lessons[li - 1].done
              const locked = !les.done && !prev
              const current = !les.done && prev
              // chap-o'ng suriladigan pozitsiya
              const shift = [0, 56, 0, -56][li % 4]
              const LesIco = Icons[les.icon] || Star
              return (
                <div key={les.id} className="flex flex-col items-center" style={{ transform: `translateX(${shift}px)` }}>
                  <button
                    disabled={locked}
                    onClick={() => startQuiz({
                      title: `${unit.title} · ${les.title}`,
                      count: 6,
                      passage: null,
                    })}
                    className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center transition active:scale-95 shadow-lg ${
                      locked ? 'bg-cardhi text-slate-600 cursor-not-allowed'
                        : les.done ? 'text-black' : 'text-black ring-4 ring-offset-2 ring-offset-base'
                    }`}
                    style={!locked ? { background: unit.accent, boxShadow: `0 6px 0 ${unit.accent}88`, '--tw-ring-color': `${unit.accent}66` } : {}}
                  >
                    {locked ? <Lock size={22} /> : les.done ? <Check size={26} strokeWidth={3} /> : <LesIco size={26} />}
                    {current && (
                      <span className="absolute -top-8 px-2 py-1 rounded-lg bg-white text-black text-[11px] font-bold whitespace-nowrap animate-pop">BOSHLASH</span>
                    )}
                  </button>
                  <span className={`text-xs font-semibold mt-2 ${locked ? 'text-slate-600' : 'text-slate-300'}`}>{les.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- Biletlar — raqamli kartalar to'ri ----------
function TicketsGrid({ startQuiz }) {
  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">Har bir bilet {TICKETS[0].count} ta savoldan iborat. Xohlagan biletni tanlang.</p>
      <div className="grid grid-cols-3 gap-3">
        {TICKETS.map((t) => (
          <button
            key={t.id}
            onClick={() => startQuiz({ title: `Bilet ${t.n}`, count: 10, passage: null })}
            className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
              t.done ? 'border-neon/40 bg-neon/10' : 'border-line bg-card hover:border-slate-500'
            }`}
          >
            <span className={`text-2xl font-black ${t.done ? 'text-neon' : 'text-slate-200'}`}>{t.n}</span>
            {t.done ? <Check size={14} className="text-neon" /> : <span className="text-[10px] text-slate-500">{t.count} savol</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------- 50/100 talik to'plamlar ----------
function SetsPicker({ startQuiz }) {
  const sets = [
    { n: 20, label: '20 talik', sub: 'Qisqa mashq', color: 'text-sky-300' },
    { n: 50, label: '50 talik', sub: 'O‘rta hajm', color: 'text-amber-300' },
    { n: 100, label: '100 talik', sub: 'To‘liq sinov', color: 'text-rose-300' },
  ]
  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-sm mb-1">Nechta savoldan iborat to‘plamni yechmoqchisiz?</p>
      {sets.map((s) => (
        <Card
          key={s.n}
          onClick={() => startQuiz({ title: `${s.label} to‘plam`, count: s.n, passage: null })}
          className="p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-cardhi flex items-center justify-center font-black ${s.color}`}>{s.n}</div>
            <div>
              <p className="font-bold">{s.label}</p>
              <p className="text-xs text-slate-500">{s.sub}</p>
            </div>
          </div>
          <ChevronRight className="text-slate-500" />
        </Card>
      ))}
    </div>
  )
}

// ---------- Xatolarni tuzatish ----------
function ErrorsView({ startQuiz }) {
  const app = useApp()
  const n = Math.max(4, Math.min(12, app.errorCount || 7))
  return (
    <div>
      <Card className="p-4 mb-4 bg-gradient-to-br from-[#2a1414] to-[#1a1010] border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-300 text-xs font-semibold uppercase">Xatolar ustida ishlash</p>
            <p className="text-3xl font-black mt-1">{app.errorCount}</p>
            <p className="text-slate-400 text-xs mt-1">tuzatilishi kerak bo‘lgan savol</p>
          </div>
          <Icons.AlertTriangle size={40} className="text-red-400/60" />
        </div>
      </Card>
      <p className="text-slate-400 text-sm mb-4">Avval xato qilgan savollaringizni qaytadan yeching — mustahkamlash uchun eng samarali usul.</p>
      <Button variant="primary" className="w-full py-3.5" onClick={() => startQuiz({ title: 'Xatolar ustida ishlash', count: n, passage: null })}>
        <RotateCcw size={18} /> Xatolarni takrorlash
      </Button>
    </div>
  )
}

// ---------- Kalit so'zlar — flesh-kartalar ----------
function KeywordsCards() {
  const [idx, setIdx] = useState(0)
  const [flip, setFlip] = useState(false)
  const card = KEYWORDS[idx]
  const next = () => { setFlip(false); setIdx((i) => (i + 1) % KEYWORDS.length) }
  const prev = () => { setFlip(false); setIdx((i) => (i - 1 + KEYWORDS.length) % KEYWORDS.length) }
  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">Kartani bosib tarjimasini ko‘ring. {idx + 1}/{KEYWORDS.length}</p>
      <button
        onClick={() => setFlip((f) => !f)}
        className="w-full h-56 rounded-3xl border border-line bg-gradient-to-br from-card to-cardhi flex flex-col items-center justify-center gap-3 transition active:scale-[.98]"
      >
        {!flip ? (
          <>
            <span className="arabic text-5xl text-slate-100">{card.ar}</span>
            <span className="text-xs text-slate-500">tarjimani ko‘rish uchun bosing</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-black text-neon">{card.uz}</span>
            <span className="text-sm text-slate-400">{card.hint}</span>
          </>
        )}
      </button>
      <div className="flex gap-3 mt-5">
        <Button variant="dark" className="flex-1 py-3" onClick={prev}><ChevronLeft size={18} /> Oldingi</Button>
        <Button variant="primary" className="flex-1 py-3" onClick={next}>Keyingi <ChevronRight size={18} /></Button>
      </div>
    </div>
  )
}

// ---------- Saqlanganlar ----------
function SavedView({ startQuiz }) {
  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">Yulduzcha bosib saqlab qo‘ygan savollaringiz — API orqali yuklanadi.</p>
      <Button variant="primary" className="w-full py-3.5 mt-4" onClick={() => startQuiz({ title: 'Saqlangan savollar', count: 5, passage: null })}>
        <Play size={18} fill="black" /> Saqlanganlarni yechish
      </Button>
    </div>
  )
}

// ---------- Real imtihon — turini tanlash ----------
function RealExamPicker({ startExam }) {
  const opts = [
    { type: 'at-Tanal', title: 'at-Tanal', sub: 'To‘liq milliy sertifikat imtihoni', color: 'from-[#0f2e1e] to-[#0c1a14]' },
    { type: 'CEFR', title: 'CEFR', sub: 'Xalqaro CEFR (A1–C2) imtihoni', color: 'from-[#101f33] to-[#0c141f]' },
  ]
  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-sm mb-1">Haqiqiy imtihon sharoitida 4 bosqichli sinov: o‘qish, tinglash, yozuv, gapirish.</p>
      {opts.map((o) => (
        <Card key={o.type} onClick={() => startExam(o.type)} className={`p-5 bg-gradient-to-br ${o.color} border-white/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icons.GraduationCap size={24} className="text-neon" />
              </div>
              <div>
                <p className="font-extrabold text-lg leading-none">{o.title}</p>
                <p className="text-slate-400 text-xs mt-1.5">{o.sub}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-500" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ---------- Chalg'ituvchi savollar ----------
function DistractView({ startQuiz }) {
  return (
    <div>
      <Card className="p-4 mb-4 bg-gradient-to-br from-[#2a1e10] to-[#1a1410] border-orange-500/20">
        <p className="font-bold text-orange-300">Ehtiyot bo‘ling</p>
        <p className="text-sm text-slate-400 mt-1">Bu savollarda javob variantlari juda o‘xshash — diqqat bilan o‘qing.</p>
      </Card>
      <div className="space-y-2 mb-4">
        {HARD_QUESTIONS.map((h) => (
          <Card key={h.id} className="p-3.5 flex items-center justify-between">
            <p className="text-sm font-medium flex-1 pr-3">{h.text}</p>
            <Badge color="red">{h.failRate}% xato</Badge>
          </Card>
        ))}
      </div>
      <Button variant="primary" className="w-full py-3.5" onClick={() => startQuiz({ title: 'Chalg‘ituvchi savollar', count: 8, passage: null })}>
        <Play size={18} fill="black" /> Sinovni boshlash
      </Button>
    </div>
  )
}

// ---------- Raqamli savollar ----------
function NumbersView({ startQuiz }) {
  return (
    <div>
      <Card className="p-4 mb-4">
        <p className="font-bold">Raqamlar va sonlar</p>
        <p className="text-sm text-slate-400 mt-1">Arab tilida sanoq, tartib sonlar va matndagi raqamlarga oid savollar.</p>
      </Card>
      <Button variant="primary" className="w-full py-3.5" onClick={() => startQuiz({ title: 'Raqamli savollar', count: 8, passage: null })}>
        <Play size={18} fill="black" /> Boshlash
      </Button>
    </div>
  )
}

// ---------- Barcha testlar ----------
function AllTestsView({ startQuiz }) {
  const tests = [
    { id: 't-read', title: 'O‘qish bo‘yicha testlar', sub: '20 savol · matn asosida', n: 20 },
    { id: 't-gram', title: 'Grammatika testi', sub: '15 savol', n: 15 },
    { id: 't-vocab', title: 'Lug‘at testi', sub: '12 savol', n: 12 },
    { id: 't-mix', title: 'Aralash test', sub: '25 savol · barcha mavzular', n: 25 },
  ]
  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">Barcha mavjud test turlari bir joyda — API dan yuklanadi.</p>
      <div className="space-y-3">
        {tests.map((t) => (
          <Card
            key={t.id}
            onClick={() => startQuiz({ title: t.title, count: t.n, passage: t.id === 't-read' ? undefined : null })}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cardhi text-sky-300 flex items-center justify-center">
                <Icons.ListChecks size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{t.title}</p>
                <p className="text-xs text-slate-500">{t.sub}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-500" />
          </Card>
        ))}
      </div>
    </div>
  )
}
