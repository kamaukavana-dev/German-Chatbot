// ============================================================================
// CURRICULUM — lesson registry + the visual learning path (skill tree).
// ============================================================================
import L001 from '../lessons/L001.js'
import L002 from '../lessons/L002.js'

export const LESSONS = {
  L001,
  L002,
}

// The winding path shown on the home screen. Each node is one tappable bubble.
// kind: 'lesson' | 'placement' | 'trophy'
// Future lessons that aren't authored yet are marked locked + comingSoon.
export const PATH = [
  {
    id: 'placement',
    kind: 'placement',
    title: 'Placement test',
    subtitle: 'Find your level',
    icon: '🧭',
  },
  {
    id: 'L001',
    kind: 'lesson',
    title: 'Erste Schritte',
    subtitle: 'First steps',
    icon: '⭐',
    cefr: 'A1',
  },
  {
    id: 'L002',
    kind: 'lesson',
    title: 'Familie & Zahlen',
    subtitle: 'Family & numbers',
    icon: '👪',
    cefr: 'A1',
  },
  {
    id: 'L003',
    kind: 'lesson',
    title: 'Essen & Trinken',
    subtitle: 'Food & drink',
    icon: '🍞',
    cefr: 'A1',
    comingSoon: true,
  },
  {
    id: 'trophy-a1',
    kind: 'trophy',
    title: 'A1 Trophy',
    subtitle: 'Unit 1 complete',
    icon: '🏆',
    comingSoon: true,
  },
]

// Order of lesson ids used for unlock logic (a lesson unlocks once the previous
// one is completed).
export const LESSON_ORDER = ['L001', 'L002', 'L003']

export function lessonById(id) {
  return LESSONS[id] || null
}
