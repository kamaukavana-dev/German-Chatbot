// ============================================================================
// GEMINI CLIENT — round-robin API-key rotation with 429 fail-over.
//
// NOTE: this app uses the @google/genai SDK (export: GoogleGenAI), NOT the
// older @google/generative-ai (GoogleGenerativeAI). The rotation logic is the
// same; only the client construction differs. The buildRequest callback
// receives a GoogleGenAI client and typically calls client.models.*.
// ============================================================================
import { GoogleGenAI } from '@google/genai'

// Load all keys, filter out undefined/empty.
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean)

if (GEMINI_KEYS.length === 0) {
  throw new Error('No Gemini API keys found. Set GEMINI_API_KEY_1 through GEMINI_API_KEY_4')
}

// Round-robin index — persists across requests in the same warm serverless
// instance.
let geminiKeyIndex = 0

/**
 * Calls Gemini with automatic key rotation on 429.
 * Tries every available key before throwing.
 *
 * @param {(client: import('@google/genai').GoogleGenAI) => Promise<any>} buildRequest
 * @returns {Promise<any>}
 */
export async function callGemini(buildRequest) {
  const total = GEMINI_KEYS.length
  let lastError

  for (let attempt = 0; attempt < total; attempt++) {
    const keyIndex = (geminiKeyIndex + attempt) % total
    const key = GEMINI_KEYS[keyIndex]

    try {
      const client = new GoogleGenAI({ apiKey: key })
      const result = await buildRequest(client)

      // Success — advance index for next call (round-robin).
      geminiKeyIndex = (keyIndex + 1) % total
      return result
    } catch (error) {
      const is429 =
        error?.status === 429 ||
        error?.httpErrorCode === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota')

      if (is429) {
        console.warn(
          `[Gemini] Key ${keyIndex + 1}/${total} rate limited. ` +
            `${attempt + 1 < total ? 'Rotating to next key...' : 'All keys exhausted.'}`,
        )
        lastError = error
        continue // try next key
      }

      // Non-429 error — throw immediately, don't rotate.
      throw error
    }
  }

  // All keys exhausted.
  throw Object.assign(new Error('All Gemini API keys are rate limited. Retry later.'), {
    status: 429,
    allKeysExhausted: true,
    cause: lastError,
  })
}
