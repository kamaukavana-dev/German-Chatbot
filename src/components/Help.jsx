import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../lib/SoundEngine.js'
import { toast } from '../lib/toast.jsx'

const FAQ = [
  ['How does XP work?', 'You earn XP by completing lessons. Correct answers = 10 XP, perfect lesson bonus = +20 XP. XP fills your CEFR level bar.'],
  ['What are streaks?', 'Complete at least one lesson per day to keep your streak alive. Missing a day resets it to zero. Streaks unlock achievements.'],
  ['How do I level up?', 'Earn enough XP to fill your level bar: A1=100, A2=250, B1=500, B2=900, C1=1500. HANS promotes you automatically.'],
  ['What are the CEFR levels?', 'A1=Beginner, A2=Elementary, B1=Intermediate, B2=Upper-Intermediate, C1=Advanced. Each unlocks new grammar topics.'],
  ['How do quests work?', 'Daily quests reset at midnight. Weekly quests reset Monday. Claim your XP reward before the reset or it disappears.'],
  ['Can I practice specific grammar?', 'Yes — open the Guidebook, find your topic, and tap "Practice this" to start a targeted lesson.'],
  ['How do I invite friends?', 'Go to Profile → Friends → Invite. Share your personal link on any platform.'],
  ['What are achievements?', 'Badges you earn for milestones (streaks, XP totals, perfect lessons). Legendary achievements have special full-screen animations.'],
]

const SHORTCUTS = [
  ['Enter', 'Submit answer'],
  ['Esc', 'Skip / hint'],
  ['Ctrl + D', 'Toggle dark mode'],
  ['Ctrl + M', 'Toggle sound'],
]

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <button onClick={() => { sound.play('button_click'); setOpen((v) => !v) }} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{q}</span>
        <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-secondary)' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            <p className="px-4 pb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
        <i className={`ti ti-chevron-${open ? 'down' : 'right'}`} /> {title}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Help({ onClose }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-4 flex items-center gap-3">
        {onClose && (
          <button onClick={onClose} className="text-2xl" style={{ color: 'var(--text-secondary)' }}><i className="ti ti-arrow-left" /></button>
        )}
        <h1 className="text-2xl font-extrabold">Help</h1>
      </div>

      <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>FAQ</div>
      <div className="space-y-2">
        {FAQ.map(([q, a]) => <Accordion key={q} q={q} a={a} />)}
      </div>

      <div className="mt-6">
        <Collapsible title="Keyboard shortcuts">
          <div className="rounded-2xl border-2 p-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            {SHORTCUTS.map(([k, d]) => (
              <div key={k} className="flex items-center justify-between px-2 py-1.5">
                <kbd className="rounded-md px-2 py-0.5 text-xs font-extrabold" style={{ background: 'var(--bg-surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}>{k}</kbd>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{d}</span>
              </div>
            ))}
          </div>
        </Collapsible>
      </div>

      <div className="mt-6 rounded-2xl border-2 p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="text-sm font-extrabold">Having issues? We'd love to help</div>
        <div className="mt-3 space-y-2">
          <a href="mailto:support@hans-app.com" className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--accent)' }}>
            <i className="ti ti-mail" /> support@hans-app.com
          </a>
          <a href="https://discord.gg/hans" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--accent)' }}>
            <i className="ti ti-brand-discord" /> Join our community
          </a>
          <button
            onClick={() => { sound.play('button_click'); window.location.href = 'mailto:support@hans-app.com?subject=HANS%20Bug%20Report&body=Describe%20the%20issue%3A'; toast('Opening your email app…', { icon: 'ti-bug' }) }}
            className="mt-1 w-full rounded-xl border-2 py-2.5 text-sm font-extrabold uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <i className="ti ti-bug" /> Report a bug
          </button>
        </div>
      </div>
    </div>
  )
}
