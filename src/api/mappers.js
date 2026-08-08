import { levelFromId } from '../lib/cefr.js'

const ARABIC_RE = /[\u0600-\u06FF]/

function looksArabic(s) {
  return ARABIC_RE.test(String(s || ''))
}

function cleanText(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/^\s*\d+[\).\:\-]\s*/, '') // boshidagi "1." raqam
    .trim()
}

/** API QuestionDto → UI savol formati */
export function mapQuestion(q) {
  if (!q || typeof q !== 'object') return null

  const rawOpts = q.options || q.Options || q.answers || q.Answers || q.$values || []
  const optList = Array.isArray(rawOpts) ? rawOpts : (rawOpts.$values || [])

  const options = optList
    .map((o, i) => {
      if (typeof o === 'string') {
        return { id: i, text: cleanText(o), isCorrect: false, orderIndex: i }
      }
      return {
        id: o.id ?? o.optionId ?? o.Id ?? i,
        text: cleanText(o.optionText || o.text || o.label || o.Text || o.OptionText || String(o)),
        isCorrect: Boolean(o.isCorrect ?? o.IsCorrect ?? o.correct),
        orderIndex: o.orderIndex ?? o.OrderIndex ?? i,
      }
    })
    .filter((o) => o.text)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const correctIdx = options.findIndex((o) => o.isCorrect)
  const text = cleanText(q.text || q.Text || q.questionText || q.QuestionText || '')
  if (!text && !options.length) return null

  const passage = q.readingPassage || q.ReadingPassage || null

  return {
    id: q.id ?? q.Id,
    text,
    isArabic: looksArabic(text),
    readingPassage: passage,
    languageLevelId: q.languageLevelId ?? q.LanguageLevelId,
    cefr: levelFromId(q.languageLevelId ?? q.LanguageLevelId),
    questionTypeId: q.questionTypeId ?? q.QuestionTypeId,
    categoryId: q.categoryId ?? q.CategoryId,
    points: q.points ?? q.Points ?? 1,
    isActive: q.isActive !== false && q.IsActive !== false,
    options: options.map((o) => o.text),
    optionArabic: options.map((o) => looksArabic(o.text)),
    optionIds: options.map((o) => o.id),
    correct: correctIdx >= 0 ? correctIdx : 0,
    raw: q,
  }
}

export function mapQuestions(list) {
  return (list || []).map(mapQuestion).filter(Boolean)
}

export function mapAdminUser(u) {
  if (!u) return null
  return {
    id: u.id ?? u.Id,
    name: u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || `User ${u.id}`,
    username: u.username ? (String(u.username).startsWith('@') ? u.username : `@${u.username}`) : '',
    level: u.cefrLevelCode || levelFromId(u.cefrLevelId),
    cefrLevelId: u.cefrLevelId,
    xp: u.xp ?? 0,
    progress: Math.round(u.progressPercent ?? 0),
    status: u.status || (u.isBanned ? 'bloklangan' : 'faol'),
    banned: Boolean(u.isBanned),
    phoneNumber: u.phoneNumber,
    roleId: u.roleId,
    raw: u,
  }
}

export function mapProfile(p) {
  if (!p) return null
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
    || p.username
    || `User ${p.id}`
  return {
    id: p.id,
    telegramId: p.telegramId,
    name,
    firstName: p.firstName,
    lastName: p.lastName,
    username: p.username ? (String(p.username).startsWith('@') ? p.username : `@${p.username}`) : '',
    phoneNumber: p.phoneNumber,
    avatarUrl: p.avatarUrl,
    roleId: p.roleId,
    xp: p.xp ?? 0,
    level: p.cefrLevelCode || levelFromId(p.cefrLevelId) || 'A1',
    cefrLevelId: p.cefrLevelId,
    streak: p.streak ?? p.currentStreak ?? 0,
    raw: p,
  }
}

export function mapExamResult(r) {
  if (!r) return null
  return {
    attemptId: r.attemptId ?? r.id,
    readingScore: r.readingScore,
    listeningScore: r.listeningScore,
    writingScore: r.writingScore,
    speakingScore: r.speakingScore,
    totalScore: r.totalScore ?? r.score,
    cefrLevel: r.cefrLevel || r.levelCode,
    raw: r,
  }
}
