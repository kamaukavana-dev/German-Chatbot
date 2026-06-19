const TABS = [
  { id: 'home', label: 'Learn', icon: '🏠' },
  { id: 'tutor', label: 'AI Tutor', icon: '🦉' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="sticky bottom-0 z-20 border-t-2 border-duo-line bg-white">
      <div className="mx-auto flex max-w-2xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-extrabold uppercase tracking-wide ${
              active === t.id ? 'text-duo-blue' : 'text-duo-gray'
            }`}
          >
            <span className="text-2xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
