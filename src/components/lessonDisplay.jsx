import { useState } from 'react'

// Display-only helpers for LessonPlayer. None of this touches lesson state or
// the engine — it only changes how existing strings are rendered.

const GENDER_CLASS = { der: 'gender-m', die: 'gender-f', das: 'gender-n' }

// Wrap standalone der/die/das (case-insensitive) in gender-colored spans.
export function highlightGenders(text) {
  if (!text) return text
  const parts = String(text).split(/(\bder\b|\bdie\b|\bdas\b|\bDer\b|\bDie\b|\bDas\b)/g)
  return parts.map((p, i) => {
    const cls = GENDER_CLASS[p.toLowerCase()]
    return cls ? (
      <span key={i} className={cls}>{p}</span>
    ) : (
      <span key={i}>{p}</span>
    )
  })
}

// Small legend explaining the article colors.
export function GenderLegend() {
  return (
    <div className="flex items-center justify-center gap-3 text-xs font-bold text-duo-gray">
      <span><span className="gender-m">●</span> der (m)</span>
      <span><span className="gender-f">●</span> die (f)</span>
      <span><span className="gender-n">●</span> das (n)</span>
    </div>
  )
}

// Estimated lesson duration (~30s per exercise) + topic tag badges.
export function LessonBadges({ lesson }) {
  const n = lesson.total_exercises || (lesson.exercises ? lesson.exercises.length : 0)
  const mins = Math.max(1, Math.round((n * 30) / 60))
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="rounded-full bg-duo-snow px-2.5 py-0.5 text-xs font-extrabold text-duo-gray">
        ~{mins} min
      </span>
      {lesson.topic && (
        <span className="rounded-full bg-duo-snow px-2.5 py-0.5 text-xs font-extrabold text-duo-blue">
          📚 {lesson.topic}
        </span>
      )}
    </div>
  )
}

// Collapsible English translation under a German sentence (hidden by default).
export function TranslationToggle({ en }) {
  const [show, setShow] = useState(false)
  if (!en) return null
  return (
    <div className="mt-1">
      <button
        onClick={() => setShow((v) => !v)}
        className="text-xs font-bold text-duo-blue"
      >
        {show ? 'Hide translation ▲' : 'Show translation ▼'}
      </button>
      {show && (
        <p className="mt-0.5 text-[0.85rem] italic text-duo-gray">{en}</p>
      )}
    </div>
  )
}
