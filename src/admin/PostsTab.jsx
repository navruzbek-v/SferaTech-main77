import React, { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Save, ImagePlus, ExternalLink, Pencil } from 'lucide-react'
import { useApp } from '../App.jsx'
import { Card, Button, Badge } from '../ui.jsx'
import { Head, Toggle } from './parts.jsx'
import * as AdminAPI from '../api/admin.js'
import { resolveMediaUrl } from '../api/posts.js'

const emptyForm = () => ({
  id: null,
  title: '',
  body: '',
  imagePath: '',
  ctaText: '',
  actionTypeId: 1,
  actionPayload: '',
  sortOrder: 10,
  isPublished: true,
  isActive: true,
  startsAt: '',
  endsAt: '',
})

export default function PostsTab() {
  const app = useApp()
  const fileRef = useRef(null)
  const [items, setItems] = useState([])
  const [actionTypes, setActionTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [page, types] = await Promise.all([
        AdminAPI.fetchPosts({ pageSize: 100, activeOnly: false }),
        AdminAPI.fetchPostActionTypes().catch(() => []),
      ])
      setItems(page.items || [])
      setActionTypes(types || [])
    } catch (e) {
      app.notify(e.message || 'Postlar yuklanmadi', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const openNew = () => {
    setForm(emptyForm())
    setEditing(true)
  }

  const openEdit = (p) => {
    setForm({
      id: p.id,
      title: p.title || '',
      body: p.body || '',
      imagePath: p.imagePath || '',
      ctaText: p.ctaText || '',
      actionTypeId: p.actionTypeId ?? 1,
      actionPayload: p.actionPayload || p.url || '',
      sortOrder: p.sortOrder ?? 10,
      isPublished: Boolean(p.isPublished),
      isActive: p.isActive !== false,
      startsAt: p.startsAt ? String(p.startsAt).slice(0, 16) : '',
      endsAt: p.endsAt ? String(p.endsAt).slice(0, 16) : '',
    })
    setEditing(true)
  }

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const meta = await AdminAPI.uploadPostImage(file)
      const path = meta?.relativePath || meta?.RelativePath || meta?.url || meta?.Url
      if (!path) throw new Error('relativePath qaytmadi')
      set('imagePath', String(path).replace(/^\//, ''))
      app.notify('Rasm yuklandi ✓')
    } catch (err) {
      app.notify(err.message || 'Rasm yuklash xatosi', 'error')
    }
  }

  const save = async () => {
    const title = String(form.title || '').trim()
    if (!title || /^[.\-–—_*•·…\s]+$/u.test(title)) {
      app.notify('Title majburiy — haqiqiy matn yozing', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title,
        body: String(form.body || '').trim() || null,
        imagePath: form.imagePath || null,
        ctaText: String(form.ctaText || '').trim() || null,
        actionTypeId: Number(form.actionTypeId) || 1,
        actionPayload: String(form.actionPayload || '').trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: Boolean(form.isPublished),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      }
      if (form.id) {
        await AdminAPI.updatePost({ ...payload, id: form.id, isActive: Boolean(form.isActive) })
        app.notify('Post yangilandi ✓')
      } else {
        await AdminAPI.createPost(payload)
        app.notify('Post yaratildi ✓')
      }
      setEditing(false)
      setForm(emptyForm())
      await load()
    } catch (e) {
      app.notify(e.message || 'Saqlash xatosi', 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Post o‘chirilsinmi?')) return
    try {
      await AdminAPI.deletePost(id)
      app.notify('O‘chirildi')
      await load()
    } catch (e) {
      app.notify(e.message || 'O‘chirish xatosi', 'error')
    }
  }

  const previewUrl = form.imagePath ? resolveMediaUrl(form.imagePath) : null
  const openUrlType = actionTypes.find((t) => /url|link|open/i.test(`${t.code} ${t.nameEn} ${t.nameUz}`))

  return (
    <div>
      <Head
        title="Postlar"
        desc="Mini-app pastki feed: GET /post/getactive. Rasm: /images/uploadcontent (category=posts)."
        right={(
          <Button variant="primary" onClick={openNew}>
            <Plus size={15} /> Yangi post
          </Button>
        )}
      />

      {editing && (
        <Card className="p-4 mb-5 space-y-3 max-w-2xl">
          <p className="font-bold text-sm">{form.id ? `Tahrirlash #${form.id}` : 'Yangi post'}</p>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Sarlavha *"
            className="w-full bg-base border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neon"
          />
          <textarea
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Matn"
            rows={3}
            className="w-full bg-base border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neon resize-y"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="dark" onClick={() => fileRef.current?.click()}>
              <ImagePlus size={15} /> Rasm yuklash
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
            {form.imagePath && (
              <span className="text-xs text-slate-400 truncate max-w-[280px]">{form.imagePath}</span>
            )}
          </div>
          {previewUrl && (
            <img src={previewUrl} alt="" className="max-h-40 rounded-xl border border-line object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={form.ctaText}
              onChange={(e) => set('ctaText', e.target.value)}
              placeholder="CTA matn (Batafsil)"
              className="w-full bg-base border border-line rounded-xl px-3 py-2.5 text-sm"
            />
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
              placeholder="sortOrder"
              className="w-full bg-base border border-line rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={form.actionTypeId}
              onChange={(e) => set('actionTypeId', +e.target.value)}
              className="w-full bg-base border border-line rounded-xl px-3 py-2.5 text-sm"
            >
              {(actionTypes.length ? actionTypes : [
                { id: 1, code: 'None', nameUz: 'Havolasiz' },
                { id: openUrlType?.id || 2, code: 'OpenUrl', nameUz: 'Tashqi havola' },
              ]).map((t) => (
                <option key={t.id} value={t.id}>{t.nameUz || t.code || t.id}</option>
              ))}
            </select>
            <input
              value={form.actionPayload}
              onChange={(e) => set('actionPayload', e.target.value)}
              placeholder="https://t.me/... (actionPayload)"
              className="w-full bg-base border border-line rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Toggle on={form.isPublished} onChange={(v) => set('isPublished', v)} label="Published (feedda)" />
            {form.id != null && (
              <Toggle on={form.isActive} onChange={(v) => set('isActive', v)} label="Active" />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="primary" disabled={saving} onClick={save}>
              <Save size={15} /> {saving ? 'Saqlanmoqda…' : 'Saqlash'}
            </Button>
            <Button variant="dark" onClick={() => { setEditing(false); setForm(emptyForm()) }}>Bekor</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Yuklanmoqda…</p>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {items.map((p) => {
            const img = p.imagePath ? resolveMediaUrl(p.imagePath) : null
            const href = /^https?:\/\//i.test(p.actionPayload || '') ? p.actionPayload : null
            return (
              <Card key={p.id} className="p-3.5 flex gap-3 items-start">
                {img ? (
                  <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover bg-base shrink-0" onError={(e) => { e.currentTarget.style.opacity = '0.2' }} />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-base border border-line shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {p.isPublished ? <Badge color="green">published</Badge> : <Badge color="slate">draft</Badge>}
                    {p.isActive === false && <Badge color="red">inactive</Badge>}
                    <span className="text-[10px] text-slate-500">#{p.id} · order {p.sortOrder}</span>
                  </div>
                  <p className="font-semibold text-sm truncate">{p.title || '—'}</p>
                  {p.body ? <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.body}</p> : null}
                  {href && (
                    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-tg mt-1">
                      <ExternalLink size={12} /> {href}
                    </a>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="dark" className="px-2.5 py-2" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                  <Button variant="danger" className="px-2.5 py-2" onClick={() => remove(p.id)}><Trash2 size={14} /></Button>
                </div>
              </Card>
            )
          })}
          {!items.length && <p className="text-sm text-slate-500">Post yo‘q — «Yangi post» bosing.</p>}
        </div>
      )}
    </div>
  )
}
