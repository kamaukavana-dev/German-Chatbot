// ============================================================================
// GERMAN TEXT-TO-SPEECH — browser-native Web Speech API (no key, offline-capable
// where the OS/browser ships German voices; Chrome/Edge have the best support).
// ============================================================================
import { useState, useEffect, useCallback, useRef } from 'react'

let cachedVoices = []

function refreshVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  cachedVoices = window.speechSynthesis.getVoices() || []
  return cachedVoices
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices()
  // Voices often load async — listen for the event.
  window.speechSynthesis.onvoiceschanged = refreshVoices
}

export function supportsTTS() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Pick the best available German voice.
export function germanVoice() {
  const voices = (window.speechSynthesis?.getVoices?.() || cachedVoices).filter(Boolean)
  return (
    voices.find((v) => /de[-_]DE/i.test(v.lang)) ||
    voices.find((v) => /^de/i.test(v.lang)) ||
    voices.find((v) => /deutsch|german/i.test(v.name)) ||
    null
  )
}

export function hasGermanVoice() {
  return Boolean(germanVoice())
}

// Strip English glosses in parentheses so the German reads cleanly.
function cleanForSpeech(text) {
  return String(text)
    .replace(/\([^)]*\)/g, ' ') // remove (parenthetical English)
    .replace(/\s+/g, ' ')
    .trim()
}

export function speak(text, { rate = 0.92, pitch = 1, onstart, onend } = {}) {
  if (!supportsTTS()) {
    onend?.()
    return
  }
  const synth = window.speechSynthesis
  const clean = cleanForSpeech(text)
  if (!clean) {
    onend?.()
    return
  }
  synth.cancel() // stop anything currently playing
  const u = new SpeechSynthesisUtterance(clean)
  u.lang = 'de-DE'
  const v = germanVoice()
  if (v) u.voice = v
  u.rate = rate
  u.pitch = pitch
  if (onstart) u.onstart = onstart
  u.onend = () => onend?.()
  u.onerror = () => onend?.()
  synth.speak(u)
}

export function stopSpeaking() {
  if (supportsTTS()) window.speechSynthesis.cancel()
}

// React hook: say() with live `speaking` state for animating the mascot.
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      stopSpeaking()
    }
  }, [])

  const say = useCallback((text, opts = {}) => {
    speak(text, {
      ...opts,
      onstart: () => mounted.current && setSpeaking(true),
      onend: () => mounted.current && setSpeaking(false),
    })
  }, [])

  const stop = useCallback(() => {
    stopSpeaking()
    setSpeaking(false)
  }, [])

  return { say, stop, speaking, supported: supportsTTS() }
}
