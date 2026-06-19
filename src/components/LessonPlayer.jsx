import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Exercise from './Exercise.jsx'
import Mascot3D from './Mascot3D.jsx'
import SpeakButton from './SpeakButton.jsx'
import { useSpeech } from '../lib/speech.js'
import {
  evaluate,
  applyXp,
  recordError,
  dueForRepetition,
  freshLessonSession,
} from '../engine.js'

export default function LessonPlayer({ lesson, profile, onProfileChange, onExit }) {
  const [session, setSession] = useState(freshLessonSession)
  const [baseIdx, setBaseIdx] = useState(0)
  const [reviewItem, setReviewItem] = useState(null)
  const [phase, setPhase] = useState('intro') // intro|exercise|feedback|complete|dead
  const [answer, setAnswer] = useState(null)
  const [ready, setReady] = useState(false)
  const [verdict, setVerdict] = useState(null)
  const [sessionXp, setSessionXp] = useState(0)
  const [hearts, setHearts] = useState(profile.hearts)
  const [gainedGems, setGainedGems] = useState(0)
  const [promo, setPromo] = useState(null)
  const { say, speaking } = useSpeech()

  const exercises = lesson.exercises
  const current = reviewItem || exercises[baseIdx]
  const total = exercises.length
  const progressPct = Math.round((Math.min(baseIdx, total) / total) * 100)
  const isLastBase = baseIdx >= total - 1 && !reviewItem

  const onAnswerChange = useCallback((value, isReady) => {
    setAnswer(value)
    setReady(isReady)
  }, [])

  // Auto-speak the German hook on the intro screen.
  useEffect(() => {
    if (phase === 'intro') say(lesson.intro.de)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Auto-speak the correct German answer on feedback (skip word-match — its
  // "answer" is a de=en mapping, not a spoken sentence).
  useEffect(() => {
    if (phase === 'feedback' && verdict && current?.type !== 'word_match') {
      say(verdict.correctAnswer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, verdict])

  // Owl congratulates you out loud when the lesson is done.
  useEffect(() => {
    if (phase === 'complete') say('Sehr gut! Weiter so!')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function check() {
    if (!ready || phase !== 'exercise') return
    const v = evaluate(current, answer)
    const passed = v.tier === 'correct' || v.tier === 'close'
    setVerdict(v)
    setSessionXp((x) => x + v.xp)

    setSession((s) => {
      let next = { ...s, total: s.total + 1 }
      if (passed) {
        next.correct += 1
        next.streak += 1
      } else {
        next.streak = 0
        next = recordError(next, current)
      }
      return next
    })

    if (!passed) {
      const h = hearts - 1
      setHearts(h)
      onProfileChange({ hearts: h })
      if (h <= 0) {
        // allow them to read feedback first, then dead screen on continue
      }
    }
    setPhase('feedback')
  }

  function next() {
    const passed = verdict && (verdict.tier === 'correct' || verdict.tier === 'close')
    setVerdict(null)
    setAnswer(null)
    setReady(false)

    if (hearts <= 0 && !passed) {
      setPhase('dead')
      return
    }

    if (reviewItem) {
      setReviewItem(null)
      if (baseIdx >= total) finish()
      else setPhase('exercise')
      return
    }

    const nextBase = baseIdx + 1
    const due = dueForRepetition(nextBase, session.last_3_errors)
    if (due && nextBase < total) {
      const original = exercises.find((e) => e.id === due.id)
      if (original) {
        setBaseIdx(nextBase)
        setReviewItem({ ...original, id: original.id + '-review', _review: true })
        setPhase('exercise')
        return
      }
    }

    if (nextBase >= total) {
      setBaseIdx(total)
      finish()
    } else {
      setBaseIdx(nextBase)
      setPhase('exercise')
    }
  }

  function finish() {
    const already = profile.completedLessons.includes(lesson.lesson_id)
    const gems = already ? 2 : 10
    setGainedGems(gems)

    const beforeLevel = profile.cefr_level
    let updated = applyXp({ ...profile }, sessionXp)
    updated.gems = (profile.gems || 0) + gems
    updated.completedLessons = already
      ? profile.completedLessons
      : [...profile.completedLessons, lesson.lesson_id]
    if (updated.justPromoted) setPromo({ from: beforeLevel, to: updated.cefr_level })
    onProfileChange(updated)
    setPhase('complete')
  }

  const accuracy =
    session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0

  // ---------- INTRO ----------
  if (phase === 'intro') {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6">
        <button onClick={onExit} className="self-start text-2xl text-duo-gray">
          ✕
        </button>
        <div className="flex flex-1 flex-col items-center justify-center text-center gap-5">
          <Mascot3D mood="idle" talking={speaking} className="h-44 w-44" />
          <div className="rounded-2xl border-2 border-duo-line bg-white px-5 py-4">
            <div className="flex items-center justify-center gap-2">
              <p className="text-xl font-extrabold text-duo-ink">{lesson.intro.de}</p>
              <SpeakButton text={lesson.intro.de} />
            </div>
            <p className="mt-1 text-duo-gray font-semibold">{lesson.intro.en}</p>
          </div>
          <div className="w-full rounded-2xl bg-duo-snow p-4 text-left">
            <p className="font-extrabold text-duo-green">{lesson.miniExplanation.rule}</p>
            <p className="mt-1 text-duo-ink font-semibold">✓ {lesson.miniExplanation.example}</p>
            <p className="text-duo-gray font-semibold">✗ {lesson.miniExplanation.counterExample}</p>
          </div>
        </div>
        <button onClick={() => setPhase('exercise')} className="duo-btn-green w-full text-lg">
          Let's go
        </button>
      </div>
    )
  }

  // ---------- OUT OF HEARTS ----------
  if (phase === 'dead') {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-5 text-center">
        <Mascot3D mood="sad" talking={speaking} className="h-44 w-44" />
        <h2 className="text-2xl font-extrabold text-duo-ink">Out of hearts!</h2>
        <p className="text-duo-gray font-semibold">
          You ran out of hearts. Refill to keep practicing.
        </p>
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={() => {
              setHearts(5)
              onProfileChange({ hearts: 5 })
              setPhase('exercise')
            }}
            className="duo-btn-red w-full"
          >
            Refill hearts (free)
          </button>
          <button onClick={onExit} className="duo-btn-locked w-full">
            Quit lesson
          </button>
        </div>
      </div>
    )
  }

  // ---------- COMPLETE ----------
  if (phase === 'complete') {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-5 px-5 text-center">
        <Confetti />
        <Mascot3D mood="happy" talking={speaking} className="h-48 w-48" />
        {promo ? (
          <h2 className="text-3xl font-extrabold text-duo-purple">
            Level up! {promo.from} → {promo.to}
          </h2>
        ) : (
          <h2 className="text-3xl font-extrabold text-duo-gold">Lesson complete!</h2>
        )}
        <div className="grid w-full grid-cols-3 gap-3">
          <ResultStat color="text-duo-gold" label="Total XP" value={`+${sessionXp}`} />
          <ResultStat color="text-duo-blue" label="Accuracy" value={`${accuracy}%`} />
          <ResultStat color="text-duo-green" label="Gems" value={`+${gainedGems}`} />
        </div>
        {session.weak_concepts.length > 0 && (
          <p className="text-sm font-semibold text-duo-gray">
            Keep an eye on: {session.weak_concepts.join(', ')}
          </p>
        )}
        <button onClick={onExit} className="duo-btn-green w-full text-lg">
          Continue
        </button>
      </div>
    )
  }

  // ---------- EXERCISE / FEEDBACK ----------
  const passed = verdict && (verdict.tier === 'correct' || verdict.tier === 'close')
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-4">
      {/* Header: X + progress + hearts */}
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="text-2xl text-duo-gray">
          ✕
        </button>
        <div className="h-4 flex-1 rounded-full bg-duo-line overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-duo-green"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex items-center gap-1 font-extrabold text-duo-red">
          <span className="text-xl">❤️</span>
          {hearts}
        </div>
      </div>

      {reviewItem && (
        <div className="mt-3 text-sm font-bold text-duo-purple">↻ Review — you missed this</div>
      )}

      {/* Exercise */}
      <div className="flex-1 py-6">
        <Exercise
          key={current.id}
          exercise={current}
          locked={phase === 'feedback'}
          onChange={onAnswerChange}
        />
      </div>

      {/* CHECK button (when answering) */}
      {phase === 'exercise' && (
        <button
          onClick={check}
          disabled={!ready}
          className={ready ? 'duo-btn-green w-full text-lg' : 'duo-btn-locked w-full text-lg'}
        >
          Check
        </button>
      )}

      {/* Feedback bottom-sheet */}
      <AnimatePresence>
        {phase === 'feedback' && verdict && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className={`-mx-5 -mb-4 mt-4 px-5 pb-6 pt-4 ${
              passed ? 'bg-[#d7ffb8]' : 'bg-[#ffdfe0]'
            }`}
          >
            <div className="mx-auto max-w-2xl">
              <div
                className={`flex items-center gap-2 text-xl font-extrabold ${
                  passed ? 'text-duo-greenDark' : 'text-duo-redDark'
                }`}
              >
                <span className="text-2xl">{passed ? '✓' : '✕'}</span>
                {passed ? 'Nice!' : 'Correct solution:'}
                {current?.type !== 'word_match' && (
                  <SpeakButton text={verdict.correctAnswer} size="sm" />
                )}
                {verdict.xp > 0 && <span className="ml-auto text-base">+{verdict.xp} XP</span>}
              </div>
              {!passed && (
                <p className="mt-1 text-lg font-bold text-duo-redDark">{verdict.correctAnswer}</p>
              )}
              <p className="mt-1 text-sm font-semibold text-duo-ink/70">{verdict.rule}</p>
              <button
                onClick={next}
                className={`mt-4 w-full ${passed ? 'duo-btn-green' : 'duo-btn-red'} text-lg`}
              >
                {isLastBase && (passed || hearts > 0) ? 'Finish' : 'Continue'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResultStat({ color, label, value }) {
  return (
    <div className="rounded-2xl border-2 border-duo-line p-3">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs font-bold uppercase tracking-wide text-duo-gray">{label}</div>
    </div>
  )
}

const CONFETTI = Array.from({ length: 36 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280
  const r = seed / 233280
  return {
    id: i,
    left: Math.round(r * 100),
    delay: (i % 12) * 0.06,
    color: ['#58cc02', '#1cb0f6', '#ffc800', '#ce82ff', '#ff4b4b'][i % 5],
    drift: (r - 0.5) * 120,
  }
})

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {CONFETTI.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0 h-3 w-3 rounded-sm"
          style={{ left: `${p.left}%`, backgroundColor: p.color }}
          initial={{ y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', x: p.drift, rotate: 540, opacity: [1, 1, 0] }}
          transition={{ duration: 2.2, delay: p.delay, repeat: Infinity, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
