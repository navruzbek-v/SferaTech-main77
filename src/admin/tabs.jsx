import React, { useEffect, useRef, useState } from 'react'
import {
  Pencil, Ban, Plus, Trash2, Save, Play, Volume2, Send as SendIcon, Download,
  KeyRound, ShieldCheck, Bell, Radio, Clock, FileDown, Palette, HardDrive,
  Sparkles, AlertTriangle, Search,
} from 'lucide-react'
import { useApp } from '../App.jsx'
import { Card, Button, Badge, ProgressBar } from '../ui.jsx'
import { Head, KpiCard, BarChart, Toggle, StatusBadge } from './parts.jsx'
import {
  USERS, LEADERBOARD, EXAM_SUBMISSIONS, VOCAB, READING_PASSAGES, LISTENING_TRACKS,
  ESSAY_TOPICS, SUPPORT_TICKETS, SYSTEM_LOGS, HARD_QUESTIONS, ANALYTICS, CEFR_LEVELS,
} from '../data.js'
import * as AdminAPI from '../api/admin.js'
import { DEFAULT_THRESHOLDS, idFromLevel } from '../lib/cefr.js'

// ============ 1. Foydalanuvchilar nazorati ============
export function UsersTab() {
  const app = useApp()
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async (search = q) => {
    setLoading(true)
    try {
      const page = await AdminAPI.fetchUsers({ search, pageSize: 100 })
      setUsers(page.items)
    } catch (e) {
      app.notify(e.message || 'Foydalanuvchilar yuklanmadi', 'error')
      setUsers(USERS.map((u) => ({ ...u })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter((u) => (u.name || '').toLowerCase().includes(q.toLowerCase()))

  const save = async () => {
    try {
      const updated = await AdminAPI.updateUser({
        userId: edit.id,
        firstName: edit.name?.split(' ')[0],
        lastName: edit.name?.split(' ').slice(1).join(' ') || '',
        username: edit.username?.replace(/^@/, ''),
        cefrLevelId: idFromLevel(edit.level),
        xp: edit.xp,
      })
      setUsers((us) => us.map((u) => (u.id === edit.id ? (updated || edit) : u)))
      setEdit(null)
      app.notify('Foydalanuvchi yangilandi ✓')
    } catch (e) {
      app.notify(e.message || 'Xatolik', 'error')
    }
  }

  const ban = async (id) => {
    const u = users.find((x) => x.id === id)
    try {
      if (u?.banned) await AdminAPI.unbanUser(id)
      else await AdminAPI.banUser(id, 'Admin panel')
      setUsers((us) => us.map((x) => (x.id === id ? { ...x, banned: !x.banned } : x)))
      app.notify('Holat o‘zgartirildi')
    } catch (e) {
      app.notify(e.message || 'Xatolik', 'error')
    }
  }

  return (
    <div>
      <Head title="Foydalanuvchilar nazorati" desc="API: /user/getusers · update · ban" />
      <div className="relative mb-4 max-w-sm flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Foydalanuvchi qidirish..." className="w-full bg-card border border-line rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-neon" />
        </div>
        <Button variant="dark" onClick={() => load()}>Qidir</Button>
      </div>
      {loading && <p className="text-sm text-slate-500 mb-2">Yuklanmoqda...</p>}
      <div className="space-y-2">
        {filtered.map((u) => (
          <Card key={u.id} className="p-3.5 flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-cardhi flex items-center justify-center font-black">{(u.name || '?')[0]}</div>
            <div className="min-w-0">
              <p className="font-semibold text-sm flex items-center gap-2">{u.name} {u.banned && <Badge color="red">bloklangan</Badge>}</p>
              <p className="text-xs text-slate-500">{u.username} · {u.level}</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-center"><p className="text-xs text-slate-500">XP</p><p className="font-bold text-sm">{u.xp}</p></div>
              <div className="w-24"><p className="text-[10px] text-slate-500 mb-1">Progres {u.progress}%</p><ProgressBar value={u.progress} /></div>
              <Button variant="dark" onClick={() => setEdit(u)} className="px-2.5 py-2"><Pencil size={14} /></Button>
              <Button variant={u.banned ? 'outline' : 'danger'} onClick={() => ban(u.id)} className="px-2.5 py-2"><Ban size={14} /></Button>
            </div>
          </Card>
        ))}
        {!loading && !filtered.length && <p className="text-sm text-slate-500">Foydalanuvchi yo‘q</p>}
      </div>

      {edit && (
        <Card className="p-4 mt-4 max-w-sm">
          <h3 className="font-bold mb-3">Profilni tahrirlash — {edit.name}</h3>
          <Field label="XP" value={edit.xp} onChange={(v) => setEdit({ ...edit, xp: +v })} type="number" />
          <label className="block mb-2">
            <span className="text-xs text-slate-500">CEFR daraja</span>
            <select
              value={edit.level}
              onChange={(e) => setEdit({ ...edit, level: e.target.value })}
              className="w-full mt-1 bg-base border border-line rounded-lg px-3 py-2 text-sm"
            >
              {CEFR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <div className="flex gap-2 mt-3">
            <Button variant="ghost" onClick={() => setEdit(null)} className="flex-1">Bekor</Button>
            <Button variant="primary" onClick={save} className="flex-1"><Save size={15} /> Saqlash</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

// ============ 2. Imtihon natijalari va Baholash ============
export function SubmissionsTab() {
  const app = useApp()
  const [remote, setRemote] = useState([])
  const [sel, setSel] = useState(null)
  const [grade, setGrade] = useState({ writing: '', speaking: '', reading: '', listening: '' })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const page = await AdminAPI.fetchExamResults({ pageSize: 50, pendingOnly: false })
      setRemote(page.items)
    } catch (e) {
      app.notify(e.message || 'Natijalar yuklanmadi', 'error')
      setRemote(EXAM_SUBMISSIONS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const assign = async () => {
    try {
      await AdminAPI.startReview(sel.id).catch(() => {})
      await AdminAPI.approveResult({
        examResultId: sel.id,
        readingScore: +grade.reading || sel.reading || 0,
        listeningScore: +grade.listening || sel.listening || 0,
        writingScore: +grade.writing || 0,
        speakingScore: +grade.speaking || 0,
      })
      app.notify(`Baho saqlandi ✓`)
      setSel(null)
      setGrade({ writing: '', speaking: '', reading: '', listening: '' })
      load()
    } catch (e) {
      app.notify(e.message || 'Xatolik', 'error')
    }
  }

  return (
    <div>
      <Head title="Imtihon natijalari va Baholash" desc="API: /examresult/getlist · approve" right={<Button variant="dark" onClick={load}>Yangilash</Button>} />
      {loading && <p className="text-sm text-slate-500 mb-2">Yuklanmoqda...</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {remote.map((s) => (
            <Card key={s.id} onClick={() => setSel(s)} className={`p-3.5 ${sel?.id === s.id ? 'border-neon' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{s.user}</p>
                  <p className="text-xs text-slate-500">{s.type} · {s.date} {s.level ? `· ${s.level}` : ''}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="flex gap-3 mt-2 text-xs text-slate-400">
                <span>O‘qish: {s.reading ?? '—'}</span>
                <span>Tinglash: {s.listening ?? '—'}</span>
                <span>Yozuv: {s.writing ?? '?'}</span>
                <span>Gapirish: {s.speaking ?? '?'}</span>
              </div>
            </Card>
          ))}
          {!loading && !remote.length && <p className="text-sm text-slate-500">Natija yo‘q</p>}
        </div>

        <div>
          {!sel ? (
            <Card className="p-8 text-center text-slate-500 text-sm">Baholash uchun imtihon tanlang.</Card>
          ) : (
            <Card className="p-4">
              <h3 className="font-bold mb-3">{sel.user} — {sel.type}</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="O‘qish" value={grade.reading} onChange={(v) => setGrade({ ...grade, reading: v })} type="number" />
                <Field label="Tinglash" value={grade.listening} onChange={(v) => setGrade({ ...grade, listening: v })} type="number" />
                <Field label="Yozuv /100" value={grade.writing} onChange={(v) => setGrade({ ...grade, writing: v })} type="number" />
                <Field label="Gapirish /100" value={grade.speaking} onChange={(v) => setGrade({ ...grade, speaking: v })} type="number" />
              </div>
              <Button variant="primary" onClick={assign} className="w-full mt-3"><Save size={15} /> Tasdiqlash (approve)</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ 3. Kontent Menejeri ============
export function ContentTab() {
  const app = useApp()
  const [questions, setQuestions] = useState([])
  const [level, setLevel] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const page = await AdminAPI.fetchQuestions({
        languageLevelId: level ? idFromLevel(level) : undefined,
        activeOnly: false,
        pageSize: 100,
      })
      setQuestions(page.items)
    } catch (e) {
      app.notify(e.message || 'Savollar yuklanmadi', 'error')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [level])

  const remove = async (id) => {
    try {
      await AdminAPI.deleteQuestion(id)
      setQuestions((q) => q.filter((x) => x.id !== id))
      app.notify('Savol o‘chirildi')
    } catch (e) {
      app.notify(e.message || 'Xatolik', 'error')
    }
  }

  return (
    <div>
      <Head
        title="Kontent Menejeri — Savollar"
        desc="API: /question/getlist · create · delete. CEFR daraja bo‘yicha filtr."
        right={(
          <div className="flex gap-2">
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-card border border-line rounded-lg px-2 py-1.5 text-sm">
              <option value="">Barcha darajalar</option>
              {CEFR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <Button variant="dark" onClick={load}>Yangilash</Button>
          </div>
        )}
      />
      {loading && <p className="text-sm text-slate-500 mb-2">Yuklanmoqda...</p>}
      <div className="space-y-2 max-w-3xl">
        {questions.map((q) => (
          <Card key={q.id} className="p-3.5">
            <div className="flex items-start gap-3">
              <Badge color="blue">{q.cefr || '—'}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{q.text}</p>
                <p className="text-xs text-slate-500 mt-1">{(q.options || []).length} variant · id={q.id}</p>
              </div>
              <Button variant="danger" onClick={() => remove(q.id)} className="px-2.5 py-2"><Trash2 size={14} /></Button>
            </div>
          </Card>
        ))}
        {!loading && !questions.length && (
          <Card className="p-6 text-center text-slate-500 text-sm">
            Savollar yo‘q. .docx parser yoki /question/create orqali qo‘shing.
          </Card>
        )}
      </div>
    </div>
  )
}

// ============ 4. Oktagon Jonli Monitoring ============
export function BattleMonitorTab() {
  const [sessions] = useState([
    { id: 1, a: 'DEVNODIR', b: 'Malika Yusupova', q: '3/5', time: '01:12' },
    { id: 2, a: 'Sardor Aliyev', b: 'Bekzod Toshev', q: '1/5', time: '00:28' },
  ])
  const app = useApp()
  return (
    <div>
      <Head title="Oktagon Jonli Monitoring" desc="Faol jonli PvP sessiyalar va global reyting boshqaruvi." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-bold mb-2">Faol janglar</p>
          <div className="space-y-2">
            {sessions.map((s) => (
              <Card key={s.id} className="p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{s.a} <span className="text-slate-500">vs</span> {s.b}</span>
                  <Badge color="green">jonli</Badge>
                </div>
                <div className="flex gap-4 text-xs text-slate-400 mt-1"><span>Savol: {s.q}</span><span>Vaqt: {s.time}</span></div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold mb-2">Reyting (Leaderboard)</p>
          <div className="space-y-2">
            {LEADERBOARD.slice(0, 5).map((u) => (
              <Card key={u.id} className="p-3 flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm ${u.rank <= 3 ? 'bg-neon text-black' : 'bg-cardhi'}`}>{u.rank}</span>
                <span className="font-semibold text-sm flex-1">{u.name}</span>
                <span className="text-neon font-bold text-sm">{u.xp} XP</span>
                <Button variant="ghost" onClick={() => app.notify('Reytingdan chetlashtirildi')} className="px-2 py-1 text-xs">Reset</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 5. Kalendar va Imtihon Sanalari ============
export function CalendarTab() {
  const app = useApp()
  const [dates, setDates] = useState([])

  useEffect(() => {
    AdminAPI.fetchExamDates()
      .then(setDates)
      .catch((e) => app.notify(e.message || 'Sanalar yuklanmadi', 'error'))
  }, [])

  return (
    <div>
      <Head title="Kalendar va Imtihon Sanalari" desc="API: /examdates/getlist — faol imtihon sanalari." />
      <div className="space-y-2 max-w-2xl">
        {dates.map((d) => (
          <Card key={d.id} className="p-4 flex items-center gap-3 flex-wrap">
            <Badge color="blue">{d.examTypeId || 'exam'}</Badge>
            <span className="font-semibold text-sm">{(d.examDateValue || '').slice(0, 10)}</span>
            <span className="text-xs text-slate-500">deadline: {(d.registrationDeadline || '').slice(0, 10) || '—'}</span>
            <span className="text-xs text-slate-400 flex-1">{d.description || ''}</span>
            {d.isActive === false ? <Badge color="red">nofaol</Badge> : <Badge color="green">faol</Badge>}
          </Card>
        ))}
        {!dates.length && <p className="text-sm text-slate-500">Sanalar yo‘q yoki API xatosi</p>}
      </div>
    </div>
  )
}

// ============ 6. Ko'p darajali Analitika ============
export function AnalyticsTab() {
  const app = useApp()
  const [dash, setDash] = useState(null)

  useEffect(() => {
    AdminAPI.fetchDashboard(30)
      .then(setDash)
      .catch((e) => app.notify(e.message || 'Analitika yuklanmadi', 'error'))
  }, [])

  const kpi = (obj, fallback) => obj?.value ?? obj?.count ?? fallback

  return (
    <div>
      <Head title="Ko‘p darajali Analitika" desc="API: /analytics/getdashboard" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Jami o‘quvchilar" value={kpi(dash?.totalStudents, ANALYTICS.activeStudents)} />
        <KpiCard label="Bugun faol" value={kpi(dash?.activeToday, '—')} color="text-tg" />
        <KpiCard label="Topshirilgan imtihon" value={kpi(dash?.examsSubmitted, '—')} color="text-violet-300" />
        <KpiCard label="O‘rtacha natija" value={kpi(dash?.averageResult, `${ANALYTICS.avgScore}%`)} color="text-neon" />
      </div>
      <Card className="p-5 max-w-2xl">
        <p className="font-bold text-sm mb-4">CEFR taqsimoti</p>
        <BarChart
          data={(dash?.levelDistribution || []).map((t) => ({
            label: t.levelCode || t.code || t.label || '?',
            value: t.count || t.value || 0,
            color: 'bg-neon',
          }))}
        />
        {!dash?.levelDistribution?.length && (
          <BarChart data={ANALYTICS.topicFailRates.map((t) => ({ label: t.topic, value: t.fail, color: t.fail > 45 ? 'bg-red-400' : 'bg-neon' }))} />
        )}
      </Card>
    </div>
  )
}

// ============ 7. Shpargalka va Loglar (Anti-Cheat) ============
export function AntiCheatTab() {
  const [flags, setFlags] = useState([
    { id: 1, user: 'Jasur Karimov', event: 'Imtihon vaqtida tabdan chiqdi', time: '13:40', level: 'yuqori' },
    { id: 2, user: 'Bekzod Toshev', event: '2 marta oynani almashtirdi', time: '12:15', level: 'o‘rta' },
    { id: 3, user: 'Sardor Aliyev', event: 'Nusxa ko‘chirishga urinish', time: '11:02', level: 'yuqori' },
  ])
  const app = useApp()
  return (
    <div>
      <Head title="Shpargalka va Katta Loglar" desc="O‘quvchi jonli imtihon vaqtida tabdan chiqsa — avtomatik ogohlantirish (flag) ko‘rsatiladi." />
      <div className="space-y-2 max-w-2xl">
        {flags.map((f) => (
          <Card key={f.id} className={`p-3.5 flex items-center gap-3 ${f.level === 'yuqori' ? 'border-red-500/30' : ''}`}>
            <AlertTriangle size={18} className={f.level === 'yuqori' ? 'text-red-400' : 'text-amber-400'} />
            <div className="flex-1"><p className="font-semibold text-sm">{f.user}</p><p className="text-xs text-slate-400">{f.event}</p></div>
            <Badge color={f.level === 'yuqori' ? 'red' : 'amber'}>{f.level}</Badge>
            <span className="text-xs text-slate-500">{f.time}</span>
            <Button variant="ghost" onClick={() => { setFlags((x) => x.filter((i) => i.id !== f.id)); app.notify('Ogohlantirish yopildi') }} className="px-2 py-1 text-xs">Yopish</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ 8. Bildirishnomalar Yuborish ============
export function BroadcastTab() {
  const app = useApp()
  const [msg, setMsg] = useState('')
  const [channel, setChannel] = useState('telegram')

  return (
    <div>
      <Head title="Bildirishnomalar Yuborish" desc="Swaggerda alohida admin broadcast endpoint yo‘q — foydalanuvchi /notifications ishlatiladi. Tez orada bot orqali yuborish qo‘shiladi." />
      <Card className="p-5 max-w-xl">
        <div className="flex gap-2 mb-3">
          {[['telegram', 'Telegram'], ['push', 'Push']].map(([k, l]) => (
            <button key={k} onClick={() => setChannel(k)} className={`px-3.5 py-1.5 rounded-lg text-sm ${channel === k ? 'bg-neon text-black font-semibold' : 'bg-card border border-line'}`}>{l}</button>
          ))}
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="E’lon matnini yozing..." className="w-full h-32 bg-base border border-line rounded-xl p-3 text-sm resize-none outline-none focus:border-neon" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-500">Kanal: {channel}</span>
          <Button variant="primary" disabled={!msg.trim()} onClick={() => app.notify('Broadcast endpoint hali backendda yo‘q', 'info')}><SendIcon size={15} /> Yuborish</Button>
        </div>
      </Card>
    </div>
  )
}

// ============ 9. Promo-kodlar va Obunalar ============
export function PromoTab() {
  const app = useApp()
  const [codes, setCodes] = useState([{ code: 'ARABO-VIP-2026', type: 'VIP', used: false }])
  const gen = () => {
    const c = 'ARABO-' + Math.random().toString(36).slice(2, 7).toUpperCase()
    setCodes((x) => [{ code: c, type: 'VIP', used: false }, ...x])
    app.notify('Yangi promo-kod yaratildi ✓')
  }
  return (
    <div>
      <Head title="Promo-kodlar va Obunalar" desc="Tizimga kirish kalitlari yoki muayyan o‘quvchilar uchun VIP kirish yarating." right={<Button variant="primary" onClick={gen}><KeyRound size={15} /> Kod yaratish</Button>} />
      <div className="space-y-2 max-w-xl">
        {codes.map((c) => (
          <Card key={c.code} className="p-3.5 flex items-center gap-3">
            <code className="font-mono text-neon text-sm">{c.code}</code>
            <Badge color="violet">{c.type}</Badge>
            <Badge color={c.used ? 'slate' : 'green'}>{c.used ? 'ishlatilgan' : 'faol'}</Badge>
            <Button variant="ghost" onClick={() => { navigator.clipboard?.writeText(c.code); app.notify('Nusxalandi') }} className="ml-auto px-2 py-1 text-xs">Nusxa</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ 10. Qiyin Savollar Statistikasi ============
export function HardQuestionsTab() {
  const app = useApp()
  return (
    <div>
      <Head title="Qiyin Savollar Statistikasi" desc="O‘quvchilar eng ko‘p xato qiladigan aniq savollar (Chalg‘ituvchi ro‘yxati)." />
      <div className="space-y-2 max-w-2xl">
        {HARD_QUESTIONS.map((q) => (
          <Card key={q.id} className="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold flex-1 pr-3">{q.text}</p>
              <Badge color={q.failRate > 60 ? 'red' : q.failRate > 40 ? 'amber' : 'green'}>{q.failRate}% xato</Badge>
            </div>
            <ProgressBar value={q.failRate} color={q.failRate > 60 ? 'bg-red-400' : 'bg-amber-400'} />
            <button onClick={() => app.notify('Chalg‘ituvchi ro‘yxatiga qo‘shildi')} className="text-xs text-tg mt-2 hover:underline">+ Chalg‘ituvchiga qo‘shish</button>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ 11. Admin Rollari ============
export function RolesTab() {
  const app = useApp()
  const [roles, setRoles] = useState([
    { id: 1, name: 'Bosh admin', perms: ['barchasi'] },
    { id: 2, name: 'Kontent moderator', perms: ['kontent', 'audio'] },
    { id: 3, name: 'Baholovchi', perms: ['baholash'] },
  ])
  const ALL = ['kontent', 'audio', 'baholash', 'foydalanuvchilar', 'analitika', 'barchasi']
  const toggle = (id, p) => setRoles((rs) => rs.map((r) => r.id === id ? { ...r, perms: r.perms.includes(p) ? r.perms.filter((x) => x !== p) : [...r.perms, p] } : r))
  return (
    <div>
      <Head title="Admin Rollari" desc="Sub-adminlar yoki kontent moderatorlari uchun ruxsatlarni belgilang." />
      <div className="space-y-3 max-w-2xl">
        {roles.map((r) => (
          <Card key={r.id} className="p-4">
            <p className="font-bold text-sm mb-2">{r.name}</p>
            <div className="flex flex-wrap gap-2">
              {ALL.map((p) => (
                <button key={p} onClick={() => toggle(r.id, p)} className={`px-2.5 py-1 rounded-lg text-xs border ${r.perms.includes(p) ? 'bg-neon/15 border-neon/40 text-neon' : 'bg-card border-line text-slate-400'}`}>{p}</button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ 12. Tizim Loglari ============
export function LogsTab() {
  const app = useApp()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AdminAPI.fetchAuditLogs({ pageSize: 50 })
      .then((p) => setLogs(p.items?.length ? p.items : SYSTEM_LOGS))
      .catch((e) => {
        app.notify(e.message || 'Loglar yuklanmadi', 'error')
        setLogs(SYSTEM_LOGS)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Head title="Tizim Loglari" desc="API: /monitoring/getauditlogs" />
      {loading && <p className="text-sm text-slate-500 mb-2">Yuklanmoqda...</p>}
      <Card className="p-5 max-w-2xl">
        <div className="space-y-4">
          {logs.map((l, i) => (
            <div key={l.id || i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-neon mt-1" />
                <span className="w-px flex-1 bg-line" />
              </div>
              <div className="pb-1">
                <p className="text-sm">{l.text || l.action || l.message || JSON.stringify(l).slice(0, 120)}</p>
                <p className="text-xs text-slate-500">{l.time || l.createdAt || l.timestamp || ''}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ============ 13. Audio Fayllar Ombori ============
export function AudioAssetsTab() {
  const app = useApp()
  const [tracks, setTracks] = useState([])
  const ref = useRef()

  const load = async () => {
    try {
      const page = await AdminAPI.fetchAudios({ pageSize: 50 })
      setTracks(page.items)
    } catch (e) {
      app.notify(e.message || 'Audio yuklanmadi', 'error')
    }
  }

  useEffect(() => { load() }, [])

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const meta = await AdminAPI.uploadAudio(file)
      setTracks((t) => [meta, ...t])
      app.notify('Audio yuklandi ✓')
    } catch (err) {
      app.notify(err.message || 'Yuklash xatosi', 'error')
    }
  }

  return (
    <div>
      <Head title="Audio Fayllar Ombori" desc="API: /audios/getlist · upload" right={<Button variant="primary" onClick={() => ref.current?.click()}><Plus size={15} /> Audio yuklash</Button>} />
      <input ref={ref} type="file" accept="audio/*" className="hidden" onChange={onFile} />
      <div className="space-y-2 max-w-2xl">
        {tracks.map((t) => (
          <Card key={t.id} className="p-3.5 flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-tg text-black flex items-center justify-center"><Play size={15} fill="currentColor" /></button>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t.originalFileName || t.title || t.url}</p>
              <p className="text-xs text-slate-500">{t.mimeType || ''} · {t.sizeBytes ? `${Math.round(t.sizeBytes / 1024)} KB` : ''}</p>
            </div>
          </Card>
        ))}
        {!tracks.length && <p className="text-sm text-slate-500">Audio yo‘q</p>}
      </div>
    </div>
  )
}

// ============ 14. Insho Mavzulari ============
export function EssayTopicsTab() {
  const app = useApp()
  const [topics, setTopics] = useState(ESSAY_TOPICS)
  const upd = (id, k, v) => setTopics((t) => t.map((x) => x.id === id ? { ...x, [k]: v } : x))
  return (
    <div>
      <Head title="Insho Mavzulari" desc="Yozuv bosqichi uchun matn mavzulari, so‘z limitlari va kategoriya teglarini boshqaring." right={<Button variant="primary" onClick={() => { setTopics((t) => [...t, { id: Date.now(), title: 'Yangi mavzu', minWords: 250, tag: 'Umumiy' }]); app.notify('Mavzu qo‘shildi') }}><Plus size={15} /> Mavzu</Button>} />
      <div className="space-y-2 max-w-2xl">
        {topics.map((t) => (
          <Card key={t.id} className="p-3.5 flex items-center gap-3 flex-wrap">
            <input value={t.title} onChange={(e) => upd(t.id, 'title', e.target.value)} className="flex-1 min-w-[200px] bg-base border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex items-center gap-1 text-xs text-slate-400">min <input type="number" value={t.minWords} onChange={(e) => upd(t.id, 'minWords', +e.target.value)} className="w-16 bg-base border border-line rounded-lg px-2 py-1.5 text-sm" /> so‘z</div>
            <Badge color="violet">{t.tag}</Badge>
            <Button variant="danger" onClick={() => setTopics((x) => x.filter((i) => i.id !== t.id))} className="px-2.5 py-2"><Trash2 size={14} /></Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ 15. Qo'llab-quvvatlash va Murojaatlar ============
export function SupportTab() {
  const app = useApp()
  const [tickets, setTickets] = useState(SUPPORT_TICKETS)
  const [reply, setReply] = useState({})
  return (
    <div>
      <Head title="Qo‘llab-quvvatlash va Murojaatlar" desc="Foydalanuvchilar bildirgan xato yoki savollarni ko‘ring va javob bering." />
      <div className="space-y-2 max-w-2xl">
        {tickets.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">{t.subject}</p>
              <StatusBadge status={t.status} />
            </div>
            <p className="text-xs text-slate-500 mb-2">{t.user} · {t.date}</p>
            <div className="flex gap-2">
              <input value={reply[t.id] || ''} onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })} placeholder="Javob yozing..." className="flex-1 bg-base border border-line rounded-lg px-3 py-2 text-sm" />
              <Button variant="primary" onClick={() => { setTickets((x) => x.map((i) => i.id === t.id ? { ...i, status: 'javob berilgan' } : i)); app.notify('Javob yuborildi ✓') }}><SendIcon size={14} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ 16. Ma'lumotlarni Eksport qilish ============
export function ExportTab() {
  const app = useApp()
  const download = (name, content) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url); app.notify(`${name} yuklab olindi ✓`)
  }
  const usersCsv = 'id,name,level,xp,progress\n' + USERS.map((u) => `${u.id},${u.name},${u.level},${u.xp},${u.progress}`).join('\n')
  return (
    <div>
      <Head title="Ma’lumotlarni Eksport qilish" desc="Tahlil qilingan savollar bankini va foydalanuvchilar ro‘yxatini JSON/CSV sifatida yuklab oling." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        <Card className="p-5">
          <p className="font-bold text-sm mb-1">Foydalanuvchilar</p>
          <p className="text-xs text-slate-500 mb-3">{USERS.length} ta yozuv</p>
          <div className="flex gap-2">
            <Button variant="dark" onClick={() => download('users.csv', usersCsv)} className="flex-1"><FileDown size={15} /> CSV</Button>
            <Button variant="dark" onClick={() => download('users.json', JSON.stringify(USERS, null, 2))} className="flex-1"><Download size={15} /> JSON</Button>
          </div>
        </Card>
        <Card className="p-5">
          <p className="font-bold text-sm mb-1">Savollar banki</p>
          <p className="text-xs text-slate-500 mb-3">Barcha tahlil qilingan savollar</p>
          <Button variant="primary" onClick={() => download('questions.json', JSON.stringify(HARD_QUESTIONS, null, 2))} className="w-full"><Download size={15} /> JSON yuklash</Button>
        </Card>
      </div>
    </div>
  )
}

// ============ 17. Dinamik Rang O'zgartirgich ============
export function ThemeTab() {
  const app = useApp()
  const [accent, setAccent] = useState('#4ADE80')
  const colors = ['#4ADE80', '#38BDF8', '#A78BFA', '#F472B6', '#FB923C', '#FACC15']
  useEffect(() => { document.documentElement.style.setProperty('--accent', accent) }, [accent])
  return (
    <div>
      <Head title="Dinamik Rang O‘zgartirgich" desc="Panel ranglarini oson o‘zgartiring yoki dashboard konfiguratsiyasini almashtiring." />
      <Card className="p-6 max-w-md">
        <p className="text-sm font-bold mb-3 flex items-center gap-2"><Palette size={16} /> Asosiy urg‘u rangi</p>
        <div className="flex gap-3 flex-wrap">
          {colors.map((c) => (
            <button key={c} onClick={() => { setAccent(c); app.notify('Rang o‘zgartirildi') }} className={`w-11 h-11 rounded-xl border-2 transition ${accent === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c }} />
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-line" style={{ background: '#161B22' }}>
          <div className="h-3 rounded-full mb-2" style={{ background: accent, width: '70%' }} />
          <button className="px-4 py-2 rounded-lg text-black font-bold text-sm" style={{ background: accent }}>Namuna tugma</button>
        </div>
      </Card>
    </div>
  )
}

// ============ 18. Onlayn Foydalanuvchilar (WebSocket) ============
export function OnlineTab() {
  const [online, setOnline] = useState(USERS.map((u) => ({ ...u, live: Math.random() > 0.4 })))
  useEffect(() => {
    const t = setInterval(() => setOnline((os) => os.map((u) => ({ ...u, live: Math.random() > 0.4 }))), 2500)
    return () => clearInterval(t)
  }, [])
  const count = online.filter((u) => u.live).length
  return (
    <div>
      <Head title="Onlayn Foydalanuvchilar" desc="Oktagon rejimiga tayyor foydalanuvchilarning real vaqtdagi onlayn holati (WebSocket simulyatsiyasi)." right={<Badge color="green"><Radio size={11} /> {count} onlayn</Badge>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-3xl">
        {online.map((u) => (
          <Card key={u.id} className="p-3 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${u.live ? 'bg-neon animate-pulse' : 'bg-slate-600'}`} />
            <span className="font-semibold text-sm flex-1">{u.name}</span>
            <span className="text-xs text-slate-500">{u.live ? 'onlayn' : 'oflayn'}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ 19. Til Darajalari Sozlamalari ============
export function LevelConfigTab() {
  const app = useApp()
  const [th, setTh] = useState(app.thresholds || DEFAULT_THRESHOLDS)

  useEffect(() => {
    AdminAPI.fetchThresholdsFromSettings()
      .then((t) => {
        if (t) {
          setTh({ ...DEFAULT_THRESHOLDS, ...t })
          app.setThresholds?.({ ...DEFAULT_THRESHOLDS, ...t })
        }
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    try {
      await AdminAPI.saveThresholdsToSettings(th)
      app.setThresholds?.(th)
      app.notify('CEFR chegaralari saqlandi ✓')
    } catch (e) {
      app.notify(e.message || 'Xatolik', 'error')
    }
  }

  return (
    <div>
      <Head
        title="Til Darajalari Sozlamalari"
        desc="API: /systemsettings — cefr.threshold.A1…C2"
        right={<Button variant="primary" onClick={save}><Save size={15} /> Saqlash</Button>}
      />
      <Card className="p-5 max-w-md space-y-3">
        {CEFR_LEVELS.map((lvl) => (
          <div key={lvl} className="flex items-center gap-3">
            <Badge color="blue">{lvl}</Badge>
            <input
              type="range"
              min="0"
              max="100"
              value={th[lvl] ?? 0}
              onChange={(e) => setTh({ ...th, [lvl]: +e.target.value })}
              className="flex-1 accent-[#4ADE80]"
            />
            <span className="w-12 text-right font-bold text-sm">{th[lvl] ?? 0}%</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ============ 20. Gapirish Taymerlari Sozlamasi ============
export function SpeakingTimerTab() {
  const app = useApp()
  const [t, setT] = useState({ short: 30, long: 120 })

  useEffect(() => {
    AdminAPI.fetchSettings().then((list) => {
      const short = list.find((s) => /speaking.*short|prep.*short/i.test(s.key))
      const long = list.find((s) => /speaking.*long|record.*long/i.test(s.key))
      setT({
        short: short ? Number(short.value) : 30,
        long: long ? Number(long.value) : 120,
      })
    }).catch(() => {})
  }, [])

  const save = async () => {
    try {
      await AdminAPI.updateSetting('speaking.timer.short', t.short)
      await AdminAPI.updateSetting('speaking.timer.long', t.long)
      app.notify('Taymerlar yangilandi ✓')
    } catch (e) {
      app.notify(e.message || 'Xatolik', 'error')
    }
  }

  return (
    <div>
      <Head title="Gapirish Taymerlari Sozlamasi" desc="API: /systemsettings — speaking.timer.*" right={<Button variant="primary" onClick={save}><Save size={15} /> Saqlash</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        <Card className="p-5">
          <p className="text-sm font-bold mb-1 flex items-center gap-2"><Clock size={15} /> A qism (qisqa)</p>
          <p className="text-xs text-slate-500 mb-3">Har savol uchun</p>
          <div className="flex items-center gap-2">
            <input type="number" value={t.short} onChange={(e) => setT({ ...t, short: +e.target.value })} className="w-20 bg-base border border-line rounded-lg px-3 py-2 text-lg font-bold" /> <span className="text-slate-400">soniya</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-bold mb-1 flex items-center gap-2"><Clock size={15} /> B qism (uzun)</p>
          <p className="text-xs text-slate-500 mb-3">Bitta uzun savol</p>
          <div className="flex items-center gap-2">
            <input type="number" value={t.long} onChange={(e) => setT({ ...t, long: +e.target.value })} className="w-20 bg-base border border-line rounded-lg px-3 py-2 text-lg font-bold" /> <span className="text-slate-400">soniya</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ============ 21. Avtomatlashtirilgan Hisobotlar ============
export function ReportsTab() {
  const app = useApp()
  return (
    <div>
      <Head title="Avtomatlashtirilgan Hisobotlar" desc="at-Tanal tayyorgarligi bo‘yicha barcha o‘quvchilarning PDF natija xulosalarini yuklab oling." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        {USERS.slice(0, 4).map((u) => (
          <Card key={u.id} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cardhi flex items-center justify-center font-black">{u.name[0]}</div>
            <div className="flex-1"><p className="font-semibold text-sm">{u.name}</p><p className="text-xs text-slate-500">{u.level} · tayyorlik {u.progress}%</p></div>
            <Button variant="dark" onClick={() => app.notify(`${u.name} PDF hisoboti tayyorlandi ✓`)}><FileDown size={15} /> PDF</Button>
          </Card>
        ))}
      </div>
      <Button variant="primary" onClick={() => app.notify('Barcha o‘quvchilar hisoboti tayyorlanmoqda...')} className="mt-4"><FileDown size={15} /> Umumiy hisobot (PDF)</Button>
    </div>
  )
}

// ============ 22. Tizim Xotirasi ============
export function StorageTab() {
  return (
    <div>
      <Head title="Tizim Xotirasi" desc="Joylashtirilgan tinglash treklari va o‘quvchilar ovozli yozuvlari uchun simulyatsiya qilingan trafik/xotira." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Jami xotira" value="128 GB" sub="240 GB dan" />
        <KpiCard label="Audio treklar" value="42 GB" color="text-tg" />
        <KpiCard label="Ovozli yozuvlar" value="61 GB" color="text-violet-300" />
        <KpiCard label="Oylik trafik" value="1.8 TB" color="text-amber-300" />
      </div>
      <Card className="p-5 max-w-2xl">
        <p className="font-bold text-sm mb-4">Xotira taqsimoti</p>
        <BarChart unit=" GB" data={[
          { label: 'Ovozli yozuvlar', value: 61, color: 'bg-violet-400' },
          { label: 'Audio treklar', value: 42, color: 'bg-tg' },
          { label: 'Rasm/media', value: 18, color: 'bg-neon' },
          { label: 'Baza', value: 7, color: 'bg-amber-400' },
        ]} />
      </Card>
    </div>
  )
}

// ============ 23. AI Baholash Sozlamalari ============
export function AITab() {
  const app = useApp()
  const [ai, setAi] = useState({ writing: true, speaking: false, autoScore: true })
  return (
    <div>
      <Head title="AI Baholash Sozlamalari" desc="Yozuv bo‘limi uchun avtomatlashtirilgan sinov baholash metrikalarini yoqing/o‘chiring." />
      <Card className="p-5 max-w-md space-y-4">
        {[['writing', 'Insho AI baholash', 'Yozuvni avtomatik tahlil qilish'], ['speaking', 'Gapirish AI baholash', 'Ovozni matnga aylantirib baholash'], ['autoScore', 'Avtomatik ball qo‘yish', 'Natijalarni darhol hisoblash']].map(([k, t, d]) => (
          <div key={k} className="flex items-center justify-between gap-3 pb-3 border-b border-line last:border-0">
            <div className="flex items-center gap-3"><Sparkles size={16} className="text-neon" /><div><p className="font-semibold text-sm">{t}</p><p className="text-xs text-slate-500">{d}</p></div></div>
            <Toggle on={ai[k]} onChange={(v) => { setAi({ ...ai, [k]: v }); app.notify(v ? 'Yoqildi' : 'O‘chirildi') }} />
          </div>
        ))}
      </Card>
    </div>
  )
}

// --- kichik yordamchi ---
function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block mb-2.5">
      <span className="text-xs text-slate-400">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 bg-base border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-neon" />
    </label>
  )
}
