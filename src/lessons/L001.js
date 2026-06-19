// ============================================================================
// LESSON L001 — "Erste Schritte" (First Steps) · CEFR A1
// Objective: Use the present tense of "sein" and basic greetings to introduce
// yourself in German.
//
// Exercise object shape:
//   id            unique within lesson
//   type          fill_in_blank | translation | error_correction
//                 | word_match | sentence_build
//   topic         concept key (drives weak_concepts tracking)
//   difficulty    CEFR tag shown on the card
//   prompt        text shown to the learner
//   answer        accepted answer(s). string | string[] | string[][] (build)
//   stem          (fill_in_blank only) verb stem for partial credit
//   hint          revealed on demand, costs XP
//   rule          one-sentence rule restated in feedback
//   example       one correct usage shown after feedback
//   pairs         (word_match only) [{ de, en }]
//   tokens        (sentence_build only) scrambled token array
// ============================================================================

export const L001 = {
  lesson_id: 'L001',
  topic: 'Erste Schritte',
  objective: 'Introduce yourself using "sein" (to be) and basic greetings.',
  cefr_level: 'A1',
  total_exercises: 6,
  intro: {
    de: 'Hallo! Ich bin Hans. Wie heißt du?',
    en: 'Hello! I am Hans. What is your name?',
  },
  miniExplanation: {
    rule: 'The verb "sein" (to be) is irregular: ich bin, du bist, er/sie/es ist.',
    example: 'Ich bin müde. (I am tired.)',
    counterExample: 'Not: "Ich bin sein" — "sein" is the infinitive, never used after ich.',
  },
  exercises: [
    {
      id: 'L001-E1',
      type: 'fill_in_blank',
      topic: 'sein-conjugation',
      difficulty: 'A1',
      prompt: 'Ich ___ Hans. (to be — "I")',
      stem: 'b',
      answer: ['bin'],
      hint: 'First person singular of "sein".',
      rule: 'With "ich", "sein" becomes "bin".',
      example: 'Ich bin Student. (I am a student.)',
    },
    {
      id: 'L001-E2',
      type: 'fill_in_blank',
      topic: 'sein-conjugation',
      difficulty: 'A1',
      prompt: 'Du ___ nett. (to be — "you", informal)',
      stem: 'b',
      answer: ['bist'],
      hint: 'Second person singular of "sein".',
      rule: 'With "du", "sein" becomes "bist".',
      example: 'Du bist hier. (You are here.)',
    },
    {
      id: 'L001-E3',
      type: 'word_match',
      topic: 'greetings-vocab',
      difficulty: 'A1',
      prompt: 'Match each German greeting/word to its English meaning.',
      pairs: [
        { de: 'Hallo', en: 'hello' },
        { de: 'Tschüss', en: 'bye' },
        { de: 'Danke', en: 'thank you' },
        { de: 'Guten Morgen', en: 'good morning' },
      ],
      // answer is derived from pairs; kept for displayAnswer fallback
      answer: 'Hallo=hello, Tschüss=bye, Danke=thank you, Guten Morgen=good morning',
      hint: '"Guten Morgen" is used before noon.',
      rule: 'Core greetings are high-frequency A1 vocabulary — memorize as chunks.',
      example: 'Guten Morgen! Wie geht es dir? (Good morning! How are you?)',
    },
    {
      id: 'L001-E4',
      type: 'translation',
      topic: 'self-introduction',
      difficulty: 'A1',
      prompt: 'Translate to German: "I am tired."',
      answer: ['ich bin müde', 'ich bin muede'],
      hint: 'müde = tired.',
      rule: 'Statement word order is Subject + Verb + rest: "Ich (S) bin (V) müde."',
      example: 'Ich bin glücklich. (I am happy.)',
    },
    {
      id: 'L001-E5',
      type: 'error_correction',
      topic: 'sein-conjugation',
      difficulty: 'A1',
      prompt: 'Find and fix the error: "Du bin freundlich."',
      answer: ['du bist freundlich'],
      hint: 'Check the verb form for "du".',
      rule: '"bin" only goes with "ich"; "du" requires "bist".',
      example: 'Du bist freundlich. (You are friendly.)',
    },
    {
      id: 'L001-E6',
      type: 'sentence_build',
      topic: 'word-order-v2',
      difficulty: 'A1',
      prompt: 'Arrange into a correct sentence (drag or type in order):',
      tokens: ['heiße', 'Ich', 'Anna'],
      answer: [['Ich', 'heiße', 'Anna']],
      hint: 'The conjugated verb goes in position 2 (the V2 rule).',
      rule: 'German main clauses put the finite verb second: Subject, Verb, rest.',
      example: 'Ich wohne in Berlin. (I live in Berlin.)',
    },
  ],
  // Preview shown on the level-up overlay.
  next: {
    lesson_id: 'L002',
    topic: 'Familie & Zahlen',
    objective: 'Count to 20 and name family members.',
    cefr_level: 'A1',
  },
}

export default L001
