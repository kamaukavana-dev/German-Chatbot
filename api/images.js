// ============================================================================
// GET /api/images?query=... — Vercel serverless proxy to the Pexels search API.
// Keys stay server-side via PEXELS_API_KEY_1..2 (rotated in _lib/pexelsClient).
// Returns up to 3 landscape photos. Cached at the edge for 7 days.
// ============================================================================
import { fetchPexels } from './_lib/pexelsClient.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { query } = req.query
  if (!query) return res.status(400).json({ error: 'Query required' })

  res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate')

  try {
    const response = await fetchPexels(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
    )

    const data = await response.json()

    if (!data.photos?.length) return res.status(404).json({ error: 'No images found' })

    const photos = data.photos.map((p) => ({
      url: p.src.medium,
      thumb: p.src.small,
      alt: p.alt || query,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
    }))

    return res.status(200).json({ photos })
  } catch (error) {
    if (error?.allKeysExhausted || error?.status === 429) {
      return res.status(429).json({ error: 'Images temporarily unavailable.', allKeysExhausted: true })
    }
    console.error('Pexels error:', error.message)
    return res.status(500).json({ error: 'Image fetch failed' })
  }
}
