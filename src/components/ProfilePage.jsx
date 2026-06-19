import { useState } from 'react'
import { motion } from 'framer-motion'
import { getAvatarUrl, getAvatarBackground, AVATAR_SEEDS } from '../lib/avatar.js'
import Avatar from './Avatar.jsx'
import { ACHIEVEMENT_BY_ID, RARITY } from '../data/achievements.js'
import { todayISODate } from '../data/store.js'
import { XP_THRESHOLDS } from '../engine.js'
import { sound } from '../lib/SoundEngine.js'
import ShareInvite from './ShareInvite.jsx'

// Build an array of the last 30 ISO date strings, oldest first.
function last30Days() {
  const out = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push(todayISODate(d))
  }
  return out
}

export default function ProfilePage({ user, profile, activity, achievements, onLogout, onEditUser, onOpenFriends }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.username)
  const [seed, setSeed] = useState(user.avatarSeed)

  const activeSet = new Set(activity || [])
  const days = last30Days()

  const xpInLevel = profile.xp
  const xpNeeded = profile.xp_to_next_level || XP_THRESHOLDS[profile.cefr_level] || 100
  const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  const stats = [
    { label: 'Total XP', value: user.totalXP || 0, icon: 'ti-bolt' },
    { label: 'Streak', value: user.streak || 0, icon: 'ti-flame' },
    { label: 'Days Active', value: (activity || []).length, icon: 'ti-calendar' },
    { label: 'Lessons', value: profile.completedLessons.length, icon: 'ti-book' },
  ]

  const recent = [...(achievements || [])]
    .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
    .slice(0, 3)
    .map((a) => ({ ...ACHIEVEMENT_BY_ID[a.id], unlockedAt: a.unlockedAt }))
    .filter((a) => a.id)

  function saveEdit() {
    if (!name.trim() || !seed) return
    sound.play('button_click')
    onEditUser({ username: name.trim(), avatarSeed: seed })
    setEditing(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar seed={user.avatarSeed} size={80} ring />
        <div className="min-w-0">
          <div className="truncate text-2xl font-extrabold">{user.username}</div>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-widest"
            style={{ background: 'var(--accent)', color: '#03120a' }}
          >
            {profile.cefr_level}
          </span>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="ml-auto rounded-xl border-2 px-3 py-2 text-sm font-bold"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <i className="ti ti-edit" /> Edit
        </button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="mt-4 rounded-2xl border-2 p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full rounded-xl border-2 bg-transparent px-3 py-2 font-bold outline-none focus:border-[var(--accent)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <div className="mt-3 grid grid-cols-6 gap-2">
            {AVATAR_SEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSeed(s)}
                className="aspect-square overflow-hidden rounded-full border-2"
                style={{ borderColor: seed === s ? 'var(--accent)' : 'var(--border)', background: getAvatarBackground(s) }}
              >
                <img src={getAvatarUrl(s)} alt={s} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          <button
            onClick={saveEdit}
            className="mt-3 w-full rounded-xl py-2.5 font-extrabold uppercase"
            style={{ background: 'var(--accent)', color: '#03120a' }}
          >
            Save
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border-2 p-3 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            <i className={`ti ${s.icon} text-lg`} style={{ color: 'var(--accent)' }} />
            <div className="text-xl font-extrabold">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* XP progress toward next level */}
      <div className="mt-6">
        <div className="mb-1 flex justify-between text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
          <span>Progress to next level</span>
          <span>{xpInLevel}/{xpNeeded} XP</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full" style={{ background: 'var(--bg-surface)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Streak calendar — last 30 days */}
      <div className="mt-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Last 30 days
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {days.map((d) => {
            const active = activeSet.has(d)
            return (
              <div
                key={d}
                title={d}
                className="aspect-square rounded-md"
                style={{ background: active ? 'var(--accent)' : 'var(--bg-surface)', border: '1px solid var(--border)' }}
              />
            )
          })}
        </div>
      </div>

      {/* Achievement showcase */}
      <div className="mt-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Recent achievements
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed p-4 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            No achievements yet — complete a lesson to start earning.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {recent.map((a) => {
              const rarity = RARITY[a.rarity] || RARITY.common
              return (
                <div key={a.id} className="rounded-2xl border-2 p-3 text-center" style={{ borderColor: rarity.color, background: 'var(--bg-card)' }}>
                  <i className={`ti ${a.icon} text-2xl`} style={{ color: rarity.color }} />
                  <div className="mt-1 truncate text-xs font-extrabold">{a.title}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Friends entry */}
      <button
        onClick={() => { sound.play('button_click'); onOpenFriends?.() }}
        className="mt-6 flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 font-extrabold"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
      >
        <span><i className="ti ti-users" /> Friends</span>
        <i className="ti ti-chevron-right" style={{ color: 'var(--text-secondary)' }} />
      </button>

      {/* Friend invites */}
      <div className="mt-4">
        <ShareInvite username={user.username} />
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          if (window.confirm('Log out? Your progress stays on this device.')) onLogout()
        }}
        className="mt-6 w-full rounded-2xl border-2 py-3 font-extrabold uppercase tracking-wide"
        style={{ borderColor: '#ef4444', color: '#ef4444' }}
      >
        <i className="ti ti-logout" /> Logout
      </button>
    </div>
  )
}
