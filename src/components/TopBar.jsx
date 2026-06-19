export default function TopBar({ profile }) {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-duo-line bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 font-extrabold">
        <div className="flex items-center gap-1 text-duo-ink">
          <span className="rounded-lg bg-duo-green px-2 py-0.5 text-sm text-white">DE</span>
          <span className="ml-1 text-sm text-duo-gray">{profile.cefr_level}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-duo-gold" title="Day streak">
            🔥 <span className="text-duo-ink">{profile.streak_days}</span>
          </span>
          <span className="flex items-center gap-1 text-duo-blue" title="Gems">
            💎 <span className="text-duo-ink">{profile.gems}</span>
          </span>
          <span className="flex items-center gap-1 text-duo-red" title="Hearts">
            ❤️ <span className="text-duo-ink">{profile.hearts}</span>
          </span>
        </div>
      </div>
    </header>
  )
}
