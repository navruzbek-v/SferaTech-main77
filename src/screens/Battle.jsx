import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Swords, Loader2, Check, X, Trophy, Zap } from 'lucide-react'
import { useApp } from '../App.jsx'
import { Button, Card } from '../ui.jsx'
import { buildExamQuestions, READING_PASSAGES, USERS } from '../data.js'

const OPPONENTS = USERS.filter((u) => u.name !== 'DEVNODIR')
const LETTERS = ['A', 'B', 'C', 'D']

/** Oktagon — lokal arabcha savollar (401 yo‘q) */
export default function Battle({ onExit }) {
  const app = useApp()
  const [phase, setPhase] = useState('matching')
  const [opp, setOpp] = useState(null)
  const [questions] = useState(() => buildExamQuestions(5))
  const [idx, setIdx] = useState(0)
  const [me, setMe] = useState({ correct: 0, time: 0 })
  const [oppScore, setOppScore] = useState({ correct: 0, time: 0 })
  const [picked, setPicked] = useState(null)
  const [oppAnswered, setOppAnswered] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const o = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)] || OPPONENTS[0]
    setOpp(o)
    const t = setTimeout(() => setPhase('playing'), 1800)
    return () => clearTimeout(t)
  }, [])

  const q = questions[idx]
  const passage = q?.readingPassage || READING_PASSAGES[0].ar

  useEffect(() => {
    if (phase !== 'playing') return undefined
    setOppAnswered(false)
    const delay = 1500 + (idx * 700) % 2500
    const t = setTimeout(() => {
      const oppCorrect = idx % 3 !== 2
      setOppScore((s) => ({ correct: s.correct + (oppCorrect ? 1 : 0), time: s.time + delay / 1000 }))
      setOppAnswered(true)
    }, delay)
    return () => clearTimeout(t)
  }, [idx, phase])

  const choose = (i) => {
    if (picked != null || !q) return
    setPicked(i)
    const ok = i === q.correct
    setMe((s) => ({ correct: s.correct + (ok ? 1 : 0), time: s.time + 2 + i * 0.4 }))
    app.addAnswer(ok)
  }

  const next = () => {
    if (idx + 1 >= questions.length) {
      const meWins = me.correct > oppScore.correct || (me.correct === oppScore.correct && me.time <= oppScore.time)
      const delta = meWins ? 40 : -25
      app.setXp((x) => Math.max(0, x + delta))
      app.notify(meWins ? 'G‘alaba! +40 XP' : 'Mag‘lubiyat: -25 XP', meWins ? 'success' : 'error')
      setResult({ meWins, delta })
      setPhase('result')
      return
    }
    setIdx((i) => i + 1)
    setPicked(null)
  }

  if (phase === 'matching') {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6 mb-8">
          <PlayerBubble name={app.user?.name || 'Siz'} you />
          <div className="text-violet-300"><Swords size={28} /></div>
          <PlayerBubble name={opp?.name || '...'} />
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Raqib qidirilmoqda...</span>
        </div>
        <button onClick={onExit} className="mt-10 text-white/40 text-sm hover:text-white/70">Bekor qilish</button>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${result.meWins ? 'bg-neon/15 text-neon' : 'bg-red-500/15 text-red-400'}`}>
          <Trophy size={44} />
        </div>
        <h2 className="text-2xl font-black text-white">{result.meWins ? 'G‘alaba!' : 'Mag‘lubiyat'}</h2>
        <p className={`text-lg font-bold mt-1 ${result.meWins ? 'text-neon' : 'text-red-400'}`}>
          {result.delta > 0 ? '+' : ''}{result.delta} XP
        </p>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
          <Card className="p-3"><p className="text-xs text-white/50">Siz</p><p className="font-bold text-white">{me.correct}/5</p></Card>
          <Card className="p-3"><p className="text-xs text-white/50">{opp?.name}</p><p className="font-bold text-white">{oppScore.correct}/5</p></Card>
        </div>
        <Button variant="primary" onClick={onExit} className="w-full max-w-xs mt-8">Bosh sahifa</Button>
      </div>
    )
  }

  if (!q) return null

  return (
    <div className="h-full min-h-0 bg-base overflow-y-auto overscroll-contain pb-8">
      <div className="px-5 pt-6 flex items-center gap-3">
        <button onClick={onExit} className="p-2 rounded-xl hover:bg-cardhi text-white"><ChevronLeft size={20} /></button>
        <span className="font-bold text-sm text-white">Oktagon jangi</span>
        <span className="ml-auto text-sm text-white/60">{idx + 1}/{questions.length}</span>
      </div>

      <div className="px-5 mt-4 flex items-center gap-3">
        <ScorePill name="Siz" score={me.correct} you />
        <div className="text-white/30 font-black text-xs">VS</div>
        <ScorePill name={opp?.name} score={oppScore.correct} answered={oppAnswered} />
      </div>

      <div className="px-5 mt-4 space-y-3">
        {passage && (
          <Card className="p-4">
            <p className="text-[11px] text-white/40 uppercase mb-1.5">O‘qish matni</p>
            <p className="arabic text-lg leading-loose q-text whitespace-pre-wrap">{passage}</p>
          </Card>
        )}

        <Card className="p-5">
          <h2 className="arabic text-xl leading-relaxed q-text font-bold mb-4">{q.text}</h2>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isCorrect = picked != null && i === q.correct
              const isWrong = picked != null && i === picked && i !== q.correct
              let box = 'border-line bg-cardhi'
              if (isCorrect) box = 'border-neon bg-neon/10'
              else if (isWrong) box = 'border-red-500/50 bg-red-500/10'
              else if (picked != null) box = 'border-line bg-cardhi opacity-40'

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={picked != null}
                  className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-xl border transition ${box}`}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black ${
                    isCorrect ? 'bg-neon text-black border-neon' : isWrong ? 'bg-red-500 text-white border-red-500' : 'bg-base text-white border-line'
                  }`}>
                    {isCorrect ? <Check size={16} /> : isWrong ? <X size={16} /> : LETTERS[i]}
                  </span>
                  <span className={`arabic flex-1 text-right text-lg leading-snug ${
                    isCorrect ? 'q-opt-correct' : isWrong ? 'q-opt-wrong' : 'q-opt'
                  }`}>
                    {opt}
                  </span>
                </button>
              )
            })}
          </div>
          {!oppAnswered && picked != null && (
            <p className="text-xs text-amber-300 mt-3 flex items-center gap-1"><Zap size={13} /> Raqib javob beryapti...</p>
          )}
        </Card>

        {picked != null && (
          <Button variant="primary" onClick={next} className="w-full py-3">
            {idx + 1 >= questions.length ? 'Natijani ko‘rish' : 'Keyingi'}
          </Button>
        )}
      </div>
    </div>
  )
}

function PlayerBubble({ name, you }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border ${you ? 'bg-neon/15 border-neon/40 text-neon' : 'bg-cardhi border-line text-white'}`}>
        {name?.[0] || '?'}
      </div>
      <span className="text-xs font-semibold max-w-[80px] truncate text-white">{name}</span>
    </div>
  )
}

function ScorePill({ name, score, you, answered }) {
  return (
    <div className={`flex-1 rounded-xl border px-3 py-2 ${you ? 'bg-neon/10 border-neon/30' : 'bg-cardhi border-line'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold truncate max-w-[90px] text-white">{name}</span>
        <span className="font-black text-lg text-white">{score}</span>
      </div>
      {!you && (
        <span className={`text-[10px] ${answered ? 'text-neon' : 'text-amber-300'}`}>
          {answered ? 'javob berdi' : 'o‘ylayapti...'}
        </span>
      )}
    </div>
  )
}
