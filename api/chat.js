// ============================================================================
// POST /api/chat — Vercel serverless function.
//   • request body  { messages: [{role, content}], level, phase?, concept?, lessonState? }
//   • response shape { reply, provider }
//   • status codes   400 (bad last msg / malformed prompt) / 429 (all providers
//                    rate-limited) / 405 / 500
//
// LLM calls go through lib/llm.js, which falls back across providers in order:
//   Groq → OpenRouter → Cerebras → Gemini (last resort).
// All keys stay server-side via Vercel env vars.
// ============================================================================
import { callLLM } from '../lib/llm.js'
import { systemPrompt, buildSystemPrompt } from './_lib/prompt.js'

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
    // Free-chat AI Tutor (no `phase`) → legacy level-only prompt.
    const instruction = phase ? buildSystemPrompt(phase, concept, lessonState) : systemPrompt(level)
    const maxTokens = phase ? 800 : 500

    const cleaned = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
      .slice(-20)

    if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from the user.' })
    }

    // Neutral message format: system instruction first, then the conversation.
    const llmMessages = [{ role: 'system', content: instruction }, ...cleaned]

    const { content, provider } = await callLLM(llmMessages, { maxTokens })
    const reply = (content || '').trim()

    return res.status(200).json({ reply: reply || '…', provider })
  } catch (err) {
    // Malformed prompt — a real client bug; surface it (don't dress it up as 503).
    if (err?.nonRetryable) {
      return res.status(400).json({ error: 'Request rejected: ' + (err.reason || err.message) })
    }
    // Every provider failed (rate limits / outages) — friendly message the UI
    // already knows how to show (allKeysExhausted). Detail goes to logs only.
    if (err?.allProvidersFailed) {
      console.error('[chat] all providers failed:\n', (err.failures || []).join('\n'))
      return res.status(429).json({
        error: 'HANS is taking a short break. Please try again in a few minutes.',
        allKeysExhausted: true,
      })
    }
    console.error('[chat] error:', err.message)
    return res.status(500).json({ error: 'AI request failed: ' + err.message })
  }
}
