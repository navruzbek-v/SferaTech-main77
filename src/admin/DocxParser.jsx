import React, { useRef, useState } from 'react'
import mammoth from 'mammoth'
import { UploadCloud, FileText, Wand2, Shuffle, Check, Loader2, Database } from 'lucide-react'
import { useApp } from '../App.jsx'
import { Button, Card, Badge } from '../ui.jsx'
import { uploadDocx, previewDocx, importDocx, createQuestion } from '../api/admin.js'
import { idFromLevel } from '../lib/cefr.js'

const SAMPLE = `يَذْهَبُ أَحْمَدُ إِلَى الْجَامِعَةِ فِي الصَّبَاحِ. هُوَ طَالِبٌ فِي كُلِّيَّةِ اللُّغَاتِ.

1. Ahmad qayerga boradi?
A) Bozorga
*B) Universitetga
C) Uyga
D) Masjidga

2. Ahmad qaysi fakultet talabasi?
A) Tibbiyot
*B) Tillar
C) Iqtisod
D) Huquq`

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function parseRawText(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const questions = []
  let passage = ''
  let cur = null
  for (const line of lines) {
    const qm = line.match(/^(\d+)[.)]\s*(.+)$/)
    if (qm) {
      if (cur) questions.push(cur)
      cur = { text: qm[2], options: [], correctIdx: 0 }
      continue
    }
    const om = line.match(/^\*?([A-Da-d])[).]\s*(.+)$/)
    if (om && cur) {
      const correct = line.trim().startsWith('*')
      cur.options.push(om[2])
      if (correct) cur.correctIdx = cur.options.length - 1
      continue
    }
    if (!cur) passage += (passage ? ' ' : '') + line
  }
  if (cur) questions.push(cur)
  return { passage, questions }
}

export default function DocxParser() {
  const app = useApp()
  const [raw, setRaw] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [level, setLevel] = useState('B1')
  const [serverPath, setServerPath] = useState(null)
  const inputRef = useRef()

  const readFile = async (file) => {
    if (!file) return
    setFileName(file.name)
    setLoading(true)
    try {
      // 1) Serverga yuklash (Swagger DocxImport)
      try {
        const up = await uploadDocx(file)
        const path = up?.filePath || up?.relativePath || up?.path || up
        if (typeof path === 'string') {
          setServerPath(path)
          const prev = await previewDocx(path).catch(() => null)
          if (prev?.text || prev?.previewText) setRaw(prev.text || prev.previewText)
        }
      } catch {
        /* lokal parse davom etadi */
      }

      const buf = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer: buf })
      setRaw(result.value || '')
      app.notify('Fayl o‘qildi — endi "Tahlil qilish"ni bosing', 'info')
    } catch {
      app.notify('Faylni o‘qishda xatolik', 'error')
    } finally {
      setLoading(false)
    }
  }

  const analyze = () => {
    const text = raw.trim()
    if (!text) { app.notify('Avval matn yuklang yoki kiriting', 'error'); return }
    setLoading(true)
    setTimeout(() => {
      const { passage, questions } = parseRawText(text)
      const shuffled = shuffle(questions).map((q) => {
        const pairs = q.options.map((o, i) => ({ o, correct: i === q.correctIdx }))
        const sp = shuffle(pairs)
        return { ...q, options: sp.map((p) => p.o), correctIdx: sp.findIndex((p) => p.correct) }
      })
      setParsed({ passage, questions: shuffled })
      setLoading(false)
      app.notify(`${shuffled.length} ta savol ajratildi ✓`)
    }, 400)
  }

  const saveToDb = async () => {
    if (!parsed?.questions?.length) return
    setLoading(true)
    try {
      if (serverPath) {
        const res = await importDocx({
          filePath: serverPath,
          questionTypeId: 1,
          languageLevelId: idFromLevel(level),
        })
        app.notify(`${res.importedCount ?? parsed.questions.length} ta savol import qilindi ✓`)
      } else {
        let n = 0
        for (const q of parsed.questions) {
          await createQuestion({
            questionTypeId: 1,
            categoryId: 1,
            languageLevelId: idFromLevel(level),
            text: q.text,
            readingPassage: parsed.passage || null,
            points: 1,
            options: q.options.map((optionText, i) => ({
              optionText,
              isCorrect: i === q.correctIdx,
              orderIndex: i,
            })),
          })
          n++
        }
        app.notify(`${n} ta savol /question/create orqali saqlandi ✓`)
      }
      setParsed(null)
      setRaw('')
      setFileName('')
      setServerPath(null)
    } catch (e) {
      app.notify(e.message || 'Saqlanmadi', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-black">Aqlli .docx Test Parseri</h2>
        <p className="text-slate-400 text-sm mt-1">
          API: /docximport/upload · preview · import yoki /question/create
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-slate-500">CEFR daraja</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-card border border-line rounded-lg px-3 py-1.5 text-sm">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); readFile(e.dataTransfer.files[0]) }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${drag ? 'border-neon bg-neon/5' : 'border-line bg-card'}`}
          >
            <UploadCloud className="mx-auto text-slate-500 mb-3" size={36} />
            <p className="font-semibold text-sm">.docx faylni tashlang</p>
            <p className="text-xs text-slate-500 mt-1">{fileName || 'yoki tanlang'}</p>
            <Button variant="dark" className="mt-4" onClick={() => inputRef.current?.click()}>Fayl tanlash</Button>
            <input ref={inputRef} type="file" accept=".docx" className="hidden" onChange={(e) => readFile(e.target.files[0])} />
          </div>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Yoki matnni shu yerga joylashtiring..."
            className="w-full mt-3 h-40 bg-card border border-line rounded-xl p-3 text-sm resize-none outline-none focus:border-neon"
          />
          <div className="flex gap-2 mt-3">
            <Button variant="dark" onClick={() => setRaw(SAMPLE)}><FileText size={15} /> Namuna</Button>
            <Button variant="primary" onClick={analyze} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={15} /> : <Wand2 size={15} />} Tahlil qilish
            </Button>
          </div>
        </div>

        <div>
          {!parsed ? (
            <Card className="p-10 text-center text-slate-500 text-sm">Tahlil natijasi shu yerda chiqadi</Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge color="green"><Shuffle size={11} /> {parsed.questions.length} savol</Badge>
                <Button variant="primary" onClick={saveToDb} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={15} /> : <Database size={15} />}
                  Bazaga saqlash
                </Button>
              </div>
              {parsed.passage && (
                <Card className="p-3"><p className="text-xs text-slate-500 mb-1">Matn</p><p className="arabic text-sm">{parsed.passage}</p></Card>
              )}
              {parsed.questions.map((q, i) => (
                <Card key={i} className="p-3">
                  <p className="text-sm font-semibold mb-2">{i + 1}. {q.text}</p>
                  <div className="space-y-1">
                    {q.options.map((o, j) => (
                      <div key={j} className={`text-xs px-2 py-1 rounded ${j === q.correctIdx ? 'bg-neon/15 text-neon' : 'text-slate-400'}`}>
                        {j === q.correctIdx && <Check size={12} className="inline mr-1" />}{o}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
