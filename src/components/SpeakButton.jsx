import { useState } from 'react'
import { speak, supportsTTS } from '../lib/speech.js'

// Small reusable speaker button that reads German text aloud.
export default function SpeakButton({ text, size = 'md', className = '' }) {
  const [active, setActive] = useState(false)
  if (!supportsTTS() || !text) return null

  const dim = size === 'sm' ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setActive(true)
        speak(text, { onend: () => setActive(false) })
      }}
      aria-label="Listen in German"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${dim} ${
        active
          ? 'border-duo-blue bg-duo-blue text-white'
          : 'border-duo-line bg-white text-duo-blue hover:border-duo-blue'
      } ${className}`}
    >
      🔊
    </button>
  )
}
