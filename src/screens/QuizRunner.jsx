import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Check, X, RotateCcw, Heart, Loader2 } from 'lucide-react'
import { useApp } from '../App.jsx'
import { Button, Badge, ProgressBar } from '../ui.jsx'
import { fetchRandomQuestions, ensureSession } from '../api/student.js'
import { hasAuthToken } from '../api/client.js'
import { buildExamQuestions, preferArabicQuestions } from '../data.js'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Test yechish — GET /question/getrandom
 * Tuzilish: savol matni → A/B/C/D variantlar → Keyingi
 */
export default function QuizRunner({ onExit, title = 'Test yechish', count = 10, passage: pProp }) {
  const app = useApp()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [fail, setFail] = useState(null)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [hearts, setHearts] = useState(5)
  const [done, setDone] = useState(false)
  const started = useRef(false)

  const load = async () => {
    setLoading(true)
    setFail(null)
    try {
      // Token bo‘lsa API; yo‘q bo‘lsa 401 yubormaymiz (ustoz tekshiruvida qizil xato chiqmasin)
      if (!hasAuthToken()) await ensureSession()
      let list = []
      if (hasAuthToken()) {
        try {
          list = await fetchRandomQuestions({ count, forceLevel: false })
        } catch { /* lokal */ }
      }
      const arabic = preferArabicQuestions(list, count)
      setQuestions(arabic.length ? arabic : buildExamQuestions(count))
      setIdx(0)
      setPicked(null)
      setScore({ correct: 0, wrong: 0 })
      setHearts(5)
      setDone(false)
    } catch {
      setQuestions(buildExamQuestions(count))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const passage = useMemo(() => {
    if (pProp === null) return null
    if (pProp) return pProp
    const first = questions[0]
    if (first?.readingPassage) return { ar: first.readingPassage }
    return null
  }, [pProp, questions])

  const q = questions[idx]
  const progress = questions.length ? ((idx + (picked != null ? 1 : 0)) / questions.length) * 100 : 0

  const choose = (i) => {
    if (picked != null || !q) return
    setPicked(i)
    const ok = i === q.correct
    app.addAnswer(ok)
    if (ok) app.setXp((x) => x + 10)
    else setHearts((h) => Math.max(0, h - 1))
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }))
  }

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); return }
    setIdx((i) => i + 1)
    setPicked(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-neon" size={32} />
        <p className="text-sm">Savollar yuklanmoqda…</p>
      </div>
    )
  }

  if (fail || !questions.length) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6 text-center gap-3">
        <p className="text-slate-300 text-sm">{fail || 'Savollar yo‘q'}</p>
        <Button variant="primary" onClick={() => { started.current = false; load(); started.current = true }}>
          Qayta urinish
        </Button>
        <Button variant="dark" onClick={onExit}>Ortga</Button>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((score.correct / Math.max(1, questions.length)) * 100)
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6 text-center">
        <div className={`text-6xl font-black ${pct >= 60 ? 'text-neon' : 'text-red-400'}`}>{pct}%</div>
        <p className="text-base font-bold mt-3 text-slate-200">Natija</p>
        <p className="text-sm text-slate-400 mt-1">
          To‘g‘ri {score.correct} · Noto‘g‘ri {score.wrong} · {questions.length} ta
        </p>
        <div className="flex gap-3 mt-8 w-full max-w-xs">
          <Button
            variant="dark"
            onClick={() => {
              setIdx(0); setPicked(null); setScore({ correct: 0, wrong: 0 }); setHearts(5); setDone(false)
            }}
            className="flex-1"
          >
            <RotateCcw size={16} /> Qayta
          </Button>
          <Button variant="primary" onClick={onExit} className="flex-1">Ortga</Button>
        </div>
      </div>
    )
  }

  const opts = q.options || []

  return (
    <div className="h-full min-h-0 bg-base flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 sticky top-0 z-20 bg-base/95 backdrop-blur border-b border-line">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="p-2 rounded-xl hover:bg-cardhi text-slate-300 shrink-0"
            aria-label="Ortga"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <ProgressBar value={progress} className="h-3" />
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 text-sm font-bold shrink-0 pl-1">
            <Heart size={15} fill="currentColor" />
            <span>{hearts}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2.5 px-1">
          <p className="text-xs text-slate-500 font-medium truncate">{title}</p>
          <p className="text-xs font-bold text-slate-300 tabular-nums">
            {idx + 1} <span className="text-slate-600">/</span> {questions.length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-28 overflow-y-auto">
        {/* Matn (passage) */}
        {passage?.ar && (
          <div className="mb-5 rounded-2xl border border-line bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Matn</p>
            <p className="arabic q-text text-[1.35rem] leading-[2.1] whitespace-pre-wrap">
              {passage.ar}
            </p>
          </div>
        )}

        {/* Savol */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-neon/15 text-neon text-xs font-black">
              {idx + 1}
            </span>
            {q.cefr && <Badge color="blue">{q.cefr}</Badge>}
            {q.points > 1 && <Badge color="amber">{q.points} ball</Badge>}
          </div>
          <p
            className={`q-text font-semibold leading-snug ${
              q.isArabic ? 'arabic text-[1.55rem] leading-[2]' : 'text-[1.15rem]'
            }`}
          >
            {q.text}
          </p>
        </div>

        {/* Variantlar A B C D */}
        <div className="space-y-2.5" role="listbox" aria-label="Javob variantlari">
          {opts.map((opt, i) => {
            const letter = LETTERS[i] || String(i + 1)
            const isCorrect = picked != null && i === q.correct
            const isWrong = picked != null && i === picked && i !== q.correct
            const isIdle = picked == null

            let box = 'border-line bg-card hover:border-slate-500 hover:bg-cardhi'
            let badge = 'bg-cardhi text-slate-400 border-line'
            if (isCorrect) {
              box = 'border-neon/60 bg-neon/10'
              badge = 'bg-neon text-black border-neon'
            } else if (isWrong) {
              box = 'border-red-400/50 bg-red-500/10'
              badge = 'bg-red-500 text-white border-red-500'
            }

            const ar = q.optionArabic?.[i]

            return (
              <button
                key={q.optionIds?.[i] ?? i}
                type="button"
                disabled={picked != null}
                onClick={() => choose(i)}
                className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl border transition text-left ${box} ${
                  isIdle ? 'active:scale-[0.98]' : ''
                }`}
              >
                <span
                  className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-black ${badge}`}
                >
                  {isCorrect ? <Check size={18} strokeWidth={3} /> : isWrong ? <X size={18} strokeWidth={3} /> : letter}
                </span>
                <span
                  className={`flex-1 text-[0.95rem] leading-snug ${
                    ar ? 'arabic text-lg' : 'font-medium'
                  } ${isCorrect ? 'q-opt-correct' : isWrong ? 'q-opt-wrong' : 'q-opt'}`}
                >
                  {opt}
                </span>
              </button>
            )
          })}
        </div>

        {!opts.length && (
          <p className="text-sm text-slate-500 text-center py-8">Variantlar yo‘q</p>
        )}
      </div>

      {/* Pastki tugma */}
      {picked != null && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-base via-base to-transparent sm:static sm:bg-none sm:p-0">
          <div className="max-w-[420px] mx-auto sm:px-4 sm:pb-6">
            <div
              className={`mb-3 rounded-xl px-3 py-2 text-sm font-semibold text-center ${
                picked === q.correct
                  ? 'bg-neon/15 text-neon'
                  : 'bg-red-500/15 text-red-300'
              }`}
            >
              {picked === q.correct ? 'To‘g‘ri!' : 'Noto‘g‘ri'}
            </div>
            <Button variant="primary" onClick={next} className="w-full py-3.5 text-base">
              {idx + 1 >= questions.length ? 'Natijani ko‘rish' : 'Keyingi savol'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
