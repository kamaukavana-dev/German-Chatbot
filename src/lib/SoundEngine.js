// ============================================================================
// SOUND ENGINE — programmatic Web Audio (no external files).
// Singleton: `import { sound } from '../lib/SoundEngine.js'` then sound.play('correct_answer').
// Respects hans_settings.soundEnabled (read live from localStorage on each call).
// AudioContext is lazily created on the first play() so we satisfy the browser
// autoplay policy (must follow a user gesture).
// ============================================================================

const SETTINGS_KEY = 'hans_settings'

function soundEnabled() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return true // default on
    const s = JSON.parse(raw)
    return s.soundEnabled !== false
  } catch {
    return true
  }
}

class SoundEngine {
  constructor() {
    this.ctx = null
  }

  _ensureCtx() {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    this.ctx = new AC()
    return this.ctx
  }

  // Resume a suspended context (Chrome suspends until a gesture).
  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
  }

  // One oscillator note. start/dur in seconds (relative to now).
  _note(freq, start, dur, { type = 'sine', gain = 0.2 } = {}) {
    const ctx = this.ctx
    const t0 = ctx.currentTime + start
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    // Short attack + exponential release to avoid clicks.
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur / 2))
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  // Linear frequency sweep over a single oscillator.
  _sweep(fromHz, toHz, start, dur, { type = 'sine', gain = 0.2 } = {}) {
    const ctx = this.ctx
    const t0 = ctx.currentTime + start
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(fromHz, t0)
    osc.frequency.linearRampToValueAtTime(toHz, t0 + dur)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  // Stacked notes = a chord at a given start time.
  _chord(freqs, start, dur, opts) {
    freqs.forEach((f) => this._note(f, start, dur, opts))
  }

  play(name) {
    if (!soundEnabled()) return
    const ctx = this._ensureCtx()
    if (!ctx) return
    this._resume()
    const ms = 0.001
    try {
      switch (name) {
        case 'correct_answer': // C4→E4→G4 ascending arpeggio, 80ms each, sine
          this._note(261.63, 0, 80 * ms, { type: 'sine', gain: 0.22 })
          this._note(329.63, 80 * ms, 80 * ms, { type: 'sine', gain: 0.22 })
          this._note(392.0, 160 * ms, 120 * ms, { type: 'sine', gain: 0.22 })
          break
        case 'wrong_answer': // G3→E3 descending buzz, square, 30% gain
          this._note(196.0, 0, 150 * ms, { type: 'square', gain: 0.18 })
          this._note(164.81, 150 * ms, 180 * ms, { type: 'square', gain: 0.18 })
          break
        case 'xp_gain': // 800hz tick, 40ms, triangle
          this._note(800, 0, 40 * ms, { type: 'triangle', gain: 0.16 })
          break
        case 'level_up': // C4→E4→G4→C5 fanfare
          this._note(261.63, 0, 110 * ms, { type: 'sine', gain: 0.24 })
          this._note(329.63, 100 * ms, 110 * ms, { type: 'sine', gain: 0.24 })
          this._note(392.0, 200 * ms, 110 * ms, { type: 'sine', gain: 0.24 })
          this._note(523.25, 300 * ms, 320 * ms, { type: 'sine', gain: 0.26 })
          // simple "reverb" tail
          this._note(523.25, 360 * ms, 420 * ms, { type: 'triangle', gain: 0.08 })
          break
        case 'streak_milestone': // 200→800hz sweep, 300ms, sine
          this._sweep(200, 800, 0, 300 * ms, { type: 'sine', gain: 0.2 })
          break
        case 'achievement_common': // E5→G5→C6 cheerful 3-note
          this._note(659.25, 0, 60 * ms, { type: 'sine', gain: 0.22 })
          this._note(783.99, 60 * ms, 60 * ms, { type: 'sine', gain: 0.22 })
          this._note(1046.5, 120 * ms, 160 * ms, { type: 'sine', gain: 0.22 })
          break
        case 'achievement_rare': { // richer 5-note with harmonic
          const seq = [523.25, 659.25, 783.99, 880.0, 1046.5]
          seq.forEach((f, i) => {
            this._note(f, i * 70 * ms, 90 * ms, { type: 'sine', gain: 0.2 })
            this._note(f * 2, i * 70 * ms, 90 * ms, { type: 'triangle', gain: 0.05 })
          })
          break
        }
        case 'achievement_epic': { // 4-chord progression, 400ms each
          const chords = [
            [261.63, 329.63, 392.0],
            [349.23, 440.0, 523.25],
            [392.0, 493.88, 587.33],
            [523.25, 659.25, 783.99],
          ]
          chords.forEach((c, i) => this._chord(c, i * 400 * ms, 420 * ms, { type: 'sine', gain: 0.12 }))
          break
        }
        case 'achievement_legendary': { // 3s layered orchestral swell
          const base = [130.81, 196.0, 261.63, 329.63, 392.0, 523.25]
          base.forEach((f, i) =>
            this._sweep(f * 0.5, f, i * 60 * ms, 3, { type: 'sine', gain: 0.08 }),
          )
          // bright top sparkle near the peak
          this._note(1046.5, 1.6, 1.2, { type: 'triangle', gain: 0.06 })
          this._note(1318.5, 2.0, 0.9, { type: 'triangle', gain: 0.05 })
          break
        }
        case 'quest_complete': { // 5-note major reward jingle
          const seq = [392.0, 523.25, 659.25, 783.99, 1046.5]
          seq.forEach((f, i) => this._note(f, i * 90 * ms, 130 * ms, { type: 'sine', gain: 0.2 }))
          break
        }
        case 'button_click': // 1000hz, 20ms, triangle, 10% gain
          this._note(1000, 0, 20 * ms, { type: 'triangle', gain: 0.1 })
          break
        default:
          break
      }
    } catch {
      /* audio errors are non-fatal */
    }
  }
}

export const sound = new SoundEngine()
export default sound
