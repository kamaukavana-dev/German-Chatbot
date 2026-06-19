import { defaultProfile } from '../data/profile.js'

export default function Profile({ profile, onReset }) {
  const stats = [
    { icon: '🔥', label: 'Day streak', value: profile.streak_days, color: 'text-duo-gold' },
    { icon: '💎', label: 'Gems', value: profile.gems, color: 'text-duo-blue' },
    { icon: '⭐', label: 'XP (level)', value: profile.xp, color: 'text-duo-green' },
    {
      icon: '📚',
      label: 'Lessons done',
      value: profile.completedLessons.length,
      color: 'text-duo-purple',
    },
  ]
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-duo-green text-4xl">
          🦉
        </div>
        <div>
          <div className="text-2xl font-extrabold text-duo-ink">
            {profile.name || 'Sprachschüler'}
          </div>
          <div className="font-bold text-duo-gray">
            Level {profile.cefr_level} · {profile.xp}/{profile.xp_to_next_level} XP
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border-2 border-duo-line p-4">
            <div className="text-2xl">{s.icon}</div>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-duo-gray">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (window.confirm('Reset all progress?')) onReset(defaultProfile())
        }}
        className="mt-8 w-full rounded-2xl border-2 border-duo-line py-3 font-extrabold uppercase tracking-wide text-duo-red"
      >
        Reset progress
      </button>
    </div>
  )
}
