// ============================================================================
// STARS — award 0–3 stars from a quiz result and persist them (best attempt
// kept). Every award recomputes unlocks so progression stays consistent.
// ============================================================================

import { starKey } from '../data/courseContent.js'
import { loadLessonState, saveLessonState } from './lessonState.js'
import { initProgression } from './progression.js'

export function calculateStars(quizScore, quizTotal, attempts) {
  const pct = quizTotal > 0 ? quizScore / quizTotal : 0
  if (pct === 1.0 && attempts === 1) return 3
  if (pct >= 0.8) return 2
  if (pct >= 0.6) return 1
  return 0 // failed but still unlock after 2 attempts
}

export function awardStars(level, unitId, conceptId, stars) {
  const state = loadLessonState()
  const key = starKey(level, unitId, conceptId)

  // Never decrease stars — keep best attempt.
  state.stars = state.stars || {}
  state.stars[key] = Math.max(state.stars[key] || 0, stars)

  if (!state.completedConcepts.includes(conceptId)) {
    state.completedConcepts = [...state.completedConcepts, conceptId]
  }
  saveLessonState(state)

  // Recalculate unlocks after every star award.
  initProgression()

  return loadLessonState().stars[key]
}
