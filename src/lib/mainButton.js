import { useEffect, useMemo } from 'react'
import { getTelegram } from './telegram.js'

/** Telegram MainButton — saqlash / topshirish (MD) */
export function useMainButton() {
  return useMemo(() => {
    const tg = getTelegram()
    const mb = tg?.MainButton

    return {
      show(text, onClick) {
        if (!mb) return () => {}
        try {
          mb.setText(text)
          mb.show()
          mb.onClick(onClick)
        } catch { /* */ }
        return () => {
          try { mb.offClick(onClick) } catch { /* */ }
          try { mb.hide() } catch { /* */ }
        }
      },
      hide() {
        try { mb?.hide() } catch { /* */ }
      },
      showProgress() {
        try { mb?.showProgress?.(false) } catch { /* */ }
      },
      hideProgress() {
        try { mb?.hideProgress?.() } catch { /* */ }
      },
    }
  }, [])
}

/** Telegram BackButton — orqaga (04-prompt) */
export function useBackButton(onBack) {
  useEffect(() => {
    const bb = getTelegram()?.BackButton
    if (!bb || typeof onBack !== 'function') return undefined
    try {
      bb.show()
      bb.onClick(onBack)
    } catch { /* */ }
    return () => {
      try { bb.offClick(onBack) } catch { /* */ }
      try { bb.hide() } catch { /* */ }
    }
  }, [onBack])
}
