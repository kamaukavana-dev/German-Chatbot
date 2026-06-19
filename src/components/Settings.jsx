import { useState } from 'react'
import { motion } from 'framer-motion'
import { sound } from '../lib/SoundEngine.js'

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative h-7 w-12 rounded-full transition-colors"
      style={{ background: on ? 'var(--accent)' : 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <motion.span
        layout
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
        style={{ left: on ? 'calc(100% - 22px)' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</span>
      {children}
    </div>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-surface)' }}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className="rounded-lg px-3 py-1 text-xs font-extrabold"
          style={{
            background: value === o.value ? 'var(--accent)' : 'transparent',
            color: value === o.value ? '#03120a' : 'var(--text-secondary)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Settings({ theme, settings, onThemeChange, onSettingsChange, onReset, onClose, onOpenHelp }) {
  const [confirm, setConfirm] = useState(0) // 0 none, 1 first confirm, 2 final

  function patch(p) {
    sound.play('button_click')
    onSettingsChange(p)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="text-2xl" style={{ color: 'var(--text-secondary)' }}>
          <i className="ti ti-arrow-left" />
        </button>
        <h1 className="text-2xl font-extrabold">Settings</h1>
      </div>

      <div className="rounded-2xl border-2 px-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <Row label="Dark mode">
          <Toggle on={theme === 'dark'} onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} />
        </Row>
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        <Row label="Daily XP goal">
          <Segmented
            options={[10, 20, 30, 50].map((v) => ({ value: v, label: String(v) }))}
            value={settings.dailyXPGoal}
            onChange={(v) => patch({ dailyXPGoal: v })}
          />
        </Row>
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        <Row label="Sound effects">
          <Toggle on={settings.soundEnabled} onClick={() => patch({ soundEnabled: !settings.soundEnabled })} />
        </Row>
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        <Row label="Hints">
          <Segmented
            options={[
              { value: 'German only', label: 'DE' },
              { value: 'German + English hints', label: 'DE+EN' },
            ]}
            value={settings.hintLanguage}
            onChange={(v) => patch({ hintLanguage: v })}
          />
        </Row>
      </div>

      {/* Help */}
      <button
        onClick={() => { sound.play('button_click'); onOpenHelp?.() }}
        className="mt-6 flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 font-extrabold"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
      >
        <span><i className="ti ti-help-circle" /> Help &amp; FAQ</span>
        <i className="ti ti-chevron-right" style={{ color: 'var(--text-secondary)' }} />
      </button>

      {/* Reset progress — double confirm */}
      <div className="mt-6 rounded-2xl border-2 p-4" style={{ borderColor: '#ef4444' }}>
        <div className="text-sm font-extrabold" style={{ color: '#ef4444' }}>Danger zone</div>
        {confirm === 0 && (
          <button
            onClick={() => setConfirm(1)}
            className="mt-3 w-full rounded-xl border-2 py-2.5 font-extrabold uppercase"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            Reset all progress
          </button>
        )}
        {confirm === 1 && (
          <div className="mt-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This wipes XP, streaks, achievements and quests. Are you sure?
            </p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setConfirm(0)} className="flex-1 rounded-xl border-2 py-2 font-bold" style={{ borderColor: 'var(--border)' }}>
                Cancel
              </button>
              <button onClick={() => setConfirm(2)} className="flex-1 rounded-xl py-2 font-extrabold text-white" style={{ background: '#ef4444' }}>
                Continue
              </button>
            </div>
          </div>
        )}
        {confirm === 2 && (
          <div className="mt-3">
            <p className="text-sm font-extrabold" style={{ color: '#ef4444' }}>
              Final confirmation — this cannot be undone.
            </p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setConfirm(0)} className="flex-1 rounded-xl border-2 py-2 font-bold" style={{ borderColor: 'var(--border)' }}>
                Keep my data
              </button>
              <button
                onClick={() => { sound.play('wrong_answer'); onReset() }}
                className="flex-1 rounded-xl py-2 font-extrabold text-white"
                style={{ background: '#ef4444' }}
              >
                Erase everything
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
