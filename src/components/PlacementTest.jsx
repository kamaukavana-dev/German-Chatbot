import { useState } from 'react'
import { motion } from 'framer-motion'
import { PLACEMENT_QUESTIONS, scorePlacement } from '../data/placement.js'
import Mascot3D from './Mascot3D.jsx'

export default function PlacementTest({ onDone, onExit }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)

  const q = PLACEMENT_QUESTIONS[idx]
  const total = PLACEMENT_QUESTIONS.length
  const progressPct = Math.round((idx / total) * 100)

  function submit() {
    if (picked == null) return
    const correct = picked === q.answer
    const all = [...answers, correct]
    setAnswers(all)
    setPicked(null)
    if (idx + 1 >= total) {
      const score = all.filter(Boolean).length
      setResult({ ...scorePlacement(score), score })
    } else {
      setIdx(idx + 1)
    }
  }

  if (result) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-5 px-5 text-center">
        <Mascot3D mood="happy" className="h-44 w-44" />
        <h2 className="text-2xl font-extrabold text-duo-ink">You're a {result.label}!</h2>
        <div className="text-5xl font-extrabold text-duo-green">{result.level}</div>
        <p className="font-semibold text-duo-gray">
          You answered {result.score}/{total} correctly. We'll start you at level {result.level}.
        </p>
        <button onClick={() => onDone(result.level)} className="duo-btn-green w-full text-lg">
          Start learning
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-4">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="text-2xl text-duo-gray">
          ✕
        </button>
        <div className="h-4 flex-1 rounded-full bg-duo-line overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-duo-blue"
            initial={false}
            animate={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-duo-gray">{q.level}</span>
      </div>

      <div className="flex-1 py-8">
        <h2 className="text-2xl font-extrabold text-duo-ink">Placement question {idx + 1}</h2>
        <div className="mt-4 flex items-start gap-3">
          <div className="text-4xl">🦉</div>
          <div className="rounded-2xl border-2 border-duo-line bg-white px-4 py-3 text-lg font-bold text-duo-ink">
            {q.prompt}
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setPicked(opt)}
              className={picked === opt ? 'duo-choice duo-choice-selected' : 'duo-choice'}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={picked == null}
        className={picked != null ? 'duo-btn-blue w-full text-lg' : 'duo-btn-locked w-full text-lg'}
      >
        {idx + 1 >= total ? 'See result' : 'Continue'}
      </button>
    </div>
  )
}
