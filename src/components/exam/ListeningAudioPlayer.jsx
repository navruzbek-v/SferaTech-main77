import React, { useEffect, useRef, useState } from 'react'
import { Headphones, Pause, Play } from 'lucide-react'
import { Card } from '../../ui.jsx'

/**
 * Listening — haqiqiy audio fayl (audioUrl).
 * Savollardan oldin tinglash uchun.
 */
export default function ListeningAudioPlayer({
  audioUrl,
  audioScript,
    title = 'Listening audio',
  maxPlays = 2,
}) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [playsLeft, setPlaysLeft] = useState(maxPlays)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const startedRef = useRef(false)

  useEffect(() => {
    startedRef.current = false
    setPlaysLeft(maxPlays)
    setProgress(0)
    setPlaying(false)
    setError(null)
    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
      a.load()
    }
  }, [audioUrl, maxPlays])

  useEffect(() => () => {
    try { audioRef.current?.pause() } catch { /* */ }
    try { window.speechSynthesis?.cancel() } catch { /* */ }
  }, [])

  if (!audioUrl && !audioScript) {
    return (
      <Card className="p-4 border-amber-500/40 bg-amber-500/10">
        <p className="text-amber-100 text-sm font-medium">Audio yo‘q</p>
      </Card>
    )
  }

  const onPlay = async () => {
    const a = audioRef.current
    if (audioUrl && a) {
      if (playing) {
        a.pause()
        setPlaying(false)
        return
      }
      if (playsLeft <= 0) return
      try {
        if (!startedRef.current || a.ended || a.currentTime === 0) {
          a.currentTime = 0
          startedRef.current = true
          setPlaysLeft((n) => Math.max(0, n - 1))
        }
        await a.play()
        setPlaying(true)
        setError(null)
      } catch (e) {
        setError('Audio ijro etilmadi — brauzer ruxsatini tekshiring')
        setPlaying(false)
      }
      return
    }

    // Fallback TTS (faqat fayl bo‘lmasa)
    if (!audioScript || playsLeft <= 0) return
    if (playing) {
      window.speechSynthesis?.cancel()
      setPlaying(false)
      return
    }
    window.speechSynthesis?.cancel()
    const u = new SpeechSynthesisUtterance(audioScript)
    u.lang = 'ar-SA'
    u.rate = 0.9
    u.onstart = () => {
      setPlaying(true)
      setPlaysLeft((n) => Math.max(0, n - 1))
    }
    u.onend = () => setPlaying(false)
    u.onerror = () => setPlaying(false)
    window.speechSynthesis?.speak(u)
  }

  return (
    <Card className="p-4 border-neon/40 bg-[#0d1a14]">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onTimeUpdate={(e) => {
            const el = e.currentTarget
            if (el.duration) setProgress(el.currentTime / el.duration)
          }}
          onEnded={() => {
            setPlaying(false)
            setProgress(1)
            startedRef.current = false
          }}
          onError={() => setError('Audio fayl topilmadi')}
        />
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-neon/25 text-neon flex items-center justify-center shrink-0">
          <Headphones size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-white">{title}</p>
          <p className="text-xs text-white/50 mt-0.5 tabular-nums">
            <span className="text-neon font-bold">{playsLeft}</span>/{maxPlays}
          </p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
        <div
          className="h-full bg-neon transition-all"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <button
        type="button"
        onClick={onPlay}
        disabled={!playing && playsLeft <= 0}
        className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base ${
          playing
            ? 'bg-cardhi border border-line text-white'
            : playsLeft > 0
              ? 'bg-neon text-black'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
      >
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {error && <p className="text-red-300 text-xs mt-2 text-center">{error}</p>}
    </Card>
  )
}
