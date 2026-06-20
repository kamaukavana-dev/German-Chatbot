// ============================================================================
// LESSON PHASES — the pedagogical state machine's vocabulary.
// Every user interaction inside a guided lesson is in EXACTLY one phase.
// No free-form chat during lessons; the phase decides what HANS may do.
// ============================================================================

export const PHASE = {
  PLACEMENT:   'placement',   // initial level detection quiz
  TEACH:       'teach',       // gemini teaches, user listens
  DEMONSTRATE: 'demonstrate', // gemini shows worked examples
  GUIDED:      'guided',      // practice WITH hints allowed
  PRACTICE:    'practice',    // practice WITHOUT hints
  QUIZ:        'quiz',        // formal assessment, no hints
  RESULT:      'result',      // score shown, stars awarded
  UNLOCK:      'unlock',      // next lesson/level unlocked
  REVIEW:      'review',      // re-teach failed concepts only
}

// Phase sequence — enforced, cannot skip forward.
export const PHASE_SEQUENCE = [
  PHASE.TEACH,
  PHASE.DEMONSTRATE,
  PHASE.GUIDED,
  PHASE.PRACTICE,
  PHASE.QUIZ,
  PHASE.RESULT,
  PHASE.UNLOCK,
]

// Phases where HANS opens the turn (speaks first, before any user reply).
export const HANS_OPENS = new Set([
  PHASE.TEACH,
  PHASE.DEMONSTRATE,
  PHASE.GUIDED,
  PHASE.PRACTICE,
  PHASE.QUIZ,
  PHASE.REVIEW,
  PHASE.RESULT,
  PHASE.UNLOCK,
])

// Phases that evaluate a student answer and therefore expect a machine-readable
// verdict tag from HANS (see api/_lib/prompt.js).
export const GRADED_PHASES = new Set([PHASE.GUIDED, PHASE.PRACTICE, PHASE.QUIZ])

// Phases that may show a lesson image (strict — never during graded practice).
export const IMAGE_PHASES = new Set([PHASE.TEACH, PHASE.DEMONSTRATE, PHASE.RESULT])

export function isValidPhase(p) {
  return Object.values(PHASE).includes(p)
}
