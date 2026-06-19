import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAILY_QUESTS, WEEKLY_QUESTS, rolloverQuests, questProgress } from '../data/quests.js'
import { sound } from '../lib/SoundEngine.js'

function ConfettiBurst() {
  const bits = Array.from({ length: 24 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280
    const r = seed / 233280
    return {
      id: i,
      x: (r - 0.5) * 240,
      y: -40 - r * 120,
      color: ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444'][i % 5],
      delay: (i % 6) * 0.02,
    }
  })
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute h-2 w-2 rounded-sm"
          style={{ background: b.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: b.x, y: b.y, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.9, delay: b.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function QuestCard({ quest, bucket, claimed, onClaim }) {
  const { value, done } = questProgress(quest, bucket)
  const pct = Math.round((value / quest.goal) * 100)
  const [burst, setBurst] = useState(false)
  const isClaimed = claimed.includes(quest.id)

  function claim() {
    if (!done || isClaimed) return
    setBurst(true)
    sound.play('quest_complete')
    onClaim(quest)
    setTimeout(() => setBurst(false), 1000)
  }

  return (
    <div className="relative rounded-2xl border-2 p-4" style={{ borderColor: done ? 'var(--accent)' : 'var(--border)', background: 'var(--bg-card)' }}>
      {burst && <ConfettiBurst />}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ background: 'var(--bg-surface)', color: 'var(--accent)' }}>
          <i className={`ti ${quest.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{quest.title}</div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-surface)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--accent)' }}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-1 text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
            {value}/{quest.goal}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {isClaimed ? (
            <span className="text-2xl" style={{ color: 'var(--accent)' }}><i className="ti ti-circle-check-filled" /></span>
          ) : done ? (
            <button onClick={claim} className="rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase" style={{ background: 'var(--accent)', color: '#03120a' }}>
              Claim
            </button>
          ) : (
            <span className="rounded-full px-2 py-0.5 text-[11px] font-extrabold" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
              +{quest.reward} XP{quest.badge ? ' +🏅' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Quests({ quests, onClaim }) {
  const q = rolloverQuests(quests)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      <h1 className="text-2xl font-extrabold">Quests</h1>

      <div className="mt-5 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
        <i className="ti ti-clock-hour-4" /> Daily — resets at midnight
      </div>
      <div className="space-y-3">
        {DAILY_QUESTS.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            bucket={q.daily}
            claimed={q.daily.claimed}
            onClaim={(qt) => onClaim('daily', qt)}
          />
        ))}
      </div>

      <div className="mt-7 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
        <i className="ti ti-calendar" /> Weekly — resets Monday
      </div>
      <div className="space-y-3">
        {WEEKLY_QUESTS.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            bucket={q.weekly}
            claimed={q.weekly.claimed}
            onClaim={(qt) => onClaim('weekly', qt)}
          />
        ))}
      </div>
    </div>
  )
}
