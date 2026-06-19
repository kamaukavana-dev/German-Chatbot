// German proverbs with English translations. Rotates daily by date seed.
export const PROVERBS = [
  ['Übung macht den Meister.', 'Practice makes perfect.'],
  ['Morgenstund hat Gold im Mund.', 'The early bird catches the worm.'],
  ['Aller Anfang ist schwer.', 'All beginnings are hard.'],
  ['Wer rastet, der rostet.', 'He who rests grows rusty.'],
  ['Ende gut, alles gut.', 'All’s well that ends well.'],
  ['Lügen haben kurze Beine.', 'Lies have short legs (don’t get you far).'],
  ['Wer A sagt, muss auch B sagen.', 'In for a penny, in for a pound.'],
  ['Der Apfel fällt nicht weit vom Stamm.', 'The apple doesn’t fall far from the tree.'],
  ['Kleinvieh macht auch Mist.', 'Every little bit helps.'],
  ['Wo ein Wille ist, ist auch ein Weg.', 'Where there’s a will, there’s a way.'],
]

// Deterministic daily pick from a YYYY-MM-DD string.
export function proverbOfDay(dateStr) {
  let h = 0
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) % 100000
  return PROVERBS[h % PROVERBS.length]
}
