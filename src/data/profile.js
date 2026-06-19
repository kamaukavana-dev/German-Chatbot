// ============================================================================
// PROFILE — persistent learner progress across the whole app (not per-lesson).
// Stored in localStorage so it survives reloads & tabs.
// ============================================================================
import { XP_THRESHOLDS } from '../engine.js'

const KEY = 'hans.profile.v2'
export const HEARTS_MAX = 5

export function defaultProfile() {
  return {
    name: '',
    cefr_level: 'A1',
    xp: 0,
    xp_to_next_level: XP_THRESHOLDS.A1,
    gems: 0,
    streak_days: 1,
    hearts: HEARTS_MAX,
    completedLessons: [],
    placementDone: false,
  }
}

export function loadProfile() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return defaultProfile()
    return { ...defaultProfile(), ...JSON.parse(raw) }
  } catch {
    return defaultProfile()
  }
}

export function saveProfile(p) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable */
  }
}
