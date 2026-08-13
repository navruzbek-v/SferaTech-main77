import React from 'react'
import {
  ChevronLeft, Info, Pause, Volume2, HelpCircle,
  Settings, Eye, ZoomIn, BookOpen, Play,
} from 'lucide-react'

/** eexam / at-Tanal — telefon format, screenshot 1:1 */
export const EE = {
  orange: '#F39200',
  orangeDeep: '#E07E00',
  bg: '#E8E8E8',
  panel: '#FFFFFF',
  toolbar: '#F3F3F3',
  rail: '#FAFAFA',
  white: '#FFFFFF',
  ink: '#2A2A2A',
  muted: '#6B6B6B',
  line: '#C8C8C8',
  select: '#B8D4F0',
  onl: '#22C55E',
  barTrack: '#D8D8D8',
  barSection: '#E85D4C',
}

export function formatHms(ms) {
  if (ms == null || Number.isNaN(ms)) return '00:00:00'
  const total = Math.max(0, Math.floor(Number(ms) / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatMmSs(sec) {
  const t = Math.max(0, Math.floor(Number(sec) || 0))
  const m = Math.floor(t / 60)
  const s = t % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function TimerMini({ ms, barPct, barColor, label }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="flex flex-col items-stretch min-w-0">
        <p className="text-[13px] font-black tabular-nums leading-none tracking-tight text-center" style={{ color: EE.ink }}>
          {formatHms(ms)}
        </p>
        <div className="h-[2.5px] mt-0.5 rounded-full overflow-hidden w-[5.5rem] max-w-full" style={{ background: EE.barTrack }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.max(0, Math.min(100, barPct ?? 0))}%`, background: barColor }}
          />
        </div>
      </div>
      <p className="text-[7px] leading-tight max-w-[2.8rem] text-right shrink-0" dir="rtl" lang="ar" style={{ color: EE.muted }}>
        {label}
      </p>
    </div>
  )
}

function EexamHeader({
  userName,
  photoUrl,
  totalLeftMs,
  sectionLeftMs,
  totalProgress,
  sectionProgress,
  onBack,
}) {
  const totalMs = totalLeftMs != null ? totalLeftMs : sectionLeftMs
  const sectionMs = sectionLeftMs != null ? sectionLeftMs : totalLeftMs

  return (
    <header
      className="shrink-0 border-b"
      style={{
        background: EE.white,
        borderColor: EE.line,
        paddingTop: '0.2rem',
      }}
    >
      <div className="px-1.5 py-1.5 flex items-center gap-1">
        <div className="flex items-center gap-0.5 shrink-0">
          {onBack ? (
            <button type="button" onClick={onBack} className="p-0.5 rounded hover:bg-black/5" style={{ color: EE.muted }} aria-label="Chiqish">
              <ChevronLeft size={17} />
            </button>
          ) : null}
          <span
            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded border text-[9px] font-bold"
            style={{ borderColor: EE.line, color: '#166534', background: '#F7F7F7' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: EE.onl }} />
            ONL
          </span>
          <span
            className="inline-flex items-center px-1 py-0.5 rounded border text-[10px] font-bold"
            style={{ borderColor: EE.orange, color: EE.orange }}
          >
            ع
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-0.5">
          <TimerMini
            ms={totalMs}
            barPct={totalProgress ?? 55}
            barColor={EE.orange}
            label="الوقت الإجمالي"
          />
          <TimerMini
            ms={sectionMs}
            barPct={sectionProgress ?? 30}
            barColor={EE.barSection}
            label="وقت القسم"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <p className="text-[9px] font-bold truncate max-w-[3.2rem] text-right leading-tight" style={{ color: EE.ink }}>
            {userName}
          </p>
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-7 h-7 rounded object-cover border shrink-0" style={{ borderColor: EE.line }} />
          ) : (
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0"
              style={{ background: EE.orange }}
            >
              {(userName || 'U')[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function EexamFooter({ showNext, nextDisabled, onNext, nextLabel }) {
  return (
    <footer
      className="shrink-0 border-t"
      style={{
        background: EE.white,
        borderColor: EE.line,
        paddingBottom: '0.35rem',
      }}
    >
      <div className="px-2 py-1.5 flex items-center justify-between gap-1.5">
        {showNext ? (
          <button
            type="button"
            disabled={nextDisabled}
            onClick={onNext}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[12px] font-bold disabled:opacity-45 active:scale-[0.98] border-2"
            style={{ borderColor: EE.orange, color: EE.orange, background: EE.white }}
            dir="rtl"
          >
            <span className="text-sm leading-none" aria-hidden>«</span>
            {nextLabel}
          </button>
        ) : (
          <span className="w-12" />
        )}

        <p className="text-[13px] font-semibold tracking-wide select-none" style={{ color: '#B0B0B0' }}>
          eexam
        </p>

        <div className="flex items-center gap-1">
          <FootBtn icon={BookOpen} />
          <FootBtn icon={Eye} />
          <FootBtn icon={Settings} />
        </div>
      </div>
    </footer>
  )
}

/**
 * at-Tanal eexam shell — telefon (PhoneFrame 420)
 * mode: 'exam' | 'page'
 */
export default function AttanalEexamShell({
  mode = 'exam',
  layout = 'default',
  userName = 'O‘quvchi',
  userTitle,
  photoUrl,
  skillLabel = '',
  questionIndex = 1,
  questionTotal = 1,
  railLabel,
  totalLeftMs = null,
  sectionLeftMs = null,
  totalProgress,
  sectionProgress,
  questionLeftSec = null,
  questionBudgetSec = 60,
  fontSize = 20,
  onFontSize,
  onBack,
  onNext,
  nextLabel = 'التالي',
  nextDisabled = false,
  showNext = true,
  children,
}) {
  const qProgress = questionTotal > 0 ? Math.min(100, (questionIndex / questionTotal) * 100) : 0
  const totProg = totalProgress != null ? totalProgress : (mode === 'exam' ? Math.max(qProgress, 35) : 0)
  const secProg = sectionProgress != null
    ? sectionProgress
    : (sectionLeftMs != null && totalLeftMs != null && totalLeftMs > 0
      ? Math.min(100, (sectionLeftMs / totalLeftMs) * 100)
      : (mode === 'exam' ? Math.max(20, 100 - qProgress) : 0))
  const circlePct = questionLeftSec != null && questionBudgetSec > 0
    ? Math.max(0, Math.min(100, (questionLeftSec / questionBudgetSec) * 100))
    : null
  const lined = layout === 'grammar' || layout === 'writing' || layout === 'reading'

  return (
    <div
      data-attanal-exam
      className="h-full min-h-0 flex flex-col"
      style={{ background: EE.bg, color: EE.ink }}
      dir="ltr"
    >
      <EexamHeader
        userName={userName}
        photoUrl={photoUrl}
        totalLeftMs={totalLeftMs}
        sectionLeftMs={sectionLeftMs}
        totalProgress={mode === 'exam' || totalLeftMs != null ? totProg : 0}
        sectionProgress={mode === 'exam' || sectionLeftMs != null ? secProg : 0}
        onBack={onBack}
      />

      <div className="flex-1 min-h-0 overflow-hidden px-1.5 py-1.5">
        <div
          className="h-full flex flex-col rounded-lg border overflow-hidden"
          style={{ background: EE.panel, borderColor: EE.line, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          {mode === 'exam' ? (
            <>
              <div className="h-[3px] shrink-0" style={{ background: EE.orange }} />

              <div
                className="shrink-0 flex items-center justify-between gap-1 px-2 py-1.5 border-b"
                style={{ background: EE.toolbar, borderColor: EE.line }}
              >
                <p className="text-[11px] font-bold tabular-nums" dir="rtl" lang="ar" style={{ color: EE.orange }}>
                  السؤال {questionIndex} من {questionTotal}
                </p>
                <div className="flex items-center gap-0.5" style={{ color: EE.orange }}>
                  <ToolIcon icon={Pause} label="Pause" />
                  <ToolIcon icon={Volume2} label="Audio" />
                  <ToolIcon icon={ZoomIn} label="Zoom" />
                  {onFontSize ? (
                    <>
                      <button
                        type="button"
                        aria-label="A-"
                        onClick={() => onFontSize(Math.max(15, fontSize - 2))}
                        className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-black hover:bg-black/5"
                      >
                        A
                      </button>
                      <button
                        type="button"
                        aria-label="A+"
                        onClick={() => onFontSize(Math.min(30, fontSize + 2))}
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black hover:bg-black/5"
                      >
                        AA
                      </button>
                    </>
                  ) : null}
                  <ToolIcon icon={HelpCircle} label="Help" />
                </div>
              </div>

              <div className="flex-1 min-h-0 flex">
                <aside
                  className="w-10 shrink-0 flex flex-col items-center gap-2 py-2 border-r"
                  style={{ background: EE.rail, borderColor: EE.line }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ background: EE.orange }}
                  >
                    <Info size={12} strokeWidth={2.5} />
                  </span>
                  {questionLeftSec != null ? (
                    <div className="relative w-8 h-8">
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#E8E8E8" strokeWidth="2.5" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={EE.orange}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={`${((circlePct ?? 0) / 100) * 88} 88`}
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[8px] font-black tabular-nums"
                        style={{ color: EE.orange }}
                      >
                        {formatMmSs(questionLeftSec)}
                      </span>
                    </div>
                  ) : null}
                  <p
                    className="mt-auto mb-1 text-[8px] font-bold leading-tight text-center"
                    dir="rtl"
                    lang="ar"
                    style={{
                      color: EE.orange,
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      maxHeight: '6.5rem',
                    }}
                  >
                    {railLabel || `السؤال ${questionIndex} من ${questionTotal}`}
                  </p>
                </aside>

                <div
                  className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain"
                  style={{
                    background: EE.white,
                    backgroundImage: lined
                      ? 'repeating-linear-gradient(0deg, transparent, transparent 26px, rgba(0,0,0,0.04) 26px, rgba(0,0,0,0.04) 27px)'
                      : undefined,
                  }}
                >
                  {children}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" style={{ background: EE.white }}>
              {children}
            </div>
          )}
        </div>
      </div>

      <EexamFooter
        showNext={showNext && mode === 'exam'}
        nextDisabled={nextDisabled}
        onNext={onNext}
        nextLabel={nextLabel}
      />
    </div>
  )
}

function ToolIcon({ icon: Icon, label }) {
  return (
    <button type="button" aria-label={label} className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/5">
      <Icon size={13} strokeWidth={2.2} />
    </button>
  )
}

function FootBtn({ icon: Icon }) {
  return (
    <button
      type="button"
      className="w-7 h-7 rounded-md border-2 flex items-center justify-center"
      style={{ borderColor: EE.orange, color: EE.orange }}
    >
      <Icon size={13} strokeWidth={2.2} />
    </button>
  )
}

/** MCQ — RTL, kvadrat orange checkbox */
export function EexamMcq({
  item,
  options,
  selectedOptionId,
  disabled,
  onSelect,
  fontSize = 18,
  hideInstruction = false,
}) {
  const list = options || item?.options || []
  const instruction = item?.subtitle || item?.situationText || null
  const prompt = item?.promptText || 'سؤال'

  return (
    <div className="px-2.5 py-2.5" dir="rtl" lang="ar">
      {!hideInstruction && (
        instruction ? (
          <p
            className="arabic text-[12px] font-semibold mb-2.5 leading-relaxed text-right"
            style={{ color: EE.ink, WebkitTextFillColor: EE.ink }}
          >
            {instruction}
          </p>
        ) : (
          <p className="text-[11px] font-semibold mb-2.5 text-right" style={{ color: EE.muted }} dir="rtl" lang="ar">
            اختر الإجابة الصحيحة:
          </p>
        )
      )}

      <p
        className="arabic font-bold leading-[1.8] mb-3.5 text-right"
        style={{ fontSize: `${fontSize}px`, color: EE.ink, WebkitTextFillColor: EE.ink }}
      >
        {prompt}
      </p>

      <div className="space-y-0.5">
        {list.map((opt) => {
          const selected = selectedOptionId === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt)}
              className="w-full flex items-center gap-2.5 px-2 py-2 text-right transition"
              style={{ background: selected ? EE.select : 'transparent' }}
            >
              <span
                className="arabic flex-1 leading-snug font-medium"
                style={{
                  fontSize: `${Math.max(14, fontSize - 1)}px`,
                  color: EE.ink,
                  WebkitTextFillColor: EE.ink,
                }}
              >
                {opt.text}
              </span>
              <span
                className="shrink-0 w-[16px] h-[16px] border-[2.5px] rounded-[2px] flex items-center justify-center"
                style={{
                  borderColor: EE.orange,
                  background: selected ? EE.orange : EE.white,
                }}
              >
                {selected ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Reading passage — oq fon, RTL */
export function EexamPassage({ text, fontSize = 18 }) {
  if (!text) return null
  return (
    <div className="px-3 py-3 border-b" style={{ borderColor: EE.line }} dir="rtl" lang="ar">
      <p
        className="arabic leading-[1.95] whitespace-pre-wrap text-right"
        style={{ fontSize: `${fontSize}px`, color: EE.ink, WebkitTextFillColor: EE.ink }}
      >
        {text}
      </p>
    </div>
  )
}

/** Listening — orange outline تشغيل */
export function EexamPlayButton({
  playing,
  disabled,
  onClick,
  label = 'تشغيل',
  playsLeft,
  maxPlays,
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-4 px-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border-2 text-sm font-bold disabled:opacity-40 active:scale-[0.98]"
        style={{ borderColor: EE.orange, color: EE.orange, background: EE.white }}
        dir="rtl"
      >
        {playing ? <Pause size={16} /> : <Play size={16} fill={EE.orange} />}
        {playing ? 'إيقاف' : label}
      </button>
      {maxPlays != null && (
        <p className="text-[10px] tabular-nums" style={{ color: EE.muted }}>
          {playsLeft}/{maxPlays}
        </p>
      )}
    </div>
  )
}
