// ============================================================================
// Gemini — last-resort fallback. NOT OpenAI-compatible, so it has its own
// request/response shape (systemInstruction + contents[]). Rotates across
// GEMINI_API_KEY_1..4 on 429. Reads keys/model at call time (never at import)
// so a missing key yields a typed 'key-missing' error instead of crashing the
// whole module graph.
// ============================================================================
import { GoogleGenAI } from '@google/genai'
import { ProviderError } from './openaiCompatible.js'

export const GEMINI_PROVIDER = 'gemini'

function geminiKeys() {
  return [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY, // singular fallback (older env setups)
  ].filter(Boolean)
}

// Convert neutral [{role:'system'|'user'|'assistant', content}] messages into
// Gemini's (systemInstruction, contents) shape.
function toGemini(messages) {
  const systemInstruction = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n')
  const contents = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  return { systemInstruction, contents }
}

function is429(err) {
  return (
    err?.status === 429 ||
    err?.httpErrorCode === 429 ||
    /429|RESOURCE_EXHAUSTED|quota/i.test(err?.message || '')
  )
}

function isAuth(err) {
  return err?.status === 401 || err?.status === 403 || /PERMISSION_DENIED|API key not valid|401|403/i.test(err?.message || '')
}

export async function callGemini(messages, { timeoutMs = 8000, maxTokens = 800 } = {}) {
  const keys = geminiKeys()
  if (keys.length === 0) throw new ProviderError(GEMINI_PROVIDER, { reason: 'key-missing', retryable: true })

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const { systemInstruction, contents } = toGemini(messages)

  let lastErr
  for (let i = 0; i < keys.length; i++) {
    const client = new GoogleGenAI({ apiKey: keys[i] })
    try {
      const result = await Promise.race([
        client.models.generateContent({
          model,
          contents,
          config: { systemInstruction, maxOutputTokens: maxTokens },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new ProviderError(GEMINI_PROVIDER, { reason: 'timeout', retryable: true, body: `>${timeoutMs}ms` })), timeoutMs),
        ),
      ])
      const text = (result?.text || '').trim()
      if (!text) throw new ProviderError(GEMINI_PROVIDER, { reason: 'unknown', retryable: true, body: 'empty completion' })
      return text
    } catch (err) {
      if (err instanceof ProviderError && err.reason === 'timeout') throw err
      lastErr = err
      if (is429(err)) continue // rotate to next key
      if (isAuth(err)) throw new ProviderError(GEMINI_PROVIDER, { status: 403, reason: 'auth-failed', retryable: true, body: (err?.message || '').slice(0, 300) })
      // Other errors: surface as retryable so the chain (already exhausted here) reports it.
      throw new ProviderError(GEMINI_PROVIDER, { status: err?.status || null, reason: 'unknown', retryable: true, body: (err?.message || '').slice(0, 300) })
    }
  }
  // All keys 429'd.
  throw new ProviderError(GEMINI_PROVIDER, { status: 429, reason: 'rate-limited', retryable: true, body: (lastErr?.message || 'all keys rate-limited').slice(0, 300) })
}
