// ============================================================================
// ANIME AVATAR SYSTEM — DiceBear "lorelei" + "adventurer" styles (no robots).
// Style is chosen by seed name; unknown seeds fall back to "adventurer".
// All renders should clip the SVG into a circle and sit on the seed's gradient.
// ============================================================================

const LORELEI = ['sakura', 'hana', 'yuki', 'rei', 'aoi', 'miku']
const ADVENTURER = ['kira', 'luna', 'nova', 'zara', 'aria', 'lyra']

// The 12 selectable avatar seeds (login + profile edit).
export const AVATAR_SEEDS = [...LORELEI, ...ADVENTURER]

// Unique soft gradient behind each character.
export const AVATAR_BACKGROUNDS = {
  sakura: 'linear-gradient(135deg, #fce4ec, #f48fb1)',
  hana: 'linear-gradient(135deg, #e8f5e9, #a5d6a7)',
  yuki: 'linear-gradient(135deg, #e3f2fd, #90caf9)',
  rei: 'linear-gradient(135deg, #ede7f6, #b39ddb)',
  aoi: 'linear-gradient(135deg, #e0f7fa, #80deea)',
  miku: 'linear-gradient(135deg, #f3e5f5, #ce93d8)',
  kira: 'linear-gradient(135deg, #fff8e1, #ffe082)',
  luna: 'linear-gradient(135deg, #fbe9e7, #ffab91)',
  nova: 'linear-gradient(135deg, #e8eaf6, #9fa8da)',
  zara: 'linear-gradient(135deg, #f9fbe7, #e6ee9c)',
  aria: 'linear-gradient(135deg, #e0f2f1, #80cbc4)',
  lyra: 'linear-gradient(135deg, #fce4ec, #ef9a9a)',
}

// Returns "lorelei" | "adventurer" for a given seed name.
export function getAvatarStyle(seed) {
  if (LORELEI.includes(seed)) return 'lorelei'
  if (ADVENTURER.includes(seed)) return 'adventurer'
  return 'adventurer' // live-preview seeds (usernames) → mixed anime style
}

// Returns the DiceBear SVG URL for a seed, using the seed-appropriate style.
export function getAvatarUrl(seed) {
  const s = seed || 'hans'
  const style = getAvatarStyle(s)
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(s)}&backgroundColor=transparent`
}

// Returns the gradient for a seed (falls back to a neutral green wash).
export function getAvatarBackground(seed) {
  return AVATAR_BACKGROUNDS[seed] || 'linear-gradient(135deg, #1f2937, #111827)'
}

// ---- backward-compat shim --------------------------------------------------
// Existing components import { avatarUrl }. Keep the name working so nothing
// breaks; it now returns an anime avatar instead of a robot.
export function avatarUrl(seed) {
  return getAvatarUrl(seed)
}
