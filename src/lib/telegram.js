// Telegram Mini App bootstrap — 04-telegram-miniapp-prompt + cefr-exam MD

let ready = false

export function getTelegram() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : null
}

export function initTelegram() {
  const tg = getTelegram()
  if (!tg || ready) return tg
  try {
    tg.ready()
    tg.expand()
    try { tg.disableVerticalSwipes?.() } catch { /* */ }
    applyTheme(tg)
    tg.onEvent?.('themeChanged', () => applyTheme(tg))
    ready = true
  } catch {
    /* browser preview */
  }
  return tg
}

function applyTheme(tg) {
  const p = tg?.themeParams || {}
  const root = document.documentElement
  root.style.setProperty('--tg-bg', p.bg_color || '#0B0F16')
  root.style.setProperty('--tg-text', p.text_color || '#E6EDF3')
  root.style.setProperty('--tg-hint', p.hint_color || '#8B949E')
  root.style.setProperty('--tg-button', p.button_color || '#2AABEE')
  root.style.setProperty('--tg-button-text', p.button_text_color || '#ffffff')
  try {
    tg.setHeaderColor?.(p.bg_color || '#0B0F16')
    tg.setBackgroundColor?.(p.bg_color || '#0B0F16')
  } catch { /* */ }
}

export function isTelegramEnv() {
  const tg = getTelegram()
  return Boolean(tg?.initData || tg?.initDataUnsafe?.user)
}

export function getTelegramUser() {
  const tg = getTelegram()
  const u = tg?.initDataUnsafe?.user
  if (!u) return null
  return {
    id: u.id,
    firstName: u.first_name || '',
    lastName: u.last_name || '',
    username: u.username ? `@${u.username}` : '',
    photoUrl: u.photo_url,
    languageCode: u.language_code,
  }
}

export function getInitData() {
  return getTelegram()?.initData || ''
}

export function displayName(user) {
  if (!user) return 'Mehmon'
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return full || user.username?.replace('@', '') || `User ${user.id}`
}

export function haptic(type = 'light') {
  try {
    getTelegram()?.HapticFeedback?.impactOccurred?.(type)
  } catch { /* */ }
}

/** Tashqi http(s) — Mini App ichida openLink */
export function openExternalLink(url) {
  const href = String(url || '').trim()
  if (!/^https?:\/\//i.test(href)) return false
  const tg = getTelegram()
  try {
    if (tg?.openLink) {
      tg.openLink(href)
      return true
    }
  } catch { /* */ }
  try {
    window.open(href, '_blank', 'noopener,noreferrer')
    return true
  } catch {
    return false
  }
}

/** Speaking: MediaRecorder + getUserMedia (TMA WebView cheklovi) */
export async function canRecordAudio() {
  if (!navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    return { ok: false, reason: 'unsupported' }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return { ok: true }
  } catch {
    return { ok: false, reason: 'denied' }
  }
}
