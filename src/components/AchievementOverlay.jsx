import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ACHIEVEMENT_BY_ID, RARITY } from '../data/achievements.js'
import { sound } from '../lib/SoundEngine.js'

// Particle burst on a canvas, colored + scaled by rarity.
function ParticleBurst({ rarity }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = (canvas.width = canvas.offsetWidth * dpr)
    const H = (canvas.height = canvas.offsetHeight * dpr)
    const cx = W / 2
    const cy = H / 2

    const counts = { common: 30, rare: 60, epic: 110, legendary: 200 }
    const palette = {
      common: ['#22c55e', '#4ade80', '#86efac'],
      rare: ['#3b82f6', '#60a5fa', '#93c5fd', '#a5f3fc'],
      epic: ['#a855f7', '#c084fc', '#fbbf24', '#f0abfc'],
      legendary: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
    }
    const colors = palette[rarity] || palette.common
    const n = counts[rarity] || 30

    let seed = 12345
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const parts = Array.from({ length: n }, () => {
      const angle = rand() * Math.PI * 2
      const speed = (1.5 + rand() * 5) * dpr
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (2 + rand() * 4) * dpr,
        color: colors[Math.floor(rand() * colors.length)],
        life: 1,
        decay: 0.008 + rand() * 0.012,
      }
    })

    let raf
    const gravity = 0.08 * dpr
    function frame() {
      ctx.clearRect(0, 0, W, H)
      let alive = false
      for (const p of parts) {
        if (p.life <= 0) continue
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy += gravity
        p.vx *= 0.99
        p.life -= p.decay
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (alive) raf = requestAnimationFrame(frame)
    }
    frame()
    return () => cancelAnimationFrame(raf)
  }, [rarity])

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />
}

// Title rendered letter-by-letter with a stagger.
function StaggerTitle({ text }) {
  return (
    <h2 className="text-3xl font-extrabold">
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.05 }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </h2>
  )
}

// Single achievement card overlay. Calls onDismiss when the user dismisses.
function AchievementCard({ id, onDismiss }) {
  const ach = ACHIEVEMENT_BY_ID[id]
  const rarity = RARITY[ach?.rarity] || RARITY.common
  const [showDismiss, setShowDismiss] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (!ach) return
    sound.play(rarity.sound)
    if (ach.rarity === 'epic' || ach.rarity === 'legendary') {
      setShake(true)
      const t = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(t)
    }
  }, [ach, rarity.sound])

  useEffect(() => {
    const dur = { common: 600, rare: 1100, epic: 1600, legendary: 3100 }[ach?.rarity] || 800
    const t = setTimeout(() => setShowDismiss(true), dur)
    return () => clearTimeout(t)
  }, [ach])

  if (!ach) return null
  const legendary = ach.rarity === 'legendary'

  return (
    <motion.div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-6 ${shake ? 'screen-shake' : ''}`}
      style={{ background: legendary ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.85)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ParticleBurst rarity={ach.rarity} />

      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.05 }}
        className="relative w-full max-w-sm rounded-3xl border-2 p-8 text-center font-mono-hans"
        style={{
          background: 'var(--bg-card)',
          borderColor: rarity.color,
          boxShadow: `0 0 40px ${rarity.color}66`,
          color: 'var(--text-primary)',
        }}
      >
        {/* Rarity badge */}
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="mx-auto mb-4 inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest"
          style={{ background: `${rarity.color}22`, color: rarity.color, border: `1px solid ${rarity.color}` }}
        >
          {rarity.label}
        </motion.div>

        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-5xl"
          style={{ background: `${rarity.color}22`, color: rarity.color }}>
          <i className={`ti ${ach.icon}`} />
        </div>

        <StaggerTitle text={ach.title} />
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{ach.desc}</p>

        {/* XP reward floats up */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1], y: -10 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-4 text-lg font-extrabold"
          style={{ color: 'var(--accent)' }}
        >
          +{ach.xpReward} XP
        </motion.div>

        <AnimatePresence>
          {showDismiss && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onDismiss}
              className="mt-6 w-full rounded-xl py-3 font-extrabold uppercase tracking-wide"
              style={{ background: rarity.color, color: '#0a0a0a' }}
            >
              Claim
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// Shows queued achievements one at a time. `queue` is an array of ids.
export default function AchievementOverlay({ queue, onDismiss }) {
  const current = queue && queue.length > 0 ? queue[0] : null
  return (
    <AnimatePresence>
      {current && <AchievementCard key={current} id={current} onDismiss={onDismiss} />}
    </AnimatePresence>
  )
}
