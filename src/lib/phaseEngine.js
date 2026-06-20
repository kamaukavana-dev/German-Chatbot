// ============================================================================
// PHASE ENGINE — pure functions that decide the next phase and whether the
// current phase's counter has been satisfied. No React, no storage, no I/O.
// ============================================================================

import { PHASE } from './phases.js'

export function getNextPhase(currentPhase, lessonState, concept) {
  switch (currentPhase) {
    case PHASE.TEACH:
      // Stay in teach until teachSteps exchanges done.
      if (lessonState.teachExchanges < concept.teachSteps) return PHASE.TEACH
      return PHASE.DEMONSTRATE

    case PHASE.DEMONSTRATE:
      if (lessonState.demonstrateCount < 2) return PHASE.DEMONSTRATE
      return PHASE.GUIDED

    case PHASE.GUIDED:
      if (lessonState.guidedAttempts < 2) return PHASE.GUIDED
      return PHASE.PRACTICE

    case PHASE.PRACTICE: {
      if (lessonState.practiceAttempts < concept.practiceCount) return PHASE.PRACTICE
      // Fail practice → back to guided, not quiz.
      const practiceScore = lessonState.practiceScore / concept.practiceCount
      return practiceScore >= concept.passScore ? PHASE.QUIZ : PHASE.GUIDED
    }

    case PHASE.QUIZ: {
      if (lessonState.quizTotal < concept.quizCount) return PHASE.QUIZ
      const quizScore = lessonState.quizScore / concept.quizCount
      if (quizScore >= concept.passScore) return PHASE.RESULT
      // First fail → review. Second fail → result anyway.
      return lessonState.quizAttempts < 2 ? PHASE.REVIEW : PHASE.RESULT
    }

    case PHASE.REVIEW:
      return PHASE.QUIZ // always goes back to quiz after review

    case PHASE.RESULT:
      return PHASE.UNLOCK

    case PHASE.UNLOCK:
      return PHASE.TEACH // next concept begins

    default:
      return PHASE.TEACH
  }
}

export function shouldAdvancePhase(currentPhase, lessonState, concept) {
  // Called after every Gemini response + user reply.
  // Returns true if the phase counter has been satisfied.
  switch (currentPhase) {
    case PHASE.TEACH:
      return lessonState.teachExchanges >= concept.teachSteps
    case PHASE.DEMONSTRATE:
      return lessonState.demonstrateCount >= 2
    case PHASE.GUIDED:
      return lessonState.guidedAttempts >= 2
    case PHASE.PRACTICE:
      return lessonState.practiceAttempts >= concept.practiceCount
    case PHASE.QUIZ:
      return lessonState.quizTotal >= concept.quizCount
    default:
      return false
  }
}
