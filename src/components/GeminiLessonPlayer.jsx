// ============================================================================
// GeminiLessonPlayer — the phased guided-lesson loop.
//
// The STATE MACHINE is authoritative: it owns the phase, the counters, the
// scoring and the unlocks (persisted in hans_lesson_state). Gemini ("HANS")
// only generates the on-screen text for the current phase. Graded phases ask
// HANS to append a hidden <<<VERDICT:correct|wrong>>> tag, which we parse and
// strip — that is how free-text chat produces a real score.
//
// Phase order: TEACH → DEMONSTRATE → GUIDED → PRACTICE → QUIZ → RESULT → UNLOCK
// (with PRACTICE-fail → GUIDED, QUIZ-fail → REVIEW → QUIZ).
// ============================================================================
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Mascot3D from './Mascot3D.jsx'
import LessonImage from './LessonImage.jsx'
import { sound } from '../lib/SoundEngine.js'
import { PHASE, GRADED_PHASES } from '../lib/phases.js'
import { getNextPhase, shouldAdvancePhase } from '../lib/phaseEngine.js'
import {
  loadLessonState,
  saveLessonState,
  resetConceptCounters,
} from '../lib/lessonState.js'
import { calculateStars, awardStars } from '../lib/stars.js'
import { getConcept, nextPosition } from '../data/courseContent.js'

const VERDICT_RE = /<<<\s*VERDICT\s*:\s*(correct|wrong)\s*>>>/i

function parseVerdict(text) {
  const m = String(text).match(VERDICT_RE)
  return { verdict: m ? m[1].toLowerCase() : null }
}
function stripVerdict(text) {
  return String(text).replace(VERDICT_RE, '').trim()
}

const TRIGGERS = {
  [PHASE.TEACH]: "I'm ready to start this lesson.",
  [PHASE.DEMONSTRATE]: 'Yes, show me the examples.',
  [PHASE.GUIDED]: "I'm ready for guided practice.",
  [PHASE.PRACTICE]: "I'm ready for practice — no hints.",
  [PHASE.QUIZ]: "I'm ready for the quiz.",
  [PHASE.REVIEW]: 'Please review what I got wrong.',
  [PHASE.RESULT]: 'Show me my results.',
  [PHASE.UNLOCK]: 'Continue.',
}

const PHASE_LABEL = {
  [PHASE.TEACH]: 'Teaching',
  [PHASE.DEMONSTRATE]: 'Examples',
  [PHASE.GUIDED]: 'Guided practice',
  [PHASE.PRACTICE]: 'Practice',
  [PHASE.QUIZ]: 'Quiz',
  [PHASE.REVIEW]: 'Review',
  [PHASE.RESULT]: 'Result',
  [PHASE.UNLOCK]: 'Unlocked!',
}

export default function GeminiLessonPlayer({ onExit, onConceptComplete }) {
  const [ls, setLs] = useState(loadLessonState)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [finished, setFinished] = useState(false)
  const [lastStars, setLastStars] = useState(null)

  const stateRef = useRef(ls)
  const msgsRef = useRef([])
  const startedRef = useRef(false)
  const scrollRef = useRef(null)

  // ---- state helpers (ref-backed so async flow never reads stale values) ----
  function commitState(updater) {
    const next = typeof updater === 'function' ? updater(stateRef.current) : updater
    stateRef.current = next
    setLs(next)
    saveLessonState(next)
    return next
  }
  function currentConcept() {
    const s = stateRef.current
    return getConcept(s.currentLevel, s.currentUnit, s.conceptIndex)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  // Kick off the current phase exactly once on mount.
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    openPhase(stateRef.current.phase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- network turn ---------------------------------------------------------
  async function sendTurn(content, { hidden = false, graded = false }) {
    const outgoing = [...msgsRef.current, { role: 'user', content, hidden }]
    msgsRef.current = outgoing
    setMessages(outgoing)
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: stateRef.current.phase,
          concept: currentConcept(),
          lessonState: stateRef.current,
          messages: outgoing.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `Server error ${res.status}`)
      }
      const data = await res.json()
      const raw = data.reply || '…'
      const verdict = graded ? parseVerdict(raw).verdict : null
      const clean = stripVerdict(raw)
      const withBot = [...msgsRef.current, { role: 'assistant', content: clean }]
      msgsRef.current = withBot
      setMessages(withBot)
      return { verdict, error: false }
    } catch (e) {
      setError(
        e.message.includes('Failed to fetch')
          ? 'Cannot reach the lesson backend (/api/chat). Run `npm run dev` and set GEMINI_API_KEY.'
          : e.message,
      )
      return { verdict: null, error: true }
    } finally {
      setBusy(false)
    }
  }

  // ---- counters -------------------------------------------------------------
  function bumpCounter(graded, verdict) {
    const phase = stateRef.current.phase
    commitState((s) => {
      const n = { ...s }
      if (phase === PHASE.TEACH) n.teachExchanges = s.teachExchanges + 1
      else if (phase === PHASE.DEMONSTRATE) n.demonstrateCount = s.demonstrateCount + 1
      else if (graded) {
        const correct = verdict === 'correct' ? 1 : 0
        if (phase === PHASE.GUIDED) n.guidedAttempts = s.guidedAttempts + 1
        else if (phase === PHASE.PRACTICE) {
          n.practiceAttempts = s.practiceAttempts + 1
          n.practiceScore = s.practiceScore + correct
        } else if (phase === PHASE.QUIZ) {
          n.quizTotal = s.quizTotal + 1
          n.quizScore = s.quizScore + correct
        }
      }
      return n
    })
  }

  // After any HANS reply within a phase: update counters then maybe advance.
  async function afterReply(graded, verdict) {
    if (graded) sound.play(verdict === 'correct' ? 'correct_answer' : 'wrong_answer')
    bumpCounter(graded, verdict)
    const phase = stateRef.current.phase
    const concept = currentConcept()
    if (shouldAdvancePhase(phase, stateRef.current, concept)) {
      if (phase === PHASE.QUIZ) {
        // The just-finished quiz round counts as an attempt (drives stars +
        // the review/result branch in getNextPhase).
        commitState((s) => ({ ...s, quizAttempts: s.quizAttempts + 1 }))
      }
      const next = getNextPhase(phase, stateRef.current, concept)
      await enterPhase(next)
    }
  }

  // ---- phase transitions ----------------------------------------------------
  async function enterPhase(next) {
    commitState((s) => {
      const n = { ...s, phase: next }
      if (next === PHASE.GUIDED) n.guidedAttempts = 0
      if (next === PHASE.PRACTICE) {
        n.practiceAttempts = 0
        n.practiceScore = 0
      }
      if (next === PHASE.QUIZ) {
        n.quizTotal = 0
        n.quizScore = 0
      }
      return n
    })
    if (next === PHASE.RESULT) doAwardStars()
    await openPhase(next)
  }

  // HANS opens a phase (hidden trigger). TEACH/DEMONSTRATE openings also count.
  async function openPhase(phase) {
    const { error: err } = await sendTurn(TRIGGERS[phase] || 'Continue.', {
      hidden: true,
      graded: false,
    })
    if (err) return
    if (phase === PHASE.TEACH || phase === PHASE.DEMONSTRATE) {
      await afterReply(false, null)
    }
  }

  function doAwardStars() {
    const s = stateRef.current
    const concept = currentConcept()
    let stars = calculateStars(s.quizScore, s.quizTotal, s.quizAttempts)
    // Forced completion (2 attempts) still unlocks the next concept.
    if (s.quizAttempts >= 2 && stars < 1) stars = 1
    if (stars < 1 && !s.failedConcepts.includes(concept.id)) {
      commitState((x) => ({ ...x, failedConcepts: [...x.failedConcepts, concept.id] }))
    }
    const finalStars = awardStars(s.currentLevel, s.currentUnit, concept.id, stars)
    sound.play(finalStars >= 3 ? 'level_up' : 'quest_complete')
    // awardStars + initProgression mutated storage — re-sync our refs.
    const fresh = loadLessonState()
    stateRef.current = fresh
    setLs(fresh)
    setLastStars(finalStars)
    onConceptComplete?.({ conceptId: concept.id, level: s.currentLevel, stars: finalStars })
  }

  function advanceConcept() {
    const s = stateRef.current
    const pos = nextPosition(s.currentLevel, s.currentUnit, s.conceptIndex)
    if (!pos) {
      setFinished(true)
      return
    }
    commitState((x) =>
      resetConceptCounters({
        ...x,
        currentLevel: pos.level,
        currentUnit: pos.unitId,
        currentLesson: pos.unitId,
        conceptIndex: pos.conceptIndex,
        phase: PHASE.TEACH,
      }),
    )
    msgsRef.current = []
    setMessages([])
    setLastStars(null)
    openPhase(PHASE.TEACH)
  }

  // ---- user actions ---------------------------------------------------------
  async function handleSend(text) {
    const content = (text ?? input).trim()
    if (!content || busy) return
    setInput('')
    const phase = stateRef.current.phase
    const graded = GRADED_PHASES.has(phase)
    const { verdict, error: err } = await sendTurn(content, { hidden: false, graded })
    if (err) return
    if (phase === PHASE.TEACH || phase === PHASE.DEMONSTRATE) await afterReply(false, null)
    else if (graded) await afterReply(true, verdict)
  }

  async function handleContinue() {
    if (busy) return
    sound.play('button_click')
    const phase = stateRef.current.phase
    if (phase === PHASE.REVIEW) await enterPhase(PHASE.QUIZ)
    else if (phase === PHASE.RESULT) await enterPhase(PHASE.UNLOCK)
    else if (phase === PHASE.UNLOCK) advanceConcept()
  }

  // ---- derived render state -------------------------------------------------
  const concept = getConcept(ls.currentLevel, ls.currentUnit, ls.conceptIndex)
  const phase = ls.phase
  const isGraded = GRADED_PHASES.has(phase)
  const isContinuePhase = phase === PHASE.REVIEW || phase === PHASE.RESULT || phase === PHASE.UNLOCK
  const isTeachLike = phase === PHASE.TEACH || phase === PHASE.DEMONSTRATE
  const visibleMessages = messages.filter((m) => !m.hidden)

  const showImage =
    concept &&
    (((phase === PHASE.TEACH || phase === PHASE.DEMONSTRATE) &&
      concept.showImageInPhases?.includes(phase)) ||
      phase === PHASE.RESULT)
  const imageQuery = phase === PHASE.RESULT ? 'celebration success confetti' : concept?.imageQuery

  const progress = (() => {
    const s = ls
    switch (phase) {
      case PHASE.TEACH:
        return `${Math.min(s.teachExchanges, concept?.teachSteps || 0)}/${concept?.teachSteps || 0}`
      case PHASE.DEMONSTRATE:
        return `${Math.min(s.demonstrateCount, 2)}/2`
      case PHASE.GUIDED:
        return `${Math.min(s.guidedAttempts, 2)}/2`
      case PHASE.PRACTICE:
        return `${s.practiceScore}/${s.practiceAttempts} · ${s.practiceAttempts}/${concept?.practiceCount || 0}`
      case PHASE.QUIZ:
        return `${s.quizScore}/${s.quizTotal} · ${s.quizTotal}/${concept?.quizCount || 0}`
      default:
        return ''
    }
  })()

  if (finished || !concept) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-5 px-5 text-center">
        <Mascot3D mood="happy" className="h-44 w-44" />
        <h2 className="text-2xl font-extrabold text-duo-ink">
          {finished ? "You've finished the available course! 🎉" : 'No lesson available.'}
        </h2>
        <p className="font-semibold text-duo-gray">
          More content is on the way. Great work, Sprachprofi!
        </p>
        <button onClick={onExit} className="duo-btn-green w-full text-lg">
          Back to app
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col px-4 py-3">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button onClick={onExit} className="text-2xl text-duo-gray" title="Exit lesson">
          ✕
        </button>
        <div className="flex-1">
          <div className="text-sm font-extrabold text-duo-ink">
            {ls.currentLevel} · {concept.title}
          </div>
          <div className="text-xs font-bold uppercase tracking-wide text-duo-blue">
            {PHASE_LABEL[phase]} {progress && <span className="text-duo-gray">· {progress}</span>}
          </div>
        </div>
        <Mascot3D mood={phase === PHASE.QUIZ ? 'idle' : 'happy'} className="h-12 w-12" />
      </div>

      {/* Image (TEACH / DEMONSTRATE / RESULT only) */}
      {showImage && <LessonImage key={`${phase}-${concept.id}`} query={imageQuery} caption={concept.title} />}

      {/* Chat */}
      <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto pb-2">
        {visibleMessages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 font-semibold ${
                m.role === 'user'
                  ? 'bg-duo-blue text-white'
                  : 'border-2 border-duo-line bg-white text-duo-ink'
              }`}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border-2 border-duo-line bg-white px-4 py-2.5 font-bold text-duo-gray">
              HANS tippt…
            </div>
          </div>
        )}
        {phase === PHASE.RESULT && lastStars != null && (
          <div className="flex justify-center py-2 text-4xl">
            {'⭐'.repeat(lastStars) || '💪'}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-[#ffdfe0] px-4 py-2.5 text-sm font-semibold text-duo-redDark">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-2">
        {isContinuePhase ? (
          <button onClick={handleContinue} disabled={busy} className="duo-btn-green w-full text-lg">
            Continue →
          </button>
        ) : (
          <>
            {isTeachLike && !busy && (
              <div className="mb-2 flex flex-wrap gap-2">
                <button
                  onClick={() => handleSend(phase === PHASE.DEMONSTRATE ? 'Next example, please.' : 'Yes, continue!')}
                  className="rounded-full border-2 border-duo-line bg-white px-3 py-1 text-sm font-bold text-duo-green"
                >
                  {phase === PHASE.DEMONSTRATE ? 'Next example →' : 'Got it, continue →'}
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                rows={1}
                disabled={busy}
                placeholder={isGraded ? 'Type your answer…' : 'Reply, or ask HANS a question…'}
                className="flex-1 resize-none rounded-2xl border-2 border-duo-line bg-duo-snow px-4 py-3 font-semibold text-duo-ink outline-none focus:border-duo-blue"
              />
              <button
                onClick={() => handleSend()}
                disabled={busy || !input.trim()}
                className={input.trim() && !busy ? 'duo-btn-green px-5 py-3' : 'duo-btn-locked px-5 py-3'}
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
