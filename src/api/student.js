import { api, unwrapList, setTokens, clearTokens, getAccessToken, hasAuthToken } from './client.js'
import { mapProfile, mapQuestions, mapExamResult } from './mappers.js'
import { getInitData } from '../lib/telegram.js'
import { isAdminRole } from '../lib/cefr.js'

export async function loginWithTelegram(initData) {
  const data = await api.post('/auth/loginwithtelegram', {
    initData: initData || getInitData(),
    deviceInfo: navigator.userAgent,
  }, { auth: false })
  setTokens(data)
  return data
}

export async function loginAdmin(phoneNumber, password) {
  const data = await api.post('/auth/login', {
    phoneNumber,
    password,
    deviceInfo: navigator.userAgent,
  }, { auth: false })
  setTokens(data)
  return data
}

/**
 * Jim session: Telegram → mavjud token → .env demo login.
 * Xato tashlamaydi — { ok, profile } qaytaradi.
 */
export async function ensureSession() {
  const initData = getInitData()
  if (initData) {
    try {
      await loginWithTelegram(initData)
      const profile = await fetchProfile().catch(() => null)
      return { ok: true, profile, source: 'telegram' }
    } catch { /* keyingi usul */ }
  }

  if (hasAuthToken() || getAccessToken()) {
    try {
      const profile = await fetchProfile()
      return { ok: true, profile, source: 'token' }
    } catch {
      clearTokens()
    }
  }

  const phone = import.meta.env.VITE_DEMO_PHONE
  const password = import.meta.env.VITE_DEMO_PASSWORD
  if (phone && password) {
    try {
      await loginAdmin(String(phone), String(password))
      const profile = await fetchProfile().catch(() => null)
      return { ok: true, profile, source: 'demo' }
    } catch { /* */ }
  }

  return { ok: false, profile: null, source: null }
}

export async function logout() {
  try { await api.post('/auth/logout', {}) } catch { /* */ }
  clearTokens()
}

export async function fetchProfile() {
  const p = await api.get('/users/getprofile')
  return mapProfile(p)
}

export async function fetchStats() {
  return api.get('/users/getstats')
}

export async function updateProfile(body) {
  const p = await api.post('/users/updateprofile', body)
  return mapProfile(p)
}

/**
 * Savollar — avval getrandom (filtrsiz, bo‘sh qolmasin),
 * bo‘sh bo‘lsa getlist. LanguageLevelId ixtiyoriy (ko‘p hollarda bo‘sh qaytaradi).
 */
export async function fetchRandomQuestions({ count = 10, languageLevelId, questionTypeId, forceLevel = false } = {}) {
  const query = { Count: count }
  if (questionTypeId) query.QuestionTypeId = questionTypeId
  // Daraja filtri faqat majburiy bo‘lsa — aks holda API bo‘sh [] qaytaradi
  if (forceLevel && languageLevelId) query.LanguageLevelId = languageLevelId

  let data = await api.get('/question/getrandom', query)
  let list = mapQuestions(unwrapList(data))

  if (!list.length && languageLevelId && !forceLevel) {
    // filtr bilan qayta urinish
    data = await api.get('/question/getrandom', { ...query, LanguageLevelId: languageLevelId })
    list = mapQuestions(unwrapList(data))
  }

  if (!list.length) {
    // getlist zaxira (bitta so‘rov)
    const page = await api.get('/question/getlist', {
      Page: 1,
      PageSize: count,
      ActiveOnly: true,
      ...(questionTypeId ? { QuestionTypeId: questionTypeId } : {}),
    })
    list = mapQuestions(unwrapList(page)).slice(0, count)
  }

  return list
}

export async function startTest({ questionCount = 10, languageLevelId, questionTypeId } = {}) {
  return api.post('/tests/start', {
    questionCount,
    languageLevelId,
    questionTypeId,
    idempotencyKey: crypto.randomUUID?.() || String(Date.now()),
  })
}

export async function submitTestAnswer({ testSessionId, questionId, selectedOptionId, timeSpentSeconds = 0 }) {
  return api.post('/tests/submitanswer', {
    testSessionId,
    questionId,
    selectedOptionId,
    timeSpentSeconds,
  })
}

export async function completeTest(testSessionId) {
  return api.post('/tests/complete', { testSessionId })
}

export async function startCefrExam(languageLevelId) {
  return api.post('/exam/start', { languageLevelId })
}

export async function getExamAttempt(attemptId) {
  return api.get(`/exam/${attemptId}`)
}

export async function submitExamAnswer(attemptId, body) {
  return api.post(`/exam/${attemptId}/answer`, body)
}

export async function completeExam(attemptId) {
  return api.post(`/exam/${attemptId}/complete`)
}

export async function getExamResult(attemptId) {
  return api.get(`/exam/${attemptId}/result`)
}

export async function fetchExamDates() {
  return unwrapList(await api.get('/examdates/getlist'))
}

export async function fetchMyExamDate() {
  return api.get('/examdates/getmyselection')
}

export async function selectExamDate(examDateId) {
  return api.post('/examdates/select', { examDateId })
}

export async function fetchMistakes(params = {}) {
  return unwrapList(await api.get('/mistakes/getlist', {
    UnresolvedOnly: params.unresolvedOnly ?? true,
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 50,
  }))
}

export async function fetchLeaderboard() {
  return unwrapList(await api.get('/leaderboard/getglobal', { Page: 1, PageSize: 20 }))
}

export async function joinPvp() {
  return api.post('/pvp/joinqueue', {
    idempotencyKey: crypto.randomUUID?.() || String(Date.now()),
  })
}

export async function getPvpStatus() {
  return api.get('/pvp/getmatchstatus')
}

export async function submitPvpAnswer(body) {
  return api.post('/pvp/submitanswer', body)
}

export async function leavePvp() {
  return api.post('/pvp/leavequeue', {})
}

export async function bootstrapSession(preferAdmin = false) {
  const initData = getInitData()
  let auth
  if (initData && !preferAdmin) {
    auth = await loginWithTelegram(initData)
  } else {
    throw new Error('TELEGRAM_REQUIRED')
  }
  const profile = await fetchProfile().catch(() => null)
  let stats = null
  try { stats = await fetchStats() } catch { /* */ }
  const roleId = profile?.roleId ?? auth.roleId
  return {
    auth,
    profile: profile || {
      id: auth.userId,
      name: 'Foydalanuvchi',
      roleId,
      xp: 0,
      level: 'A1',
    },
    stats,
    isAdmin: isAdminRole(roleId),
  }
}
