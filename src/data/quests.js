// ============================================================================
// QUESTS — definitions + reset logic. Progress lives in hans_quests:
//   { daily: { date, lessons, streak, xp, claimed[] },
//     weekly:{ weekStart, lessons, streakDays, claimed[] } }
// ============================================================================
import { todayISODate, weekStartISO, defaultQuests } from './store.js'

export const DAILY_QUESTS = [
  { id: 'd_lessons', title: 'Complete 3 lessons', icon: 'ti-book', field: 'lessons', goal: 3, reward: 15 },
  { id: 'd_combo', title: 'Get 5 correct in a row', icon: 'ti-flame', field: 'streak', goal: 5, reward: 20 },
  { id: 'd_xp', title: 'Earn 20 XP today', icon: 'ti-bolt', field: 'xp', goal: 20, reward: 10 },
]

export const WEEKLY_QUESTS = [
  { id: 'w_lessons', title: 'Complete 10 lessons this week', icon: 'ti-books', field: 'lessons', goal: 10, reward: 50, badge: false },
  { id: 'w_streak', title: 'Maintain a 5-day streak', icon: 'ti-calendar-stats', field: 'streakDays', goal: 5, reward: 100, badge: true },
]

// Roll over daily/weekly buckets if the date/week changed. Returns possibly-new quests.
export function rolloverQuests(q) {
  const base = q && q.daily && q.weekly ? q : defaultQuests()
  const today = todayISODate()
  const week = weekStartISO()
  const next = { daily: { ...base.daily }, weekly: { ...base.weekly } }
  if (next.daily.date !== today) {
    next.daily = { date: today, lessons: 0, streak: 0, xp: 0, claimed: [] }
  }
  if (next.weekly.weekStart !== week) {
    next.weekly = { weekStart: week, lessons: 0, streakDays: 0, xp: 0, claimed: [] }
  }
  if (!Array.isArray(next.daily.claimed)) next.daily.claimed = []
  if (!Array.isArray(next.weekly.claimed)) next.weekly.claimed = []
  // Coerce numeric counters so an older saved blob can't yield NaN on +=.
  for (const k of ['lessons', 'streak', 'xp']) next.daily[k] = Number(next.daily[k]) || 0
  for (const k of ['lessons', 'streakDays', 'xp']) next.weekly[k] = Number(next.weekly[k]) || 0
  return next
}

export function questProgress(quest, bucket) {
  const v = bucket[quest.field] || 0
  return { value: Math.min(v, quest.goal), done: v >= quest.goal }
}

// Count of completed-but-unclaimed quests (for the nav badge).
export function unclaimedCount(q) {
  if (!q) return 0
  const r = rolloverQuests(q)
  let n = 0
  for (const quest of DAILY_QUESTS) {
    const { done } = questProgress(quest, r.daily)
    if (done && !r.daily.claimed.includes(quest.id)) n++
  }
  for (const quest of WEEKLY_QUESTS) {
    const { done } = questProgress(quest, r.weekly)
    if (done && !r.weekly.claimed.includes(quest.id)) n++
  }
  return n
}
