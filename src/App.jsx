import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Toast } from './ui.jsx'
import Auth from './screens/Auth.jsx'
import Dashboard from './screens/Dashboard.jsx'
import { initTelegram, getInitData } from './lib/telegram.js'
import { DEFAULT_THRESHOLDS } from './lib/cefr.js'
import { apiConfigured, clearTokens, hasAuthToken } from './api/client.js'
import { ensureSession, logout as apiLogout } from './api/student.js'
import { clearAttemptId } from './api/exam.js'
import { setPath } from './lib/routes.js'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  const [examDate, setExamDate] = useState(null)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 })
  const [xp, setXp] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [submissions, setSubmissions] = useState([])
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS)

  useEffect(() => {
    initTelegram()
    // Eski /admin bookmark — mini-appda yo‘q
    if (window.location.pathname.startsWith('/admin')) {
      setPath('/', { replace: true })
    }
    ;(async () => {
      try {
        const canAuth = Boolean(getInitData())
          || Boolean(import.meta.env.VITE_DEMO_PHONE && import.meta.env.VITE_DEMO_PASSWORD)
        if (!canAuth) {
          clearTokens()
          clearAttemptId()
        } else {
          const session = await ensureSession()
          if (session.ok && session.profile) {
            setUser(session.profile)
            setXp(session.profile.xp || 0)
            setAuthed(true)
          }
        }
      } catch {
        clearTokens()
      } finally {
        setBooting(false)
      }
    })()
  }, [])

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const addAnswer = useCallback((isCorrect) => {
    setStats((s) => {
      const correct = s.correct + (isCorrect ? 1 : 0)
      const wrong = s.wrong + (isCorrect ? 0 : 1)
      return { ...s, correct, wrong, total: correct + wrong }
    })
    if (!isCorrect) setErrorCount((c) => c + 1)
  }, [])

  const progressPct = useMemo(() => {
    const done = stats.correct + stats.wrong
    if (!done) return 0
    return Math.round((stats.correct / done) * 100)
  }, [stats])

  const daysLeft = useMemo(() => {
    if (!examDate) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(examDate)
    return Math.max(0, Math.ceil((d - today) / 86400000))
  }, [examDate])

  const signOut = useCallback(async () => {
    try { await apiLogout() } catch { clearTokens() }
    clearAttemptId()
    setAuthed(false)
    setUser(null)
    setPath('/', { replace: true })
  }, [])

  const submitExam = useCallback(async (payload) => {
    const row = { id: `local-${Date.now()}`, ...payload }
    setSubmissions((prev) => [row, ...prev])
    return row
  }, [])

  const ctx = {
    authed, setAuthed, notify, signOut,
    user, setUser,
    examDate, setExamDate, daysLeft,
    stats, setStats, addAnswer, progressPct,
    xp, setXp, errorCount, setErrorCount,
    submissions, submitExam, setSubmissions,
    thresholds, setThresholds,
    apiOnline: apiConfigured() && hasAuthToken(),
    apiBase: apiConfigured(),
  }

  if (booting) {
    return (
      <div className="h-[100dvh] bg-base flex items-center justify-center text-slate-400 text-sm overflow-hidden">
        Arabosfera yuklanmoqda...
      </div>
    )
  }

  return (
    <AppCtx.Provider value={ctx}>
      <Toast toast={toast} />
      {!authed ? (
        <PhoneFrame>
          <Auth />
        </PhoneFrame>
      ) : (
        <PhoneFrame>
          <Dashboard />
        </PhoneFrame>
      )}
    </AppCtx.Provider>
  )
}

function PhoneFrame({ children }) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-[#070b10] sm:p-6">
      <div
        className="w-full h-full sm:w-[420px] sm:max-w-[420px] sm:h-[min(860px,100%)] sm:rounded-[2.5rem] sm:border sm:border-white/10 sm:shadow-2xl overflow-hidden relative flex flex-col"
        style={{
          paddingTop: 'var(--app-safe-top)',
          paddingBottom: 'var(--app-safe-bottom)',
          paddingLeft: 'var(--app-safe-left)',
          paddingRight: 'var(--app-safe-right)',
        }}
      >
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  )
}
