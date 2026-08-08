import React from 'react'
import { ITEM_TYPE, answerTypeForItem, speakingTimingFor } from '../../lib/examConstants.js'
import GapFillPassage from './GapFillPassage.jsx'
import ExclusiveMatchPart from './ExclusiveMatchPart.jsx'
import StickyPassage from './StickyPassage.jsx'
import McqOptions from './McqOptions.jsx'
import YesNoItem, { YesNoPart } from './YesNoItem.jsx'
import TfngItem from './TfngItem.jsx'
import SpeakingProsCons from './SpeakingProsCons.jsx'
import SpeakingRecorder from '../SpeakingRecorder.jsx'
import ListeningAudioPlayer from './ListeningAudioPlayer.jsx'

function isGapFillPart(part) {
  const items = part?.items || []
  return (
    part?.passageText
    && /\{\{\d+\}\}/.test(part.passageText)
    && items.every((it) => Number(it.itemTypeId) === ITEM_TYPE.GapFill || it.blankIndex != null)
  )
}

function isExclusiveMatchPart(part) {
  const items = part?.items || []
  if (!items.length || !(part.options?.length)) return false
  return items.every((it) => {
    const t = answerTypeForItem(it)
    return t === 'matching' || it.usesExclusiveOptions
  })
}

function isYesNoPart(part) {
  const items = part?.items || []
  return items.length > 0 && items.every((it) => Number(it.itemTypeId) === ITEM_TYPE.YesNo)
}

function hasListeningAudio(part) {
  return Boolean(part?.audioUrl || part?.audioScript)
}

function AudioBlock({ part }) {
  if (!hasListeningAudio(part)) return null
  return (
    <ListeningAudioPlayer
      audioUrl={part.audioUrl}
      audioScript={part.audioScript}
      title="Audio"
      maxPlays={2}
    />
  )
}

/**
 * answers: { [itemId]: answerBody }
 * onAnswer(item, body) — body: selectedOptionId | yesNoValue | tfngValue | audio
 */
export default function ExamPartView({
  part,
  answers,
  disabled,
  onAnswer,
  onClearAnswer,
  speakingExtras,
  fontSize = 22,
}) {
  if (!part) return null
  const items = part.items || []

  if (isGapFillPart(part)) {
    return (
      <div className="space-y-4">
        <AudioBlock part={part} />
        <GapFillPassage
          passageText={part.passageText}
          items={items}
          options={part.options}
          answers={answers}
          disabled={disabled}
          instruction={part.instruction}
          fontSize={fontSize}
          onPick={(item, opt) => onAnswer(item, {
            itemId: item.id,
            answerType: 'matching',
            selectedOptionId: opt.id,
          })}
          onClear={onClearAnswer}
        />
      </div>
    )
  }

  if (isYesNoPart(part)) {
    return (
      <div className="space-y-4">
        <AudioBlock part={part} />
        <YesNoPart
          items={items}
          answers={answers}
          disabled={disabled}
          instruction={part.instruction}
          onAnswer={onAnswer}
        />
      </div>
    )
  }

  if (isExclusiveMatchPart(part)) {
    const layout = part.matchLayout
      || (part.partNumber === 3 || items.length <= 6 ? 'list' : 'grid')
    return (
      <div className="space-y-4">
        <AudioBlock part={part} />
        {/* Part 3 da matn har item ichida — umumiy sticky kerak emas */}
        {part.passageText && !items.some((it) => (it.promptText || '').length > 40) && (
          <StickyPassage text={part.passageText} fontSize={fontSize} />
        )}
        <ExclusiveMatchPart
          items={items}
          options={part.options}
          answers={answers}
          disabled={disabled}
          instruction={part.instruction}
          bankTitle={`A–${part.options[part.options.length - 1]?.label || 'J'}`}
          showBank={part.partNumber !== 3}
          layout={layout}
          fontSize={fontSize}
          onPick={(item, opt) => onAnswer(item, {
            itemId: item.id,
            answerType: 'matching',
            selectedOptionId: opt.id,
          })}
          onClear={onClearAnswer}
        />
      </div>
    )
  }

  // Oddiy / aralash part (MCQ, TFNG, YesNo, Speaking, matn)
  const showPassage = part.passageText && !items.some((i) => Number(i.itemTypeId) === ITEM_TYPE.Speaking)
  // Part 4/5: katta matn savollar bilan birga — sticky qilib doim ko‘rinsin
  const pin = Boolean(part.pinPassage) || Number(part.partNumber) >= 4

  return (
    <div className="space-y-4">
      <AudioBlock part={part} />
      {part.instruction && (
        <div className="rounded-xl border border-neon/30 bg-neon/5 px-3 py-2.5 text-sm text-white/80">
          {part.instruction}
        </div>
      )}

      {showPassage && (
        <div
          className={
            pin
              ? 'sticky top-0 z-30 -mx-1 px-1 pt-1 pb-3 bg-gradient-to-b from-[#05070a] via-[#05070a]/95 to-transparent'
              : ''
          }
        >
          <StickyPassage
            text={part.passageText}
            sticky={pin}
            fontSize={fontSize}
            title="النص"
          />
        </div>
      )}

      {items.map((item) => (
        <ItemView
          key={item.id}
          item={item}
          part={part}
          answered={answers?.[item.id]}
          disabled={disabled}
          onAnswer={onAnswer}
          speakingExtras={speakingExtras}
          fontSize={fontSize}
        />
      ))}
    </div>
  )
}

function ItemView({ item, part, answered, disabled, onAnswer, speakingExtras, fontSize = 18 }) {
  const type = answerTypeForItem(item)

  if (type === 'audio') {
    const timing = speakingTimingFor(item.displayNumber)
    const prep = item.prepTimeSec ?? timing.prep
    const record = item.recordTimeSec ?? timing.record
    return (
      <div className="space-y-2">
        <SpeakingProsCons speakingPrompt={item.speakingPrompt} />
        <SpeakingRecorder
          promptText={item.promptText || 'تَحَدَّثْ'}
          alreadyDone={Boolean(answered)}
          prepSec={prep}
          recordSec={record}
          disabled={disabled}
          onBeforeRecord={speakingExtras?.onBeforeRecord
            ? () => speakingExtras.onBeforeRecord(item)
            : undefined}
          onRecorded={speakingExtras?.onRecorded
            ? (blob) => speakingExtras.onRecorded(item, blob)
            : undefined}
          onComplete={speakingExtras?.onComplete
            ? () => speakingExtras.onComplete(item)
            : () => onAnswer(item, { itemId: item.id, answerType: 'audio' })}
        />
      </div>
    )
  }

  if (type === 'yes_no') {
    return (
      <YesNoItem
        item={item}
        value={answered?.yesNoValue}
        disabled={disabled}
        onSelect={(v) => onAnswer(item, { itemId: item.id, answerType: 'yes_no', yesNoValue: v })}
      />
    )
  }

  if (type === 'tfng') {
    return (
      <TfngItem
        item={item}
        value={answered?.tfngValue}
        disabled={disabled}
        onSelect={(v) => onAnswer(item, { itemId: item.id, answerType: 'tfng', tfngValue: v })}
      />
    )
  }

  const options = item.options || part.options || []
  const answerType = type === 'matching' || item.usesExclusiveOptions ? 'matching' : 'option'
  return (
    <McqOptions
      item={item}
      options={options}
      selectedOptionId={answered?.selectedOptionId}
      disabled={disabled}
      fontSize={fontSize}
      onSelect={(opt) => onAnswer(item, {
        itemId: item.id,
        answerType,
        selectedOptionId: opt.id,
      })}
    />
  )
}
