// ============================================================================
// GET /api/health — probes every LLM provider in parallel with a trivial
// 1-token prompt and a short timeout, returning per-provider status:
//   ok | auth-failed | rate-limited | timeout | key-missing | server-error |
//   network | bad-request | unknown
// Replaces the old Gemini-only key-count check.
// ============================================================================
import { callGroq, GROQ_PROVIDER } from '../lib/providers/groq.js'
import { callOpenRouter, OPENROUTER_PROVIDER } from '../lib/providers/openrouter.js'
import { callCerebras, CEREBRAS_PROVIDER } from '../lib/providers/cerebras.js'
import { callGemini, GEMINI_PROVIDER } from '../lib/providers/gemini.js'

const PROBE = [{ role: 'user', content: 'Reply with the single word: ok' }]
// Budget must be large enough for reasoning models (Cerebras gpt-oss/glm spend
// tokens on hidden reasoning before emitting content).
const PROBE_OPTS = { timeoutMs: 6000, maxTokens: 200 }

const PROVIDERS = [
  { name: GROQ_PROVIDER, fn: callGroq, model: () => process.env.GROQ_MODEL || null },
  { name: OPENROUTER_PROVIDER, fn: callOpenRouter, model: () => process.env.OPENROUTER_MODEL || null },
  { name: CEREBRAS_PROVIDER, fn: callCerebras, model: () => process.env.CEREBRAS_MODEL || null },
  { name: GEMINI_PROVIDER, fn: callGemini, model: () => process.env.GEMINI_MODEL || 'gemini-2.0-flash' },
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const results = await Promise.allSettled(PROVIDERS.map((p) => p.fn(PROBE, PROBE_OPTS)))

  const providers = {}
  let anyOk = false
  results.forEach((r, i) => {
    const p = PROVIDERS[i]
    if (r.status === 'fulfilled') {
      anyOk = true
      providers[p.name] = { status: 'ok', model: p.model() }
    } else {
      const err = r.reason || {}
      providers[p.name] = {
        status: err.reason || 'unknown',
        model: p.model(),
        ...(err.status ? { httpStatus: err.status } : {}),
      }
    }
  })

  return res.status(200).json({
    ok: anyOk,
    chain: PROVIDERS.map((p) => p.name),
    providers,
  })
}
