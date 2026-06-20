import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Mascot3D from './Mascot3D.jsx'
import SpeakButton from './SpeakButton.jsx'
import { useSpeech } from '../lib/speech.js'

const STARTERS = [
  'Hallo! Wie geht es dir?',
  'Können wir über das Wetter sprechen?',
  'Korrigiere bitte: Ich habe gestern ins Kino gegangen.',
  'Stell mir eine einfache Frage auf Deutsch.',
]

export default function AITutor({ profile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hallo${profile.name ? ' ' + profile.name : ''}! Ich bin dein KI-Tutor. 🦉\nLass uns auf Deutsch üben — schreib mir einfach etwas! (Level ${profile.cefr_level})`,
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const scrollRef = useRef(null)
  const { say, stop, speaking, supported } = useSpeech()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  async function send(text) {
    const content = (text ?? input).trim()
    if (!content || busy) return
    setError(null)
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: profile.cefr_level,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error ${res.status}`)
      }
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
      if (autoSpeak) say(data.reply)
    } catch (e) {
      setError(
        e.message.includes('Failed to fetch')
          ? 'Cannot reach the AI backend (/api/chat). Run `npm run dev` (vercel dev) and set your Gemini API keys in .env.'
          : e.message,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-118px)] max-w-2xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center gap-3">
        <Mascot3D mood="idle" talking={speaking} className="h-14 w-14" />
        <div>
          <div className="text-lg font-extrabold text-duo-ink">AI Tutor</div>
          <div className="text-xs font-semibold text-duo-gray">
            Powered by Gemini · speaks {profile.cefr_level} German
          </div>
        </div>
        {supported && (
          <button
            onClick={() => {
              if (autoSpeak) stop()
              setAutoSpeak((v) => !v)
            }}
            title={autoSpeak ? 'Mute the owl' : 'Let the owl speak'}
            className={`ml-auto rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold ${
              autoSpeak
                ? 'border-duo-blue bg-duo-blue text-white'
                : 'border-duo-line bg-white text-duo-gray'
            }`}
          >
            {autoSpeak ? '🔊 Speaking' : '🔇 Muted'}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto pb-2">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] items-start gap-2 rounded-2xl px-4 py-2.5 font-semibold ${
                m.role === 'user'
                  ? 'bg-duo-blue text-white'
                  : 'border-2 border-duo-line bg-white text-duo-ink'
              }`}
            >
              <span className="whitespace-pre-wrap">{m.content}</span>
              {m.role === 'assistant' && <SpeakButton text={m.content} size="sm" />}
            </div>
          </motion.div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border-2 border-duo-line bg-white px-4 py-2.5 font-bold text-duo-gray">
              tippt…
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-[#ffdfe0] px-4 py-2.5 text-sm font-semibold text-duo-redDark">
            {error}
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border-2 border-duo-line bg-white px-3 py-1 text-xs font-bold text-duo-blue"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          placeholder="Schreib auf Deutsch…"
          className="flex-1 resize-none rounded-2xl border-2 border-duo-line bg-duo-snow px-4 py-3 font-semibold text-duo-ink outline-none focus:border-duo-blue"
        />
        <button
          onClick={() => send()}
          disabled={busy || !input.trim()}
          className={input.trim() && !busy ? 'duo-btn-green px-5 py-3' : 'duo-btn-locked px-5 py-3'}
        >
          ➤
        </button>
      </div>
    </div>
  )
}
