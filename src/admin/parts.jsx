import React from 'react'
import { Card, Badge } from '../ui.jsx'

// Admin bo'limlari uchun umumiy yordamchilar

export function Head({ title, desc, right }) {
  return (
    <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
      <div>
        <h2 className="text-xl font-black">{title}</h2>
        {desc && <p className="text-slate-400 text-sm mt-1 max-w-2xl">{desc}</p>}
      </div>
      {right}
    </div>
  )
}

export function KpiCard({ label, value, sub, color = 'text-neon' }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </Card>
  )
}

// Oddiy gorizontal bar chart
export function BarChart({ data, unit = '%', color = 'bg-neon' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300">{d.label}</span>
            <span className="text-slate-400 font-semibold">{d.value}{unit}</span>
          </div>
          <div className="h-2.5 rounded-full bg-black/40 overflow-hidden">
            <div className={`h-full ${d.color || color} rounded-full transition-all`} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <button onClick={() => onChange(!on)} className="flex items-center gap-3">
      <span className={`w-11 h-6 rounded-full p-0.5 transition ${on ? 'bg-neon' : 'bg-cardhi border border-line'}`}>
        <span className={`block w-5 h-5 rounded-full bg-white transition ${on ? 'translate-x-5' : ''}`} />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  )
}

export function StatusBadge({ status }) {
  const map = {
    faol: 'green', onlayn: 'green', oflayn: 'slate', yakunlangan: 'green',
    baholanmoqda: 'amber', ochiq: 'red', 'javob berilgan': 'blue',
  }
  return <Badge color={map[status] || 'slate'}>{status}</Badge>
}
