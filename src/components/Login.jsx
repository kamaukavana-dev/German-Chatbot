import { useState } from 'react'
import { motion } from 'framer-motion'
import { AVATAR_SEEDS, getAvatarUrl, getAvatarBackground } from '../lib/avatar.js'
import { sound } from '../lib/SoundEngine.js'
import { toast } from '../lib/toast.jsx'
import ParticleField from './ParticleField.jsx'

const SOCIALS = [
  { name: 'Google', icon: 'ti-brand-google', color: '#ea4335' },
  { name: 'Apple', icon: 'ti-brand-apple', color: '#ffffff' },
  { name: 'GitHub', icon: 'ti-brand-github', color: '#ffffff' },
]

// Cinematic full-screen local auth: particle field + glass card + anime avatars.
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [avatarSeed, setAvatarSeed] = useState('')
  const [loading, setLoading] = useState(false)

  const canStart = username.trim().length > 0 && avatarSeed !== ''
  // Live preview: once an avatar is picked, its face tracks the typed username.
  const previewSeed = avatarSeed && username.trim() ? username.trim() : avatarSeed

  function submit() {
    if (!canStart || loading) return
    sound.play('level_up')
    setLoading(true)
    const now = new Date()
    const user = {
      username: username.trim(),
      avatarSeed,
      joinDate: now.toISOString(),
      totalXP: 0,
      currentLevel: 'A1',
      streak: 0,
      lastActiveDate: now.toISOString().slice(0, 10),
      referrals: 0,
      lessonsCompleted: 0,
    }
    // Brief morph-to-spinner then transition out.
    setTimeout(() => onLogin(user), 650)
  }

  return (
    <motion.div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-10 font-mono-hans"
      style={{ background: '#030712', color: 'var(--text-primary)' }}
      animate={loading ? { scale: 1.05, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <ParticleField count={80} />

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }}
        className="glass relative z-10 w-full max-w-md rounded-3xl p-7"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="glow-pulse text-5xl font-extrabold tracking-tight" style={{ color: '#22c55e' }}>
            HANS
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-2 text-sm font-bold"
            style={{ color: 'var(--text-secondary)' }}
          >
            Meister dein Deutsch
          </motion.div>
        </motion.div>

        {/* Avatar grid */}
        <div className="mt-7 grid grid-cols-4 justify-items-center gap-3">
          {AVATAR_SEEDS.map((seed, i) => {
            const selected = avatarSeed === seed
            const shownSeed = selected ? previewSeed : seed
            return (
              <motion.button
                key={seed}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 + i * 0.04 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => {
                  sound.play('button_click')
                  setAvatarSeed(seed)
                }}
                className="relative h-[60px] w-[60px] overflow-hidden rounded-full transition-all duration-200"
                style={{
                  background: getAvatarBackground(seed),
                  border: selected ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: selected ? '0 0 20px rgba(34,197,94,0.6)' : 'none',
                  filter: selected ? 'grayscale(0%)' : 'grayscale(80%)',
                  transform: selected ? 'scale(1.15)' : 'scale(1.0)',
                }}
              >
                <img src={getAvatarUrl(shownSeed)} alt={seed} className="h-full w-full object-cover" loading="lazy" />
              </motion.button>
            )
          })}
        </div>

        {/* Username */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6"
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            maxLength={20}
            placeholder="Wie heißt du?"
            className="w-full rounded-xl border bg-black/20 px-4 py-3 text-lg font-bold outline-none transition-shadow focus:border-[#22c55e] focus:shadow-[0_0_16px_rgba(34,197,94,0.4)]"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text-primary)' }}
            autoFocus
          />
          <div className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Your name in the HANS community
          </div>
        </motion.div>

        {/* Submit */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          onClick={submit}
          disabled={!canStart || loading}
          className={`relative mt-5 flex w-full items-center justify-center rounded-xl py-4 text-lg font-extrabold uppercase tracking-wide ${
            canStart && !loading ? 'shimmer' : 'cursor-not-allowed'
          }`}
          style={{
            background: canStart ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.1)',
            color: canStart ? '#03120a' : 'var(--text-secondary)',
            opacity: canStart ? 1 : 0.3,
          }}
        >
          {loading ? (
            <motion.i className="ti ti-loader-2" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
          ) : (
            'Jetzt starten →'
          )}
        </motion.button>

        {/* Social login (visual only) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
            or join with
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>
          <div className="mt-3 flex justify-center gap-3">
            {SOCIALS.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  sound.play('button_click')
                  toast('Social login coming soon!', { icon: 'ti-info-circle' })
                }}
                className="glass flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-shadow hover:shadow-[0_0_16px_currentColor]"
                style={{ color: s.color }}
                title={s.name}
              >
                <i className={`ti ${s.icon}`} />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
