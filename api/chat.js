// ============================================================================
// POST /api/chat — Vercel serverless function.
// Exact functional mirror of the original Express handler in backend/server.js:
//   • same SDK (@google/genai, GoogleGenAI)
//   • same model (GEMINI_MODEL || 'gemini-2.5-flash')
//   • same request body  { messages: [{role, content}], level }
//   • same response shape { reply }
//   • same status codes   503 (no key) / 400 (bad last msg) / 500 (error)
// Key stays server-side via process.env.GEMINI_API_KEY (Vercel env var).
// ============================================================================
import { GoogleGenAI } from '@google/genai'
import { systemPrompt } from './_lib/prompt.js'

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const apiKey = process.env.GEMINI_API_KEY
const client = apiKey ? new GoogleGenAI({ apiKey }) : null

export default async function handler(req, res) {
  // CORS (harmless on Vercel same-origin; helps local cross-port testing).
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!client) {
    return res.status(503).json({
      error:
        'AI tutor not configured. Add GEMINI_API_KEY to a .env file (see .env.example) and restart.',
    })
  }

  try {
    const { messages = [], level } = req.body || {}
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

    const response = await client.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt(level),
        maxOutputTokens: 400,
      },
    })

    const reply = (response.text || '').trim()

    return res.status(200).json({ reply: reply || '…' })
  } catch (err) {
    console.error('[chat] error:', err.message)
    return res.status(500).json({ error: 'AI request failed: ' + err.message })
  }
}
