import { api, unwrapList, getApiBase } from './client.js'
import { HOME_NEWS } from '../data/homeNews.js'

/** Backend static files origin (imagePath relative) */
export function getMediaBase() {
  const fromEnv = (import.meta.env.VITE_MEDIA_BASE_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv

  const apiBase = getApiBase()
  if (/^https?:\/\//i.test(apiBase)) {
    try {
      return new URL(apiBase).origin
    } catch { /* */ }
  }
  // Dev /api proxy — rasm to‘g‘ridan backenddan
  return 'https://arabosfera.onrender.com'
}

/** `images/content/posts/x.webp` → to‘liq URL */
export function resolveMediaUrl(path) {
  if (!path) return null
  const p = String(path).trim()
  if (!p) return null
  if (/^https?:\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p
  if (p.startsWith('/')) return `${getMediaBase()}${p}`
  return `${getMediaBase()}/${p.replace(/^\.\//, '')}`
}

function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj?.[k] != null && obj[k] !== '') return obj[k]
  }
  return undefined
}

/** API post → UI model */
export function mapPost(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = pick(raw, 'id', 'Id')
  const title = pick(raw, 'title', 'Title') || ''
  const body = pick(raw, 'body', 'Body') || ''
  const imagePath = pick(raw, 'imagePath', 'ImagePath', 'image', 'Image')
  const ctaText = pick(raw, 'ctaText', 'CtaText', 'cta', 'Cta')
  const url = pick(raw, 'url', 'Url', 'link', 'Link')
  const sortOrder = Number(pick(raw, 'sortOrder', 'SortOrder') ?? 0)

  const href = url ? String(url).trim() : ''
  const safeUrl = /^https?:\/\//i.test(href) ? href : null

  return {
    id: id ?? title,
    title,
    body,
    imagePath: imagePath || null,
    imageUrl: resolveMediaUrl(imagePath),
    ctaText: ctaText ? String(ctaText).trim() : null,
    url: safeUrl,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  }
}

/**
 * Faol postlar — AllowAnonymous.
 * MD: GET /post/getactive
 */
export async function getActivePosts() {
  const data = await api.get('/post/getactive', undefined, { auth: false })
  const list = unwrapList(data)
    .map(mapPost)
    .filter((p) => p && p.title)
  return list.sort((a, b) => (a.sortOrder - b.sortOrder) || 0)
}

/** API ishlamasa — lokal fallback kartalar */
export function fallbackPosts() {
  return (HOME_NEWS || []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body || '',
    imagePath: null,
    imageUrl: n.image || null,
    ctaText: n.cta || null,
    url: n.url || null,
    sortOrder: 0,
    _local: true,
    _startCefr: Boolean(n.cta && !n.url),
  }))
}
