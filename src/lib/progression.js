// ============================================================================
// PROGRESSION — derive which levels/units are unlocked from the star record.
// Rule of thumb: NEVER trust the stored unlock list; recompute from `stars`
// on every load and merge (so an unlock can never be lost, only gained).
// ============================================================================

import { CURRICULUM, LEVEL_ORDER, starKey } from '../data/courseContent.js'
import { loadLessonState, saveLessonState } from './lessonState.js'

// A unit counts as "complete" when every concept in it has ≥1 star.
function unitComplete(level, unit, stars) {
  return unit.concepts.every((concept) => (stars[starKey(level, unit.id, concept.id)] || 0) >= 1)
}

export function recalculateUnlockedLevels(stars) {
  const unlocked = ['A1']

  for (let i = 1; i < LEVEL_ORDER.length; i++) {
    const prevLevel = LEVEL_ORDER[i - 1]
    const units = CURRICULUM[prevLevel].units

    const allConceptsStarred = units.every((unit) => unitComplete(prevLevel, unit, stars))

    if (allConceptsStarred) unlocked.push(LEVEL_ORDER[i])
    else break // stop — cannot unlock non-sequential levels
  }

  return unlocked
}

// Within each unlocked level, a unit unlocks once the previous unit is complete.
export function recalculateUnlockedUnits(stars, unlockedLevels) {
  const out = {}
  for (const level of unlockedLevels) {
    const lvl = CURRICULUM[level]
    if (!lvl) continue
    const unitIds = [lvl.units[0].id] // first unit always open
    for (let i = 1; i < lvl.units.length; i++) {
      if (unitComplete(level, lvl.units[i - 1], stars)) unitIds.push(lvl.units[i].id)
      else break
    }
    out[level] = unitIds
  }
  return out
}

// Call this on every app load — recalculate from stars, never trust stored list.
export function initProgression() {
  const state = loadLessonState()
  const stars = state.stars || {}
  const correctUnlocks = recalculateUnlockedLevels(stars)

  // Merge — never remove a previously unlocked level.
  const mergedLevels = [...new Set([...(state.unlockedLevels || ['A1']), ...correctUnlocks])]
  // Keep merged levels in canonical order.
  mergedLevels.sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b))

  const mergedUnits = recalculateUnlockedUnits(stars, mergedLevels)
  // Never remove a previously unlocked unit either.
  for (const [lvl, prevUnits] of Object.entries(state.unlockedUnits || {})) {
    mergedUnits[lvl] = [...new Set([...(mergedUnits[lvl] || []), ...prevUnits])].sort((a, b) => a - b)
  }

  state.unlockedLevels = mergedLevels
  state.unlockedUnits = mergedUnits
  saveLessonState(state)
  return mergedLevels
}
