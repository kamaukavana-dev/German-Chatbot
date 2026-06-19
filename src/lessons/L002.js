// ============================================================================
// LESSON L002 — "Familie & Zahlen" (Family & Numbers) · CEFR A1
// Objective: Count to 20 and name immediate family members.
// (Same exercise shape as L001 — see src/lessons/L001.js for the schema.)
// ============================================================================

export const L002 = {
  lesson_id: 'L002',
  topic: 'Familie & Zahlen',
  objective: 'Count to twenty and name members of your family.',
  cefr_level: 'A1',
  total_exercises: 6,
  intro: {
    de: 'Das ist meine Familie. Wir sind fünf Personen.',
    en: 'This is my family. We are five people.',
  },
  miniExplanation: {
    rule: 'Family nouns take an article: der (m), die (f), das (n) — e.g. der Vater, die Mutter.',
    example: 'die Schwester (the sister), der Bruder (the brother)',
    counterExample: 'Not: "das Mutter" — Mutter is feminine, so it is "die Mutter".',
  },
  exercises: [
    {
      id: 'L002-E1',
      type: 'word_match',
      topic: 'family-vocab',
      difficulty: 'A1',
      prompt: 'Match each family member to its English meaning.',
      pairs: [
        { de: 'die Mutter', en: 'mother' },
        { de: 'der Vater', en: 'father' },
        { de: 'die Schwester', en: 'sister' },
        { de: 'der Bruder', en: 'brother' },
      ],
      answer:
        'die Mutter=mother, der Vater=father, die Schwester=sister, der Bruder=brother',
      hint: 'Mutter and Schwester are feminine (die).',
      rule: 'Family vocabulary is core A1 — learn each noun together with its article.',
      example: 'Meine Mutter heißt Eva. (My mother is called Eva.)',
    },
    {
      id: 'L002-E2',
      type: 'translation',
      topic: 'numbers-1-20',
      difficulty: 'A1',
      prompt: 'Write the German word for the number: 3',
      answer: ['drei'],
      hint: 'eins, zwei, ___ …',
      rule: 'Numbers 1–12 are unique words you memorize: eins, zwei, drei, vier …',
      example: 'Ich habe drei Bücher. (I have three books.)',
    },
    {
      id: 'L002-E3',
      type: 'translation',
      topic: 'numbers-1-20',
      difficulty: 'A1',
      prompt: 'Write the German word for the number: 12',
      answer: ['zwölf', 'zwoelf'],
      hint: 'It rhymes with "elf" (11).',
      rule: '11 = elf, 12 = zwölf — these break the pattern, so memorize them.',
      example: 'Es ist zwölf Uhr. (It is twelve o’clock.)',
    },
    {
      id: 'L002-E4',
      type: 'fill_in_blank',
      topic: 'possessive-mein',
      difficulty: 'A1',
      prompt: '___ Vater ist groß. (my — masculine)',
      stem: 'mein',
      answer: ['mein'],
      hint: '"mein" for masculine/neuter, "meine" for feminine/plural.',
      rule: 'With masculine nouns (der Vater) the possessive is "mein": mein Vater.',
      example: 'Mein Bruder ist klein. (My brother is small.)',
    },
    {
      id: 'L002-E5',
      type: 'error_correction',
      topic: 'article-gender',
      difficulty: 'A1',
      prompt: 'Find and fix the error: "Das Mutter ist nett."',
      answer: ['die Mutter ist nett'],
      hint: 'What gender is "Mutter"?',
      rule: '"Mutter" is feminine, so it takes "die", not "das".',
      example: 'Die Mutter ist nett. (The mother is nice.)',
    },
    {
      id: 'L002-E6',
      type: 'sentence_build',
      topic: 'word-order-v2',
      difficulty: 'A1',
      prompt: 'Arrange into a correct sentence:',
      tokens: ['Geschwister', 'habe', 'Ich', 'zwei'],
      answer: [['Ich', 'habe', 'zwei', 'Geschwister']],
      hint: 'Verb second: Ich (S) habe (V) …',
      rule: 'The finite verb stays in position 2 even with an object phrase.',
      example: 'Ich habe eine Schwester. (I have one sister.)',
    },
  ],
  next: {
    lesson_id: 'L003',
    topic: 'Essen & Trinken',
    objective: 'Order food and drink in a café.',
    cefr_level: 'A1',
  },
}

export default L002
