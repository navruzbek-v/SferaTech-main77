/** CEFR / til darajasi ID xaritasi (backend LanguageLevelId) */
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const CEFR_ID_MAP = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
  6: 'C2',
}

export const CEFR_CODE_TO_ID = Object.fromEntries(
  Object.entries(CEFR_ID_MAP).map(([id, code]) => [code, Number(id)]),
)

export const DEFAULT_THRESHOLDS = {
  A1: 40,
  A2: 50,
  B1: 60,
  B2: 70,
  C1: 80,
  C2: 90,
}

export const CEFR_LABELS = {
  A1: 'Boshlang‘ich',
  A2: 'Elementar',
  B1: 'O‘rta',
  B2: 'O‘rta yuqori',
  C1: 'Ilg‘or',
  C2: 'Mukammal',
}

/** Admin role — backendda odatda 2 yoki yuqori */
export function isAdminRole(roleId) {
  return Number(roleId) >= 2
}

export function levelFromId(id) {
  return CEFR_ID_MAP[id] || CEFR_ID_MAP[Number(id)] || 'A1'
}

export function idFromLevel(code) {
  return CEFR_CODE_TO_ID[code] || 1
}

export function levelFromScore(score, thresholds = DEFAULT_THRESHOLDS) {
  let result = 'A1'
  for (const lvl of CEFR_LEVELS) {
    if (score >= (thresholds[lvl] ?? 0)) result = lvl
  }
  return result
}

export function levelBadgeColor(level) {
  const map = { A1: 'green', A2: 'green', B1: 'blue', B2: 'blue', C1: 'violet', C2: 'violet' }
  return map[level] || 'blue'
}

export function passageIndexForExam(type) {
  return type === 'CEFR' ? 0 : 1
}
