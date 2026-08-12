import { api, unwrapList, unwrapPaged, request, getApiBase, parseError } from './client.js'
import { mapAdminUser, mapQuestions, mapExamResult, mapQuestion } from './mappers.js'

export async function fetchUsers(params = {}) {
  const data = await api.get('/user/getusers', {
    Search: params.search,
    BannedOnly: params.bannedOnly,
    ActiveOnly: params.activeOnly,
    CefrLevelId: params.cefrLevelId,
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 50,
  })
  const page = unwrapPaged(data)
  return { ...page, items: page.items.map(mapAdminUser).filter(Boolean) }
}

export async function updateUser(body) {
  const u = await api.post('/user/updateuser', body)
  return mapAdminUser(u)
}

export async function banUser(userId, reason = '') {
  return api.post('/user/banuser', { userId, reason })
}

export async function unbanUser(userId) {
  return api.post('/user/unbanuser', { userId })
}

export async function fetchQuestions(params = {}) {
  const data = await api.get('/question/getlist', {
    QuestionTypeId: params.questionTypeId,
    LanguageLevelId: params.languageLevelId,
    ActiveOnly: params.activeOnly,
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 50,
  })
  const page = unwrapPaged(data)
  const items = mapQuestions(page.items.length ? page.items : unwrapList(data))
  return { ...page, items }
}

export async function createQuestion(body) {
  return mapQuestion(await api.post('/question/create', body))
}

export async function updateQuestion(id, body) {
  return mapQuestion(await api.post('/question/update', body, { query: { id } }))
}

export async function deleteQuestion(id) {
  return api.post('/question/delete', { id })
}

export async function fetchExamResults(params = {}) {
  const data = await api.get('/examresult/getlist', {
    Search: params.search,
    ExamTypeId: params.examTypeId,
    ExamResultStatusId: params.statusId,
    PendingReviewOnly: params.pendingOnly,
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 50,
  })
  const page = unwrapPaged(data)
  return { ...page, items: page.items.map(mapExamResult).filter(Boolean) }
}

export async function getExamResultDetail(id) {
  return api.get('/examresult/getbyid', { id })
}

export async function startReview(examResultId) {
  return api.post('/examresult/startreview', { examResultId })
}

export async function approveResult(body) {
  return mapExamResult(await api.post('/examresult/approve', body))
}

export async function rejectResult(examResultId, reason) {
  return mapExamResult(await api.post('/examresult/reject', { examResultId, reason }))
}

export async function fetchDashboard(days = 30) {
  return api.get('/analytics/getdashboard', { Days: days })
}

export async function fetchAnalyticsSummary(days = 30) {
  return api.get('/analytics/getsummary', { Days: days })
}

export async function fetchHardQuestions(days = 30) {
  return api.get('/analytics/getdifficultquestions', { Days: days })
}

export async function fetchLevelAnalysis(days = 30) {
  return api.get('/analytics/getlevelanalysis', { Days: days })
}

export async function fetchExamDates() {
  return unwrapList(await api.get('/examdates/getlist'))
}

export async function fetchSettings() {
  return unwrapList(await api.get('/systemsettings/getall'))
}

export async function updateSetting(key, value) {
  return api.post('/systemsettings/update', { key, value: String(value) })
}

export async function fetchAudios(params = {}) {
  const data = await api.get('/audios/getlist', {
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 50,
  })
  return unwrapPaged(data)
}

export async function uploadAudio(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api.upload('/audios/upload', fd)
}

export async function deleteAudio(id) {
  return api.post('/audios/delete', { id })
}

export async function uploadDocx(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api.upload('/docximport/upload', fd)
}

export async function previewDocx(filePath) {
  return api.post('/docximport/preview', { filePath })
}

export async function importDocx(body) {
  return api.post('/docximport/import', body)
}

export async function fetchImportLogs() {
  return unwrapList(await api.get('/docximport/getimportlogs'))
}

export async function fetchAuditLogs(params = {}) {
  return unwrapPaged(await api.get('/monitoring/getauditlogs', {
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 50,
  }))
}

export async function fetchSystemStatus(days = 7) {
  return api.get('/system/getstatus', { Days: days })
}

export async function exportData(body) {
  return api.post('/exportbackup/export', body)
}

export async function generateAdminReport(body) {
  return api.post('/reports/generateadminreport', body)
}

export async function fetchCefrBlueprint() {
  return api.get('/cefrcontent/getblueprint')
}

export async function fetchCefrSkills() {
  return unwrapList(await api.get('/cefrcontent/getskills'))
}

export async function fetchCefrInventory() {
  return unwrapList(await api.get('/cefrcontent/getinventory'))
}

export async function fetchCefrBlocks(params = {}) {
  return unwrapList(await api.get('/cefrcontent/getblocks', params))
}

export async function fetchCefrEntries(params = {}) {
  return unwrapList(await api.get('/cefrcontent/getentries', params))
}

export async function reportAntiCheat(body) {
  return api.post('/anticheat/reportevent', body)
}

export async function getAntiCheatLogs() {
  return unwrapList(await api.get('/anticheat/getmylogs'))
}

/** Sozlamalardan CEFR chegaralarini o‘qish (kalitlar: cefr.threshold.A1 ...) */
export async function fetchThresholdsFromSettings() {
  const settings = await fetchSettings()
  const th = {}
  for (const s of settings) {
    const m = String(s.key || '').match(/cefr\.?threshold\.?(A[12]|B[12]|C[12])/i)
    if (m) th[m[1].toUpperCase()] = Number(s.value)
  }
  return Object.keys(th).length ? th : null
}

export async function saveThresholdsToSettings(thresholds) {
  const results = []
  for (const [lvl, val] of Object.entries(thresholds)) {
    results.push(await updateSetting(`cefr.threshold.${lvl}`, val))
  }
  return results
}

/* —— At-Tanal kontent (admin) — /attanalcontent/* —— */

export async function fetchAttanalSkills() {
  return unwrapList(await api.get('/attanalcontent/getskills'))
}

export async function fetchAttanalBlueprint() {
  return api.get('/attanalcontent/getblueprint')
}

export async function fetchAttanalInventory() {
  return unwrapList(await api.get('/attanalcontent/getinventory'))
}

export async function fetchAttanalBlocks(params = {}) {
  return unwrapList(await api.get('/attanalcontent/getblocks', params))
}

export async function fetchAttanalBlockById(id) {
  return api.get('/attanalcontent/getblockbyid', { id })
}

export async function updateAttanalBlock(id, body) {
  return api.post(`/attanalcontent/updateblock?id=${encodeURIComponent(id)}`, body)
}

export async function deleteAttanalBlock(body) {
  return api.post('/attanalcontent/deleteblock', body)
}

export async function fetchAttanalEntries(params = {}) {
  return unwrapList(await api.get('/attanalcontent/getentries', params))
}

export async function fetchAttanalEntryById(id) {
  return api.get('/attanalcontent/getentrybyid', { id })
}

export async function updateAttanalEntry(id, body) {
  return api.post(`/attanalcontent/updateentry?id=${encodeURIComponent(id)}`, body)
}

export async function deleteAttanalEntry(body) {
  return api.post('/attanalcontent/deleteentry', body)
}

export async function saveAttanalGrammarVocabPart1(body) {
  return api.post('/attanalcontent/savegrammarvocabpart1', body)
}

export async function saveAttanalReadingPart(part, body) {
  return api.post(`/attanalcontent/savereadingpart${part}`, body)
}

export async function saveAttanalListeningPart(part, body) {
  return api.post(`/attanalcontent/savelisteningpart${part}`, body)
}

export async function saveAttanalWritingPart(part, body) {
  return api.post(`/attanalcontent/savewritingpart${part}`, body)
}

export async function saveAttanalSpeakingPart(part, body) {
  return api.post(`/attanalcontent/savespeakingpart${part}`, body)
}

export async function saveAttanalBatch(body) {
  return api.post('/attanalcontent/saveattanalbatch', body)
}

/* —— Postlar (yangilik / reklama) —— */

export async function fetchPosts(params = {}) {
  const query = {
    Search: params.search,
    PublishedOnly: params.publishedOnly,
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 50,
  }
  // activeOnly=false faqat o‘chirilganlarni qaytaradi — yubormaslik
  if (params.activeOnly === true) query.ActiveOnly = true
  const data = await api.get('/post/getlist', query)
  return unwrapPaged(data)
}

export async function fetchPostActionTypes() {
  return []
}

export async function createPost(body) {
  return api.post('/post/create', body)
}

export async function updatePost(body) {
  return api.post('/post/update', body)
}

export async function deletePost(id) {
  return api.post('/post/delete', { id })
}

function normalizeUploadedPath(raw) {
  const fromUrl = String(raw?.url ?? raw?.Url ?? '')
  const fromRel = String(raw?.relativePath ?? raw?.RelativePath ?? '')
  const pick = fromRel || fromUrl
  const s = pick
    .replace(/^https?:\/\/[^/]+\//i, '')
    .replace(/^\/+/, '')
    .replace(/\\/g, '/')
  return s || null
}

function safeUploadFileName(file) {
  const ext = (String(file.name || '').match(/\.[a-z0-9]{1,8}$/i)?.[0] || '.jpg').toLowerCase()
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${id}${ext}`
}

/** Kontent rasm: category=posts → relativePath → imagePath */
export async function uploadPostImage(file) {
  const safeName = safeUploadFileName(file)
  const renamed = new File([file], safeName, { type: file.type || 'image/jpeg' })
  const fd = new FormData()
  fd.append('category', 'posts')
  fd.append('file', renamed)

  const token = localStorage.getItem('as_access') || localStorage.getItem('as_token')
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const bases = [getApiBase(), 'https://arabosfera.onrender.com']
  let lastErr = null

  for (const base of bases) {
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/images/uploadcontent`, {
        method: 'POST',
        headers,
        body: fd,
      })
      if ([502, 503, 504].includes(res.status)) continue
      if (!res.ok) throw await parseError(res)
      const data = await res.json()
      const raw = data?.data && typeof data.data === 'object' ? data.data : data
      const relativePath = normalizeUploadedPath(raw)
      if (!relativePath) throw new Error('relativePath qaytmadi')

      const absoluteUrl = raw?.url || raw?.Url || null
      // Fayl Render diskida — ba’zan biroz kechikadi; probe soft
      const probeUrl = absoluteUrl && /^https?:\/\//i.test(absoluteUrl)
        ? absoluteUrl
        : `https://arabosfera.onrender.com/${relativePath.split('/').map(encodeURIComponent).join('/')}`

      let reachable = false
      for (let i = 0; i < 3; i += 1) {
        try {
          const probe = await fetch(probeUrl, { cache: 'no-store', method: 'GET' })
          if (probe.ok) { reachable = true; break }
        } catch { /* */ }
        await new Promise((r) => setTimeout(r, 600 * (i + 1)))
      }

      return {
        relativePath,
        url: absoluteUrl || probeUrl,
        reachable,
        warning: reachable
          ? null
          : 'Rasm saqlandi, lekin hozircha ochilmayapti. Bir necha soniyadan keyin qayta tekshiring yoki qayta yuklang.',
      }
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('Rasm yuklanmadi')
}
