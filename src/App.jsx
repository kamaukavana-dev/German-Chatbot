import { useState, useEffect } from 'react'
import AppTopBar from './components/AppTopBar.jsx'
import AppNav from './components/AppNav.jsx'
import Home from './components/Home.jsx'
import LessonPlayer from './components/LessonPlayer.jsx'
import PlacementTest from './components/PlacementTest.jsx'
import AITutor from './components/AITutor.jsx'
import Login from './components/Login.jsx'
import ProfilePage from './components/ProfilePage.jsx'
import Settings from './components/Settings.jsx'
import Quests from './components/Quests.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Guidebook from './components/Guidebook.jsx'
import Dashboard from './components/Dashboard.jsx'
import Friends from './components/Friends.jsx'
import Help from './components/Help.jsx'
import AchievementOverlay from './components/AchievementOverlay.jsx'
import { ToastHost, toast } from './lib/toast.jsx'
import { seedGhostFollowers } from './data/social.js'
import { loadProfile, saveProfile, defaultProfile } from './data/profile.js'
import { lessonById } from './data/curriculum.js'
import { XP_THRESHOLDS } from './engine.js'
import {
  initStore, getUser, setUser as persistUser, patchUser,
  getSettings, patchSettings as persistSettings,
  getActivity, markActiveToday,
  getAchievements, setAchievements,
  getQuests, setQuests, defaultQuests,
  getLeaderboard, todayISODate, clearAll,
} from './data/store.js'
import { rolloverQuests, unclaimedCount } from './data/quests.js'
import { evaluateAchievements, ACHIEVEMENT_BY_ID } from './data/achievements.js'
import { loadTheme, applyTheme } from './lib/theme.js'
import { sound } from './lib/SoundEngine.js'

// One-time store seeding (safe to call before render).
initStore()

function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayISODate(d)
}

export default function App() {
  const [profile, setProfile] = useState(loadProfile)
  const [user, setUserState] = useState(getUser)
  const [theme, setTheme] = useState(loadTheme)
  const [settings, setSettingsState] = useState(getSettings)
  const [activity, setActivityState] = useState(getActivity)
  const [achievements, setAchievementsState] = useState(getAchievements)
  const [quests, setQuestsState] = useState(() => rolloverQuests(getQuests() || defaultQuests()))
  const [leaderboard] = useState(getLeaderboard)
  const [achQueue, setAchQueue] = useState([])

  const [tab, setTab] = useState('home') // home | learn | quests | leaderboard | profile
  const [screen, setScreen] = useState(null) // null | {type:'lesson'|'placement'|'settings'|'tutor'|'guidebook'|'friends'|'help'}

  useEffect(() => saveProfile(profile), [profile])

  // Theme: apply class + enable color transitions after first paint.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])
  useEffect(() => {
    document.body.classList.add('hans-shell')
    const t = setTimeout(() => document.documentElement.classList.add('theme-anim'), 80)
    return () => clearTimeout(t)
  }, [])

  // Persist quest rollover (e.g. crossing midnight resets buckets).
  useEffect(() => setQuests(quests), [quests])

  // Referral capture: ?ref=<username> increments referrals once per link.
  useEffect(() => {
    if (!user) return
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      const seen = window.localStorage.getItem('hans_ref_seen')
      if (ref && ref !== user.username && seen !== ref) {
        window.localStorage.setItem('hans_ref_seen', ref)
        const u = patchUser({ referrals: (user.referrals || 0) + 1 })
        setUserState(u)
        runAchievementCheck({ referrals: u.referrals })
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username])

  // Ghost followers: on first-ever login (flagged in handleLogin), silently add
  // 5 seed followers after ~3s, then surface a friendly toast at ~4s.
  function triggerGhostFollowers() {
    setTimeout(() => {
      const added = seedGhostFollowers()
      if (added > 0) {
        setTimeout(() => toast(`${added} people started following you!`, { icon: 'ti-users', duration: 4000 }), 1000)
      }
    }, 3000)
  }

  // Keyboard shortcuts: Ctrl+D theme, Ctrl+M sound (Enter/Esc are lesson-local).
  useEffect(() => {
    function onKey(e) {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        const s = persistSettings({ soundEnabled: !getSettings().soundEnabled })
        setSettingsState(s)
        toast(`Sound ${s.soundEnabled ? 'on' : 'off'}`, { icon: s.soundEnabled ? 'ti-volume' : 'ti-volume-off' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---- achievement engine ----------------------------------------------------
  function runAchievementCheck(extra = {}) {
    const u = getUser() || {}
    const ctx = {
      lessonsCompleted: profile.completedLessons.length,
      totalXP: u.totalXP || 0,
      currentLevel: profile.cefr_level,
      streak: u.streak || 0,
      referrals: u.referrals || 0,
      questsClaimed: u.questsClaimed || 0,
      hourOfDay: new Date().getHours(),
      ...extra,
    }
    const have = getAchievements()
    const haveIds = have.map((a) => a.id)
    const newly = evaluateAchievements(ctx, haveIds)
    if (newly.length === 0) return
    const stamp = new Date().toISOString()
    const nextAch = [...have, ...newly.map((id) => ({ id, unlockedAt: stamp }))]
    setAchievements(nextAch)
    setAchievementsState(nextAch)
    // Award achievement XP into the lifetime total.
    const bonus = newly.reduce((sum, id) => sum + (ACHIEVEMENT_BY_ID[id]?.xpReward || 0), 0)
    if (bonus > 0) {
      const u2 = patchUser({ totalXP: (u.totalXP || 0) + bonus })
      setUserState(u2)
    }
    setAchQueue((q) => [...q, ...newly])
  }

  // ---- lesson completion integration ----------------------------------------
  function handleLessonComplete(summary) {
    const u = getUser() || {}
    const today = todayISODate()
    // streak: same day → unchanged; yesterday → +1; otherwise reset to 1.
    let streak = u.streak || 0
    if (u.lastActiveDate === today) {
      streak = streak || 1
    } else if (u.lastActiveDate === yesterdayISO()) {
      streak += 1
    } else {
      streak = 1
    }
    const updatedUser = patchUser({
      totalXP: (u.totalXP || 0) + (summary.gainedXp || 0),
      lessonsCompleted: (u.lessonsCompleted || 0) + (summary.newlyCompleted ? 1 : 0),
      currentLevel: summary.level,
      streak,
      lastActiveDate: today,
    })
    setUserState(updatedUser)
    setActivityState(markActiveToday())

    // quests
    setQuestsState((prev) => {
      const q = rolloverQuests(prev)
      q.daily.lessons += 1
      q.daily.xp += summary.gainedXp || 0
      q.daily.streak = Math.max(q.daily.streak, summary.bestCombo || 0)
      q.weekly.lessons += 1
      q.weekly.xp += summary.gainedXp || 0
      q.weekly.streakDays = Math.max(q.weekly.streakDays, streak)
      return { ...q }
    })

    // achievements (use the freshest context)
    runAchievementCheck({
      perfectLesson: summary.perfect,
      lessonDurationSec: summary.durationSec,
      bestCombo: summary.bestCombo,
      streak,
      currentLevel: summary.level,
      lessonsCompleted: profile.completedLessons.length,
      totalXP: updatedUser.totalXP,
    })
  }

  // ---- quest claim -----------------------------------------------------------
  function claimQuest(scope, quest) {
    setQuestsState((prev) => {
      const q = rolloverQuests(prev)
      if (!q[scope].claimed.includes(quest.id)) q[scope].claimed = [...q[scope].claimed, quest.id]
      return { ...q }
    })
    const u = getUser() || {}
    const u2 = patchUser({
      totalXP: (u.totalXP || 0) + quest.reward,
      questsClaimed: (u.questsClaimed || 0) + 1,
    })
    setUserState(u2)
    runAchievementCheck({ questsClaimed: u2.questsClaimed, totalXP: u2.totalXP })
  }

  // ---- profile mutations -----------------------------------------------------
  function patchProfile(patch) {
    setProfile((p) => {
      const merged = { ...p, ...patch }
      delete merged.justPromoted
      return merged
    })
  }

  function openNode(node) {
    if (node.kind === 'placement') setScreen({ type: 'placement' })
    else if (node.kind === 'lesson') {
      const lesson = lessonById(node.id)
      if (lesson) setScreen({ type: 'lesson', lesson })
    }
  }

  function finishPlacement(level) {
    patchProfile({
      cefr_level: level,
      xp: 0,
      xp_to_next_level: XP_THRESHOLDS[level],
      placementDone: true,
    })
    const u2 = patchUser({ currentLevel: level })
    setUserState(u2)
    setScreen(null)
  }

  function handleLogin(newUser) {
    // First-ever login = no prior hans_social ghost seeding has happened.
    const firstEver = !window.localStorage.getItem('hans_social')
    persistUser(newUser)
    setUserState(newUser)
    setActivityState(markActiveToday())
    runAchievementCheck({ currentLevel: newUser.currentLevel })
    if (firstEver) triggerGhostFollowers()
  }

  function handleLogout() {
    try {
      window.localStorage.removeItem('hans_user')
    } catch { /* ignore */ }
    setUserState(null)
    setScreen(null)
    setTab('learn')
  }

  function handleEditUser(patch) {
    const u2 = patchUser(patch)
    setUserState(u2)
  }

  function handleThemeChange(next) {
    sound.play('button_click')
    setTheme(next)
  }

  function handleSettingsChange(patch) {
    const s = persistSettings(patch)
    setSettingsState(s)
  }

  function handleReset() {
    clearAll()
    try {
      window.localStorage.removeItem('hans.profile.v2')
      window.localStorage.removeItem('hans_user')
      window.localStorage.removeItem('hans_ref_seen')
      window.localStorage.removeItem('hans_social')
    } catch { /* ignore */ }
    initStore()
    setProfile(defaultProfile())
    setUserState(null)
    setActivityState([])
    setAchievementsState([])
    setQuestsState(rolloverQuests(defaultQuests()))
    setScreen(null)
    setTab('learn')
  }

  function dismissAchievement() {
    sound.play('button_click')
    setAchQueue((q) => q.slice(1))
  }

  // ---- gate: no user → login -------------------------------------------------
  if (!user) return <Login onLogin={handleLogin} />

  // ---- full-screen legacy flows (kept on the light Duolingo surface) ---------
  if (screen?.type === 'lesson') {
    return (
      <div className="min-h-screen bg-white text-duo-ink">
        <LessonPlayer
          key={screen.lesson.lesson_id}
          lesson={screen.lesson}
          profile={profile}
          onProfileChange={patchProfile}
          onLessonComplete={handleLessonComplete}
          onExit={() => setScreen(null)}
        />
      </div>
    )
  }
  if (screen?.type === 'placement') {
    return (
      <div className="min-h-screen bg-white text-duo-ink">
        <PlacementTest onDone={finishPlacement} onExit={() => setScreen(null)} />
      </div>
    )
  }
  if (screen?.type === 'tutor') {
    return (
      <div className="min-h-screen bg-white text-duo-ink">
        <button onClick={() => setScreen(null)} className="absolute left-4 top-3 z-30 text-2xl text-duo-gray">✕</button>
        <AITutor profile={{ ...profile, name: user.username }} />
      </div>
    )
  }
  if (screen?.type === 'settings') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Settings
          theme={theme}
          settings={settings}
          onThemeChange={handleThemeChange}
          onSettingsChange={handleSettingsChange}
          onReset={handleReset}
          onClose={() => setScreen(null)}
          onOpenHelp={() => setScreen({ type: 'help' })}
        />
        <ToastHost />
      </div>
    )
  }
  if (screen?.type === 'guidebook') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Guidebook onPractice={() => { setScreen(null); setTab('learn') }} />
        <ToastHost />
      </div>
    )
  }
  if (screen?.type === 'friends') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Friends username={user.username} onClose={() => setScreen(null)} />
        <ToastHost />
      </div>
    )
  }
  if (screen?.type === 'help') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Help onClose={() => setScreen(null)} />
        <ToastHost />
      </div>
    )
  }

  // ---- themed app shell ------------------------------------------------------
  const badge = unclaimedCount(quests) > 0

  // current user's weekly leaderboard entry (injected into bot list)
  const lbEntries = [
    ...leaderboard,
    { username: user.username, xp: quests.weekly.xp || 0, avatar: user.avatarSeed, isBot: false },
  ].sort((a, b) => b.xp - a.xp)

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppTopBar
        streak={user.streak || 0}
        avatarSeed={user.avatarSeed}
        onOpenSettings={() => setScreen({ type: 'settings' })}
        onOpenTutor={() => setScreen({ type: 'tutor' })}
        onOpenGuide={() => setScreen({ type: 'guidebook' })}
        onOpenProfile={() => setTab('profile')}
      />

      <main className="flex-1">
        {tab === 'home' && (
          <Dashboard
            user={user}
            profile={profile}
            activity={activity}
            achievements={achievements}
            quests={quests}
            leaderboard={leaderboard}
            dailyGoal={settings.dailyXPGoal}
            onGoLearn={() => setTab('learn')}
            onGoQuests={() => setTab('quests')}
            onGoLeaderboard={() => setTab('leaderboard')}
            onGoAchievements={() => setTab('profile')}
          />
        )}
        {tab === 'learn' && (
          <div className="min-h-full bg-white text-duo-ink">
            <Home profile={profile} onOpen={openNode} />
          </div>
        )}
        {tab === 'quests' && <Quests quests={quests} onClaim={claimQuest} />}
        {tab === 'leaderboard' && <Leaderboard entries={lbEntries} currentUsername={user.username} />}
        {tab === 'profile' && (
          <ProfilePage
            user={user}
            profile={profile}
            activity={activity}
            achievements={achievements}
            onLogout={handleLogout}
            onEditUser={handleEditUser}
            onOpenFriends={() => setScreen({ type: 'friends' })}
          />
        )}
      </main>

      <AppNav active={tab} onChange={setTab} questBadge={badge} />

      <AchievementOverlay queue={achQueue} onDismiss={dismissAchievement} />
      <ToastHost />
    </div>
  )
}
