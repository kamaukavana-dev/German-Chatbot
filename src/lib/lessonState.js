// ============================================================================
// LESSON STATE — the single source of truth for the phased guided-lesson loop.
// Stored under localStorage key `hans_lesson_state`. Independent of the legacy
// `hans.profile.v2` / `hans_user` keys (those keep driving the static flow).
// ============================================================================

import { PHASE } from './phases.js'

export const LESSON_STATE_KEY = 'hans_lesson_state'

export function defaultLessonState() {
  return {
    currentLevel: 'A1',
    currentUnit: 1,
    currentLesson: 1,      // reserved (unit == lesson grouping for now)
    conceptIndex: 0,
    phase: PHASE.TEACH,
    teachExchanges: 0,
    demonstrateCount: 0,
    guidedAttempts: 0,
    practiceScore: 0,
    practiceAttempts: 0,
    quizScore: 0,
    quizTotal: 0,
    quizAttempts: 0,
    failedConcepts: [],
    unlockedLevels: ['A1'],
    unlockedUnits: { A1: [1] },
    stars: {},
    completedConcepts: [],
    lastPhaseChange: new Date().toISOString(),
    placementComplete: false,
    placementLevel: null,
  }
}

export function loadLessonState() {
  try {
    const raw = window.localStorage.getItem(LESSON_STATE_KEY)
    if (!raw) return defaultLessonState()
    // Merge so older saves gain any newly-added fields.
    return { ...defaultLessonState(), ...JSON.parse(raw) }
  } catch {
    return defaultLessonState()
  }
}

export function saveLessonState(state) {
  try {
    window.localStorage.setItem(LESSON_STATE_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable */
  }
  return state
}

export function patchLessonState(patch) {
  const next = { ...loadLessonState(), ...patch, lastPhaseChange: new Date().toISOString() }
  return saveLessonState(next)
}

export function hasLessonState() {
  try {
    return window.localStorage.getItem(LESSON_STATE_KEY) != null
  } catch {
    return false
  }
}

// Reset only the per-concept counters (called when a new concept begins or a
// quiz is retried). Position + progression fields are preserved.
export function resetConceptCounters(state) {
  return {
    ...state,
    phase: PHASE.TEACH,
    teachExchanges: 0,
    demonstrateCount: 0,
    guidedAttempts: 0,
    practiceScore: 0,
    practiceAttempts: 0,
    quizScore: 0,
    quizTotal: 0,
    quizAttempts: 0,
  }
}
