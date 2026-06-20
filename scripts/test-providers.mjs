// ============================================================================
// Throwaway diagnostic: call each LLM provider directly and print pass/fail
// with the real error body on failure. Same pattern we used by hand on the
// Gemini keys, but reusable.
//
// Run:  node --env-file=.env scripts/test-providers.mjs
// (Node 20+ loads .env via --env-file; no dotenv dependency needed.)
// ============================================================================
import { callGroq } from '../lib/providers/groq.js'
import { callOpenRouter } from '../lib/providers/openrouter.js'
import { callCerebras } from '../lib/providers/cerebras.js'
import { callGemini } from '../lib/providers/gemini.js'

const PROBE = [
  { role: 'system', content: 'You are a terse assistant.' },
  { role: 'user', content: 'Say "hallo" in one short German sentence.' },
]
// Cerebras' models (gpt-oss-120b, zai-glm-4.7) are reasoning models that spend
// tokens on hidden reasoning before content, so give a realistic budget.
const OPTS = { timeoutMs: 8000, maxTokens: 300 }

const PROVIDERS = [
  ['groq', callGroq, process.env.GROQ_MODEL],
  ['openrouter', callOpenRouter, process.env.OPENROUTER_MODEL],
  ['cerebras', callCerebras, process.env.CEREBRAS_MODEL],
  ['gemini', callGemini, process.env.GEMINI_MODEL || 'gemini-2.0-flash'],
]

const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n)
let pass = 0
let fail = 0

console.log('\nProvider probe — fallback order: groq → openrouter → cerebras → gemini\n')

for (const [name, fn, model] of PROVIDERS) {
  const t0 = Date.now()
  try {
    const text = await fn(PROBE, OPTS)
    const ms = Date.now() - t0
    pass++
    console.log(`✅ ${pad(name, 11)} ${pad(model || '(no model)', 36)} ${ms}ms`)
    console.log(`   → ${String(text).replace(/\n/g, ' ').slice(0, 120)}`)
  } catch (err) {
    const ms = Date.now() - t0
    fail++
    console.log(`❌ ${pad(name, 11)} ${pad(model || '(no model)', 36)} ${ms}ms`)
    console.log(`   reason=${err?.reason || 'unknown'} status=${err?.status ?? '-'} retryable=${err?.retryable}`)
    if (err?.body) console.log(`   body: ${String(err.body).replace(/\n/g, ' ').slice(0, 300)}`)
  }
}

console.log(`\n${pass} passed, ${fail} failed.\n`)
