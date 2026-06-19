import Avatar from './Avatar.jsx'
import { sound } from '../lib/SoundEngine.js'

// Top bar: streak (left) · HANS logo (center) · guidebook + tutor + settings + avatar (right).
export default function AppTopBar({ streak = 0, avatarSeed, onOpenSettings, onOpenTutor, onOpenGuide, onOpenProfile }) {
  return (
    <header
      className="sticky top-0 z-30 border-b-2 font-mono-hans"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-1 text-sm font-extrabold" style={{ color: '#f59e0b' }}>
          <i className="ti ti-flame text-lg" />
          <span style={{ color: 'var(--text-primary)' }}>{streak}</span>
        </span>

        <span className="text-lg font-extrabold tracking-tight glow-green" style={{ color: 'var(--accent)' }}>
          HANS
        </span>

        <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
          <button onClick={() => { sound.play('button_click'); onOpenGuide?.() }} title="Guidebook" className="text-xl leading-none transition-colors hover:text-[var(--accent)]">
            <i className="ti ti-notebook" />
          </button>
          <button onClick={() => { sound.play('button_click'); onOpenTutor?.() }} title="AI Tutor" className="text-xl leading-none transition-colors hover:text-[var(--accent)]">
            🦉
          </button>
          <button onClick={() => { sound.play('button_click'); onOpenSettings?.() }} title="Settings" className="text-xl leading-none transition-colors hover:text-[var(--accent)]">
            <i className="ti ti-settings" />
          </button>
          <button onClick={() => { sound.play('button_click'); onOpenProfile?.() }} title="Profile">
            <Avatar seed={avatarSeed} size={28} ring />
          </button>
        </div>
      </div>
    </header>
  )
}
