// ============================================================================
// POST /api/chat — Vercel serverless function.
// Exact functional mirror of the original Express handler in backend/server.js:
//   • same SDK (@google/genai, GoogleGenAI)
//   • same model (GEMINI_MODEL || 'gemini-2.5-flash')
//   • same request body  { messages: [{role, content}], level }
//   • same response shape { reply }
//   • same status codes   503 (no key) / 400 (bad last msg) / 500 (error)
// Keys stay server-side via GEMINI_API_KEY_1..4 (Vercel env vars), rotated by
// api/_lib/geminiClient.js on 429.
// ============================================================================
import { callGemini } from './_lib/geminiClient.js'
import { systemPrompt, buildSystemPrompt } from './_lib/prompt.js'

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

export default async function handler(req, res) {
  // CORS (harmless on Vercel same-origin; helps local cross-port testing).
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { messages = [], level, phase, concept, lessonState } = req.body || {}

    // Phased guided lesson → phase-aware system prompt.
    // Free-chat AI Tutor (no `phase`) → legacy level-only prompt (unchanged).
    const instruction = phase
      ? buildSystemPrompt(phase, concept, lessonState)
      : systemPrompt(level)
    // Phased lessons can be wordier (worked examples, multi-line feedback).
    const maxOutputTokens = phase ? 700 : 400

    const cleaned = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
      .slice(-20)

    if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from the user.' })
    }

    // Gemini uses `model` for assistant turns and a `parts` array for content.
    const contents = cleaned.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const response = await callGemini((client) =>
      client.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: instruction,
          maxOutputTokens,
        },
      }),
    )

    const reply = (response.text || '').trim()

    return res.status(200).json({ reply: reply || '…' })
  } catch (err) {
    // All keys rate-limited → friendly 429 the UI can detect (never raw quota text).
    if (err?.allKeysExhausted || err?.status === 429) {
      return res.status(429).json({
        error: 'HANS is taking a short break. Please try again in a few minutes.',
        allKeysExhausted: true,
      })
    }
    console.error('[chat] error:', err.message)
    return res.status(500).json({ error: 'AI request failed: ' + err.message })
  }
}
