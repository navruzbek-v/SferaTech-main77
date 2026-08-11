import { api, unwrapList, getApiBase } from './client.js'
import { HOME_NEWS } from '../data/homeNews.js'

const BACKEND_ORIGIN = 'https://arabosfera.onrender.com'

/** Placeholder / test matnlar (adminda "." yozilgan holat) */
export function cleanPostText(value) {
  const s = String(value ?? '').trim()
  if (!s) return ''
  if (/^[.\-–—_*•·…\s]+$/u.test(s)) return ''
  return s
}

/** Backend static / proxy origin */
export function getMediaBase() {
  const fromEnv = (import.meta.env.VITE_MEDIA_BASE_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv

  const apiBase = getApiBase()
  // Vite + Vercel: /api → arabosfera.onrender.com (same-origin)
  if (apiBase === '/api' || apiBase.endsWith('/api')) return '/api'

  if (/^https?:\/\//i.test(apiBase)) {
    try {
      return new URL(apiBase).origin
    } catch { /* */ }
  }
  return BACKEND_ORIGIN
}

/** `images/content/posts/x.webp` → to‘liq URL (proxy orqali) */
export function resolveMediaUrl(path) {
  if (!path) return null
  const p = String(path).trim()
  if (!p) return null
  if (/^https?:\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p

  const base = getMediaBase()
  const rel = p.replace(/^\.\//, '').replace(/^\//, '')

  if (base === '/api') return `/api/${rel}`
  if (p.startsWith('/')) return `${base}${p}`
  return `${base}/${rel}`
}

function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj?.[k] != null && obj[k] !== '') return obj[k]
  }
  return undefined
}

function asHttpUrl(value) {
  const href = cleanPostText(value)
  if (!/^https?:\/\//i.test(href)) return null
  return href
}

/** API post → UI model */
export function mapPost(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = pick(raw, 'id', 'Id')
  const title = cleanPostText(pick(raw, 'title', 'Title'))
  const body = cleanPostText(pick(raw, 'body', 'Body'))
  const imagePath = cleanPostText(pick(raw, 'imagePath', 'ImagePath', 'image', 'Image')) || null
  const ctaText = cleanPostText(pick(raw, 'ctaText', 'CtaText', 'cta', 'Cta')) || null
  const badgeText = cleanPostText(pick(raw, 'badgeText', 'BadgeText', 'tag', 'Tag')) || null

  const actionCode = String(pick(raw, 'actionTypeCode', 'ActionTypeCode') || '').toLowerCase()
  const actionPayload = pick(raw, 'actionPayload', 'ActionPayload', 'url', 'Url', 'link', 'Link')

  let url = asHttpUrl(pick(raw, 'url', 'Url'))
  if (!url && actionCode && actionCode !== 'none') {
    url = asHttpUrl(actionPayload)
  }
  if (!url) url = asHttpUrl(actionPayload)

  const sortOrder = Number(pick(raw, 'sortOrder', 'SortOrder') ?? 0)

  // Hech narsa yo‘q — o‘tkazib yuborish
  if (!title && !body && !imagePath && !url) return null

  return {
    id: id ?? `post-${sortOrder}-${title || 'n'}`,
    title: title || (url ? 'Havola' : 'Yangilik'),
    body,
    badgeText,
    imagePath,
    imageUrl: resolveMediaUrl(imagePath),
    ctaText: ctaText || (url ? 'Batafsil' : null),
    url,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  }
}

function normalizePosts(data) {
  return unwrapList(data)
    .map(mapPost)
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

async function fetchJson(url) {
  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

/**
 * Faol postlar — AllowAnonymous.
 * 1) sozlangan API base  2) to‘g‘ridan backend
 */
export async function getActivePosts() {
  const errors = []

  try {
    const data = await api.get('/post/getactive', undefined, { auth: false })
    return normalizePosts(data)
  } catch (e) {
    errors.push(e)
  }

  try {
    const data = await fetchJson(`${BACKEND_ORIGIN}/post/getactive`)
    return normalizePosts(data)
  } catch (e) {
    errors.push(e)
  }

  throw errors[errors.length - 1] || new Error('Posts yuklanmadi')
}

/** API ishlamasa — lokal fallback */
export function fallbackPosts() {
  return (HOME_NEWS || []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body || '',
    badgeText: n.tag || null,
    imagePath: null,
    imageUrl: n.image || null,
    ctaText: n.cta || null,
    url: n.url || null,
    sortOrder: 0,
    _local: true,
    _startCefr: Boolean(n.cta && !n.url),
  }))
}
