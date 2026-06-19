import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tooltipSeen, markTooltipSeen } from '../data/store.js'
import { sound } from '../lib/SoundEngine.js'

// A pulsing blue dot anchored to a UI element. On click it reveals a tooltip
// explaining the element; "Got it" dismisses + persists to hans_settings.
// `id` must be unique per element; `placement` positions the popover.
export default function TutorialTip({ id, text, placement = 'bottom', className = '', style = {} }) {
  const [seen, setSeen] = useState(() => tooltipSeen(id))
  const [open, setOpen] = useState(false)
  if (seen) return null

  function dismiss() {
    sound.play('button_click')
    markTooltipSeen(id)
    setSeen(true)
    setOpen(false)
  }

  const pos = {
    bottom: 'top-5 left-1/2 -translate-x-1/2',
    top: 'bottom-5 left-1/2 -translate-x-1/2',
    left: 'right-5 top-1/2 -translate-y-1/2',
    right: 'left-5 top-1/2 -translate-y-1/2',
  }[placement]

  return (
    <span className={`absolute z-50 ${className}`} style={style}>
      <button
        onClick={() => { sound.play('button_click'); setOpen((v) => !v) }}
        className="tip-dot block h-3 w-3 rounded-full"
        style={{ background: '#3b82f6' }}
        aria-label="Tutorial hint"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute ${pos} w-52 rounded-xl border p-3 text-left shadow-xl`}
            style={{ background: 'var(--bg-card)', borderColor: '#3b82f6', color: 'var(--text-primary)' }}
          >
            <p className="text-xs font-bold">{text}</p>
            <button onClick={dismiss} className="mt-2 w-full rounded-lg py-1.5 text-xs font-extrabold uppercase" style={{ background: '#3b82f6', color: '#fff' }}>
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
