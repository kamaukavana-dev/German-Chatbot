// ============================================================================
// HANS — COGNITIVE ENGINE (Layer 1)
// Pure logic: no React, no DOM. Tracks learner state, evaluates answers,
// applies XP / streak / spaced-repetition rules. Fully unit-testable.
// ============================================================================

export const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1']

// XP required to advance OUT of each CEFR level.
export const XP_THRESHOLDS = {
  A1: 100,
  A2: 250,
  B1: 500,
  B2: 900,
  C1: 1500,
}

export const XP_REWARD = {
  CORRECT: 10,
  CLOSE: 8,
  PARTIAL: 4,
  WRONG: 0,
  WORD_MATCH_ALL: 15,
  HINT_COST: 2,
}

// ----------------------------------------------------------------------------
// Text normalization + fuzzy comparison
// ----------------------------------------------------------------------------

const UMLAUT_MAP = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }

export function normalize(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"']/g, '')
    .replace(/\s+/g, ' ')
}

// Fold umlauts so "ue" === "ü" and strip accents — used for the CLOSE tier.
export function fold(str = '') {
  return normalize(str)
    .replace(/[äöüß]/g, (c) => UMLAUT_MAP[c] || c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Classic Levenshtein distance.
export function levenshtein(a = '', b = '') {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

// ----------------------------------------------------------------------------
// Answer evaluation — returns a verdict object the UI + state reducer consume.
// verdict.tier ∈ 'correct' | 'close' | 'partial' | 'wrong'
// ----------------------------------------------------------------------------

function accepts(exercise) {
  // Normalize the set of acceptable answers into an array of strings.
  const a = exercise.answer
  if (Array.isArray(a)) return a
  return [a]
}

export function evaluate(exercise, raw) {
  const userRaw = raw == null ? '' : raw
  const blank = normalize(userRaw) === ''

  if (blank) {
    return {
      tier: 'wrong',
      blank: true,
      xp: 0,
      correctAnswer: displayAnswer(exercise),
      rule: exercise.rule,
      example: exercise.example,
      message: 'No answer entered.',
    }
  }

  switch (exercise.type) {
    case 'word_match':
      return evaluateWordMatch(exercise, userRaw)
    case 'sentence_build':
      return evaluateSequence(exercise, userRaw)
    case 'fill_in_blank':
      return evaluateFill(exercise, userRaw)
    default:
      // translation, error_correction → semantic-ish string compare
      return evaluateText(exercise, userRaw)
  }
}

function evaluateText(exercise, userRaw) {
  const user = normalize(userRaw)
  const candidates = accepts(exercise).map(normalize)

  if (candidates.includes(user)) return win(exercise, 'correct')

  // CLOSE: umlaut/case fold match OR a single-char typo.
  const userFold = fold(userRaw)
  for (const c of accepts(exercise)) {
    if (fold(c) === userFold) return win(exercise, 'close', 'Minor spelling/umlaut slip — counts.')
    if (levenshtein(normalize(c), user) <= 1)
      return win(exercise, 'close', 'One-character typo — counts.')
  }
  return lose(exercise)
}

function evaluateFill(exercise, userRaw) {
  const user = normalize(userRaw)
  const candidates = accepts(exercise).map(normalize)
  if (candidates.includes(user)) return win(exercise, 'correct')

  const userFold = fold(userRaw)
  for (const c of accepts(exercise)) {
    if (fold(c) === userFold) return win(exercise, 'close', 'Spelling/umlaut slip — counts.')
    if (levenshtein(normalize(c), user) <= 1)
      return win(exercise, 'close', 'One-character typo — counts.')
  }

  // PARTIAL: correct verb stem but wrong ending (fill-blank only).
  if (exercise.stem) {
    const stem = normalize(exercise.stem)
    if (userFold.startsWith(fold(exercise.stem)) || fold(userRaw).startsWith(fold(stem))) {
      return {
        tier: 'partial',
        xp: XP_REWARD.PARTIAL,
        correctAnswer: displayAnswer(exercise),
        rule: exercise.rule,
        example: exercise.example,
        message: 'Right stem, wrong ending — partial credit.',
      }
    }
  }
  return lose(exercise)
}

// Order-sensitive comparison for sentence_build (array of tokens or a string).
function evaluateSequence(exercise, userRaw) {
  const target = accepts(exercise)[0]
  const targetTokens = Array.isArray(target) ? target : String(target).split(/\s+/)
  const userTokens = Array.isArray(userRaw) ? userRaw : String(userRaw).trim().split(/\s+/)

  const norm = (t) => fold(t)
  const exact =
    userTokens.length === targetTokens.length &&
    userTokens.every((t, i) => norm(t) === norm(targetTokens[i]))
  if (exact) return win(exercise, 'correct')

  // Same words, wrong order → partial (word-order is the teaching point).
  const sortKey = (arr) => arr.map(norm).sort().join('|')
  if (sortKey(userTokens) === sortKey(targetTokens)) {
    return {
      tier: 'partial',
      xp: XP_REWARD.PARTIAL,
      correctAnswer: displayAnswer(exercise),
      rule: exercise.rule,
      example: exercise.example,
      message: 'All the right words — word order is off.',
    }
  }
  return lose(exercise)
}

// userRaw is a map { germanWord: chosenEnglish }. Scores all-or-nothing for XP,
// but reports which pairs were wrong so they can be queued for repetition.
function evaluateWordMatch(exercise, userRaw) {
  const map = userRaw || {}
  const wrong = []
  for (const pair of exercise.pairs) {
    if (fold(map[pair.de] || '') !== fold(pair.en)) wrong.push(pair.de)
  }
  if (wrong.length === 0) {
    return {
      tier: 'correct',
      xp: XP_REWARD.WORD_MATCH_ALL,
      correctAnswer: displayAnswer(exercise),
      rule: exercise.rule,
      example: exercise.example,
      message: 'All four matched.',
    }
  }
  return {
    tier: 'wrong',
    xp: 0,
    wrongPairs: wrong,
    correctAnswer: displayAnswer(exercise),
    rule: exercise.rule,
    example: exercise.example,
    message: `${wrong.length} pair(s) wrong: ${wrong.join(', ')}.`,
  }
}

function win(exercise, tier, message) {
  return {
    tier,
    xp: tier === 'correct' ? XP_REWARD.CORRECT : XP_REWARD.CLOSE,
    correctAnswer: displayAnswer(exercise),
    rule: exercise.rule,
    example: exercise.example,
    message: message || (tier === 'correct' ? 'Correct.' : 'Correct (minor slip).'),
  }
}

function lose(exercise) {
  return {
    tier: 'wrong',
    xp: 0,
    correctAnswer: displayAnswer(exercise),
    rule: exercise.rule,
    example: exercise.example,
    message: 'Incorrect.',
  }
}

export function displayAnswer(exercise) {
  const a = exercise.answer
  if (exercise.type === 'word_match') {
    return exercise.pairs.map((p) => `${p.de} = ${p.en}`).join(' · ')
  }
  if (Array.isArray(a)) {
    if (Array.isArray(a[0])) return a[0].join(' ')
    return a[0]
  }
  return a
}

// ----------------------------------------------------------------------------
// XP / level progression
// ----------------------------------------------------------------------------

export function applyXp(learner, gainedXp) {
  let xp = Math.max(0, learner.xp + gainedXp)
  let level = learner.cefr_level
  let promoted = false
  let threshold = XP_THRESHOLDS[level]

  // Carry-over promotion: subtract threshold, advance level.
  while (xp >= threshold && CEFR_ORDER.indexOf(level) < CEFR_ORDER.length - 1) {
    xp -= threshold
    level = CEFR_ORDER[CEFR_ORDER.indexOf(level) + 1]
    threshold = XP_THRESHOLDS[level]
    promoted = true
  }

  return {
    ...learner,
    xp,
    cefr_level: level,
    xp_to_next_level: threshold,
    promoted_this_session: learner.promoted_this_session || promoted,
    justPromoted: promoted,
  }
}

// ----------------------------------------------------------------------------
// Weak-concept + spaced-repetition bookkeeping
// ----------------------------------------------------------------------------

export function recordError(learner, exercise) {
  const concept = exercise.topic
  const errorEntry = { id: exercise.id, topic: concept, prompt: exercise.prompt }

  const last3 = [errorEntry, ...learner.last_3_errors].slice(0, 3)

  // Count prior errors on this concept; promote to weak_concepts on 2nd hit.
  const seen = learner._errorCounts || {}
  const count = (seen[concept] || 0) + 1
  const errorCounts = { ...seen, [concept]: count }

  let weak = learner.weak_concepts
  if (count >= 2 && !weak.includes(concept)) weak = [...weak, concept]

  return { ...learner, last_3_errors: last3, weak_concepts: weak, _errorCounts: errorCounts }
}

// After every 3rd exercise, surface one item to re-test from recent errors.
export function dueForRepetition(exerciseCountCompleted, last3Errors) {
  if (exerciseCountCompleted > 0 && exerciseCountCompleted % 3 === 0 && last3Errors.length > 0) {
    return last3Errors[0]
  }
  return null
}

// ----------------------------------------------------------------------------
// Fresh state factory
// ----------------------------------------------------------------------------

// Per-lesson-run session state (resets every time a lesson is opened).
export function freshLessonSession() {
  return {
    weak_concepts: [],
    last_3_errors: [],
    _errorCounts: {},
    correct: 0,
    total: 0,
    streak: 0,
  }
}

export function freshLearner(cefr = 'A1') {
  return {
    cefr_level: cefr,
    xp: 0,
    xp_to_next_level: XP_THRESHOLDS[cefr],
    streak_days: 0,
    streak_this_session: 0,
    total_exercises: 0,
    correct_this_session: 0,
    weak_concepts: [],
    last_3_errors: [],
    promoted_this_session: false,
    _errorCounts: {},
  }
}
