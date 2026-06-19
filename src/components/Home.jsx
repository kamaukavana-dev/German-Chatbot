import { motion } from 'framer-motion'
import { PATH, LESSON_ORDER } from '../data/curriculum.js'
import Mascot3D from './Mascot3D.jsx'

// Determine each node's state from the profile.
function nodeState(node, profile) {
  if (node.kind === 'placement') {
    return profile.placementDone ? 'done' : 'active'
  }
  if (node.comingSoon) return 'locked'
  if (node.kind === 'trophy') return 'locked'

  const done = profile.completedLessons.includes(node.id)
  if (done) return 'done'

  const idx = LESSON_ORDER.indexOf(node.id)
  if (idx <= 0) return 'active' // first lesson always open
  const prev = LESSON_ORDER[idx - 1]
  return profile.completedLessons.includes(prev) ? 'active' : 'locked'
}

export default function Home({ profile, onOpen }) {
  // Offsets create the zig-zag Duolingo path.
  const offsets = [0, 70, 110, 70, 0, -70, -110, -70]

  // Find the first active lesson/placement to show the "START" bubble + mascot.
  const firstActiveIdx = PATH.findIndex((n) => nodeState(n, profile) === 'active')

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-6">
      <div className="mb-6 rounded-2xl bg-duo-green px-5 py-4 text-white">
        <div className="text-xs font-bold uppercase tracking-widest opacity-80">
          German · Unit 1
        </div>
        <div className="text-xl font-extrabold">A1 — Grundlagen</div>
      </div>

      <div className="flex flex-col items-center gap-8">
        {PATH.map((node, i) => {
          const state = nodeState(node, profile)
          const offset = offsets[i % offsets.length]
          const isFirstActive = i === firstActiveIdx
          return (
            <div
              key={node.id}
              className="relative flex flex-col items-center"
              style={{ transform: `translateX(${offset}px)` }}
            >
              {isFirstActive && (
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: [-2, -8, -2] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="absolute -top-9 rounded-xl border-2 border-duo-line bg-white px-3 py-1 text-xs font-extrabold uppercase text-duo-green shadow-card"
                >
                  Start
                </motion.div>
              )}

              <button
                disabled={state === 'locked'}
                onClick={() => state !== 'locked' && onOpen(node)}
                className={[
                  'flex h-20 w-20 items-center justify-center rounded-full text-3xl transition-transform active:translate-y-1',
                  state === 'locked'
                    ? 'bg-duo-locked text-white/70 shadow-node cursor-not-allowed'
                    : state === 'done'
                      ? 'bg-duo-gold text-white shadow-btn-gold'
                      : 'bg-duo-green text-white shadow-btn-green',
                  isFirstActive ? 'ring-4 ring-duo-green/30' : '',
                ].join(' ')}
                title={node.title}
              >
                {state === 'done' ? '✓' : state === 'locked' ? '🔒' : node.icon}
              </button>

              <div className="mt-2 text-center">
                <div className="text-sm font-extrabold text-duo-ink">{node.title}</div>
                <div className="text-xs font-semibold text-duo-gray">
                  {node.comingSoon ? 'Coming soon' : node.subtitle}
                </div>
              </div>

              {/* Mascot next to the first active node */}
              {isFirstActive && (
                <div
                  className="absolute top-0"
                  style={{ left: offset >= 0 ? '-130px' : '90px' }}
                >
                  <Mascot3D mood="idle" className="h-24 w-24" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
