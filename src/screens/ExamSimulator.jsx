import React, { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft, BookOpen, Headphones, PenLine, Mic, CheckCircle2, Loader2,
} from 'lucide-react'
import { useApp } from '../App.jsx'
import { Button, Card, Badge } from '../ui.jsx'
import {
  buildExamQuestions, READING_PASSAGES,
  SPEAKING_SHORT, SPEAKING_LONG,
} from '../data.js'
import { buildLocalCefrAttempt, totalItems } from '../data/cefrLocalExam.js'
import { WRITING_TASKS } from '../data/cefrWriting.js'
import { passageIndexForExam } from '../lib/cefr.js'
import { speakingTimingFor } from '../lib/examConstants.js'
import { countWords } from '../api/exam.js'
import { hasAuthToken } from '../api/client.js'
import { ensureSession } from '../api/student.js'
import CefrExam from './CefrExam.jsx'
import AttanalExam from './AttanalExam.jsx'
import ExamPartView from '../components/exam/ExamPartView.jsx'
import PartShell from '../components/exam/PartShell.jsx'
import SpeakingProsCons from '../components/exam/SpeakingProsCons.jsx'
import SpeakingRecorder from '../components/SpeakingRecorder.jsx'
import CefrBriefing from '../components/exam/CefrBriefing.jsx'

const STAGES = [
  { key: 'reading', label: 'Reading', icon: BookOpen },
  { key: 'listening', label: 'Listening', icon: Headphones },
  { key: 'writing', label: 'Writing', icon: PenLine },
  { key: 'speaking', label: 'Speaking', icon: Mic },
  { key: 'submit', label: 'Yakun', icon: CheckCircle2 },
]

/** CEFR / at-Tanal: token bor → API; yo‘q → lokal */
export default function ExamSimulator({ type, onExit }) {
  const isApiExam = type === 'CEFR' || type === 'at-Tanal'
  const [phase, setPhase] = useState(isApiExam ? 'check' : 'local') // check | api | local

  useEffect(() => {
    if (!isApiExam) return undefined
    let alive = true
    ;(async () => {
      if (!hasAuthToken()) await ensureSession()
      if (!alive) return
      setPhase(hasAuthToken() ? 'api' : 'local')
    })()
    return () => { alive = false }
  }, [type, isApiExam])

  if (isApiExam && phase === 'check') {
    return (
      <div className="h-full bg-base flex items-center justify-center">
        <Loader2 className="animate-spin text-neon" size={36} />
      </div>
    )
  }
  if (type === 'CEFR' && phase === 'api') {
    return (
      <div className="h-full min-h-0">
        <CefrExam onExit={onExit} onFallback={() => setPhase('local')} />
      </div>
    )
  }
  if (type === 'at-Tanal' && phase === 'api') {
    return (
      <div className="h-full min-h-0">
        <AttanalExam onExit={onExit} onFallback={() => setPhase('local')} />
      </div>
    )
  }
  return (
    <div className="h-full min-h-0">
      <LocalExamSimulator type={type === 'CEFR' ? 'CEFR' : type} onExit={onExit} />
    </div>
  )
}

const STAGE_BRIEFING_KEY = {
  0: 'reading',
  1: 'listening',
  2: 'writing',
  3: 'speaking',
}

function LocalExamSimulator({ type, onExit }) {
  const app = useApp()
  const isCefr = type === 'CEFR'
  const [stage, setStage] = useState(0)
  /** CEFR: har bosqich oldidan ma’lumot oynasi */
  const [briefing, setBriefing] = useState(isCefr ? 'reading' : null)
  const [attempt] = useState(() => (isCefr ? buildLocalCefrAttempt() : null))
  const [data, setData] = useState({
    reading: { answers: {} },
    listening: { answers: {} },
    // CEFR: kirish CefrBriefing da — ichki “Test haqida” qayta chiqmasin
    writing: { letter1: '', letter2: '', essay: '', taskIdx: isCefr ? 0 : -1 },
    speaking: { done: {} },
  })

  const goNext = () => {
    const next = Math.min(STAGES.length - 1, stage + 1)
    // Har yangi skill oldidan kirish oynasi (Reading→Listening→Writing→Speaking)
    if (isCefr && STAGE_BRIEFING_KEY[next]) {
      setBriefing(STAGE_BRIEFING_KEY[next])
    } else if (isCefr && next === 4) {
      setBriefing(null)
    }
    setStage(next)
  }
  const update = (k, v) => setData((d) => ({ ...d, [k]: v }))
  const StageIcon = STAGES[stage].icon

  const readingSkill = attempt?.skills?.find((s) => /read/i.test(s.skillCode))
  const listeningSkill = attempt?.skills?.find((s) => /listen/i.test(s.skillCode))
  const speakingSkill = attempt?.skills?.find((s) => /speak/i.test(s.skillCode))

  if (briefing) {
    return (
      <div className="h-full min-h-0">
        <CefrBriefing
          skillKey={briefing}
          onBack={onExit}
          onStart={() => setBriefing(null)}
        />
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 bg-base overflow-y-auto overscroll-contain exam-scroll">
      {/* CEFR da PartShell o‘zi header beradi — ikki qavatli panel bo‘lmasin */}
      {!isCefr && (
        <div className="px-5 pt-6 sticky top-0 bg-base/95 backdrop-blur z-20 pb-3 border-b border-line">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onExit} className="p-2 rounded-xl hover:bg-cardhi text-slate-300">
              <ChevronLeft size={20} />
            </button>
            <div>
              <p className="font-extrabold leading-none">{type} imtihoni</p>
              <p className="text-xs text-slate-500 mt-1">{stage + 1}-bosqich: {STAGES[stage].label}</p>
            </div>
            <Badge color="green" className="ml-auto"><StageIcon size={11} /> {STAGES[stage].label}</Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {STAGES.map((s, i) => (
              <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= stage ? 'bg-neon' : 'bg-cardhi'}`} />
            ))}
          </div>
        </div>
      )}
      {isCefr && (
        <div className="px-4 pt-3 flex items-center gap-2">
          <button type="button" onClick={onExit} className="p-2 rounded-xl hover:bg-cardhi text-slate-300">
            <ChevronLeft size={20} />
          </button>
          <p className="text-sm font-bold text-white/70">{STAGES[stage].label}</p>
          <div className="ml-auto flex gap-1">
            {STAGES.slice(0, 4).map((s, i) => (
              <div key={s.key} className={`w-1.5 h-1.5 rounded-full ${i <= stage ? 'bg-neon' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}
      <div className="px-5 mt-3 pb-24">
        {stage === 0 && isCefr && (
          <SkillPartsStage
            skill={readingSkill}
            answers={data.reading.answers}
            onAnswers={(answers) => update('reading', { answers })}
            onDone={goNext}
          />
        )}
        {stage === 0 && !isCefr && (
          <SimpleMcqStage
            kind="reading"
            count={10}
            type={type}
            data={data.reading}
            onChange={(v) => update('reading', v)}
            onDone={goNext}
          />
        )}
        {stage === 1 && isCefr && (
          <SkillPartsStage
            skill={listeningSkill}
            answers={data.listening.answers}
            onAnswers={(answers) => update('listening', { answers })}
            onDone={goNext}
          />
        )}
        {stage === 1 && !isCefr && (
          <SimpleMcqStage
            kind="listening"
            count={20}
            type={type}
            data={data.listening}
            onChange={(v) => update('listening', v)}
            onDone={goNext}
          />
        )}
        {stage === 2 && (
          <WritingStageWithShell
            data={data.writing}
            onChange={(v) => update('writing', v)}
            onDone={goNext}
          />
        )}
        {stage === 3 && isCefr && (
          <SpeakingSkillStage
            skill={speakingSkill}
            done={data.speaking.done}
            onDoneMap={(done) => update('speaking', { done })}
            onDone={goNext}
          />
        )}
        {stage === 3 && !isCefr && (
          <LegacySpeakingStage
            done={data.speaking.done}
            onDoneMap={(done) => update('speaking', { done })}
            onDone={goNext}
          />
        )}
        {stage === 4 && <SubmitStage type={type} data={data} onExit={onExit} app={app} />}
      </div>
    </div>
  )
}

const SKILL_DURATION_MS = {
  reading: 60 * 60 * 1000,
  listening: 40 * 60 * 1000,
  writing: 60 * 60 * 1000,
  speaking: 20 * 60 * 1000,
}

function SkillPartsStage({ skill, answers, onAnswers, onDone }) {
  const parts = skill?.parts || []
  const [partIdx, setPartIdx] = useState(0)
  const [fontSize, setFontSize] = useState(22)
  const code = String(skill?.skillCode || 'reading').toLowerCase()
  const durKey = Object.keys(SKILL_DURATION_MS).find((k) => code.includes(k)) || 'reading'
  const [deadlineMs] = useState(() => Date.now() + (SKILL_DURATION_MS[durKey] || SKILL_DURATION_MS.reading))
  const part = parts[partIdx]
  const total = totalItems(skill)
  const answered = Object.keys(answers || {}).length

  const setAnswer = (item, body) => {
    // Exclusive matching: bir optionId faqat bitta itemda
    const next = { ...answers, [item.id]: body }
    if (body?.selectedOptionId != null && body?.answerType === 'matching') {
      for (const it of part?.items || []) {
        if (it.id === item.id) continue
        if (next[it.id]?.selectedOptionId === body.selectedOptionId) {
          delete next[it.id]
        }
      }
    }
    onAnswers(next)
  }
  const clearAnswer = (item) => {
    const next = { ...answers }
    delete next[item.id]
    onAnswers(next)
  }

  const tabs = parts.map((p) => ({
    key: p.partNumber,
    label: String(p.partNumber),
  }))

  return (
    <PartShell
      partTabs={tabs}
      activePartIdx={partIdx}
      onPartChange={setPartIdx}
      answered={answered}
      total={total}
      title={null}
      deadlineMs={deadlineMs}
      fontSize={fontSize}
      onFontSize={setFontSize}
    >
      {part && (
        <ExamPartView
          part={part}
          answers={answers}
          onAnswer={setAnswer}
          onClearAnswer={clearAnswer}
          fontSize={fontSize}
        />
      )}
      <div className="mt-5 flex gap-2">
        {partIdx > 0 && (
          <Button variant="dark" className="flex-1 py-3" onClick={() => setPartIdx((i) => i - 1)}>
            ←
          </Button>
        )}
        {partIdx < parts.length - 1 ? (
          <Button variant="primary" className="flex-1 py-3" onClick={() => setPartIdx((i) => i + 1)}>
            Keyingi →
          </Button>
        ) : (
          <Button variant="primary" className="flex-1 py-3" onClick={onDone}>
            Keyingi →
          </Button>
        )}
      </div>
    </PartShell>
  )
}

function SimpleMcqStage({ kind, count, type, data, onChange, onDone }) {
  const [questions] = useState(() => buildExamQuestions(count, {
    examType: type === 'CEFR' ? 'CEFR' : 'at-Tanal',
  }))
  const answers = data.answers || {}
  const setAns = (qid, i) => onChange({ ...data, answers: { ...answers, [qid]: i } })
  const answered = Object.keys(answers).length
  const passage = kind === 'reading'
    ? (READING_PASSAGES[passageIndexForExam(type)] || READING_PASSAGES[0])
    : null

  return (
    <div>
      {passage && (
        <Card className="p-4 mb-4">
          <p className="arabic q-text font-bold mb-2 text-xl">{passage.title}</p>
          <p className="arabic q-text text-lg leading-loose whitespace-pre-wrap">{passage.ar}</p>
        </Card>
      )}
      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id} className="p-3.5">
            <p className="arabic q-text text-lg font-semibold my-2.5 leading-relaxed">{q.text}</p>
            <div className="grid grid-cols-1 gap-1.5">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAns(q.id, i)}
                  className={`arabic text-right text-base px-3 py-2.5 rounded-lg border transition ${
                    answers[q.id] === i ? 'border-neon bg-neon/10 q-opt-correct' : 'border-line bg-cardhi q-opt'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <p className="text-sm text-slate-400 mt-4 mb-2">{answered}/{questions.length}</p>
      <Button variant="primary" onClick={onDone} className="w-full py-3">Keyingi bosqich</Button>
    </div>
  )
}

function LegacySpeakingStage({ done, onDoneMap, onDone }) {
  const items = useMemo(
    () => [...SPEAKING_SHORT.slice(0, 2), SPEAKING_LONG[0]].map((promptText, i) => ({
      id: `leg-${i}`,
      displayNumber: i + 1,
      promptText,
      prepTimeSec: 5,
      recordTimeSec: 30,
    })),
    [],
  )
  return (
    <SpeakingSkillStage
      skill={{ parts: [{ items }] }}
      done={done}
      onDoneMap={onDoneMap}
      onDone={onDone}
    />
  )
}

function SpeakingSkillStage({ skill, done, onDoneMap, onDone }) {
  const items = skill?.parts?.[0]?.items || []
  const [idx, setIdx] = useState(0)
  const [fontSize, setFontSize] = useState(22)
  const [deadlineMs] = useState(() => Date.now() + SKILL_DURATION_MS.speaking)
  const item = items[idx]
  if (!item) {
    return <Button variant="primary" onClick={onDone} className="w-full py-3">Keyingi →</Button>
  }

  const timing = speakingTimingFor(item.displayNumber)
  const prep = item.prepTimeSec ?? timing.prep
  const record = item.recordTimeSec ?? timing.record

  const goNext = () => {
    const next = { ...done, [item.id]: true }
    onDoneMap(next)
    if (idx + 1 >= items.length) onDone()
    else setIdx((i) => i + 1)
  }

  const tabs = items.map((it) => ({ key: it.id, label: String(it.displayNumber) }))
  const answered = Object.keys(done || {}).length

  return (
    <PartShell
      partTabs={tabs}
      activePartIdx={idx}
      onPartChange={setIdx}
      answered={answered}
      total={items.length}
      title={null}
      deadlineMs={deadlineMs}
      fontSize={fontSize}
      onFontSize={setFontSize}
    >
      <SpeakingProsCons speakingPrompt={item.speakingPrompt} />
      <SpeakingRecorder
        key={item.id}
        promptText={item.promptText}
        alreadyDone={Boolean(done[item.id])}
        prepSec={prep}
        recordSec={record}
        onComplete={goNext}
      />
    </PartShell>
  )
}

function WritingStageWithShell({ data, onChange, onDone }) {
  const [fontSize, setFontSize] = useState(20)
  const [deadlineMs] = useState(() => Date.now() + SKILL_DURATION_MS.writing)
  return (
    <WritingStage
      data={data}
      onChange={onChange}
      onDone={onDone}
      showShell
      deadlineMs={deadlineMs}
      fontSize={fontSize}
      onFontSize={setFontSize}
    />
  )
}

function WritingStage({ data, onChange, onDone, showShell = true, deadlineMs, fontSize = 20, onFontSize }) {
  const taskIdx = Math.max(0, data.taskIdx ?? 0)
  const task = WRITING_TASKS[taskIdx]
  if (!task) return null

  const text = data[task.key] || ''
  const words = countWords(text)
  const ok = words >= task.minWords && (task.maxWords == null || words <= task.maxWords + 20)
  const targetLabel = task.maxWords
    ? `${task.minWords}–${task.maxWords}`
    : `${task.minWords}+`

  const tabs = WRITING_TASKS.map((t, i) => ({
    key: t.id,
    label: String(i + 1),
  }))

  const body = (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
          ok ? 'border-neon text-neon bg-neon/10' : 'border-red-400/50 text-red-300 bg-red-500/10'
        }`}>
          {words} / {targetLabel}
        </span>
      </div>

      {task.situationAr && (
        <Card className="p-4 border-orange-500/35">
          <p className="arabic text-xs font-bold text-orange-300 mb-2">{task.situationTitle}</p>
          <p
            className="arabic q-text leading-loose whitespace-pre-wrap"
            style={{ fontSize: `${fontSize}px` }}
          >
            {task.situationAr}
          </p>
        </Card>
      )}

      <Card className="p-4 border-sky-500/30">
        <p className="arabic text-xs font-bold text-sky-300 mb-2">{task.taskTitle}</p>
        <p
          className="arabic q-text leading-loose whitespace-pre-wrap"
          style={{ fontSize: `${fontSize}px` }}
        >
          {task.taskAr}
        </p>
      </Card>

      <div>
        <textarea
          dir="rtl"
          lang="ar"
          value={text}
          onChange={(e) => onChange({ ...data, [task.key]: e.target.value })}
          className="arabic q-text w-full h-48 bg-base border border-line rounded-xl p-3 leading-loose outline-none focus:border-neon"
          style={{ fontSize: `${fontSize}px` }}
          placeholder={task.placeholder}
        />
        <p className={`text-xs mt-2 tabular-nums ${ok ? 'text-neon' : 'text-amber-300'}`}>
          {words} / {targetLabel}
        </p>
      </div>

      <div className="flex gap-2">
        {taskIdx > 0 && (
          <Button
            variant="dark"
            className="flex-1 py-3"
            onClick={() => onChange({ ...data, taskIdx: taskIdx - 1 })}
          >
            ←
          </Button>
        )}
        {taskIdx < WRITING_TASKS.length - 1 ? (
          <Button
            variant="primary"
            className="flex-1 py-3"
            onClick={() => onChange({ ...data, taskIdx: taskIdx + 1 })}
          >
            Keyingi →
          </Button>
        ) : (
          <Button variant="primary" className="flex-1 py-3" onClick={onDone}>
            Keyingi →
          </Button>
        )}
      </div>
    </div>
  )

  if (!showShell) return body

  const answered = WRITING_TASKS.filter((t) => countWords(data[t.key] || '') >= t.minWords).length

  return (
    <PartShell
      partTabs={tabs}
      activePartIdx={taskIdx}
      onPartChange={(i) => onChange({ ...data, taskIdx: i })}
      answered={answered}
      total={WRITING_TASKS.length}
      title={null}
      deadlineMs={deadlineMs}
      fontSize={fontSize}
      onFontSize={onFontSize}
    >
      {body}
    </PartShell>
  )
}

function SubmitStage({ type, data, onExit, app }) {
  const [state, setState] = useState('saving')
  React.useEffect(() => {
    const t = setTimeout(() => {
      app.submitExam({
        user: app.user?.name || 'Mehmon',
        type,
        date: new Date().toISOString().slice(0, 10),
        reading: Object.keys(data.reading.answers || {}).length,
        listening: Object.keys(data.listening.answers || {}).length,
        writing: null,
        speaking: Object.keys(data.speaking.done || {}).length,
        status: 'baholanmoqda',
      })
      setState('done')
      app.notify('Natijalar yuborildi ✓')
    }, 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line
  }, [])
  if (state === 'saving') {
    return (
      <div className="flex flex-col items-center py-24">
        <Loader2 size={40} className="animate-spin text-neon mb-4" />
        <p className="font-bold">Saqlanmoqda...</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <CheckCircle2 size={48} className="text-neon mb-4" />
      <h2 className="text-2xl font-black">Yakunlandi</h2>
      <Button variant="primary" onClick={onExit} className="w-full max-w-xs mt-6">Bosh sahifa</Button>
    </div>
  )
}
