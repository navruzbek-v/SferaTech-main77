import React, { useState } from 'react'
import {
  FileScan, Users, ClipboardList, FolderCog, Swords, CalendarRange, BarChart3,
  ShieldAlert, Megaphone, Ticket, Flame, UserCog, ScrollText, Music, PenLine,
  LifeBuoy, DatabaseBackup, Palette, Radio, Sliders, Timer, FileText, HardDrive,
  Sparkles, LogOut, Menu, X, Smartphone,
} from 'lucide-react'
import { useApp } from '../App.jsx'
import DocxParser from './DocxParser.jsx'
import * as T from './tabs.jsx'

// Bo'limlar ro'yxati — parser + 23 ta admin funksiyasi
const SECTIONS = [
  { key: 'parser', label: '.docx Test Parseri', icon: FileScan, comp: DocxParser, group: 'Asosiy' },
  { key: 'users', label: 'Foydalanuvchilar nazorati', icon: Users, comp: T.UsersTab, group: 'Boshqaruv' },
  { key: 'subs', label: 'Imtihon natijalari va Baholash', icon: ClipboardList, comp: T.SubmissionsTab, group: 'Boshqaruv' },
  { key: 'content', label: 'Kontent Menejeri', icon: FolderCog, comp: T.ContentTab, group: 'Kontent' },
  { key: 'battle', label: 'Oktagon Jonli Monitoring', icon: Swords, comp: T.BattleMonitorTab, group: 'Boshqaruv' },
  { key: 'calendar', label: 'Kalendar va Imtihon Sanalari', icon: CalendarRange, comp: T.CalendarTab, group: 'Boshqaruv' },
  { key: 'analytics', label: 'Ko‘p darajali Analitika', icon: BarChart3, comp: T.AnalyticsTab, group: 'Tahlil' },
  { key: 'anticheat', label: 'Shpargalka va Loglar', icon: ShieldAlert, comp: T.AntiCheatTab, group: 'Xavfsizlik' },
  { key: 'broadcast', label: 'Bildirishnomalar Yuborish', icon: Megaphone, comp: T.BroadcastTab, group: 'Aloqa' },
  { key: 'promo', label: 'Promo-kodlar va Obunalar', icon: Ticket, comp: T.PromoTab, group: 'Boshqaruv' },
  { key: 'hard', label: 'Qiyin Savollar Statistikasi', icon: Flame, comp: T.HardQuestionsTab, group: 'Tahlil' },
  { key: 'roles', label: 'Admin Rollari', icon: UserCog, comp: T.RolesTab, group: 'Xavfsizlik' },
  { key: 'logs', label: 'Tizim Loglari', icon: ScrollText, comp: T.LogsTab, group: 'Xavfsizlik' },
  { key: 'audio', label: 'Audio Fayllar Ombori', icon: Music, comp: T.AudioAssetsTab, group: 'Kontent' },
  { key: 'essays', label: 'Insho Mavzulari', icon: PenLine, comp: T.EssayTopicsTab, group: 'Kontent' },
  { key: 'support', label: 'Qo‘llab-quvvatlash', icon: LifeBuoy, comp: T.SupportTab, group: 'Aloqa' },
  { key: 'export', label: 'Ma’lumotlarni Eksport', icon: DatabaseBackup, comp: T.ExportTab, group: 'Tizim' },
  { key: 'theme', label: 'Dinamik Rang O‘zgartirgich', icon: Palette, comp: T.ThemeTab, group: 'Tizim' },
  { key: 'online', label: 'Onlayn Foydalanuvchilar', icon: Radio, comp: T.OnlineTab, group: 'Tahlil' },
  { key: 'levels', label: 'Til Darajalari Sozlamalari', icon: Sliders, comp: T.LevelConfigTab, group: 'Sozlamalar' },
  { key: 'timers', label: 'Gapirish Taymerlari', icon: Timer, comp: T.SpeakingTimerTab, group: 'Sozlamalar' },
  { key: 'reports', label: 'Avtomatik Hisobotlar', icon: FileText, comp: T.ReportsTab, group: 'Tahlil' },
  { key: 'storage', label: 'Tizim Xotirasi', icon: HardDrive, comp: T.StorageTab, group: 'Tizim' },
  { key: 'ai', label: 'AI Baholash Sozlamalari', icon: Sparkles, comp: T.AITab, group: 'Sozlamalar' },
]

const GROUPS = ['Asosiy', 'Boshqaruv', 'Kontent', 'Tahlil', 'Aloqa', 'Xavfsizlik', 'Sozlamalar', 'Tizim']

export default function AdminPanel() {
  const app = useApp()
  const [active, setActive] = useState('parser')
  const [open, setOpen] = useState(false)
  const Section = SECTIONS.find((s) => s.key === active)
  const Comp = Section.comp

  return (
    <div className="min-h-screen bg-base flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-72 bg-card border-r border-line flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-line flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon/15 border border-neon/30 flex items-center justify-center"><span className="arabic text-neon">ع</span></div>
          <div>
            <p className="font-black leading-none">Arabosfera</p>
            <p className={`text-[11px] ${app.apiOnline ? 'text-neon' : 'text-amber-400/90'}`}>
              {app.apiOnline ? 'API ulangan ✓' : 'Token yo‘q — qayta kiring'}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {GROUPS.map((g) => {
            const items = SECTIONS.filter((s) => s.group === g)
            if (!items.length) return null
            return (
              <div key={g}>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 font-bold px-2 mb-1.5">{g}</p>
                <div className="space-y-0.5">
                  {items.map((s) => {
                    const Ico = s.icon
                    const on = active === s.key
                    return (
                      <button
                        key={s.key}
                        onClick={() => { setActive(s.key); setOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition ${on ? 'bg-neon/15 text-neon font-semibold' : 'text-slate-300 hover:bg-cardhi'}`}
                      >
                        <Ico size={16} className="shrink-0" />
                        <span className="truncate">{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="p-3 border-t border-line space-y-1">
          <button onClick={() => app.goStudent?.() || app.setView('student')} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-300 hover:bg-cardhi">
            <Smartphone size={16} /> O‘quvchi ko‘rinishi
          </button>
          <button onClick={() => app.signOut?.() || app.setAuthed(false)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-red-300 hover:bg-cardhi">
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-20 bg-base/95 backdrop-blur border-b border-line p-3 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-cardhi"><Menu size={20} /></button>
          <span className="font-bold text-sm">{Section.label}</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          <Comp />
        </div>
      </main>
    </div>
  )
}
