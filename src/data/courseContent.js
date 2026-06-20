// ============================================================================
// COURSE CONTENT — the guided-lesson curriculum that drives the phased
// (TEACH → DEMONSTRATE → … → UNLOCK) Gemini lesson loop.
//
// This is intentionally a SEPARATE file from data/curriculum.js (which owns the
// legacy static skill-path: PATH / LESSON_ORDER / lessonById). Nothing here
// touches that file, so the existing static LessonPlayer keeps working.
//
// A1 is fully authored (4 units). A2–C1 are minimal-but-real stubs (1 unit /
// 1 concept each) so the engine works end-to-end; flesh them out later.
//
// Concept schema (every field used by the phase engine / prompt builder):
//   id                 globally unique, e.g. "A1_U1_C1"
//   title              human label
//   imageQuery         Pexels search string for the concept hero image
//   showImageInPhases  phases allowed to render the concept image
//   vocabulary[]       { de, en, phonetic, gender, imageQuery }
//                      imageQuery → per-word image shown during TEACH
//   grammarRule        rule stated in German-teaching terms
//   grammarRuleEnglish plain-English bridge / mnemonic
//   exampleSentences[] { de, en, literal }
//   teachSteps         # of TEACH exchanges before DEMONSTRATE
//   practiceCount      # of PRACTICE exercises
//   quizCount          # of QUIZ questions
//   passScore          fraction (0–1) needed to pass practice/quiz
//   commonMistake      the classic learner trap
//
// imageQuery rules: show the ACTION or OBJECT being taught, specific enough for
// Pexels to return a relevant, safe, real-world photo.
// ============================================================================

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1']

export const CURRICULUM = {
  A1: {
    displayName: 'Beginner',
    color: '#22c55e',
    requiredStarsToUnlock: 0,
    units: [
      {
        id: 1,
        title: 'Greetings & Introductions',
        concepts: [
          {
            id: 'A1_U1_C1',
            title: 'Basic Greetings',
            imageQuery: 'two people waving hello smiling',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'Hallo', en: 'Hello', phonetic: '[HA-lo]', gender: null, imageQuery: 'person waving hello smiling friendly' },
              { de: 'Guten Morgen', en: 'Good morning', phonetic: '[GOO-ten MOR-gen]', gender: null, imageQuery: 'sunrise morning coffee breakfast bright' },
              { de: 'Guten Tag', en: 'Good day', phonetic: '[GOO-ten TAHK]', gender: null, imageQuery: 'people greeting daytime street sunny' },
              { de: 'Guten Abend', en: 'Good evening', phonetic: '[GOO-ten AH-bent]', gender: null, imageQuery: 'evening city lights dinner warm' },
              { de: 'Tschüss', en: 'Bye', phonetic: '[CHUESS]', gender: null, imageQuery: 'person waving goodbye door' },
            ],
            grammarRule:
              'German greetings change by time of day. Use Morgen (morning), ' +
              'Tag (daytime), Abend (evening). Hallo and Tschüss work any time.',
            grammarRuleEnglish:
              "Think of it like English: you say 'Good morning' not 'Good day' " +
              'at 8am. German is the same.',
            exampleSentences: [
              { de: 'Hallo! Wie heißt du?', en: 'Hello! What is your name?', literal: 'Hello! How are-called you?' },
              { de: 'Guten Morgen, ich heiße Anna.', en: 'Good morning, my name is Anna.', literal: 'Good morning, I am-called Anna.' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              "Saying 'Guten Morgen' in the evening. Germans will notice and smile.",
          },
          {
            id: 'A1_U1_C2',
            title: 'Introducing Yourself',
            imageQuery: 'people shaking hands meeting first time',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'ich heiße', en: 'my name is', phonetic: '[ikh HY-suh]', gender: null, imageQuery: 'person holding name tag introduction' },
              { de: 'ich bin', en: 'I am', phonetic: '[ikh bin]', gender: null, imageQuery: 'person pointing to self smiling' },
              { de: 'wie geht es dir?', en: 'how are you?', phonetic: '[vee gait es deer]', gender: null, imageQuery: 'two friends talking asking conversation' },
              { de: 'gut', en: 'good / well', phonetic: '[goot]', gender: null, imageQuery: 'person thumbs up happy' },
              { de: 'und du?', en: 'and you?', phonetic: '[oont doo]', gender: null, imageQuery: 'two people conversation question gesture' },
            ],
            grammarRule:
              'Use "ich heiße + name" or "ich bin + name" to introduce yourself. ' +
              'The verb comes in second position.',
            grammarRuleEnglish:
              '"heiße" literally means "am called", so "ich heiße Anna" = "I am ' +
              'called Anna". English just says "my name is".',
            exampleSentences: [
              { de: 'Ich heiße Max. Und du?', en: "My name is Max. And you?", literal: 'I am-called Max. And you?' },
              { de: 'Mir geht es gut, danke!', en: "I'm doing well, thanks!", literal: 'To-me goes it good, thanks!' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Mixing up "ich heiße" (I am called) with "ich bin" — both work, but ' +
              'never say "ich heiße bin".',
          },
        ],
      },
      {
        id: 2,
        title: 'Numbers & Counting',
        concepts: [
          {
            id: 'A1_U2_C1',
            title: 'Numbers 0–10',
            imageQuery: 'child counting fingers hands',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'null', en: 'zero', phonetic: '[nool]', gender: null, imageQuery: 'empty bowl zero nothing' },
              { de: 'eins', en: 'one', phonetic: '[eyns]', gender: null, imageQuery: 'one finger raised hand' },
              { de: 'zwei', en: 'two', phonetic: '[tsvy]', gender: null, imageQuery: 'two fingers peace sign hand' },
              { de: 'drei', en: 'three', phonetic: '[dry]', gender: null, imageQuery: 'three fingers raised hand' },
              { de: 'vier', en: 'four', phonetic: '[feer]', gender: null, imageQuery: 'four fingers raised hand' },
              { de: 'fünf', en: 'five', phonetic: '[fuenf]', gender: null, imageQuery: 'open hand five fingers high five' },
            ],
            grammarRule:
              'German numbers 0–10 are fixed words you memorise. "eins" loses its ' +
              '-s when counting objects ("ein Buch").',
            grammarRuleEnglish:
              'Just like English one/two/three, these never change form when you ' +
              'count out loud. Drill them as a chant.',
            exampleSentences: [
              { de: 'Ich habe zwei Brüder.', en: 'I have two brothers.', literal: 'I have two brothers.' },
              { de: 'Das kostet fünf Euro.', en: 'That costs five euros.', literal: 'That costs five euro.' },
            ],
            teachSteps: 2,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Confusing "zwei" with "drei" when spoken fast. Stress the vowel: ' +
              'tsv-EYE vs. dr-EYE.',
          },
          {
            id: 'A1_U2_C2',
            title: 'Numbers 11–20',
            imageQuery: 'numbers chalkboard classroom counting',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'elf', en: 'eleven', phonetic: '[elf]', gender: null, imageQuery: 'number eleven sign sport jersey' },
              { de: 'zwölf', en: 'twelve', phonetic: '[tsvoelf]', gender: null, imageQuery: 'clock face twelve numbers' },
              { de: 'dreizehn', en: 'thirteen', phonetic: '[DRY-tsayn]', gender: null, imageQuery: 'number thirteen painted' },
              { de: 'sechzehn', en: 'sixteen', phonetic: '[ZEKH-tsayn]', gender: null, imageQuery: 'sixteen birthday candles cake' },
              { de: 'zwanzig', en: 'twenty', phonetic: '[TSVAN-tsikh]', gender: null, imageQuery: 'twenty euro banknote money' },
            ],
            grammarRule:
              'From 13–19, German adds "-zehn" (ten) to the unit: drei + zehn = ' +
              'dreizehn. 11 and 12 are irregular (elf, zwölf).',
            grammarRuleEnglish:
              'It mirrors English thir-TEEN, six-TEEN — German "-zehn" IS "-teen". ' +
              'But sechzehn drops the -s of sechs.',
            exampleSentences: [
              { de: 'Sie ist dreizehn Jahre alt.', en: 'She is thirteen years old.', literal: 'She is thirteen years old.' },
              { de: 'Ich habe zwanzig Euro.', en: 'I have twenty euros.', literal: 'I have twenty euro.' },
            ],
            teachSteps: 2,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Writing "sechszehn" — the correct form drops a letter: "sechzehn".',
          },
        ],
      },
      {
        id: 3,
        title: 'Colors & Basic Adjectives',
        concepts: [
          {
            id: 'A1_U3_C1',
            title: 'Common Colors',
            imageQuery: 'colorful paint palette rainbow',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'rot', en: 'red', phonetic: '[roht]', gender: null, imageQuery: 'red apple bright closeup' },
              { de: 'blau', en: 'blue', phonetic: '[blow]', gender: null, imageQuery: 'blue sky ocean clear' },
              { de: 'grün', en: 'green', phonetic: '[gruen]', gender: null, imageQuery: 'green leaves grass fresh' },
              { de: 'gelb', en: 'yellow', phonetic: '[gelp]', gender: null, imageQuery: 'yellow sunflower bright field' },
              { de: 'schwarz', en: 'black', phonetic: '[shvarts]', gender: null, imageQuery: 'black coal dark texture' },
            ],
            grammarRule:
              'Color words are adjectives. After "ist" they stay in their base ' +
              'form: "Das Auto ist rot."',
            grammarRuleEnglish:
              'When a color comes AFTER "is" (predicate), it never changes — just ' +
              'like English "the car is red".',
            exampleSentences: [
              { de: 'Der Himmel ist blau.', en: 'The sky is blue.', literal: 'The sky is blue.' },
              { de: 'Ich mag die Farbe grün.', en: 'I like the color green.', literal: 'I like the color green.' },
            ],
            teachSteps: 2,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Adding endings too early ("rotes Auto") before learning adjective ' +
              'declension. After "ist", keep colors plain.',
          },
          {
            id: 'A1_U3_C2',
            title: 'Describing Things',
            imageQuery: 'big and small objects size comparison',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'groß', en: 'big', phonetic: '[grohss]', gender: null, imageQuery: 'tall skyscraper building large' },
              { de: 'klein', en: 'small', phonetic: '[klyne]', gender: null, imageQuery: 'small mouse tiny cute' },
              { de: 'alt', en: 'old', phonetic: '[alt]', gender: null, imageQuery: 'old vintage antique clock' },
              { de: 'neu', en: 'new', phonetic: '[noy]', gender: null, imageQuery: 'new shiny product box' },
              { de: 'schön', en: 'beautiful', phonetic: '[shoern]', gender: null, imageQuery: 'beautiful mountain landscape scenery' },
            ],
            grammarRule:
              'Basic adjectives describe nouns. As predicates ("Es ist groß") they ' +
              'never take endings.',
            grammarRuleEnglish:
              'Same rule as colors: after "ist/sind" the adjective is plain. ' +
              'Endings only appear before a noun (later level).',
            exampleSentences: [
              { de: 'Das Haus ist groß.', en: 'The house is big.', literal: 'The house is big.' },
              { de: 'Mein Auto ist neu.', en: 'My car is new.', literal: 'My car is new.' },
            ],
            teachSteps: 2,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Confusing "groß" (big) with "grau" (grey) — watch the vowel and ß.',
          },
        ],
      },
      {
        id: 4,
        title: 'Family & Pronouns',
        concepts: [
          {
            id: 'A1_U4_C1',
            title: 'Family Members',
            imageQuery: 'happy family portrait together',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'die Mutter', en: 'the mother', phonetic: '[dee MOO-ter]', gender: 'die', imageQuery: 'mother smiling portrait warm' },
              { de: 'der Vater', en: 'the father', phonetic: '[dair FAH-ter]', gender: 'der', imageQuery: 'father smiling portrait warm' },
              { de: 'die Schwester', en: 'the sister', phonetic: '[dee SHVES-ter]', gender: 'die', imageQuery: 'two sisters hugging together' },
              { de: 'der Bruder', en: 'the brother', phonetic: '[dair BROO-der]', gender: 'der', imageQuery: 'two brothers together smiling' },
              { de: 'das Kind', en: 'the child', phonetic: '[das kint]', gender: 'das', imageQuery: 'child playing happy outdoors' },
            ],
            grammarRule:
              'Every German noun has a gender: der (masc), die (fem), das (neuter). ' +
              'Learn the article WITH the noun.',
            grammarRuleEnglish:
              'English has only "the", but German has three. Memorise der/die/das as ' +
              'part of the word, like a first name.',
            exampleSentences: [
              { de: 'Das ist meine Mutter.', en: 'This is my mother.', literal: 'This is my mother.' },
              { de: 'Mein Bruder heißt Tom.', en: 'My brother is called Tom.', literal: 'My brother is-called Tom.' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Guessing the article. "Mädchen" (girl) is "das", not "die" — gender ' +
              'is grammatical, not biological.',
          },
          {
            id: 'A1_U4_C2',
            title: 'Personal Pronouns',
            imageQuery: 'diverse group people talking together',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'ich', en: 'I', phonetic: '[ikh]', gender: null, imageQuery: 'person pointing to self portrait' },
              { de: 'du', en: 'you (informal)', phonetic: '[doo]', gender: null, imageQuery: 'person pointing at camera you' },
              { de: 'er', en: 'he', phonetic: '[air]', gender: null, imageQuery: 'young man smiling portrait' },
              { de: 'sie', en: 'she / they', phonetic: '[zee]', gender: null, imageQuery: 'young woman smiling portrait' },
              { de: 'wir', en: 'we', phonetic: '[veer]', gender: null, imageQuery: 'group friends together team huddle' },
            ],
            grammarRule:
              'Pronouns replace the subject and decide the verb ending. "sie" means ' +
              'both "she" and "they" — context tells you which.',
            grammarRuleEnglish:
              'Like English I/you/he/she, but watch "sie": lowercase can be "she" or ' +
              '"they"; capital "Sie" is formal "you".',
            exampleSentences: [
              { de: 'Wir sind Freunde.', en: 'We are friends.', literal: 'We are friends.' },
              { de: 'Er ist müde.', en: 'He is tired.', literal: 'He is tired.' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Using "du" with strangers or elders. In formal settings use "Sie" ' +
              '(capital S).',
          },
        ],
      },
    ],
  },

  // ---- A2–C1: minimal real stubs (1 unit / 1 concept each) -----------------
  A2: {
    displayName: 'Elementary',
    color: '#3b82f6',
    requiredStarsToUnlock: 0,
    units: [
      {
        id: 1,
        title: 'Daily Routines',
        concepts: [
          {
            id: 'A2_U1_C1',
            title: 'Separable Verbs',
            imageQuery: 'person morning routine alarm clock waking',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'aufstehen', en: 'to get up', phonetic: '[OWF-shtay-en]', gender: null, imageQuery: 'person getting out of bed morning stretch' },
              { de: 'anrufen', en: 'to call (phone)', phonetic: '[AN-roo-fen]', gender: null, imageQuery: 'person talking on phone call' },
              { de: 'einkaufen', en: 'to shop', phonetic: '[EYN-kow-fen]', gender: null, imageQuery: 'person shopping groceries supermarket cart' },
              { de: 'fernsehen', en: 'to watch TV', phonetic: '[FAIRN-zay-en]', gender: null, imageQuery: 'person watching television on couch' },
            ],
            grammarRule:
              'Separable verbs split: the prefix jumps to the end of the clause. ' +
              '"aufstehen" → "Ich stehe um 7 Uhr auf."',
            grammarRuleEnglish:
              'Like English phrasal verbs ("get UP", "call UP"), German sends the ' +
              'prefix to the very end of the sentence.',
            exampleSentences: [
              { de: 'Ich stehe früh auf.', en: 'I get up early.', literal: 'I stand early up.' },
              { de: 'Er ruft seine Mutter an.', en: 'He calls his mother.', literal: 'He calls his mother up.' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Forgetting to send the prefix to the end: "Ich aufstehe" is wrong; ' +
              'it must be "Ich stehe … auf".',
          },
        ],
      },
    ],
  },

  B1: {
    displayName: 'Intermediate',
    color: '#a855f7',
    requiredStarsToUnlock: 0,
    units: [
      {
        id: 1,
        title: 'Talking About the Past',
        concepts: [
          {
            id: 'B1_U1_C1',
            title: 'The Perfekt Tense',
            imageQuery: 'old photographs memories nostalgia album',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'gemacht', en: 'done / made', phonetic: '[ge-MAKHT]', gender: null, imageQuery: 'person finishing task checklist done' },
              { de: 'gegangen', en: 'gone', phonetic: '[ge-GANG-en]', gender: null, imageQuery: 'person walking away path distance' },
              { de: 'gegessen', en: 'eaten', phonetic: '[ge-GES-en]', gender: null, imageQuery: 'empty plate after meal finished' },
              { de: 'gesehen', en: 'seen', phonetic: '[ge-ZAY-en]', gender: null, imageQuery: 'person looking watching binoculars view' },
            ],
            grammarRule:
              'The Perfekt uses haben/sein + past participle at the end: "Ich habe ' +
              'Pizza gegessen." Movement verbs take "sein".',
            grammarRuleEnglish:
              'It is the everyday spoken past, like English "I have eaten" — but ' +
              'German uses it where English would say "I ate".',
            exampleSentences: [
              { de: 'Ich habe Pizza gegessen.', en: 'I ate pizza.', literal: 'I have pizza eaten.' },
              { de: 'Wir sind nach Berlin gefahren.', en: 'We drove to Berlin.', literal: 'We are to Berlin driven.' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Using "haben" with movement verbs. "Ich bin gegangen" (sein), not ' +
              '"ich habe gegangen".',
          },
        ],
      },
    ],
  },

  B2: {
    displayName: 'Upper Intermediate',
    color: '#f59e0b',
    requiredStarsToUnlock: 0,
    units: [
      {
        id: 1,
        title: 'Complex Sentences',
        concepts: [
          {
            id: 'B2_U1_C1',
            title: 'Subordinate Clauses',
            imageQuery: 'person thinking writing essay desk',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'weil', en: 'because', phonetic: '[vyle]', gender: null, imageQuery: 'person explaining reason gesture conversation' },
              { de: 'obwohl', en: 'although', phonetic: '[ob-VOLE]', gender: null, imageQuery: 'person walking in rain with umbrella' },
              { de: 'damit', en: 'so that', phonetic: '[da-MIT]', gender: null, imageQuery: 'person planning goal whiteboard arrow' },
              { de: 'während', en: 'while', phonetic: '[VEH-rent]', gender: null, imageQuery: 'person multitasking working laptop coffee' },
            ],
            grammarRule:
              'Subordinating conjunctions (weil, obwohl, dass …) send the conjugated ' +
              'verb to the very end of the clause.',
            grammarRuleEnglish:
              'English keeps verb order the same after "because"; German kicks the ' +
              'verb to the end: "… weil ich müde BIN".',
            exampleSentences: [
              { de: 'Ich bleibe zu Hause, weil ich krank bin.', en: 'I stay home because I am sick.', literal: 'I stay at home, because I sick am.' },
              { de: 'Obwohl es regnet, gehe ich spazieren.', en: 'Although it rains, I go for a walk.', literal: 'Although it rains, go I for-a-walk.' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Keeping normal word order after "weil". The verb must go last: ' +
              '"weil ich müde bin", not "weil ich bin müde".',
          },
        ],
      },
    ],
  },

  C1: {
    displayName: 'Advanced',
    color: '#ef4444',
    requiredStarsToUnlock: 0,
    units: [
      {
        id: 1,
        title: 'Nuanced Expression',
        concepts: [
          {
            id: 'C1_U1_C1',
            title: 'Passive Voice',
            imageQuery: 'factory production line process machinery',
            showImageInPhases: ['teach', 'demonstrate'],
            vocabulary: [
              { de: 'werden', en: 'to be (passive aux.)', phonetic: '[VAIR-den]', gender: null, imageQuery: 'factory machine working automated' },
              { de: 'hergestellt', en: 'manufactured', phonetic: '[HAIR-ge-shtelt]', gender: null, imageQuery: 'factory manufacturing products assembly' },
              { de: 'gebaut', en: 'built', phonetic: '[ge-BOWT]', gender: null, imageQuery: 'construction building site crane' },
              { de: 'verkauft', en: 'sold', phonetic: '[fair-KOWFT]', gender: null, imageQuery: 'store selling products checkout counter' },
            ],
            grammarRule:
              'The passive uses "werden" + past participle: "Das Auto wird gebaut." ' +
              'The doer is optional, introduced by "von".',
            grammarRuleEnglish:
              'English uses "to be" for passive ("is built"); German uses "werden", ' +
              'which otherwise means "to become".',
            exampleSentences: [
              { de: 'Das Auto wird in Deutschland gebaut.', en: 'The car is built in Germany.', literal: 'The car becomes in Germany built.' },
              { de: 'Die Tickets werden online verkauft.', en: 'The tickets are sold online.', literal: 'The tickets become online sold.' },
            ],
            teachSteps: 3,
            practiceCount: 4,
            quizCount: 5,
            passScore: 0.8,
            commonMistake:
              'Using "sein" instead of "werden" for the process passive. "wird ' +
              'gebaut" (is being built) vs. "ist gebaut" (is already built).',
          },
        ],
      },
    ],
  },
}

// ---- lookup helpers --------------------------------------------------------

export function getLevel(level) {
  return CURRICULUM[level] || null
}

export function getUnit(level, unitId) {
  const lvl = CURRICULUM[level]
  if (!lvl) return null
  return lvl.units.find((u) => u.id === unitId) || null
}

// Concept by its position within a unit (conceptIndex is 0-based).
export function getConcept(level, unitId, conceptIndex) {
  const unit = getUnit(level, unitId)
  if (!unit) return null
  return unit.concepts[conceptIndex] || null
}

export function getConceptById(conceptId) {
  for (const level of LEVEL_ORDER) {
    const lvl = CURRICULUM[level]
    if (!lvl) continue
    for (const unit of lvl.units) {
      const idx = unit.concepts.findIndex((c) => c.id === conceptId)
      if (idx >= 0) return { level, unitId: unit.id, conceptIndex: idx, concept: unit.concepts[idx] }
    }
  }
  return null
}

// Stable star key used everywhere (progression.js + stars.js must agree).
export function starKey(level, unitId, conceptId) {
  return `${level}_U${unitId}_${conceptId}`
}

// Given a position, return the next position (advancing concept → unit → level)
// or null if the whole course is finished.
export function nextPosition(level, unitId, conceptIndex) {
  const unit = getUnit(level, unitId)
  if (!unit) return null
  if (conceptIndex + 1 < unit.concepts.length) {
    return { level, unitId, conceptIndex: conceptIndex + 1 }
  }
  const lvl = CURRICULUM[level]
  const unitPos = lvl.units.findIndex((u) => u.id === unitId)
  if (unitPos + 1 < lvl.units.length) {
    return { level, unitId: lvl.units[unitPos + 1].id, conceptIndex: 0 }
  }
  const levelPos = LEVEL_ORDER.indexOf(level)
  if (levelPos + 1 < LEVEL_ORDER.length) {
    const nextLvl = LEVEL_ORDER[levelPos + 1]
    const firstUnit = CURRICULUM[nextLvl]?.units?.[0]
    if (firstUnit) return { level: nextLvl, unitId: firstUnit.id, conceptIndex: 0 }
  }
  return null
}
