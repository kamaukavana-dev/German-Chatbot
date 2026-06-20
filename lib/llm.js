// ============================================================================
// LLM fallback orchestrator.
// callLLM(messages) tries providers in order: Groq → OpenRouter → Cerebras →
// Gemini. On a RETRYABLE failure it logs a warning and moves to the next
// provider. On a NON-retryable failure (400 malformed prompt) it throws
// immediately — retrying the same bad prompt elsewhere just wastes calls.
// If every provider fails, it throws an aggregate error naming each failure.
//
// Returns { content, provider } so the caller can log/expose who served it.
//
// `messages` are neutral: [{ role: 'system'|'user'|'assistant', content }].
// ============================================================================
import { callGroq, GROQ_PROVIDER } from './providers/groq.js'
import { callOpenRouter, OPENROUTER_PROVIDER } from './providers/openrouter.js'
import { callCerebras, CEREBRAS_PROVIDER } from './providers/cerebras.js'
import { callGemini, GEMINI_PROVIDER } from './providers/gemini.js'

export const PROVIDER_CHAIN = [
  { name: GROQ_PROVIDER, fn: callGroq },
  { name: OPENROUTER_PROVIDER, fn: callOpenRouter },
  { name: CEREBRAS_PROVIDER, fn: callCerebras },
  { name: GEMINI_PROVIDER, fn: callGemini },
]

export async function callLLM(messages, opts = {}) {
  const failures = []

  for (const provider of PROVIDER_CHAIN) {
    try {
      const content = await provider.fn(messages, opts)
      if (failures.length) {
        console.warn(`[llm] served by ${provider.name} after ${failures.length} failure(s): ${failures.join('; ')}`)
      }
      return { content, provider: provider.name }
    } catch (err) {
      const reason = err?.reason || err?.message || 'unknown'
      const status = err?.status ? ` HTTP ${err.status}` : ''

      // Non-retryable (bad prompt) → stop the whole chain immediately.
      if (err?.retryable === false) {
        console.error(`[llm] ${provider.name} non-retryable (${reason}${status}); aborting chain`)
        throw Object.assign(new Error(`LLM request rejected by ${provider.name}: ${reason}${status}`), {
          provider: provider.name,
          status: err?.status ?? null,
          reason,
          nonRetryable: true,
          cause: err,
        })
      }

      console.warn(`[llm] ${provider.name} failed (${reason}${status}) — falling back to next provider`)
      failures.push(`${provider.name}: ${reason}${status}`)
    }
  }

  throw Object.assign(new Error(`All LLM providers failed:\n- ${failures.join('\n- ')}`), {
    allProvidersFailed: true,
    failures,
  })
}
