import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft, CheckCircle2, Loader2, BookOpen, Headphones, PenLine, Mic,
} from 'lucide-react'
import { useApp } from '../App.jsx'
import { Button, Card, Badge } from '../ui.jsx'
import {
  startExam, getAttempt, submitAnswer, beginSpeaking, submitAnswerAudio,
  completeExam, getResult, applyOptionLocks, countWords,
  saveAttemptId, loadAttemptId, clearAttemptId,
} from '../api/exam.js'
import {
  ITEM_TYPE, deadlineForSkill, msLeft, formatMs, skillCodeKey,
  usableDeadline, speakingTimingFor,
} from '../lib/examConstants.js'
import { idFromLevel } from '../lib/cefr.js'
import { useMainButton, useBackButton } from '../lib/mainButton.js'
import { haptic } from '../lib/telegram.js'
import ExamPartView from '../components/exam/ExamPartView.jsx'
import PartShell from '../components/exam/PartShell.jsx'
import SpeakingProsCons from '../components/exam/SpeakingProsCons.jsx'
import SpeakingRecorder from '../components/SpeakingRecorder.jsx'
import CefrBriefing from '../components/exam/CefrBriefing.jsx'
import { hasAuthToken } from '../api/client.js'
import { ensureSession } from '../api/student.js'

function briefingKeyForSkill(skill) {
  const c = skillCodeKey(skill?.skillCode)
  if (c.includes('read')) return 'reading'
  if (c.includes('listen')) return 'listening'
  if (c.includes('writ')) return 'writing'
  if (c.includes('speak')) return 'speaking'
  return null
}

const SKILL_ICON = {
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenLine,
}

function flattenNav(attempt) {
  const nav = []
  for (const skill of attempt?.skills || []) {
    for (const part of skill.parts || []) {
      nav.push({ skill, part })
    }
  }
  return nav
}

export default function CefrExam({ onExit, onFallback }) {
  const app = useApp()
  const mainBtn = useMainButton()
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(null)
  const [navIdx, setNavIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finishing, setFinishing] = useState(false)
  const [result, setResult] = useState(null)
  const [bootError, setBootError] = useState(null)
  const [tick, setTick] = useState(0)
  const [briefingKey, setBriefingKey] = useState(null)
  const [fontSize, setFontSize] = useState(22)
  const submitting = useRef(new Set())
  const finishingRef = useRef(false)
  const fellBack = useRef(false)
  const seenBriefings = useRef(new Set())
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [navIdx])

  const levelId = app.user?.cefrLevelId || idFromLevel(app.user?.level) || undefined

  const softFallback = useCallback(() => {
    if (fellBack.current) return
    fellBack.current = true
    if (typeof onFallback === 'function') onFallback()
    else onExit?.()
  }, [onFallback, onExit])

  /** Token bor → API; yo‘q → lokal (401 Networkda chiqmasin) */
  const boot = useCallback(async () => {
    setLoading(true)
    setBootError(null)
    setResult(null)
    try {
      if (!hasAuthToken()) await ensureSession()
      if (!hasAuthToken()) {
        softFallback()
        return
      }

      let data = null
      const savedId = loadAttemptId()
      if (savedId) {
        try {
          data = await getAttempt(savedId)
          if (!data?.skills?.length) data = null
        } catch {
          clearAttemptId()
          data = null
        }
      }

      if (!data) {
        try {
          data = await startExam(levelId || 3)
        } catch (e) {
          if (e.status === 400) data = await startExam(undefined)
          else throw e
        }
      }

      if (!data?.attemptId || !data.skills?.length) {
        softFallback()
        return
      }
      saveAttemptId(data.attemptId)
      if (data.optionLocks?.length) data = applyOptionLocks(data, data.optionLocks)
      setAttempt(data)
      setNavIdx(0)
      setAnswers({})
    } catch (e) {
      if (e.status === 410 || e.code === 'EXAM_EXPIRED' || /EXAM_EXPIRED/i.test(e.message || '')) {
        clearAttemptId()
        setResult({ timedOut: true })
      } else {
        clearAttemptId()
        softFallback()
      }
    } finally {
      setLoading(false)
    }
  }, [levelId, softFallback])

  useEffect(() => { boot() }, [boot])

  const onBack = useCallback(() => {
    if (navIdx > 0) setNavIdx((i) => i - 1)
    else onExit?.()
  }, [navIdx, onExit])

  useBackButton(onBack)

  const nav = useMemo(() => flattenNav(attempt), [attempt])
  const current = nav[navIdx]
  const skill = current?.skill
  const part = current?.part
  // Eski/o‘tgan deadline bilan to‘liq ekran chiqmasin
  const deadline = usableDeadline(deadlineForSkill(attempt, skill))
  const left = msLeft(deadline)

  // Har yangi skill oldidan ma’lumot oynasi
  useEffect(() => {
    if (!attempt || loading || result) return
    const key = briefingKeyForSkill(skill)
    if (key && !seenBriefings.current.has(key)) {
      setBriefingKey(key)
    }
  }, [attempt, loading, result, skill, navIdx])

  const finish = useCallback(async () => {
    if (!attempt?.attemptId || finishingRef.current) return
    finishingRef.current = true
    setFinishing(true)
    mainBtn.showProgress()
    try {
      let res = await completeExam(attempt.attemptId)
      try {
        const full = await getResult(attempt.attemptId)
        if (full) res = { ...res, ...full }
      } catch { /* complete body yetarli */ }
      clearAttemptId()
      setResult(res || {})
      app.notify('CEFR imtihoni yakunlandi ✓')
      mainBtn.hide()
    } catch (e) {
      if (e.status === 410 || e.code === 'EXAM_EXPIRED' || /EXAM_EXPIRED/i.test(e.message || '')) {
        clearAttemptId()
        setResult({ timedOut: true })
      } else if (e.status === 401) {
        setBootError('401 — qayta login')
      } else {
        setResult({
          readingScore: null, listeningScore: null, writingScore: null, speakingScore: null, totalScore: null,
        })
      }
      mainBtn.hide()
    } finally {
      setFinishing(false)
      finishingRef.current = false
      mainBtn.hideProgress()
    }
  }, [attempt, app, mainBtn])

  useEffect(() => {
    if (!deadline) return undefined
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [deadline])

  // Timer tugasa — xato ekrani emas, avtomatik natija
  useEffect(() => {
    if (deadline && left === 0 && !result && !loading) {
      finish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, deadline, tick])

  const handleApiError = useCallback((e) => {
    if (e.status === 410 || e.code === 'EXAM_EXPIRED' || /EXAM_EXPIRED/i.test(e.message || '')) {
      finish()
      return true
    }
    if (e.status === 409) {
      app.notify('Bu variant band, boshqasini tanlang', 'info')
      return true
    }
    if (e.status === 401) {
      clearAttemptId()
      app.signOut?.()
      return true
    }
    return false
  }, [finish, app])

  const sendAnswer = useCallback(async (item, body) => {
    if (!attempt?.attemptId) return null
    const key = String(item.id)
    if (submitting.current.has(key)) return null
    submitting.current.add(key)
    try {
      const res = await submitAnswer(attempt.attemptId, body)
      setAnswers((a) => ({ ...a, [item.id]: body }))
      if (res?.optionLocks) {
        setAttempt((prev) => applyOptionLocks(prev, res.optionLocks))
      }
      haptic('light')
      return res
    } catch (e) {
      handleApiError(e)
      return null
    } finally {
      submitting.current.delete(key)
    }
  }, [attempt, handleApiError])

  const goNext = useCallback(() => {
    if (navIdx + 1 < nav.length) setNavIdx((i) => i + 1)
    else finish()
  }, [navIdx, nav.length, finish])

  // Telegram MainButton — briefingda yashirin (ilova tugmasi yetarli)
  useEffect(() => {
    if (loading || result || !attempt || briefingKey) {
      mainBtn.hide()
      return undefined
    }
    const last = navIdx >= nav.length - 1
    return mainBtn.show(last ? 'Topshirish' : 'Keyingi part', () => {
      if (last) finish()
      else goNext()
    })
  }, [loading, result, attempt, navIdx, nav.length, mainBtn, finish, goNext, briefingKey])

  if (loading) {
    return (
      <Center>
        <Loader2 className="animate-spin text-neon" size={36} />
        <p className="text-sm text-slate-400">API: /exam/start…</p>
      </Center>
    )
  }

  if (result) {
    return (
      <Center>
        <div className="w-20 h-20 rounded-full bg-neon/15 text-neon flex items-center justify-center mb-4">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black">Natija</h2>
        <Card className="p-4 mt-5 w-full max-w-xs text-left space-y-2">
          <Row label="Reading" value={result.readingScore ?? '—'} />
          <Row label="Listening" value={result.listeningScore ?? '—'} />
          <Row label="Writing" value={result.writingScore ?? '—'} />
          <Row label="Speaking" value={result.speakingScore ?? '—'} />
          <Row label="Jami" value={result.totalScore ?? '—'} />
        </Card>
        <Button variant="primary" onClick={onExit} className="w-full max-w-xs mt-6">Bosh sahifa</Button>
      </Center>
    )
  }

  if (bootError || !part) {
    return (
      <Center>
        <Loader2 className="animate-spin text-neon" size={32} />
        <p className="text-white/70 text-sm mt-3">Tayyorlanmoqda…</p>
        <Button variant="dark" onClick={onExit} className="mt-6 w-full max-w-xs">Ortga</Button>
      </Center>
    )
  }

  if (briefingKey) {
    return (
      <div className="h-full min-h-0">
        <CefrBriefing
          skillKey={briefingKey}
          onBack={onExit}
          onStart={() => {
            seenBriefings.current.add(briefingKey)
            setBriefingKey(null)
          }}
        />
      </div>
    )
  }

  const code = skillCodeKey(skill.skillCode)
  const Icon = SKILL_ICON[code] || BookOpen
  const items = part.items || []
  const speakingOnly = items.length > 0 && items.every((it) => Number(it.itemTypeId) === ITEM_TYPE.Speaking)
  const writingItems = items.filter((it) => Number(it.itemTypeId) === ITEM_TYPE.Writing
    || it.minWords != null || it.taskText)

  const skillParts = skill.parts || []
  const skillPartIdx = Math.max(0, skillParts.findIndex((p) => p === part
    || (p.partNumber === part.partNumber && p.subPart === part.subPart)))
  const skillItemIds = new Set()
  for (const p of skillParts) {
    for (const it of p.items || []) skillItemIds.add(it.id)
  }
  const skillAnswered = Object.keys(answers).filter((id) => skillItemIds.has(Number(id)) || skillItemIds.has(id)).length
  const skillTotal = skillItemIds.size
  const partTabs = skillParts.map((p) => ({
    key: `${p.partNumber}-${p.subPart ?? 0}`,
    label: String(p.partNumber),
  }))
  const deadlineMs = deadline ? new Date(deadline).getTime() : null

  const jumpToSkillPart = (i) => {
    const target = skillParts[i]
    if (!target) return
    const idx = nav.findIndex((n) => n.part === target
      || (n.skill === skill && n.part?.partNumber === target.partNumber
        && n.part?.subPart === target.subPart))
    if (idx >= 0) setNavIdx(idx)
  }

  return (
    <div ref={scrollRef} className="h-full min-h-0 bg-base overflow-y-auto overscroll-contain">
      <div className="px-4 pt-3 flex items-center gap-2">
        <button type="button" onClick={onBack} className="p-2 rounded-xl hover:bg-cardhi text-slate-300">
          <ChevronLeft size={20} />
        </button>
        <p className="text-sm font-bold text-white/70 flex items-center gap-1.5 truncate">
          <Icon size={14} className="text-neon shrink-0" /> {skill.skillCode}
        </p>
        <Badge color="green" className="ml-auto shrink-0">{navIdx + 1}/{nav.length}</Badge>
      </div>

      <div className="px-5 mt-2 pb-28 space-y-4">
        {speakingOnly ? (
          <ApiSpeakingSequence
            items={items}
            answers={answers}
            attemptId={attempt.attemptId}
            disabled={finishing}
            onAnswer={sendAnswer}
            onApiError={handleApiError}
            onAllDone={goNext}
          />
        ) : (
          <PartShell
            partTabs={partTabs}
            activePartIdx={skillPartIdx}
            onPartChange={jumpToSkillPart}
            answered={skillAnswered}
            total={skillTotal || 1}
            title={null}
            deadlineMs={deadlineMs}
            fontSize={fontSize}
            onFontSize={setFontSize}
          >
            <ExamPartView
              part={{
                ...part,
                items: items.filter((it) => Number(it.itemTypeId) !== ITEM_TYPE.Writing
                  && !it.taskText && it.minWords == null),
              }}
              answers={answers}
              disabled={finishing}
              fontSize={fontSize}
              onAnswer={sendAnswer}
              onClearAnswer={(item) => {
                setAnswers((a) => {
                  const n = { ...a }
                  delete n[item.id]
                  return n
                })
              }}
              speakingExtras={{
                onBeforeRecord: async (item) => {
                  try {
                    await beginSpeaking(attempt.attemptId, item.id)
                  } catch (e) {
                    if (e.status !== 409) handleApiError(e)
                  }
                },
                onRecorded: async (item, blob) => {
                  try {
                    await submitAnswerAudio(attempt.attemptId, { itemId: item.id, audioBlob: blob })
                    await sendAnswer(item, { itemId: item.id, answerType: 'audio' })
                  } catch (e) {
                    handleApiError(e)
                    throw e
                  }
                },
              }}
            />
            {writingItems.map((item) => (
              <WritingItem
                key={item.id}
                item={item}
                answered={answers[item.id]}
                disabled={finishing}
                onAnswer={sendAnswer}
              />
            ))}
            <Button variant="primary" onClick={goNext} disabled={finishing} className="w-full py-3 mt-4">
              {finishing ? <Loader2 className="animate-spin" size={18} /> : null}
              {navIdx >= nav.length - 1 ? 'Topshirish' : 'Keyingi part'}
            </Button>
          </PartShell>
        )}
      </div>
    </div>
  )
}

function ApiSpeakingSequence({ items, answers, attemptId, disabled, onAnswer, onApiError, onAllDone }) {
  const [idx, setIdx] = useState(0)
  const [fontSize, setFontSize] = useState(22)
  const item = items[idx]
  if (!item) return null
  const timing = speakingTimingFor(item.displayNumber)
  const prep = item.prepTimeSec ?? timing.prep
  const record = item.recordTimeSec ?? timing.record
  const tabs = items.map((it) => ({ key: it.id, label: String(it.displayNumber) }))
  const answered = items.filter((it) => answers?.[it.id]).length

  const finishOne = () => {
    if (idx + 1 >= items.length) onAllDone()
    else setIdx((i) => i + 1)
  }

  return (
    <PartShell
      partTabs={tabs}
      activePartIdx={idx}
      onPartChange={setIdx}
      answered={answered}
      total={items.length}
      title={null}
      fontSize={fontSize}
      onFontSize={setFontSize}
    >
      <SpeakingProsCons speakingPrompt={item.speakingPrompt} />
      <SpeakingRecorder
        key={item.id}
        promptText={item.promptText}
        alreadyDone={Boolean(answers?.[item.id])}
        prepSec={prep}
        recordSec={record}
        disabled={disabled}
        onBeforeRecord={async () => {
          try {
            await beginSpeaking(attemptId, item.id)
          } catch (e) {
            if (e.status !== 409) onApiError?.(e)
          }
        }}
        onRecorded={async (blob) => {
          try {
            await submitAnswerAudio(attemptId, { itemId: item.id, audioBlob: blob })
            await onAnswer(item, { itemId: item.id, answerType: 'audio' })
          } catch (e) {
            onApiError?.(e)
            throw e
          }
        }}
        onComplete={finishOne}
      />
    </PartShell>
  )
}

function WritingItem({ item, answered, disabled, onAnswer }) {
  const [text, setText] = useState(answered?.textValue || '')
  const words = countWords(text)
  const min = item.minWords || 0
  const ok = !min || words >= min

  return (
    <Card className="p-4">
      {item.situationText && (
        <p className="arabic q-text text-base leading-loose mb-3 whitespace-pre-wrap">{item.situationText}</p>
      )}
      <p className="arabic q-text font-semibold text-base mb-3">{item.taskText || item.promptText || 'اُكْتُبْ'}</p>
      <textarea
        disabled={disabled}
        value={text}
        dir="rtl"
        lang="ar"
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const textValue = text.trim()
          if (!textValue) return
          onAnswer(item, { itemId: item.id, answerType: 'text', textValue })
        }}
        className="arabic w-full h-40 bg-base border border-line rounded-xl p-3 text-lg leading-loose text-white outline-none focus:border-neon"
        placeholder={min ? `الحد الأدنى ${min} كلمة` : 'اكتب هنا...'}
      />
      <div className="flex justify-between mt-2 text-[11px] tabular-nums">
        <span className={ok ? 'text-neon' : 'text-amber-400'}>
          {words}{min ? ` / ${min}+` : ''}
        </span>
        {answered && <span className="text-neon">✓</span>}
      </div>
    </Card>
  )
}

function Center({ children }) {
  return (
    <div className="h-full min-h-0 bg-base flex flex-col items-center justify-center px-6 text-center gap-2">
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
