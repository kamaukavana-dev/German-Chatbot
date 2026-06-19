// ============================================================================
// PLACEMENT TEST — 5 multiple-choice questions scaling A1 → B1.
// Scoring (per HANS spec): 5/5 = B1, 4/5 = A2, 3/5 = A2, 1–2/5 = A1, 0 = A1.
// ============================================================================

export const PLACEMENT_QUESTIONS = [
  {
    id: 'P1',
    level: 'A1',
    prompt: 'Choose the correct form: "Ich ___ Anna."',
    options: ['bin', 'bist', 'ist', 'sein'],
    answer: 'bin',
  },
  {
    id: 'P2',
    level: 'A1',
    prompt: 'Which article is correct? "___ Mutter ist nett."',
    options: ['Der', 'Die', 'Das', 'Den'],
    answer: 'Die',
  },
  {
    id: 'P3',
    level: 'A2',
    prompt: 'Past tense (Perfekt): "Gestern ___ ich Pizza gegessen."',
    options: ['habe', 'bin', 'hatte', 'war'],
    answer: 'habe',
  },
  {
    id: 'P4',
    level: 'A2',
    prompt: 'Pick the correct word order: "Ich gehe ins Kino, weil ich Filme ___."',
    options: ['mag', 'ich mag', 'mag ich', 'gemag'],
    answer: 'mag',
  },
  {
    id: 'P5',
    level: 'B1',
    prompt: 'Konjunktiv II: "Wenn ich Zeit ___, würde ich reisen."',
    options: ['hätte', 'habe', 'hatte', 'haben'],
    answer: 'hätte',
  },
]

export function scorePlacement(correctCount) {
  if (correctCount >= 5) return { level: 'B1', label: 'Intermediate' }
  if (correctCount >= 3) return { level: 'A2', label: 'Elementary' }
  return { level: 'A1', label: 'Beginner' }
}
