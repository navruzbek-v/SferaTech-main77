import { api, request } from './client.js'

/** CEFR Mock Exam — /exam/* (cefr-exam-telegram-miniapp.md + flutter MD) */

const ATTEMPT_KEY = 'as_cefr_attempt'

export function saveAttemptId(id) {
  if (id != null) localStorage.setItem(ATTEMPT_KEY, String(id))
}

export function loadAttemptId() {
  const v = localStorage.getItem(ATTEMPT_KEY)
  return v ? Number(v) || v : null
}

export function clearAttemptId() {
  localStorage.removeItem(ATTEMPT_KEY)
}

function normalizeItemOptions(options) {
  if (!options) return null
  const list = Array.isArray(options) ? options : (options.$values || [])
  return list.map((o) => ({
    id: o.id ?? o.Id,
    label: o.label || o.Label || null,
    text: o.text || o.Text || '',
    isLocked: Boolean(o.isLocked ?? o.IsLocked),
    lockedByItemId: o.lockedByItemId ?? o.LockedByItemId ?? null,
  }))
}

function normalizeSpeakingPrompt(sp) {
  if (!sp || typeof sp !== 'object') return null
  return {
    prosHint: sp.prosHint || sp.ProsHint || null,
    consHint: sp.consHint || sp.ConsHint || null,
    pros: sp.pros || sp.Pros || null,
    cons: sp.cons || sp.Cons || null,
  }
}

/** PascalCase / camelCase normalizatsiya */
export function normalizeAttempt(raw) {
  if (!raw || typeof raw !== 'object') return null
  const skills = raw.skills || raw.Skills || []
  return {
    attemptId: raw.attemptId ?? raw.AttemptId,
    readingDeadline: raw.readingDeadline ?? raw.ReadingDeadline ?? null,
    listeningDeadline: raw.listeningDeadline ?? raw.ListeningDeadline ?? null,
    writingDeadline: raw.writingDeadline ?? raw.WritingDeadline ?? null,
    optionLocks: raw.optionLocks || raw.OptionLocks || [],
    skills: (Array.isArray(skills) ? skills : skills.$values || []).map((sk) => {
      const partsRaw = sk.parts || sk.Parts || []
      const partsList = Array.isArray(partsRaw) ? partsRaw : (partsRaw.$values || [])
      return {
        skillId: sk.skillId ?? sk.SkillId,
        skillCode: sk.skillCode || sk.SkillCode || '',
        serverDeadline: sk.serverDeadline || sk.ServerDeadline || null,
        parts: partsList.map((p) => normalizePart(p)),
      }
    }),
    raw,
  }
}

function normalizePart(p) {
  const options = p.options || p.Options || []
  const items = p.items || p.Items || []
  return {
    partNumber: p.partNumber ?? p.PartNumber,
    subPart: p.subPart ?? p.SubPart ?? null,
    optionGroupKey: p.optionGroupKey || p.OptionGroupKey || null,
    pinPassage: Boolean(p.pinPassage ?? p.PinPassage),
    passageText: p.passageText || p.PassageText || null,
    audioUrl: p.audioUrl || p.AudioUrl || null,
    audioScript: p.audioScript || p.AudioScript || null,
    matchLayout: p.matchLayout || p.MatchLayout || null,
    options: (Array.isArray(options) ? options : options.$values || []).map((o) => ({
      id: o.id ?? o.Id,
      label: o.label || o.Label || null,
      text: o.text || o.Text || '',
      isLocked: Boolean(o.isLocked ?? o.IsLocked),
      lockedByItemId: o.lockedByItemId ?? o.LockedByItemId ?? null,
    })),
    items: (Array.isArray(items) ? items : items.$values || []).map((it) => ({
      id: it.id ?? it.Id,
      itemTypeId: it.itemTypeId ?? it.ItemTypeId,
      displayNumber: it.displayNumber ?? it.DisplayNumber,
      blankIndex: it.blankIndex ?? it.BlankIndex,
      promptText: it.promptText || it.PromptText || null,
      subtitle: it.subtitle || it.Subtitle || null,
      situationText: it.situationText || it.SituationText || null,
      taskText: it.taskText || it.TaskText || null,
      minWords: it.minWords ?? it.MinWords ?? null,
      pinPassage: Boolean(it.pinPassage ?? it.PinPassage),
      usesExclusiveOptions: Boolean(it.usesExclusiveOptions ?? it.UsesExclusiveOptions),
      serverDeadline: it.serverDeadline || it.ServerDeadline || null,
      prepTimeSec: it.prepTimeSec ?? it.PrepTimeSec ?? it.prepSec ?? it.PrepSec ?? null,
      recordTimeSec: it.recordTimeSec ?? it.RecordTimeSec ?? it.recordSec ?? it.RecordSec ?? null,
      speakingPrompt: normalizeSpeakingPrompt(it.speakingPrompt || it.SpeakingPrompt),
      options: normalizeItemOptions(it.options || it.Options),
      raw: it,
    })),
  }
}

export function startExam(languageLevelId) {
  const body = {}
  if (languageLevelId != null && languageLevelId !== '') {
    body.languageLevelId = Number(languageLevelId)
  }
  return api.post('/exam/start', body).then(normalizeAttempt)
}

/** Session tiklash — GET /exam/{attemptId} (Swagger; prompt “current”) */
export function getAttempt(attemptId) {
  return api.get(`/exam/${attemptId}`).then(normalizeAttempt)
}

export function submitAnswer(attemptId, body) {
  return api.post(`/exam/${attemptId}/answer`, body)
}

export function beginSpeaking(attemptId, itemId) {
  return api.post(`/exam/${attemptId}/speaking/${itemId}/begin`, {})
}

export function submitAnswerAudio(attemptId, { itemId, audioBlob, filename = 'speaking.webm' }) {
  const fd = new FormData()
  fd.append('itemId', String(itemId))
  fd.append('audio', audioBlob, filename)
  return request(`/exam/${attemptId}/answer-audio`, { method: 'POST', formData: fd })
}

export function completeExam(attemptId) {
  return api.post(`/exam/${attemptId}/complete`)
}

export function getResult(attemptId) {
  return api.get(`/exam/${attemptId}/result`)
}

export function applyOptionLocks(attempt, locks) {
  if (!attempt?.skills || !locks?.length) return attempt
  const lockMap = new Map(locks.map((l) => [`${l.optionGroupKey}:${l.optionId}`, l.lockedByItemId]))
  const skills = attempt.skills.map((sk) => ({
    ...sk,
    parts: (sk.parts || []).map((part) => ({
      ...part,
      options: (part.options || []).map((opt) => {
        const key = `${part.optionGroupKey}:${opt.id}`
        const by = lockMap.get(key)
        if (by != null) return { ...opt, isLocked: true, lockedByItemId: by }
        return opt
      }),
    })),
  }))
  return { ...attempt, skills, optionLocks: locks }
}

export function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}
