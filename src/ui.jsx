import React, { useEffect } from 'react'
import { X } from 'lucide-react'

// Umumiy UI komponentlari — barcha ekranlarda qayta ishlatiladi

export function Card({ className = '', children, onClick, ...rest }) {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-line rounded-2xl ${onClick ? 'cursor-pointer active:scale-[.99] transition' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...rest }) {
  const styles = {
    primary: 'bg-neon text-black font-bold hover:brightness-105 active:scale-[.98]',
    tg: 'bg-tg text-black font-bold hover:brightness-105 active:scale-[.98]',
    dark: 'bg-cardhi text-white border border-line hover:bg-line active:scale-[.98]',
    ghost: 'bg-transparent text-slate-300 hover:bg-cardhi',
    danger: 'bg-red-500/90 text-white font-semibold hover:bg-red-500 active:scale-[.98]',
    outline: 'bg-transparent border border-line text-slate-200 hover:bg-cardhi',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Badge({ children, color = 'green', className = '' }) {
  const map = {
    green: 'bg-neon/15 text-neon border-neon/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    blue: 'bg-tg/15 text-tg border-tg/30',
    amber: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    slate: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${map[color]} ${className}`}>
      {children}
    </span>
  )
}

export function ProgressBar({ value = 0, className = '', color = 'bg-neon' }) {
  return (
    <div className={`w-full h-2.5 rounded-full bg-black/40 overflow-hidden ${className}`}>
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-md'} bg-card border border-line rounded-t-3xl sm:rounded-3xl p-5 animate-slideup max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cardhi text-slate-400">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Toast bildirishnoma tizimi
export function Toast({ toast }) {
  if (!toast) return null
  const c = toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-tg' : 'bg-neon'
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-pop">
      <div className={`${c} text-black font-semibold text-sm px-4 py-2.5 rounded-xl shadow-2xl`}>
        {toast.msg}
      </div>
    </div>
  )
}

export function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">{children}</h2>
      {right}
    </div>
  )
}

export function Stat({ label, value, color = 'text-white' }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-extrabold ${color}`}>{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}
