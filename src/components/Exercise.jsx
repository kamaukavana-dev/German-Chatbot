import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import SpeakButton from './SpeakButton.jsx'

// Deterministic shuffle seeded by a string — stable per exercise.
function seededShuffle(arr, seedStr) {
  let seed = 0
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) % 233280
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280
    const j = Math.floor((seed / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TYPE_TITLE = {
  fill_in_blank: 'Fill in the blank',
  translation: 'Write this in German',
  error_correction: 'Fix the mistake',
  word_match: 'Tap the matching pairs',
  sentence_build: 'Tap the words in order',
}

// Controlled-ish: manages its own answer, reports up via onChange(value, ready).
export default function Exercise({ exercise, locked, lockedResult, onChange }) {
  const isText = ['fill_in_blank', 'translation', 'error_correction'].includes(exercise.type)

  const [text, setText] = useState('')
  const [matchMap, setMatchMap] = useState({})
  const [built, setBuilt] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    setText('')
    setMatchMap({})
    setBuilt([])
    if (isText && inputRef.current) inputRef.current.focus()
  }, [exercise.id, isText])

  const englishOptions = useMemo(
    () =>
      exercise.type === 'word_match'
        ? seededShuffle(exercise.pairs.map((p) => p.en), exercise.id)
        : [],
    [exercise],
  )
  const scrambledTokens = useMemo(
    () => (exercise.type === 'sentence_build' ? seededShuffle(exercise.tokens, exercise.id) : []),
    [exercise],
  )

  // Report current answer + readiness whenever inputs change.
  useEffect(() => {
    let value
    let ready
    if (isText) {
      value = text
      ready = text.trim().length > 0
    } else if (exercise.type === 'word_match') {
      value = matchMap
      ready = exercise.pairs.every((p) => matchMap[p.de])
    } else {
      value = built.map((b) => b.t)
      ready = built.length === exercise.tokens.length
    }
    onChange?.(value, ready)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, matchMap, built, exercise])

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-duo-ink">{TYPE_TITLE[exercise.type]}</h2>

      {/* Prompt bubble with mini mascot vibe */}
      <div className="flex items-start gap-3">
        <div className="mt-1 hidden sm:block text-4xl">🦉</div>
        <div className="relative rounded-2xl border-2 border-duo-line bg-white px-4 py-3 text-lg font-bold text-duo-ink">
          {exercise.prompt}
        </div>
      </div>

      {/* ---- TEXT TYPES ---- */}
      {isText && (
        <textarea
          ref={inputRef}
          value={text}
          disabled={locked}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Type in German…"
          className="w-full resize-none rounded-2xl border-2 border-duo-line bg-duo-snow px-4 py-3 text-lg font-semibold text-duo-ink outline-none focus:border-duo-blue disabled:opacity-60"
        />
      )}

      {/* ---- WORD MATCH (tap a German word, then its meaning) ---- */}
      {exercise.type === 'word_match' && (
        <WordMatch
          pairs={exercise.pairs}
          options={englishOptions}
          value={matchMap}
          locked={locked}
          onPick={(de, en) => setMatchMap((m) => ({ ...m, [de]: en }))}
        />
      )}

      {/* ---- SENTENCE BUILD ---- */}
      {exercise.type === 'sentence_build' && (
        <div className="space-y-4">
          <div className="min-h-[60px] border-b-2 border-duo-line flex flex-wrap gap-2 pb-3">
            {built.map((b, idx) => (
              <button
                key={`${b.t}-${b.i}`}
                disabled={locked}
                onClick={() => setBuilt((arr) => arr.filter((_, k) => k !== idx))}
                className="duo-choice px-3 py-2"
              >
                {b.t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {scrambledTokens.map((t, i) =>
              built.some((b) => b.t === t && b.i === i) ? (
                <span
                  key={`${t}-${i}`}
                  className="rounded-2xl border-2 border-duo-line bg-duo-snow px-3 py-2 font-bold text-duo-snow"
                >
                  {t}
                </span>
              ) : (
                <button
                  key={`${t}-${i}`}
                  disabled={locked}
                  onClick={() => setBuilt((arr) => [...arr, { t, i }])}
                  className="duo-choice px-3 py-2"
                >
                  {t}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function WordMatch({ pairs, options, value, locked, onPick }) {
  const [activeDe, setActiveDe] = useState(null)
  const used = Object.values(value)

  function pickEn(en) {
    if (!activeDe) return
    onPick(activeDe, en)
    setActiveDe(null)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {pairs.map((p) => (
          <div key={p.de} className="flex items-center gap-2">
            <button
              disabled={locked}
              onClick={() => setActiveDe(p.de)}
              className={`flex-1 text-left ${
                value[p.de]
                  ? 'duo-choice duo-choice-correct'
                  : activeDe === p.de
                    ? 'duo-choice duo-choice-selected'
                    : 'duo-choice'
              }`}
            >
              {p.de}
              {value[p.de] && <span className="float-right text-sm">→ {value[p.de]}</span>}
            </button>
            <SpeakButton text={p.de} size="sm" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {options.map((en) => {
          const taken = used.includes(en)
          return (
            <button
              key={en}
              disabled={locked || taken}
              onClick={() => pickEn(en)}
              className={`w-full ${taken ? 'duo-choice opacity-40' : 'duo-choice'}`}
            >
              {en}
            </button>
          )
        })}
      </div>
    </div>
  )
}
