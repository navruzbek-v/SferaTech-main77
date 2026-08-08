import React, { useEffect, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useApp } from '../App.jsx'
import { Button } from '../ui.jsx'
import {
  initTelegram, getTelegramUser, displayName, getInitData, haptic, isTelegramEnv,
} from '../lib/telegram.js'
import { ensureSession, loginWithTelegram, fetchProfile } from '../api/student.js'

/**
 * Auth — cefr-exam-telegram-miniapp.md:
 * POST /auth/loginwithtelegram + Telegram.WebApp.initData
 */
export default function Auth() {
  const { setAuthed, setUser, setXp, notify } = useApp()
  const [loading, setLoading] = useState(false)
  const inTg = isTelegramEnv()

  useEffect(() => {
    initTelegram()
  }, [])

  const enter = (user) => {
    setUser(user)
    setXp(user.xp ?? 0)
    setAuthed(true)
    notify(`Xush kelibsiz, ${user.name}!`)
  }

  const guest = (tg) => ({
    id: tg?.id || 'local',
    name: displayName(tg) || 'Mehmon',
    username: tg?.username || '@mehmon',
    roleId: 1,
    xp: 0,
    level: 'B2',
    cefrLevelId: 4,
    streak: 0,
  })

  const login = async () => {
    setLoading(true)
    haptic('medium')
    const tg = getTelegramUser()
    try {
      // 1) MD: Telegram initData
      const initData = getInitData()
      if (initData) {
        await loginWithTelegram(initData)
        const profile = await fetchProfile().catch(() => null)
        enter(profile || guest(tg))
        return
      }

      // 2) Mavjud token / demo
      const session = await ensureSession()
      if (session.ok && session.profile) {
        enter(session.profile)
        return
      }

      // Brauzer preview — lokal rejim (xatosiz)
      enter(guest(tg))
    } catch (e) {
      notify(e.message || 'Kirish amalgamadi', 'error')
      enter(guest(tg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-base flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center mb-14 select-none">
        <div className="w-20 h-20 rounded-3xl bg-neon/10 border border-neon/30 flex items-center justify-center mb-5">
          <span className="arabic text-4xl text-neon">ع</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Arabosfera</h1>
        <p className="text-slate-500 text-sm mt-1">
          {inTg ? 'Telegram Mini App · CEFR Mock Exam' : 'Arab tilini professional o‘rganish'}
        </p>
      </div>

      <Button
        variant="tg"
        onClick={login}
        disabled={loading}
        className="w-full max-w-xs py-3.5 text-base animate-pulseg"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        {loading ? 'Kirilmoqda...' : 'Kirish'}
      </Button>

      <p className="text-slate-600 text-xs mt-4 max-w-xs text-center">
        {inTg ? 'Telegram Mini App' : 'Demo rejim — lokal savollar bilan ishlaydi'}
      </p>
    </div>
  )
}
