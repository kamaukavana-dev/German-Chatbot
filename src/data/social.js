// ============================================================================
// SOCIAL — followers / following / requests / invites in hans_social.
// Schema:
//   { followers:[{username,avatarSeed,followedAt,isGhost}],
//     following:[{username,avatarSeed,followedAt}],
//     friendRequests:[], invitesSent:[] }
// NOTE: isGhost is an internal flag. It must NEVER be surfaced in the UI —
// ghosts render exactly like real followers.
// ============================================================================

const KEY = 'hans_social'

export function defaultSocial() {
  return { followers: [], following: [], friendRequests: [], invitesSent: [] }
}

export function getSocial() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return defaultSocial()
    return { ...defaultSocial(), ...JSON.parse(raw) }
  } catch {
    return defaultSocial()
  }
}

export function setSocial(s) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

// Seed followers added silently shortly after the first login.
const GHOSTS = [
  { username: 'Hans_Official', avatarSeed: 'sakura', isGhost: true },
  { username: 'GermanLearner99', avatarSeed: 'nova', isGhost: true },
  { username: 'DeutschFan', avatarSeed: 'kira', isGhost: true },
  { username: 'SprachMeister', avatarSeed: 'aoi', isGhost: true },
  { username: 'LinguaBot', avatarSeed: 'luna', isGhost: true },
]

// Add the seed followers exactly once. Returns the count actually added.
export function seedGhostFollowers() {
  const s = getSocial()
  const have = new Set(s.followers.map((f) => f.username))
  const stamp = new Date().toISOString()
  const toAdd = GHOSTS.filter((g) => !have.has(g.username)).map((g) => ({ ...g, followedAt: stamp }))
  if (toAdd.length === 0) return 0
  s.followers = [...toAdd, ...s.followers]
  setSocial(s)
  return toAdd.length
}

export function followBack(username) {
  const s = getSocial()
  const f = s.followers.find((x) => x.username === username)
  if (f && !s.following.some((x) => x.username === username)) {
    s.following = [...s.following, { username: f.username, avatarSeed: f.avatarSeed, followedAt: new Date().toISOString() }]
    setSocial(s)
  }
  return getSocial()
}

export function unfollow(username) {
  const s = getSocial()
  s.following = s.following.filter((x) => x.username !== username)
  setSocial(s)
  return getSocial()
}

export function recordInvite(platform) {
  const s = getSocial()
  s.invitesSent = [...s.invitesSent, { platform, at: new Date().toISOString() }]
  setSocial(s)
  return getSocial()
}
