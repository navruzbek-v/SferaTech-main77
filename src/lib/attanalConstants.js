/** At-Tanal imtihon constlari — attanal-exam-admin-react.md */

export const ATTANAL_SKILL = {
  GrammarVocab: 'GrammarVocab',
  Reading: 'Reading',
  Listening: 'Listening',
  Writing: 'Writing',
  Speaking: 'Speaking',
}

/** Blueprint vaqtlar (frontend ko‘rsatish / lokal fallback) */
export const ATTANAL_TIMERS = {
  grammarVocabPerQuestionSec: 60,
  grammarVocabQuestions: 30,
  reading: {
    1: { readMin: 2, questionsMin: 6 },
    2: { readMin: 5, questionsMin: 6 },
    3: { readMin: 8, questionsMin: 6 },
  },
  listening: {
    1: { prepMin: 0, testMin: 7 },
    2: { prepMin: 3, testMin: 7 },
    3: { prepMin: 3.5, testMin: 7 },
  },
  writing: {
    1: { min: 15, minWords: 100 },
    2: { min: 20, minWords: 150 },
    3: { min: 30, minWords: 200 },
  },
  speaking: {
    1: { prepSec: 60, recordSec: 30 },
    2: { prepSec: 60, recordSec: 45 },
    3: { prepSec: 60, recordSec: 60 },
  },
}

export function skillCodeKey(code) {
  return String(code || '').toLowerCase()
}

export function isGrammarVocab(code) {
  const c = skillCodeKey(code)
  return c.includes('grammar') || c.includes('vocab')
}

export function attanalSpeakingTiming(partNumber, item) {
  const n = Number(partNumber) || 1
  const fromItemPrep = item?.prepTimeSec
  const fromItemRec = item?.recordTimeSec
  const def = ATTANAL_TIMERS.speaking[n] || ATTANAL_TIMERS.speaking[1]
  return {
    prep: fromItemPrep != null ? Number(fromItemPrep) : def.prepSec,
    record: fromItemRec != null ? Number(fromItemRec) : def.recordSec,
  }
}

export function attanalWritingMinWords(partNumber, item) {
  if (item?.minWords != null) return Number(item.minWords)
  const n = Number(partNumber) || 1
  return ATTANAL_TIMERS.writing[n]?.minWords ?? 100
}

export function phaseNeedsAdvance(phase) {
  const p = String(phase || '').toLowerCase()
  return p.includes('read') || p.includes('prep') || p.includes('prepare') || p.includes('listeningprep')
}

export const ATTANAL_BRIEFINGS = {
  grammarvocab: {
    titleUz: 'Grammar & Vocab',
    icon: 'book',
    accent: 'green',
    durationLabel: '30 savol × 1 daqiqa (ketma-ket)',
    taskCountLabel: '30 ta MCQ (4 variant)',
    warning: 'Har savol uchun vaqt ketma-ket hisoblanadi.',
  },
  reading: {
    titleUz: 'Reading',
    icon: 'book',
    accent: 'green',
    durationLabel: '3 part: o‘qish 2/5/8 daq → savollar 6 daq',
    taskCountLabel: 'Har part: matn + 6 MCQ',
    warning: 'O‘qish fazasini tugatib, savollarga o‘ting.',
  },
  listening: {
    titleUz: 'Listening',
    icon: 'headphones',
    accent: 'orange',
    durationLabel: 'P1: 7 daq · P2/P3: prep + 7 daq test',
    taskCountLabel: 'Har part: audio + 6 MCQ',
    warning: 'Prep vaqtida audio qayta eshitish mumkin.',
  },
  writing: {
    titleUz: 'Writing',
    icon: 'pen',
    accent: 'green',
    durationLabel: '15 / 20 / 30 daqiqa (P1–P3)',
    taskCountLabel: 'min 100 / 150 / 200 so‘z',
    warning: 'Minimal so‘z soniga rioya qiling.',
  },
  speaking: {
    titleUz: 'Speaking',
    icon: 'mic',
    accent: 'orange',
    durationLabel: 'Prep 60s → javob 30 / 45 / 60s',
    taskCountLabel: 'Har part: 2 ta audio-prompt',
    warning: 'Matn yo‘q — faqat audio savol.',
  },
}
