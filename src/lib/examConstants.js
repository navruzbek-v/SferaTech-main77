/** CEFR exam constlari — cefr-exam-flutter.md */

export const SKILL = {
  Reading: 1,
  Listening: 2,
  Speaking: 3,
  Writing: 4,
}

export const ITEM_TYPE = {
  GapFill: 1,
  Matching: 2,
  McqAbcd: 3,
  TrueFalseNg: 4,
  YesNo: 5,
  Speaking: 6,
  Writing: 7,
}

/** itemTypeId → answerType (MD) */
export function answerTypeForItem(item) {
  const t = Number(item?.itemTypeId)
  switch (t) {
    case ITEM_TYPE.GapFill:
      return item.usesExclusiveOptions ? 'matching' : 'option'
    case ITEM_TYPE.Matching:
      return 'matching'
    case ITEM_TYPE.McqAbcd:
      return 'option'
    case ITEM_TYPE.TrueFalseNg:
      return 'tfng'
    case ITEM_TYPE.YesNo:
      return 'yes_no'
    case ITEM_TYPE.Writing:
      return 'text'
    case ITEM_TYPE.Speaking:
      return 'audio'
    default:
      if (item?.minWords != null || item?.taskText) return 'text'
      return 'option'
  }
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export const TFNG_OPTIONS = [
  { value: 1, label: 'True / صح' },
  { value: 0, label: 'False / خطأ' },
  { value: 2, label: "Not given / غير معطى (g‘oyru mu'to)" },
]

export const YESNO_OPTIONS = [
  { value: 1, label: 'نعم / Ha' },
  { value: 0, label: 'لا / Yo‘q' },
]

/** Speaking: 1–6 → 5s/30s; 7–8 → 60s/120s */
export const SPEAKING_TIMINGS = {
  short: { prep: 5, record: 30 },
  long: { prep: 60, record: 120 },
}

export function speakingTimingFor(displayNumber) {
  const n = Number(displayNumber) || 0
  return n >= 7 ? SPEAKING_TIMINGS.long : SPEAKING_TIMINGS.short
}

export function skillCodeKey(code) {
  return String(code || '').toLowerCase()
}

export function deadlineForSkill(attempt, skill) {
  const code = skillCodeKey(skill?.skillCode)
  if (code.includes('read')) return attempt?.readingDeadline || skill?.serverDeadline
  if (code.includes('listen')) return attempt?.listeningDeadline || skill?.serverDeadline
  if (code.includes('writ')) return attempt?.writingDeadline || skill?.serverDeadline
  return skill?.serverDeadline || null
}

export function msLeft(deadlineIso) {
  if (!deadlineIso) return null
  const t = new Date(deadlineIso).getTime()
  if (Number.isNaN(t)) return null
  return Math.max(0, t - Date.now())
}

/** Yuklanganda allaqachon o‘tgan deadline — client timer sifatida ishlatilmasin */
export function usableDeadline(deadlineIso) {
  if (!deadlineIso) return null
  const t = new Date(deadlineIso).getTime()
  if (Number.isNaN(t)) return null
  // Kamida 30 soniya qolgan bo‘lsagina timer ko‘rsatiladi
  if (t - Date.now() < 30_000) return null
  return deadlineIso
}

export function formatMs(ms) {
  if (ms == null) return '—'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
