// ============================================================================
// ACHIEVEMENTS — 20 definitions + a pure check engine.
// State lives in hans_achievements: [{ id, unlockedAt }].
// `evaluateAchievements(ctx, alreadyUnlocked)` returns the list of NEWLY earned
// achievement ids given a context snapshot. The caller persists + animates them.
// ============================================================================

export const RARITY = {
  common: { label: 'Common', color: '#22c55e', sound: 'achievement_common' },
  rare: { label: 'Rare', color: '#3b82f6', sound: 'achievement_rare' },
  epic: { label: 'Epic', color: '#a855f7', sound: 'achievement_epic' },
  legendary: { label: 'Legendary', color: '#f59e0b', sound: 'achievement_legendary' },
}

export const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'First Step', desc: 'Complete your first lesson', icon: 'ti-star', xpReward: 10, rarity: 'common' },
  { id: 'streak_3', title: 'On Fire', desc: '3-day streak', icon: 'ti-flame', xpReward: 20, rarity: 'common' },
  { id: 'streak_7', title: 'Week Warrior', desc: '7-day streak', icon: 'ti-sword', xpReward: 50, rarity: 'rare' },
  { id: 'streak_30', title: 'Unstoppable', desc: '30-day streak', icon: 'ti-shield', xpReward: 200, rarity: 'legendary' },
  { id: 'perfect_lesson', title: 'Flawless', desc: '100% on a lesson', icon: 'ti-diamond', xpReward: 30, rarity: 'rare' },
  { id: 'level_a2', title: 'Rising', desc: 'Reach A2 level', icon: 'ti-trending-up', xpReward: 75, rarity: 'rare' },
  { id: 'level_b1', title: 'Halfway There', desc: 'Reach B1 level', icon: 'ti-award', xpReward: 150, rarity: 'epic' },
  { id: 'xp_500', title: 'XP Collector', desc: 'Earn 500 total XP', icon: 'ti-coin', xpReward: 25, rarity: 'common' },
  { id: 'invite_friend', title: 'Ambassador', desc: 'Invite a friend', icon: 'ti-users', xpReward: 30, rarity: 'common' },
  { id: 'speed_demon', title: 'Speed Demon', desc: 'Complete a lesson in under 60s', icon: 'ti-bolt', xpReward: 40, rarity: 'rare' },
  // ---- 10 more that make sense for a German learning app ----
  { id: 'lessons_5', title: 'Getting Started', desc: 'Complete 5 lessons', icon: 'ti-books', xpReward: 30, rarity: 'common' },
  { id: 'lessons_25', title: 'Bücherwurm', desc: 'Complete 25 lessons', icon: 'ti-book-2', xpReward: 100, rarity: 'epic' },
  { id: 'level_b2', title: 'Fluent Mind', desc: 'Reach B2 level', icon: 'ti-brain', xpReward: 250, rarity: 'epic' },
  { id: 'level_c1', title: 'Sprachmeister', desc: 'Reach C1 level', icon: 'ti-crown', xpReward: 400, rarity: 'legendary' },
  { id: 'xp_1000', title: 'Wortschatz', desc: 'Earn 1000 total XP', icon: 'ti-coins', xpReward: 75, rarity: 'rare' },
  { id: 'streak_14', title: 'Fortnight', desc: '14-day streak', icon: 'ti-calendar-stats', xpReward: 120, rarity: 'epic' },
  { id: 'combo_5', title: 'Im Fluss', desc: '5 correct answers in a row', icon: 'ti-arrows-up', xpReward: 25, rarity: 'common' },
  { id: 'combo_10', title: 'Unaufhaltsam', desc: '10 correct answers in a row', icon: 'ti-flame', xpReward: 60, rarity: 'rare' },
  { id: 'quest_master', title: 'Quest Master', desc: 'Claim 10 quests', icon: 'ti-checklist', xpReward: 80, rarity: 'rare' },
  { id: 'night_owl', title: 'Nachteule', desc: 'Study after midnight', icon: 'ti-moon', xpReward: 20, rarity: 'common' },
]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))

const LEVEL_RANK = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 }

// ctx fields (all optional — checks guard for undefined):
//   lessonsCompleted, totalXP, currentLevel, streak, perfectLesson,
//   lessonDurationSec, bestCombo, questsClaimed, referrals, hourOfDay
export function evaluateAchievements(ctx = {}, alreadyUnlocked = []) {
  const have = new Set(alreadyUnlocked)
  const lvl = LEVEL_RANK[ctx.currentLevel] ?? 0
  const tests = {
    first_lesson: (ctx.lessonsCompleted || 0) >= 1,
    lessons_5: (ctx.lessonsCompleted || 0) >= 5,
    lessons_25: (ctx.lessonsCompleted || 0) >= 25,
    streak_3: (ctx.streak || 0) >= 3,
    streak_7: (ctx.streak || 0) >= 7,
    streak_14: (ctx.streak || 0) >= 14,
    streak_30: (ctx.streak || 0) >= 30,
    perfect_lesson: !!ctx.perfectLesson,
    level_a2: lvl >= 1,
    level_b1: lvl >= 2,
    level_b2: lvl >= 3,
    level_c1: lvl >= 4,
    xp_500: (ctx.totalXP || 0) >= 500,
    xp_1000: (ctx.totalXP || 0) >= 1000,
    invite_friend: (ctx.referrals || 0) >= 1,
    speed_demon: ctx.lessonDurationSec != null && ctx.lessonDurationSec < 60,
    combo_5: (ctx.bestCombo || 0) >= 5,
    combo_10: (ctx.bestCombo || 0) >= 10,
    quest_master: (ctx.questsClaimed || 0) >= 10,
    night_owl: ctx.hourOfDay != null && (ctx.hourOfDay >= 0 && ctx.hourOfDay < 5),
  }
  const newly = []
  for (const a of ACHIEVEMENTS) {
    if (!have.has(a.id) && tests[a.id]) newly.push(a.id)
  }
  return newly
}
