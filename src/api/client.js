import { getInitData } from '../lib/telegram.js'

// Dev da odatda `/api` (Vite proxy). Prod da to‘liq URL.
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const TOKEN_KEY = 'as_access'
const REFRESH_KEY = 'as_refresh'

export function getApiBase() {
  return BASE
}

export function apiConfigured() {
  return Boolean(BASE)
}

export function hasAuthToken() {
  return Boolean(getAccessToken() || localStorage.getItem('as_token'))
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setTokens({ accessToken, refreshToken, AccessToken, RefreshToken, ...rest }) {
  const access = accessToken || AccessToken || rest.token || rest.Token
  const refresh = refreshToken || RefreshToken
  if (access) localStorage.setItem(TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem('as_token') // legacy
}

function qs(params = {}) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    sp.set(k, String(v))
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

async function parseError(res) {
  let detail = res.statusText
  let code
  try {
    const j = await res.json()
    detail = j.message || j.title || j.detail || j.error || (typeof j === 'string' ? j : detail)
    code = j.errorCode || j.code
    if (Array.isArray(j.errors)) detail = j.errors.join(', ')
    else if (j.errors && typeof j.errors === 'object') {
      detail = Object.values(j.errors).flat().join(', ')
    }
  } catch {
    try { detail = await res.text() || detail } catch { /* */ }
  }
  const err = new Error(detail || `HTTP ${res.status}`)
  err.status = res.status
  err.code = code
  return err
}

let refreshing = null

async function refreshAccess() {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return null
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          clearTokens()
          return null
        }
        const data = await res.json()
        setTokens(data)
        return data.accessToken
      })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: any, headers?: Record<string,string>, auth?: boolean, formData?: FormData, query?: Record<string,any>, raw?: boolean }} options
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers: extra = {},
    auth = true,
    formData,
    query,
    raw = false,
  } = options

  const url = `${BASE}${path}${query ? qs(query) : ''}`
  const headers = { Accept: 'application/json', ...extra }

  if (!formData && body != null) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = getAccessToken() || localStorage.getItem('as_token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const initData = getInitData()
  if (initData) headers['X-Telegram-Init-Data'] = initData

  const doFetch = () => fetch(url, {
    method,
    headers,
    body: formData || (body != null ? JSON.stringify(body) : undefined),
  })

  let res = await doFetch()

  if (res.status === 401 && auth) {
    const next = await refreshAccess()
    if (next) {
      headers.Authorization = `Bearer ${next}`
      res = await doFetch()
    }
  }

  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return null
  if (raw) return res

  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

export const api = {
  get: (path, query, opts) => request(path, { ...opts, method: 'GET', query }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, body, opts) => request(path, { ...opts, method: 'DELETE', body }),
  upload: (path, formData, query) => request(path, { method: 'POST', formData, query }),
}

/** Paged / ASP.NET / oddiy massivni normalizatsiya */
export function unwrapList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  // Newtonsoft ReferenceHandler / System.Text.Json $values
  if (Array.isArray(data.$values)) return data.$values
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.Items)) return data.Items
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.Data)) return data.Data
  if (Array.isArray(data.result)) return data.result
  if (Array.isArray(data.Result)) return data.Result
  if (Array.isArray(data.questions)) return data.questions
  if (Array.isArray(data.Questions)) return data.Questions
  if (Array.isArray(data.users)) return data.users
  if (data.items?.$values) return data.items.$values
  if (data.data?.$values) return data.data.$values
  return []
}

export function unwrapPaged(data) {
  const items = unwrapList(data)
  return {
    items,
    page: data?.page ?? 1,
    pageSize: data?.pageSize ?? items.length,
    totalCount: data?.totalCount ?? items.length,
    totalPages: data?.totalPages ?? 1,
  }
}

export async function withFallback(fn, fallback) {
  try {
    return await fn()
  } catch (e) {
    if (typeof fallback === 'function') return fallback(e)
    return fallback
  }
}
