import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui.jsx'

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
const WD = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

// CEFR / at-Tanal imtihon sanasini tanlash kalendari
export default function Calendar({ onSelect, initial = '2026-07-14' }) {
  const today = new Date(initial)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [picked, setPicked] = useState(null)

  const first = new Date(year, month, 1)
  const startDay = (first.getDay() + 6) % 7 // dushanba = 0
  const daysInMonth = new Date(year, month + 1, 1).getDate()
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const move = (dir) => {
    let m = month + dir
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m); setYear(y)
  }

  const isPast = (d) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const confirm = () => {
    if (picked == null) return
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(picked).padStart(2, '0')
    onSelect(`${year}-${mm}-${dd}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => move(-1)} className="p-2 rounded-lg hover:bg-cardhi text-slate-300"><ChevronLeft size={18} /></button>
        <div className="font-bold text-sm">{MONTHS[month]} {year}</div>
        <button onClick={() => move(1)} className="p-2 rounded-lg hover:bg-cardhi text-slate-300"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WD.map((w) => <div key={w} className="text-center text-[11px] text-slate-500 py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d == null) return <div key={i} />
          const past = isPast(d)
          const active = picked === d
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => setPicked(d)}
              className={`aspect-square rounded-lg text-sm font-medium transition
                ${active ? 'bg-neon text-black font-bold' : past ? 'text-slate-700 cursor-not-allowed' : 'text-slate-200 hover:bg-cardhi'}`}
            >
              {d}
            </button>
          )
        })}
      </div>

      <Button variant="primary" onClick={confirm} disabled={picked == null} className="w-full mt-5 disabled:opacity-40">
        Sanani tasdiqlash
      </Button>
    </div>
  )
}
