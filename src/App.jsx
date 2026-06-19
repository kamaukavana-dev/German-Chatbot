import { useState, useEffect } from 'react'
import TopBar from './components/TopBar.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './components/Home.jsx'
import Profile from './components/Profile.jsx'
import LessonPlayer from './components/LessonPlayer.jsx'
import PlacementTest from './components/PlacementTest.jsx'
import AITutor from './components/AITutor.jsx'
import { loadProfile, saveProfile } from './data/profile.js'
import { lessonById } from './data/curriculum.js'
import { XP_THRESHOLDS } from './engine.js'

export default function App() {
  const [profile, setProfile] = useState(loadProfile)
  const [tab, setTab] = useState('home') // home | tutor | profile
  const [screen, setScreen] = useState(null) // null | {type:'lesson',lesson} | {type:'placement'}

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  function patchProfile(patch) {
    setProfile((p) => {
      const merged = { ...p, ...patch }
      delete merged.justPromoted
      return merged
    })
  }

  function openNode(node) {
    if (node.kind === 'placement') {
      setScreen({ type: 'placement' })
    } else if (node.kind === 'lesson') {
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
    setScreen(null)
  }

  // ---- Full-screen flows (no nav) ----
  if (screen?.type === 'lesson') {
    return (
      <LessonPlayer
        key={screen.lesson.lesson_id}
        lesson={screen.lesson}
        profile={profile}
        onProfileChange={patchProfile}
        onExit={() => setScreen(null)}
      />
    )
  }
  if (screen?.type === 'placement') {
    return <PlacementTest onDone={finishPlacement} onExit={() => setScreen(null)} />
  }

  // ---- Tabbed main app ----
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar profile={profile} />
      <main className="flex-1">
        {tab === 'home' && <Home profile={profile} onOpen={openNode} />}
        {tab === 'tutor' && <AITutor profile={profile} />}
        {tab === 'profile' && <Profile profile={profile} onReset={setProfile} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
