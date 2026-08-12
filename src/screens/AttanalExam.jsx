import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2, Loader2, BookOpen, Headphones, PenLine, Mic,
} from 'lucide-react'
import { useApp } from '../App.jsx'
import { Card } from '../ui.jsx'
import {
  startAttanalExam as startExam,
  getAttanalAttempt as getAttempt,
  submitAttanalAnswer as submitAnswer,
  beginAttanalSpeaking as beginSpeaking,
  submitAttanalAnswerAudio as submitAnswerAudio,
  completeAttanalExam as completeExam,
  getAttanalResult as getResult,
  advanceAttanalPhase,
  applyOptionLocks, countWords,
  saveAttanalAttemptId as saveAttemptId,
  loadAttanalAttemptId as loadAttemptId,
  clearAttanalAttemptId as clearAttemptId,
} from '../api/attanalExam.js'
import {
  ITEM_TYPE, deadlineForSkill, msLeft, formatMs, skillCodeKey,
  usableDeadline,
} from '../lib/examConstants.js'
import {
  isGrammarVocab, attanalSpeakingTiming, attanalWritingMinWords, phaseNeedsAdvance,
  ATTANAL_TIMERS,
} from '../lib/attanalConstants.js'
import { useMainButton, useBackButton } from '../lib/mainButton.js'
import { haptic, getTelegramUser } from '../lib/telegram.js'
import ExamPartView from '../components/exam/ExamPartView.jsx'
import PartShell from '../components/exam/PartShell.jsx'
import SpeakingProsCons from '../components/exam/SpeakingProsCons.jsx'
import SpeakingRecorder from '../components/SpeakingRecorder.jsx'
import ListeningAudioPlayer from '../components/exam/ListeningAudioPlayer.jsx'
import CefrBriefing from '../components/exam/CefrBriefing.jsx'
import AttanalEexamShell, { EexamMcq } from '../components/exam/AttanalEexamShell.jsx'
import { hasAuthToken } from '../api/client.js'
import { ensureSession } from '../api/student.js'

function briefingKeyForSkill(skill) {
  const c = skillCodeKey(skill?.skillCode)
  if (isGrammarVocab(c)) return 'grammarvocab'
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
  grammarvocab: BookOpen,
}

function flattenNav(attempt) {
  const nav = []
  for (const skill of attempt?.skills || []) {
    for (const part of skill.parts || []) {
      if (part.isUnlocked === false) continue
      nav.push({ skill, part })
    }
  }
  return nav
}

export default function AttanalExam({ onExit, onFallback }) {
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

  const softFallback = useCallback(() => {
    if (fellBack.current) return
    fellBack.current = true
    if (typeof onFallback === 'function') onFallback()
    else onExit?.()
  }, [onFallback, onExit])

  /** Token bor → API; yo‘q → lokal */
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
        data = await startExam()
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
  }, [softFallback])

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
      app.notify('at-Tanal imtihoni yakunlandi ✓')
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

  // Telegram MainButton — at-Tanal da sticky footer yetarli
  useEffect(() => {
    mainBtn.hide()
    return () => mainBtn.hide()
  }, [mainBtn])

  const pageUser = {
    userName: app.user?.name || 'O‘quvchi',
    photoUrl: app.user?.avatarUrl || getTelegramUser()?.photoUrl || null,
    userTitle: 'شهادة الكفاءة الدولية في اللغة العربية - الاختبار الأكاديمي',
  }

  if (loading) {
    return (
      <AttanalEexamShell mode="page" {...pageUser} skillLabel="at-Tanal" showNext={false}>
        <div className="h-full flex flex-col items-center justify-center px-6 gap-3 min-h-[280px]">
          <Loader2 className="animate-spin text-[#F39200]" size={36} />
          <p className="text-sm text-[#666] font-medium">eexam · yuklanmoqda…</p>
        </div>
      </AttanalEexamShell>
    )
  }

  if (result) {
    return (
      <AttanalEexamShell
        mode="page"
        {...pageUser}
        skillLabel="Natija"
        showNext={false}
        onBack={onExit}
      >
        <div className="flex flex-col items-center justify-center px-5 py-10 max-w-lg mx-auto text-center min-h-[320px]">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(243,146,0,0.15)', color: '#F39200' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#2A2A2A]">Natija</h2>
          <p className="text-sm text-[#666] mt-1 mb-5">at-Tanal · eexam</p>
          <div className="w-full rounded-xl border p-4 text-left space-y-2.5" style={{ background: '#FFF', borderColor: '#C4C4C4' }}>
            <Row label="Grammar & Vocab" value={result.grammarScore ?? result.grammarVocabScore ?? '—'} />
            <Row label="Reading" value={result.readingScore ?? '—'} />
            <Row label="Listening" value={result.listeningScore ?? '—'} />
            <Row label="Writing" value={result.writingScore ?? '—'} />
            <Row label="Speaking" value={result.speakingScore ?? '—'} />
            <div className="border-t pt-2 mt-1" style={{ borderColor: '#C4C4C4' }}>
              <Row label="Jami" value={result.totalScore ?? '—'} />
            </div>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="w-full max-w-xs mt-6 py-3 rounded-md font-bold text-white"
            style={{ background: '#F39200' }}
          >
            Bosh sahifa
          </button>
        </div>
      </AttanalEexamShell>
    )
  }

  if (bootError || !part) {
    return (
      <AttanalEexamShell mode="page" {...pageUser} showNext={false} onBack={onExit}>
        <div className="h-full flex flex-col items-center justify-center px-6 gap-3 min-h-[240px]">
          <Loader2 className="animate-spin text-[#F39200]" size={32} />
          <p className="text-[#666] text-sm">Tayyorlanmoqda…</p>
        </div>
      </AttanalEexamShell>
    )
  }

  if (briefingKey) {
    return (
      <AttanalEexamShell
        mode="page"
        {...pageUser}
        skillLabel="at-Tanal"
        showNext={false}
        onBack={onExit}
      >
        <CefrBriefing
          skillKey={briefingKey}
          variant="attanal"
          onBack={null}
          onStart={() => {
            seenBriefings.current.add(briefingKey)
            setBriefingKey(null)
          }}
        />
      </AttanalEexamShell>
    )
  }

  const code = skillCodeKey(skill.skillCode)
  const items = part.items || []
  const speakingOnly = items.length > 0 && items.every((it) => Number(it.itemTypeId) === ITEM_TYPE.Speaking)
  const writingItems = items.filter((it) => Number(it.itemTypeId) === ITEM_TYPE.Writing
    || it.minWords != null || it.taskText)

  const skillParts = skill.parts || []
  const partTabs = skillParts.filter((p) => p.isUnlocked !== false).map((p) => ({
    key: `${p.partNumber}-${p.subPart ?? 0}`,
    label: String(p.partNumber),
  }))
  const phase = part.activePhase || attempt.currentPhase
  const phaseDl = usableDeadline(part.phaseDeadline || attempt.phaseDeadline)
  const liveDeadline = deadline || phaseDl

  const doAdvance = async () => {
    if (!attempt?.attemptId) return
    try {
      let data = await advanceAttanalPhase(attempt.attemptId)
      if (data?.optionLocks?.length) data = applyOptionLocks(data, data.optionLocks)
      if (data?.skills?.length) setAttempt(data)
      haptic('medium')
      app.notify('Keyingi fazaga o‘tildi')
    } catch (e) {
      if (!handleApiError(e)) app.notify(e.message || 'Faza xatosi', 'error')
    }
  }

  const jumpToSkillPart = (i) => {
    const unlocked = skillParts.filter((p) => p.isUnlocked !== false)
    const target = unlocked[i]
    if (!target) return
    const idx = nav.findIndex((n) => n.part === target
      || (n.skill === skill && n.part?.partNumber === target.partNumber
        && n.part?.subPart === target.subPart))
    if (idx >= 0) setNavIdx(idx)
  }

  const last = navIdx >= nav.length - 1
  const userName = app.user?.name || 'O‘quvchi'
  const photoUrl = app.user?.avatarUrl || getTelegramUser()?.photoUrl || null
  const sectionLeftMs = liveDeadline ? msLeft(liveDeadline) : null
  const totalLeftMs = (() => {
    void tick
    const candidates = [
      attempt?.readingDeadline,
      attempt?.listeningDeadline,
      attempt?.writingDeadline,
      ...(attempt?.skills || []).map((sk) => sk.serverDeadline),
    ]
    const lefts = candidates.map((d) => msLeft(usableDeadline(d) || d)).filter((v) => v != null && v > 0)
    if (!lefts.length) return sectionLeftMs
    return Math.max(...lefts, sectionLeftMs || 0)
  })()
  const shellUser = {
    userName,
    photoUrl,
    userTitle: 'شهادة الكفاءة الدولية في اللغة العربية - الاختبار الأكاديمي',
  }
  const skillLayout = (() => {
    const c = String(code || '').toLowerCase()
    if (c.includes('read')) return 'reading'
    if (c.includes('listen')) return 'listening'
    if (c.includes('writ')) return 'writing'
    if (c.includes('speak')) return 'speaking'
    return 'default'
  })()

  if (isGrammarVocab(code)) {
    return (
      <div ref={scrollRef} className="h-full min-h-0">
        {phaseNeedsAdvance(phase) ? (
          <div className="absolute top-14 left-2 right-2 z-30 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
            <button type="button" onClick={doAdvance} className="font-bold text-[#F39200]">Fazani tugatish →</button>
          </div>
        ) : null}
        <GrammarVocabSequence
          items={items}
          startIndex={attempt.currentGrammarIndex ?? 0}
          answers={answers}
          disabled={finishing}
          perQuestionSec={ATTANAL_TIMERS.grammarVocabPerQuestionSec}
          fontSize={fontSize}
          {...shellUser}
          skillLabel={skill.skillCode}
          totalLeftMs={totalLeftMs}
          sectionLeftMs={sectionLeftMs}
          onFontSize={setFontSize}
          onBack={onBack}
          onAnswer={sendAnswer}
          onAllDone={goNext}
        />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full min-h-0">
      <AttanalEexamShell
        {...shellUser}
        layout={skillLayout}
        skillLabel={skill.skillCode}
        questionIndex={navIdx + 1}
        questionTotal={Math.max(nav.length, 1)}
        railLabel={`السؤال ${navIdx + 1} من ${Math.max(nav.length, 1)}`}
        totalLeftMs={totalLeftMs}
        sectionLeftMs={sectionLeftMs}
        fontSize={fontSize}
        onFontSize={setFontSize}
        onBack={onBack}
        onNext={() => { if (last) finish(); else goNext() }}
        nextDisabled={finishing}
        showNext={!speakingOnly}
        nextLabel={last ? 'إنهاء' : 'التالي'}
      >
        {phaseNeedsAdvance(phase) ? (
          <div className="m-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-950/90">
              <span className="font-bold">Faza:</span> {phase}
              {phaseDl ? ` · ${formatMs(msLeft(phaseDl))}` : ''}
            </p>
            <button
              type="button"
              onClick={doAdvance}
              disabled={finishing}
              className="px-4 py-2 rounded-md text-sm font-bold text-white bg-[#F39200]"
            >
              Fazani tugatish
            </button>
          </div>
        ) : null}

        {speakingOnly ? (
          <div className="p-3 sm:p-4">
            <ApiSpeakingSequence
              items={items}
              partNumber={part.partNumber}
              answers={answers}
              attemptId={attempt.attemptId}
              disabled={finishing}
              onAnswer={sendAnswer}
              onApiError={handleApiError}
              onAllDone={goNext}
            />
          </div>
        ) : (
          <div className="p-0 sm:p-0 space-y-0 h-full min-h-0">
            {partTabs.length > 1 ? (
              <div className="flex gap-1.5 px-3 pt-2 mb-1">
                {partTabs.map((t, i) => {
                  const active = Math.max(0, skillParts.filter((p) => p.isUnlocked !== false).findIndex((p) => p === part
                    || (p.partNumber === part.partNumber && p.subPart === part.subPart)))
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => jumpToSkillPart(i)}
                      className="h-1.5 flex-1 rounded-full"
                      style={{ background: i === active ? '#F39200' : '#D0D0D0' }}
                      aria-label={`Part ${t.label}`}
                    />
                  )
                })}
              </div>
            ) : null}
            <ExamPartView
              part={{
                ...part,
                items: items.filter((it) => Number(it.itemTypeId) !== ITEM_TYPE.Writing
                  && !it.taskText && it.minWords == null),
              }}
              answers={answers}
              disabled={finishing}
              fontSize={fontSize}
              variant="eexam"
              onAnswer={sendAnswer}
              listeningMaxPlays={phaseNeedsAdvance(phase) ? 99 : 2}
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
                item={{ ...item, minWords: attanalWritingMinWords(part.partNumber, item) }}
                answered={answers[item.id]}
                disabled={finishing}
                onAnswer={sendAnswer}
              />
            ))}
          </div>
        )}
      </AttanalEexamShell>
    </div>
  )
}

function GrammarVocabSequence({
  items,
  startIndex = 0,
  answers,
  disabled,
  perQuestionSec = 60,
  fontSize = 22,
  userName,
  userTitle,
  photoUrl,
  skillLabel,
  totalLeftMs,
  sectionLeftMs,
  onFontSize,
  onBack,
  onAnswer,
  onAllDone,
}) {
  const initial = Math.min(Math.max(0, Number(startIndex) || 0), Math.max(0, items.length - 1))
  const [idx, setIdx] = useState(initial)
  const [leftSec, setLeftSec] = useState(perQuestionSec)
  const advancing = useRef(false)

  useEffect(() => {
    const next = Math.min(Math.max(0, Number(startIndex) || 0), Math.max(0, items.length - 1))
    setIdx(next)
  }, [startIndex, items.length])

  useEffect(() => {
    setLeftSec(perQuestionSec)
    advancing.current = false
  }, [idx, perQuestionSec])

  const item = items[idx]
  const advance = useCallback(async (selectedOpt) => {
    if (!item || advancing.current) return
    advancing.current = true
    if (selectedOpt && !answers?.[item.id]) {
      await onAnswer?.(item, {
        itemId: item.id,
        answerType: 'option',
        selectedOptionId: selectedOpt.id,
      })
    }
    if (idx + 1 >= items.length) onAllDone?.()
    else setIdx((i) => i + 1)
  }, [item, answers, idx, items.length, onAnswer, onAllDone])

  useEffect(() => {
    if (!item || disabled) return undefined
    if (answers?.[item.id]) {
      const t = setTimeout(() => advance(null), 400)
      return () => clearTimeout(t)
    }
    const id = setInterval(() => {
      setLeftSec((s) => {
        if (s <= 1) {
          clearInterval(id)
          advance(null)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [item, disabled, answers, advance])

  if (!item) return null

  const total = items.length || ATTANAL_TIMERS.grammarVocabQuestions
  const budget = perQuestionSec

  return (
    <AttanalEexamShell
      layout="grammar"
      userName={userName}
      userTitle={userTitle}
      photoUrl={photoUrl}
      skillLabel={skillLabel}
      questionIndex={idx + 1}
      questionTotal={total}
      railLabel={`السؤال ${idx + 1} من ${total}`}
      totalLeftMs={totalLeftMs}
      sectionLeftMs={sectionLeftMs}
      questionLeftSec={leftSec}
      questionBudgetSec={budget}
      fontSize={fontSize}
      onFontSize={onFontSize}
      onBack={onBack}
      showNext
      nextLabel="التالي"
      nextDisabled={disabled}
      onNext={() => advance(null)}
    >
      <EexamMcq
        item={item}
        options={item.options}
        selectedOptionId={answers?.[item.id]?.selectedOptionId}
        disabled={disabled || Boolean(answers?.[item.id])}
        fontSize={fontSize}
        onSelect={(opt) => advance(opt)}
      />
    </AttanalEexamShell>
  )
}

function ApiSpeakingSequence({ items, partNumber, answers, attemptId, disabled, onAnswer, onApiError, onAllDone }) {
  const [idx, setIdx] = useState(0)
  const [fontSize, setFontSize] = useState(22)
  const item = items[idx]
  if (!item) return null
  const timing = attanalSpeakingTiming(partNumber, item)
  const prep = timing.prep
  const record = timing.record
  const tabs = items.map((it) => ({ key: it.id, label: String(it.displayNumber ?? '') }))
  const answered = items.filter((it) => answers?.[it.id]).length
  const hasHints = Boolean(
    item.speakingPrompt?.prosHint || item.speakingPrompt?.consHint
      || item.speakingPrompt?.pros || item.speakingPrompt?.cons,
  )

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
      {/* MD: Speaking — 2 ta audio-prompt (matn yo‘q) */}
      {item.audioUrl ? (
        <ListeningAudioPlayer
          audioUrl={item.audioUrl}
          title={`Prompt ${item.displayNumber ?? idx + 1}`}
          maxPlays={99}
        />
      ) : (
        <Card className="p-3 text-sm text-amber-200/80 border border-amber-400/20 bg-amber-400/5">
          Audio prompt kutilmoqda (matn ko‘rsatilmaydi).
        </Card>
      )}
      {hasHints ? <SpeakingProsCons speakingPrompt={item.speakingPrompt} /> : null}
      <SpeakingRecorder
        key={item.id}
        promptText={null}
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
    <div className="px-3 py-3" dir="rtl" lang="ar">
      {item.situationText && (
        <p
          className="arabic text-[15px] leading-[1.9] mb-3 whitespace-pre-wrap text-right"
          style={{ color: '#2A2A2A', WebkitTextFillColor: '#2A2A2A' }}
        >
          {item.situationText}
        </p>
      )}
      <p
        className="arabic font-bold text-[16px] mb-3 text-right"
        style={{ color: '#2A2A2A', WebkitTextFillColor: '#2A2A2A' }}
      >
        {item.taskText || item.promptText || 'اُكْتُبْ'}
      </p>
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
        className="arabic w-full h-52 rounded-md p-3 text-[17px] leading-[1.9] outline-none border resize-none"
        style={{
          color: '#2A2A2A',
          WebkitTextFillColor: '#2A2A2A',
          borderColor: '#C8C8C8',
          background: 'transparent',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(0,0,0,0.06) 31px, rgba(0,0,0,0.06) 32px)',
          backgroundAttachment: 'local',
        }}
        placeholder={min ? `الحد الأدنى ${min} كلمة` : 'اكتب هنا...'}
      />
      <div className="flex justify-between mt-2 text-[11px] tabular-nums">
        <span style={{ color: ok ? '#F39200' : '#D97706' }}>
          {words}{min ? ` / ${min}+` : ''}
        </span>
        {answered && <span style={{ color: '#F39200' }}>✓</span>}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#666]">{label}</span>
      <span className="font-bold text-[#2A2A2A]">{value}</span>
    </div>
  )
}
