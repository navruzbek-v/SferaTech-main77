import { api, unwrapList } from './client.js'
import { HOME_NEWS } from '../data/homeNews.js'

const BACKEND_ORIGIN = 'https://arabosfera.onrender.com'

export function cleanPostText(value) {
  const s = String(value ?? '').trim()
  if (!s) return ''
  if (/^[.\-–—_*•·…\s]+$/u.test(s)) return ''
  return s
}

export function getMediaBase() {
  const fromEnv = (import.meta.env.VITE_MEDIA_BASE_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
  // Dev / Vercel: same-origin proxy (`/images` → backend)
  const api = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  if (!api || api === '/api' || api.startsWith('/')) return ''
  return BACKEND_ORIGIN
}

/** Relative path → ochiladigan URL (bo‘shliq / kirill / emoji encode) */
export function resolveMediaUrl(path) {
  if (!path) return null
  let p = String(path).trim()
  if (!p) return null
  if (/^https?:\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p
  // Ba’zan API to‘liq URL ni relative sifatida qaytaradi
  p = p.replace(/\\/g, '/')
  p = p.replace(/^\.\//, '').replace(/^\/+/, '')
  // Allaqachon encode qilingan bo‘lsa — ikki marta encode qilmaslik
  const encoded = p.split('/').map((seg) => {
    try {
      const decoded = decodeURIComponent(seg)
      return encodeURIComponent(decoded)
    } catch {
      return encodeURIComponent(seg)
    }
  }).join('/')
  const base = getMediaBase()
  return base ? `${base}/${encoded}` : `/${encoded}`
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

const CARD_COLORS = ['#E8A0BF', '#F0A35E', '#3DDC97', '#5B8DEF', '#C77DFF', '#E76F51', '#2A9D8F']

export function mapPost(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null

  const id = pick(raw, 'id', 'Id')
  const title = cleanPostText(pick(raw, 'title', 'Title'))
  const body = cleanPostText(pick(raw, 'body', 'Body'))
  // imagePath ni cleanPostText bilan buzmaslik (bo‘shliq/kirill kerak)
  const imageRaw = pick(raw, 'imagePath', 'ImagePath', 'image', 'Image', 'imageUrl', 'ImageUrl')
  const imagePath = imageRaw != null ? String(imageRaw).trim() || null : null
  const ctaText = cleanPostText(pick(raw, 'ctaText', 'CtaText', 'cta', 'Cta')) || null
  const badgeText = cleanPostText(pick(raw, 'badgeText', 'BadgeText', 'tag', 'Tag')) || null
  const bg = cleanPostText(pick(raw, 'backgroundColor', 'BackgroundColor')) || null

  const actionCode = String(pick(raw, 'actionTypeCode', 'ActionTypeCode') || '').toLowerCase()
  const actionPayload = pick(raw, 'actionPayload', 'ActionPayload')

  // Swagger yangilangan: asosiy maydon — url
  let url = asHttpUrl(pick(raw, 'url', 'Url'))
  if (!url && actionCode && !['none', 'openpremium'].includes(actionCode)) {
    url = asHttpUrl(actionPayload)
  }
  if (!url) url = asHttpUrl(actionPayload)

  const sortOrder = Number(pick(raw, 'sortOrder', 'SortOrder') ?? 0)
  if (!title && !body && !imagePath && !url) return null

  // Agar imagePath allaqachon http bo‘lsa — to‘g‘ridan
  const imageUrl = /^https?:\/\//i.test(imagePath || '')
    ? imagePath
    : resolveMediaUrl(imagePath)

  return {
    id: id ?? `post-${sortOrder}-${title || 'n'}`,
    title: title || (url ? 'Havola' : 'Yangilik'),
    body,
    badgeText,
    imagePath,
    imageUrl,
    ctaText: ctaText || (url ? 'O‘qish' : 'O‘qish'),
    url,
    backgroundColor: bg || CARD_COLORS[Math.abs(Number(id) || index) % CARD_COLORS.length],
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  }
}

function normalizePosts(data) {
  return unwrapList(data)
    .map((row, i) => mapPost(row, i))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder || Number(b.id) - Number(a.id))
}

async function fetchJson(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function wakeBackend() {
  try {
    await fetch(`${BACKEND_ORIGIN}/system/getstatus`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
  } catch { /* cold start */ }
}

/** Faol postlar — server uyg‘onishi + retry + 500 da to‘g‘ridan backend */
export async function getActivePosts() {
  await wakeBackend()

  const attempts = [
    async () => api.get('/post/getactive', undefined, { auth: false }),
    async () => fetchJson(`${BACKEND_ORIGIN}/post/getactive`),
    async () => {
      await sleep(800)
      return fetchJson(`${BACKEND_ORIGIN}/post/getactive`)
    },
  ]

  for (const run of attempts) {
    try {
      const data = await run()
      if (data == null) continue
      return normalizePosts(data)
    } catch (e) {
      if (e?.status === 500) continue
    }
  }
  return []
}

export function fallbackPosts() {
  const demos = [
    {
      id: 'f1',
      title: 'Arabosfera — CEFR va arab tili',
      body: 'Barcha skillardan imtihon topshiring: o‘qish, tinglash, yozuv va gapirish.',
      image: '/images/cefr-exam-hero.svg?v=4',
      cta: 'Imtihon topshirish',
      accent: '#6EE000',
      _startCefr: true,
    },
    {
      id: 'f2',
      title: 'Yangi postlar shu yerda',
      body: 'Admin paneldan 3–4 ta post qo‘shing — ular shu feedda pastga chiqadi.',
      image: null,
      cta: 'O‘qish',
      accent: '#3BBFF5',
    },
    {
      id: 'f3',
      title: 'O‘qish · Tinglash · Yozuv',
      body: 'Har bir skill alohida mashq va mock imtihon bilan.',
      image: null,
      cta: 'O‘qish',
      accent: '#8B95A8',
    },
    {
      id: 'f4',
      title: 'Oktagon — birga-bir jang',
      body: 'Do‘stingiz bilan o‘ynab o‘rganing.',
      image: null,
      cta: 'O‘qish',
      accent: '#F5C842',
    },
    {
      id: 'f5',
      title: 'Kalendar va mashg‘ulotlar',
      body: 'Haftalik reja va darslar — bir joyda.',
      image: null,
      cta: 'O‘qish',
      accent: '#A78BFA',
    },
  ]

  const fromHome = (HOME_NEWS || []).map((n, i) => ({
    id: n.id,
    title: n.title,
    body: n.body || '',
    badgeText: n.tag || null,
    imagePath: null,
    imageUrl: n.image || null,
    ctaText: n.cta || 'O‘qish',
    url: n.url || null,
    backgroundColor: n.accent || CARD_COLORS[i % CARD_COLORS.length],
    sortOrder: 0,
    _local: true,
    _startCefr: Boolean(n.cta && !n.url),
  }))

  if (fromHome.length >= 3) return fromHome

  return demos.map((n, i) => ({
    id: n.id,
    title: n.title,
    body: n.body || '',
    badgeText: null,
    imagePath: null,
    imageUrl: n.image || null,
    ctaText: n.cta || 'O‘qish',
    url: null,
    backgroundColor: n.accent || CARD_COLORS[i % CARD_COLORS.length],
    sortOrder: i,
    _local: true,
    _startCefr: Boolean(n._startCefr),
  }))
}
