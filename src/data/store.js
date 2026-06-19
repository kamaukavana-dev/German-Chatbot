// ============================================================================
// HANS STORE — single source of truth for every NEW `hans_` localStorage key.
// The legacy lesson engine continues to own `hans.profile.v2` (see data/profile.js);
// this module never touches that key. All new features read/write through here.
//
// KEYS:
//   hans_user         identity + lifetime aggregate stats
//   hans_theme        "dark" | "light"            (managed in lib/theme.js)
//   hans_settings     { dailyXPGoal, soundEnabled, hintLanguage }
//   hans_activity     string[]  ISO date strings (days the user was active)
//   hans_achievements { id, unlockedAt }[]
//   hans_quests       { daily:{...}, weekly:{...} }
//   hans_leaderboard  { username, xp, avatar, isBot }[]
// ============================================================================

export const KEYS = {
  user: 'hans_user',
  settings: 'hans_settings',
  activity: 'hans_activity',
  achievements: 'hans_achievements',
  quests: 'hans_quests',
  leaderboard: 'hans_leaderboard',
}

// ---- low-level JSON helpers ------------------------------------------------

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

// ---- date helpers ----------------------------------------------------------

export function todayISODate(d = new Date()) {
  // YYYY-MM-DD in local time
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Monday 00:00 of the week containing `d`, as an ISO date string.
export function weekStartISO(d = new Date()) {
  const date = new Date(d)
  const dow = date.getDay() // 0 Sun … 6 Sat
  const diff = (dow + 6) % 7 // days since Monday
  date.setDate(date.getDate() - diff)
  date.setHours(0, 0, 0, 0)
  return todayISODate(date)
}

// Next Monday 00:00 as a Date (for the leaderboard countdown).
export function nextMondayDate(now = new Date()) {
  const d = new Date(now)
  const dow = d.getDay()
  const daysUntilMonday = (8 - dow) % 7 || 7
  d.setDate(d.getDate() + daysUntilMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

// ---- defaults --------------------------------------------------------------

export function defaultUser() {
  return {
    username: '',
    avatarSeed: '',
    joinDate: '',
    totalXP: 0,
    currentLevel: 'A1',
    streak: 0,
    lastActiveDate: '',
    referrals: 0,
    lessonsCompleted: 0,
  }
}

export function defaultSettings() {
  return {
    dailyXPGoal: 20,
    soundEnabled: true,
    hintLanguage: 'German + English hints',
    tooltipsSeen: [],
  }
}

// ---- tutorial tooltips -----------------------------------------------------
export function tooltipSeen(id) {
  const seen = getSettings().tooltipsSeen || []
  return seen.includes(id)
}
export function markTooltipSeen(id) {
  const s = getSettings()
  const seen = s.tooltipsSeen || []
  if (!seen.includes(id)) {
    s.tooltipsSeen = [...seen, id]
    setSettings(s)
  }
  return s
}

export function defaultQuests() {
  return {
    daily: { date: todayISODate(), lessons: 0, streak: 0, xp: 0, claimed: [] },
    weekly: { weekStart: weekStartISO(), lessons: 0, streakDays: 0, xp: 0, claimed: [] },
  }
}

const GERMAN_BOTS = [
  { username: 'MaxMüller', xp: 340, avatar: 'bot1', isBot: true },
  { username: 'AnnaSchmidt', xp: 290, avatar: 'bot2', isBot: true },
  { username: 'LeonWagner', xp: 255, avatar: 'bot3', isBot: true },
  { username: 'MiaBecker', xp: 210, avatar: 'bot4', isBot: true },
  { username: 'PaulHoffmann', xp: 175, avatar: 'bot5', isBot: true },
  { username: 'EmmaFischer', xp: 140, avatar: 'bot6', isBot: true },
  { username: 'JonasWeber', xp: 110, avatar: 'bot7', isBot: true },
  { username: 'LinaSchulz', xp: 80, avatar: 'bot8', isBot: true },
  { username: 'FelixKoch', xp: 55, avatar: 'bot9', isBot: true },
]

export function defaultLeaderboard() {
  return GERMAN_BOTS.map((b) => ({ ...b }))
}

// ---- typed accessors -------------------------------------------------------

export const getUser = () => read(KEYS.user, null)
export const setUser = (u) => write(KEYS.user, u)
export const patchUser = (patch) => {
  const u = { ...defaultUser(), ...(getUser() || {}), ...patch }
  setUser(u)
  return u
}

export const getSettings = () => ({ ...defaultSettings(), ...(read(KEYS.settings, {}) || {}) })
export const setSettings = (s) => write(KEYS.settings, { ...defaultSettings(), ...s })
export const patchSettings = (patch) => {
  const s = { ...getSettings(), ...patch }
  setSettings(s)
  return s
}

export const getActivity = () => read(KEYS.activity, []) || []
export const setActivity = (a) => write(KEYS.activity, a)
export function markActiveToday() {
  const today = todayISODate()
  const a = getActivity()
  if (!a.includes(today)) {
    const next = [...a, today]
    setActivity(next)
    return next
  }
  return a
}

export const getAchievements = () => read(KEYS.achievements, []) || []
export const setAchievements = (a) => write(KEYS.achievements, a)

export const getQuests = () => read(KEYS.quests, null)
export const setQuests = (q) => write(KEYS.quests, q)

export const getLeaderboard = () => read(KEYS.leaderboard, null)
export const setLeaderboard = (l) => write(KEYS.leaderboard, l)

// ---- one-time initialization ----------------------------------------------
// Seeds any missing hans_ key with its default so no screen is ever empty.
// Called once on app start (does NOT create hans_user — that gates the login).

export function initStore() {
  if (read(KEYS.settings, null) == null) setSettings(defaultSettings())
  if (read(KEYS.activity, null) == null) setActivity([])
  if (read(KEYS.achievements, null) == null) setAchievements([])
  if (read(KEYS.quests, null) == null) setQuests(defaultQuests())
  if (read(KEYS.leaderboard, null) == null) setLeaderboard(defaultLeaderboard())
}

// Wipe every hans_ key (used by Settings → reset progress and Profile → logout
// optionally). Returns nothing.
export function clearAll({ keepNothing = true } = {}) {
  Object.values(KEYS).forEach((k) => {
    try {
      window.localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
  if (keepNothing) {
    try {
      window.localStorage.removeItem('hans_theme')
    } catch {
      /* ignore */
    }
  }
}
