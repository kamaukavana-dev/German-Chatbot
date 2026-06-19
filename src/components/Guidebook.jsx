import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GUIDEBOOK, GUIDEBOOK_LEVELS } from '../data/guidebook.js'
import { sound } from '../lib/SoundEngine.js'

function Card({ topic, level, onPractice }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <button
        onClick={() => { sound.play('button_click'); setOpen((v) => !v) }}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
          <span className="mr-2 rounded px-1.5 py-0.5 text-[10px] font-extrabold" style={{ background: 'var(--bg-surface)', color: 'var(--accent)' }}>{level}</span>
          {topic.title}
        </span>
        <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-secondary)' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{topic.rule}</p>
              <div className="mt-3 space-y-1">
                {topic.examples.map((ex, i) => (
                  <div key={i} className="text-sm"><span style={{ color: 'var(--accent)' }}>✓</span> {ex}</div>
                ))}
                <div className="text-sm"><span style={{ color: '#ef4444' }}>✗ Common mistake:</span> {topic.mistake}</div>
              </div>
              <button
                onClick={() => onPractice(topic, level)}
                className="mt-3 rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase"
                style={{ background: 'var(--accent)', color: '#03120a' }}
              >
                Practice this
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Guidebook({ onPractice }) {
  const [level, setLevel] = useState('A1')
  const [query, setQuery] = useState('')

  // When searching, filter across ALL levels; otherwise show the active tab.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GUIDEBOOK[level].map((t) => ({ level, topic: t }))
    const all = []
    for (const lv of GUIDEBOOK_LEVELS) {
      for (const t of GUIDEBOOK[lv]) {
        const hay = `${t.title} ${t.rule} ${t.examples.join(' ')} ${t.mistake}`.toLowerCase()
        if (hay.includes(q)) all.push({ level: lv, topic: t })
      }
    }
    return all
  }, [level, query])

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      <h1 className="text-2xl font-extrabold">Guidebook</h1>

      {/* Search */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border-2 px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <i className="ti ti-search" style={{ color: 'var(--text-secondary)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all levels…"
          className="w-full bg-transparent text-sm font-bold outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ color: 'var(--text-secondary)' }}><i className="ti ti-x" /></button>
        )}
      </div>

      {/* Tabs (hidden while searching) */}
      {!query && (
        <div className="mt-4 flex gap-2">
          {GUIDEBOOK_LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => { sound.play('button_click'); setLevel(lv) }}
              className="flex-1 rounded-xl py-2 text-sm font-extrabold"
              style={{
                background: level === lv ? 'var(--accent)' : 'var(--bg-card)',
                color: level === lv ? '#03120a' : 'var(--text-secondary)',
                border: `2px solid ${level === lv ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {lv}
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className="mt-4 space-y-2">
        {results.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            No topics match “{query}”.
          </div>
        ) : (
          results.map(({ level: lv, topic }) => (
            <Card key={topic.id} topic={topic} level={lv} onPractice={onPractice} />
          ))
        )}
      </div>
    </div>
  )
}
