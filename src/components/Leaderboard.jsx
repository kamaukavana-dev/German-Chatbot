import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { nextMondayDate } from '../data/store.js'

// Deterministic "vs last week" rank delta from a seed (mocked, stable per name).
function mockDelta(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 97
  return (h % 7) - 3 // -3..+3
}

function Countdown() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  const target = nextMondayDate(now)
  const diff = Math.max(0, target - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return (
    <span className="font-mono-hans text-sm font-extrabold" style={{ color: 'var(--accent)' }}>
      {d}d {h}h {m}m
    </span>
  )
}

function Delta({ value }) {
  if (value === 0) return <span style={{ color: 'var(--text-secondary)' }}>–</span>
  const up = value > 0
  return (
    <span className="text-xs font-extrabold" style={{ color: up ? '#22c55e' : '#ef4444' }}>
      {up ? '▲' : '▼'}{Math.abs(value)}
    </span>
  )
}

const CROWN = { 0: '#ffd700', 1: '#c0c0c0', 2: '#cd7f32' }
const PODIUM_H = { 0: 'h-28', 1: 'h-20', 2: 'h-16' }

export default function Leaderboard({ entries, currentUsername }) {
  // entries: merged + sorted desc by xp, each {username, xp, avatar, isBot}
  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1, you: e.username === currentUsername }))
  const top3 = ranked.slice(0, 3)
  const rest = ranked.slice(3, 10)
  const me = ranked.find((e) => e.you)
  const meOutside = me && me.rank > 10

  // Podium display order: 2nd, 1st, 3rd (tallest center). Animate 1st last.
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Leaderboard</h1>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Resets in</div>
          <Countdown />
        </div>
      </div>

      {/* Podium */}
      <div className="mt-6 flex items-end justify-center gap-3">
        {podiumOrder.map((e) => {
          const place = e.rank - 1 // 0,1,2
          const isFirst = place === 0
          return (
            <motion.div
              key={e.username}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: isFirst ? 0.35 : place === 1 ? 0.1 : 0.2 }}
              className="flex w-1/4 flex-col items-center"
            >
              <i className="ti ti-crown text-2xl" style={{ color: CROWN[place] }} />
              <div className="my-1">
                <Avatar seed={e.avatar || e.username} size={48} style={{ boxShadow: `0 0 0 2px ${CROWN[place]}` }} />
              </div>
              <div className="max-w-full truncate text-xs font-extrabold" style={{ color: e.you ? 'var(--accent)' : 'var(--text-primary)' }}>
                {e.you ? 'YOU' : e.username}
              </div>
              <div className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>{e.xp} XP</div>
              <div className={`mt-1 w-full rounded-t-lg ${PODIUM_H[place]}`} style={{ background: `${CROWN[place]}33`, borderTop: `3px solid ${CROWN[place]}` }} />
            </motion.div>
          )
        })}
      </div>

      {/* Rows 4-10 */}
      <div className="mt-6 space-y-2">
        {rest.map((e, i) => (
          <Row key={e.username} e={e} index={i} />
        ))}
      </div>

      {/* User outside top 10 */}
      {meOutside && (
        <>
          <div className="my-2 text-center text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>• • •</div>
          <Row e={me} index={0} highlight />
        </>
      )}
    </div>
  )
}

function Row({ e, index, highlight }) {
  const maxXp = 400
  const pct = Math.min(100, Math.round((e.xp / maxXp) * 100))
  const isYou = e.you || highlight
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5"
      style={{
        borderColor: isYou ? 'var(--accent)' : 'var(--border)',
        background: isYou ? 'color-mix(in srgb, var(--accent) 12%, var(--bg-card))' : 'var(--bg-card)',
      }}
    >
      <div className="w-6 text-center text-sm font-extrabold" style={{ color: 'var(--text-secondary)' }}>{e.rank}</div>
      <Avatar seed={e.avatar || e.username} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-extrabold" style={{ color: isYou ? 'var(--accent)' : 'var(--text-primary)' }}>
            {e.username}
          </span>
          {isYou && (
            <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold" style={{ background: 'var(--accent)', color: '#03120a' }}>YOU</span>
          )}
          <Delta value={mockDelta(e.username)} />
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-surface)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'var(--accent)' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
        </div>
      </div>
      <div className="shrink-0 text-sm font-extrabold">{e.xp}</div>
    </motion.div>
  )
}
