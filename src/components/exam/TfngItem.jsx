import React from 'react'
import { Card } from '../../ui.jsx'
import { TFNG_OPTIONS } from '../../lib/examConstants.js'

export default function TfngItem({ item, value, disabled, onSelect }) {
  return (
    <Card className="p-4">
      <p className="arabic q-text font-semibold text-sm mb-3 leading-relaxed">
        {item.displayNumber != null ? `${item.displayNumber}. ` : ''}
        {item.promptText}
      </p>
      <div className="space-y-2">
        {TFNG_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(o.value)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm ${
              value === o.value ? 'border-neon bg-neon/10 text-neon' : 'border-line bg-cardhi'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Card>
  )
}
