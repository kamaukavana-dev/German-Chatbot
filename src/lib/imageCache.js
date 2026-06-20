// ============================================================================
// IMAGE CACHE — fetch a single concept image via /api/images, with a two-tier
// cache (in-memory + localStorage, 7-day TTL) and a hard 2s timeout. ALWAYS
// fails silently to null so a lesson never blocks on an image.
// ============================================================================

const memCache = new Map()
const TTL_MS = 604800000 // 7 days

export async function getConceptImage(query) {
  if (!query) return null

  // Memory cache — instant.
  if (memCache.has(query)) return memCache.get(query)

  // localStorage cache — 7 days.
  const lsKey = `hans_img_${query.replace(/\W+/g, '_')}`
  try {
    const cached = localStorage.getItem(lsKey)
    if (cached) {
      const { photo, cachedAt } = JSON.parse(cached)
      if (Date.now() - cachedAt < TTL_MS) {
        memCache.set(query, photo)
        return photo
      }
    }
  } catch {
    /* ignore */
  }

  // Fetch with 2s timeout — never block the lesson.
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)

    const res = await fetch(`/api/images?query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) return null

    const { photos } = await res.json()
    const photo = photos?.[0]
    if (!photo) return null

    memCache.set(query, photo)
    try {
      localStorage.setItem(lsKey, JSON.stringify({ photo, cachedAt: Date.now() }))
    } catch {
      /* storage full / unavailable — memory cache still serves this session */
    }

    return photo
  } catch {
    return null // silent fail — lesson ALWAYS continues
  }
}
