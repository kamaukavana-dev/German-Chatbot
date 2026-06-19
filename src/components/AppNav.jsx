import { motion } from 'framer-motion'
import { sound } from '../lib/SoundEngine.js'

const TABS = [
  { id: 'home', label: 'Home', icon: 'ti-home' },
  { id: 'learn', label: 'Learn', icon: 'ti-book' },
  { id: 'quests', label: 'Quests', icon: 'ti-target' },
  { id: 'leaderboard', label: 'Ranks', icon: 'ti-trophy' },
  { id: 'profile', label: 'Profile', icon: 'ti-user' },
]

// Persistent bottom navigation. `questBadge` shows an unread dot on Quests when
// there are unclaimed completed quests.
export default function AppNav({ active, onChange, questBadge = false }) {
  return (
    <nav
      className="sticky bottom-0 z-30 border-t-2"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex max-w-2xl">
        {TABS.map((t) => {
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => {
                sound.play('button_click')
                onChange(t.id)
              }}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute top-0 h-0.5 w-8 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative text-2xl leading-none">
                <i className={`ti ${t.icon}`} />
                {t.id === 'quests' && questBadge && (
                  <span
                    className="absolute -right-1.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2"
                    style={{ background: '#ef4444', ['--tw-ring-color']: 'var(--bg-surface)' }}
                  />
                )}
              </span>
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
