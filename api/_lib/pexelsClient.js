// ============================================================================
// PEXELS CLIENT — round-robin API-key rotation with 429 fail-over.
// ============================================================================
const PEXELS_KEYS = [process.env.PEXELS_API_KEY_1, process.env.PEXELS_API_KEY_2].filter(Boolean)

if (PEXELS_KEYS.length === 0) {
  throw new Error('No Pexels API keys found. Set PEXELS_API_KEY_1 and PEXELS_API_KEY_2')
}

let pexelsKeyIndex = 0

/**
 * Calls the Pexels API with automatic key rotation on 429.
 *
 * @param {string} url - Full Pexels API URL
 * @returns {Promise<Response>}
 */
export async function fetchPexels(url) {
  const total = PEXELS_KEYS.length
  let lastError

  for (let attempt = 0; attempt < total; attempt++) {
    const keyIndex = (pexelsKeyIndex + attempt) % total
    const key = PEXELS_KEYS[keyIndex]

    try {
      const response = await fetch(url, {
        headers: { Authorization: key },
      })

      if (response.status === 429) {
        console.warn(
          `[Pexels] Key ${keyIndex + 1}/${total} rate limited. ` +
            `${attempt + 1 < total ? 'Rotating...' : 'All keys exhausted.'}`,
        )
        lastError = new Error('Pexels rate limit hit')
        continue
      }

      // Success — advance round-robin.
      pexelsKeyIndex = (keyIndex + 1) % total
      return response
    } catch (error) {
      lastError = error
      continue
    }
  }

  throw Object.assign(new Error('All Pexels API keys are rate limited.'), {
    status: 429,
    allKeysExhausted: true,
    cause: lastError,
  })
}
