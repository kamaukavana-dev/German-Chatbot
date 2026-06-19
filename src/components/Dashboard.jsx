import { motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { ACHIEVEMENT_BY_ID, RARITY } from '../data/achievements.js'
import { DAILY_QUESTS, rolloverQuests, questProgress } from '../data/quests.js'
import { proverbOfDay } from '../data/proverbs.js'
import { todayISODate } from '../data/store.js'
import { sound } from '../lib/SoundEngine.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

// Circular progress ring (SVG). value/max → animated stroke.
function ProgressRing({ value, max, size = 92 }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-surface)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{Math.round(pct * 100)}%</span>
        <span className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>{value}/{max} XP</span>
      </div>
    </div>
  )
}

function last7() {
  const out = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push({ iso: todayISODate(d), label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] })
  }
  return out
}

export default function Dashboard({ user, profile, activity, achievements, quests, leaderboard, dailyGoal = 20, onGoLearn, onGoQuests, onGoLeaderboard, onGoAchievements }) {
  const q = rolloverQuests(quests)
  const todayXP = q.daily.xp || 0
  const goalXP = dailyGoal || 20 // ring reflects today's XP toward the user's daily goal

  // 7-day chart: estimate per-day XP. We only persist activity dates + today's
  // quest XP, so show today precisely and a light bar for other active days.
  const activeSet = new Set(activity || [])
  const today = todayISODate()
  const days = last7().map((d) => ({
    ...d,
    isToday: d.iso === today,
    xp: d.iso === today ? todayXP : activeSet.has(d.iso) ? 30 : 0,
  }))
  const maxXP = Math.max(50, ...days.map((d) => d.xp))

  const proverb = proverbOfDay(today)

  const ranked = [...leaderboard, { username: user.username, xp: q.weekly.xp || 0, avatar: user.avatarSeed }]
    .sort((a, b) => b.xp - a.xp)
  const myRank = ranked.findIndex((e) => e.username === user.username) + 1
  const top3 = ranked.slice(0, 3)

  const recentAch = [...(achievements || [])]
    .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
    .slice(0, 3)
    .map((a) => ACHIEVEMENT_BY_ID[a.id])
    .filter(Boolean)

  const unclaimedDaily = DAILY_QUESTS
    .map((quest) => ({ quest, ...questProgress(quest, q.daily), claimed: q.daily.claimed.includes(quest.id) }))
    .filter((x) => !x.claimed)
    .slice(0, 3)

  const stats = [
    { label: 'Total XP', value: user.totalXP || 0, icon: 'ti-coin', color: '#f59e0b' },
    { label: 'Streak', value: user.streak || 0, icon: 'ti-flame', color: '#fb923c' },
    { label: 'Lessons', value: profile.completedLessons.length, icon: 'ti-book', color: '#3b82f6' },
    { label: 'Rank', value: `#${myRank}`, icon: 'ti-trophy', color: '#ffd700' },
  ]

  return (
    <div className="relative min-h-full overflow-hidden font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      {/* Orbiting gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-a" style={{ top: '-60px', left: '-40px', width: 240, height: 240, background: '#22c55e' }} />
        <div className="orb orb-b" style={{ top: '180px', right: '-60px', width: 220, height: 220, background: '#a855f7' }} />
        <div className="orb orb-c" style={{ bottom: '40px', left: '20px', width: 200, height: 200, background: '#3b82f6' }} />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-6">
        {/* 1. Hero greeting */}
        <div className="flex items-center gap-4">
          <div className="relative" style={{ width: 72, height: 72 }}>
            <div className="avatar-ring absolute inset-0 rounded-full" />
            <div className="absolute inset-[3px] rounded-full" style={{ background: 'var(--bg-primary)' }}>
              <Avatar seed={user.avatarSeed} size={66} className="absolute inset-[3px]" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl font-extrabold">{greeting()} {user.username}!</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase" style={{ background: 'var(--accent)', color: '#03120a' }}>{profile.cefr_level}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Keep going, you're doing great</span>
            </div>
          </div>
          <ProgressRing value={todayXP} max={goalXP} />
        </div>

        {/* streak emphasis */}
        <motion.div
          animate={(user.streak || 0) > 0 ? { scale: [1, 1.04, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="mt-3 flex items-center gap-2 text-sm font-extrabold"
          style={{ color: '#fb923c' }}
        >
          <i className="ti ti-flame text-xl" /> {user.streak || 0} day streak 🔥
        </motion.div>

        {/* 2. Stats cards */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[88px] flex-1 rounded-2xl border-2 p-3 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              <i className={`ti ${s.icon} text-lg`} style={{ color: s.color }} />
              <div className="text-lg font-extrabold">{s.value}</div>
              <div className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 3. XP history chart */}
        <Section title="Your XP this week">
          <div className="flex h-32 items-end justify-between gap-2 rounded-2xl border-2 p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            {days.map((d, i) => (
              <div key={d.iso} className="flex flex-1 flex-col items-center justify-end gap-1">
                <motion.div
                  className="w-full rounded-t-md"
                  style={{ background: d.isToday ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 35%, var(--bg-surface))' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (d.xp / maxXP) * 90)}px` }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                />
                <span className="text-[9px] font-bold" style={{ color: d.isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Active quests preview */}
        <Section title="Active quests" action="View all quests →" onAction={onGoQuests}>
          {unclaimedDaily.length === 0 ? (
            <Card><div className="py-2 text-center text-sm font-bold">All done for today! 🎉</div></Card>
          ) : (
            <div className="space-y-2">
              {unclaimedDaily.map(({ quest, value, done }) => (
                <Card key={quest.id}>
                  <div className="flex items-center gap-3">
                    <i className={`ti ${quest.icon} text-lg`} style={{ color: 'var(--accent)' }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-extrabold">{quest.title}</div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-surface)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(value / quest.goal) * 100}%`, background: 'var(--accent)' }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold" style={{ color: done ? 'var(--accent)' : 'var(--text-secondary)' }}>{value}/{quest.goal}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>

        {/* 5. Recent achievements */}
        <Section title="Recent achievements" action="View all →" onAction={onGoAchievements}>
          {recentAch.length === 0 ? (
            <Card><div className="py-2 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>Complete your first lesson to earn achievements</div></Card>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentAch.map((a) => {
                const r = RARITY[a.rarity] || RARITY.common
                return (
                  <div key={a.id} className="flex min-w-[80px] flex-col items-center rounded-2xl border-2 p-3" style={{ borderColor: r.color, background: 'var(--bg-card)', boxShadow: `0 0 14px ${r.color}44` }}>
                    <i className={`ti ${a.icon} text-2xl`} style={{ color: r.color }} />
                    <div className="mt-1 truncate text-[10px] font-extrabold">{a.title}</div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* 6. Leaderboard preview */}
        <Section title="Leaderboard" action="View full leaderboard →" onAction={onGoLeaderboard}>
          <Card>
            <div className="space-y-2">
              {top3.map((e, i) => {
                const you = e.username === user.username
                return (
                  <div key={e.username} className="flex items-center gap-3">
                    <span className="w-4 text-center text-sm font-extrabold" style={{ color: ['#ffd700', '#c0c0c0', '#cd7f32'][i] }}>{i + 1}</span>
                    <Avatar seed={e.avatar || e.username} size={28} />
                    <span className="min-w-0 flex-1 truncate text-xs font-extrabold" style={{ color: you ? 'var(--accent)' : 'var(--text-primary)' }}>{you ? 'YOU' : e.username}</span>
                    <span className="text-xs font-extrabold">{e.xp}</span>
                  </div>
                )
              })}
              {myRank > 3 && (
                <div className="flex items-center gap-3 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                  <span className="w-4 text-center text-sm font-extrabold" style={{ color: 'var(--accent)' }}>{myRank}</span>
                  <Avatar seed={user.avatarSeed} size={28} />
                  <span className="min-w-0 flex-1 truncate text-xs font-extrabold" style={{ color: 'var(--accent)' }}>YOU</span>
                  <span className="text-xs font-extrabold">{q.weekly.xp || 0}</span>
                </div>
              )}
            </div>
          </Card>
        </Section>

        {/* 7. Proverb */}
        <Section title="Sprichwort des Tages">
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--accent)' }}>
            <div className="text-lg font-bold italic">{proverb[0]}</div>
            <div className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{proverb[1]}</div>
          </div>
        </Section>

        {/* 8. Continue learning CTA */}
        <button
          onClick={() => { sound.play('button_click'); onGoLearn() }}
          className="shimmer pulse-border mt-6 w-full rounded-2xl py-4 text-lg font-extrabold uppercase tracking-wide"
          style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)', color: '#03120a' }}
        >
          Weiter lernen →
        </button>
      </div>
    </div>
  )
}

function Section({ title, action, onAction, children }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{title}</h2>
        {action && (
          <button onClick={onAction} className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>{action}</button>
        )}
      </div>
      {children}
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="rounded-2xl border-2 p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      {children}
    </div>
  )
}
