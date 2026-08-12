import React, { useEffect, useRef, useState } from 'react'
import { Mic, Play, Loader2 } from 'lucide-react'
import { Button, Card } from '../ui.jsx'
import { canRecordAudio, haptic } from '../lib/telegram.js'

const PREP_SEC = 8
const RECORD_SEC = 45

function speakPrompt(text) {
  try {
    window.speechSynthesis?.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = /[\u0600-\u06FF]/.test(text) ? 'ar-SA' : 'uz-UZ'
    u.rate = 0.9
    window.speechSynthesis?.speak(u)
  } catch { /* */ }
}

function formatClock(sec) {
  const s = Math.max(0, Number(sec) || 0)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.value = 0.12
    o.start()
    setTimeout(() => { o.stop(); ctx.close?.() }, 180)
  } catch { /* */ }
}

/**
 * Gapirish: tayyorgarlik → avto yozish → o‘zini tinglash
 * Knopka bosish shart emas (prep tugagach boshlanadi).
 */
export default function SpeakingRecorder({
  promptText,
  hints,
  prepSec = PREP_SEC,
  recordSec = RECORD_SEC,
  disabled,
  onBeforeRecord,
  onRecorded,
  alreadyDone,
  onComplete,
}) {
  const [phase, setPhase] = useState(alreadyDone ? 'done' : 'prep')
  const [prepLeft, setPrepLeft] = useState(prepSec)
  const [recLeft, setRecLeft] = useState(recordSec)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const mediaRef = useRef(null)
  const streamRef = useRef(null)
  const chunks = useRef([])
  const initialDone = useRef(Boolean(alreadyDone))
  const phaseRef = useRef(phase)
  const callbacks = useRef({ onBeforeRecord, onRecorded, onComplete })
  const recordSecRef = useRef(recordSec)
  const prepTickRef = useRef(null)
  const prepAliveRef = useRef(true)

  phaseRef.current = phase
  callbacks.current = { onBeforeRecord, onRecorded, onComplete }
  recordSecRef.current = recordSec

  const cleanupStream = () => {
    try { streamRef.current?.getTracks().forEach((t) => t.stop()) } catch { /* */ }
    streamRef.current = null
  }

  const stopRecording = () => {
    try {
      if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
    } catch { /* */ }
  }

  const beginRecord = async () => {
    if (phaseRef.current === 'record' || phaseRef.current === 'review') return
    setError(null)
    const mic = await canRecordAudio()
    if (!mic.ok) {
      setError('Mikrofon ochilmadi — brauzerda ruxsat bering')
      setPhase('prep')
      return
    }
    try {
      const { onBeforeRecord: before, onRecorded: after } = callbacks.current
      if (before) {
        try { await before() } catch { /* 409 ok */ }
      }
      playBeep()
      haptic('medium')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunks.current = []
      rec.ondataavailable = (e) => { if (e.data?.size) chunks.current.push(e.data) }
      rec.onstop = async () => {
        cleanupStream()
        const blob = new Blob(chunks.current, { type: mime || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setPhase('review')
        if (after) {
          setUploading(true)
          try { await after(blob) } catch { /* review baribir */ }
          finally { setUploading(false) }
        }
      }
      mediaRef.current = rec
      rec.start()
      setPhase('record')
      setRecLeft(recordSecRef.current)
    } catch {
      setError('Yozib bo‘lmadi')
      setPhase('prep')
    }
  }

  const skipPrep = () => {
    if (phaseRef.current !== 'prep') return
    prepAliveRef.current = false
    if (prepTickRef.current) {
      clearInterval(prepTickRef.current)
      prepTickRef.current = null
    }
    window.speechSynthesis?.cancel()
    setPrepLeft(0)
    beginRecord()
  }

  // Tayyorgarlik countdown — faqat prompt/prepSec o‘zgaganda qayta ishga tushadi
  useEffect(() => {
    if (initialDone.current) return undefined

    prepAliveRef.current = true
    let left = prepSec
    setPhase('prep')
    setPrepLeft(prepSec)
    if (promptText) speakPrompt(promptText)

    prepTickRef.current = setInterval(() => {
      left -= 1
      if (!prepAliveRef.current) return
      if (left <= 0) {
        clearInterval(prepTickRef.current)
        prepTickRef.current = null
        setPrepLeft(0)
        beginRecord()
        return
      }
      setPrepLeft(left)
    }, 1000)

    return () => {
      prepAliveRef.current = false
      if (prepTickRef.current) {
        clearInterval(prepTickRef.current)
        prepTickRef.current = null
      }
      window.speechSynthesis?.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepSec, promptText])

  // Yozish taymeri
  useEffect(() => {
    if (phase !== 'record') return undefined
    let left = recordSec
    setRecLeft(left)
    const id = setInterval(() => {
      left -= 1
      if (left <= 0) {
        clearInterval(id)
        setRecLeft(0)
        stopRecording()
        return
      }
      setRecLeft(left)
    }, 1000)
    return () => clearInterval(id)
  }, [phase, recordSec])

  // Unmount cleanup
  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    stopRecording()
    cleanupStream()
  }, [])

  const confirmDone = () => {
    window.speechSynthesis?.cancel()
    setPhase('done')
    callbacks.current.onComplete?.()
  }

  if (phase === 'done' || initialDone.current) {
    return (
      <Card className="p-5 text-center space-y-3">
        {promptText ? <p className="arabic q-text text-lg leading-relaxed">{promptText}</p> : null}
        <p className="text-neon text-sm font-semibold">Gapirish yakunlandi ✓</p>
        {audioUrl && (
          <audio controls src={audioUrl} className="w-full mt-2" />
        )}
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2">
        {phase === 'prep' ? 'Tayyorgarlik' : phase === 'record' ? 'Gapiring' : 'Tinglang'}
      </p>
      {promptText ? <p className="arabic q-text text-xl leading-relaxed mb-4">{promptText}</p> : null}
      {hints}

      {error && <p className="text-amber-300 text-xs mb-3">{error}</p>}

      <div className="flex flex-col items-center gap-4 py-4">
        {phase === 'prep' && (
          <>
            <p className="text-sm text-white/60 italic mb-1">Javob bering!</p>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-orange-500/25" />
              <div className="prep-spin absolute inset-0 rounded-full border-4 border-orange-400 border-t-transparent" />
              <span className="text-3xl font-black text-white tabular-nums">
                {formatClock(prepLeft)}
              </span>
            </div>
            <p className="text-sm font-semibold text-orange-300 text-center">Tayyorgarlik vaqti</p>
            <p className="text-xs text-white/50 text-center">
              {prepLeft}s dan keyin yozish avtomatik boshlanadi
            </p>
            <Button
              type="button"
              variant="dark"
              className="w-full mt-1"
              disabled={disabled}
              onClick={skipPrep}
            >
              O‘tkazib yuborish →
            </Button>
          </>
        )}

        {phase === 'record' && (
          <>
            <button
              type="button"
              onClick={stopRecording}
              disabled={disabled}
              className="mic-pulse mic-speaking relative w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center"
              aria-label="To‘xtatish"
            >
              <span className="mic-ring" />
              <span className="mic-ring delay" />
              <span className="mic-ring delay2" />
              <Mic size={30} className="relative z-10" />
            </button>
            <p className="text-sm text-white font-semibold tabular-nums">
              Gapiring… {formatClock(recLeft)}
            </p>
            <p className="text-xs text-white/50">Vaqt tugaguncha gapiring — avtomatik to‘xtaydi</p>
          </>
        )}

        {phase === 'review' && (
          <>
            <p className="text-sm text-white/80">O‘z ovozingizni tinglang</p>
            {audioUrl && (
              <audio controls autoPlay playsInline src={audioUrl} className="w-full" />
            )}
            <Button variant="primary" className="w-full" onClick={confirmDone} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
              Tayyor
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

export { speakPrompt, playBeep }
