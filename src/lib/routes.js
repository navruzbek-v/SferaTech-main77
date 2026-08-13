/** Oddiy path routing — react-router shart emas */

export function currentPath() {
  const p = window.location.pathname.replace(/\/+$/, '')
  return p || '/'
}

export function setPath(path, { replace = false } = {}) {
  const url = !path || path === '/' ? '/' : path.replace(/\/+$/, '') || '/'
  if (currentPath() === url) return
  if (replace) window.history.replaceState({ path: url }, '', url)
  else window.history.pushState({ path: url }, '', url)
}

export function pathForView() {
  return '/'
}
