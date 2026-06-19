// ============================================================================
// GUIDEBOOK CONTENT — hardcoded grammar reference by CEFR level. No API.
// Each topic: { id, title, rule, examples[2], mistake }
// ============================================================================

export const GUIDEBOOK = {
  A1: [
    {
      id: 'a1_articles',
      title: 'Articles (der / die / das)',
      rule: 'Every German noun has a gender: masculine (der), feminine (die), or neuter (das). The article must match the noun, and you learn the gender together with the word.',
      examples: ['der Tisch (the table)', 'die Lampe (the lamp) · das Buch (the book)'],
      mistake: 'Guessing the gender from the English meaning — gender is grammatical, not logical (das Mädchen = the girl, neuter).',
    },
    {
      id: 'a1_pronouns',
      title: 'Personal pronouns',
      rule: 'Subject pronouns replace the person doing the action: ich, du, er/sie/es, wir, ihr, sie/Sie. "Sie" (capitalized) is the formal "you".',
      examples: ['ich bin (I am) · du bist (you are)', 'wir sind (we are) · sie sind (they are)'],
      mistake: 'Using informal "du" with strangers or officials — use formal "Sie" until invited otherwise.',
    },
    {
      id: 'a1_present',
      title: 'Present tense (sein, haben, regular verbs)',
      rule: 'Regular verbs drop -en and add endings: ich -e, du -st, er -t, wir -en, ihr -t, sie -en. "sein" and "haben" are irregular and must be memorized.',
      examples: ['ich spiele, du spielst, er spielt', 'ich habe, du hast · ich bin, du bist'],
      mistake: 'Forgetting the -st / -t endings: "du spiele" is wrong; it must be "du spielst".',
    },
    {
      id: 'a1_word_order',
      title: 'Basic word order (V2 rule)',
      rule: 'In a main clause the conjugated verb is always the second element. The subject can move, but the verb stays in position two.',
      examples: ['Ich gehe heute ins Kino.', 'Heute gehe ich ins Kino. (verb still 2nd)'],
      mistake: 'Saying "Heute ich gehe…" — putting the subject before the verb pushes the verb out of position two.',
    },
    {
      id: 'a1_numbers',
      title: 'Numbers 1–100',
      rule: 'Numbers 21–99 are said "units-and-tens": einundzwanzig = one-and-twenty. They are written as one word.',
      examples: ['21 = einundzwanzig', '47 = siebenundvierzig'],
      mistake: 'Saying the tens first like English ("zwanzigeins") — German reverses it: ein-und-zwanzig.',
    },
    {
      id: 'a1_nouns',
      title: 'Common nouns (with gender)',
      rule: 'Capitalize every noun in German. Learn nouns with their article so the gender sticks.',
      examples: ['der Mann, die Frau, das Kind', 'der Apfel, die Milch, das Wasser'],
      mistake: 'Writing nouns in lowercase — all German nouns are always capitalized, mid-sentence too.',
    },
  ],
  A2: [
    {
      id: 'a2_perfekt',
      title: 'Perfect tense (Perfekt)',
      rule: 'Spoken past uses haben/sein + past participle at the end. Most verbs take haben; motion/change verbs take sein.',
      examples: ['Ich habe gegessen.', 'Ich bin gegangen.'],
      mistake: 'Using haben with motion verbs: "Ich habe gegangen" → should be "Ich bin gegangen".',
    },
    {
      id: 'a2_akkusativ',
      title: 'Accusative case',
      rule: 'The direct object takes the accusative. Only the masculine article changes: der → den.',
      examples: ['Ich sehe den Mann.', 'Ich kaufe die Lampe / das Buch.'],
      mistake: 'Leaving masculine as "der": "Ich sehe der Mann" → "den Mann".',
    },
    {
      id: 'a2_modal',
      title: 'Modal verbs',
      rule: 'Modals (können, müssen, wollen…) conjugate in position two and send the main verb to the end as an infinitive.',
      examples: ['Ich kann Deutsch sprechen.', 'Wir müssen jetzt gehen.'],
      mistake: 'Conjugating the second verb: "Ich kann spreche" → keep it infinitive: "sprechen".',
    },
  ],
  B1: [
    {
      id: 'b1_dativ',
      title: 'Dative case',
      rule: 'The indirect object takes the dative: der→dem, die→der, das→dem, plural→den (+n). Many prepositions trigger it.',
      examples: ['Ich gebe dem Kind ein Buch.', 'Ich fahre mit dem Bus.'],
      mistake: 'Using accusative after dative prepositions: "mit den Bus" → "mit dem Bus".',
    },
    {
      id: 'b1_konjunktiv2',
      title: 'Konjunktiv II (would / could)',
      rule: 'Express hypotheticals and politeness with würde + infinitive, or special forms hätte / wäre / könnte.',
      examples: ['Ich würde gern kommen.', 'Ich hätte gern einen Kaffee.'],
      mistake: 'Overusing würde with haben/sein — prefer hätte / wäre directly.',
    },
    {
      id: 'b1_relativ',
      title: 'Relative clauses',
      rule: 'Relative pronouns (der/die/das/den/dem…) match the noun and send the verb to the clause end.',
      examples: ['Der Mann, der dort steht, ist mein Lehrer.', 'Das Buch, das ich lese, ist gut.'],
      mistake: 'Forgetting verb-final order: "…, der steht dort," → "…, der dort steht,".',
    },
  ],
  B2: [
    {
      id: 'b2_passiv',
      title: 'Passive voice',
      rule: 'Werden + past participle forms the passive. The agent is introduced with von (person) or durch (means).',
      examples: ['Das Haus wird gebaut.', 'Der Brief wurde von Anna geschrieben.'],
      mistake: 'Using sein instead of werden for the process passive: "Das Haus ist gebaut" describes a state, not the action.',
    },
    {
      id: 'b2_konnektoren',
      title: 'Two-part connectors',
      rule: 'Connectors like entweder…oder, sowohl…als auch, je…desto link ideas and affect word order.',
      examples: ['Je mehr ich lerne, desto besser verstehe ich.', 'Sowohl Anna als auch Paul kommen.'],
      mistake: 'Ignoring the inversion after "je…desto": the desto-clause needs verb-final then verb-second.',
    },
  ],
  C1: [
    {
      id: 'c1_nominalstil',
      title: 'Nominal style (Nominalisierung)',
      rule: 'Formal/academic German favors noun phrases over verbs, often with genitive constructions.',
      examples: ['die Durchführung des Projekts', 'aufgrund der steigenden Nachfrage'],
      mistake: 'Mixing registers — nominal style belongs in formal writing, not casual speech.',
    },
    {
      id: 'c1_partizip',
      title: 'Extended participial phrases',
      rule: 'Participles can act as compact adjectives carrying their own objects before the noun.',
      examples: ['das gestern gekaufte Buch', 'die von vielen erwartete Entscheidung'],
      mistake: 'Building phrases so long the reader loses the head noun — keep them readable.',
    },
  ],
}

export const GUIDEBOOK_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
