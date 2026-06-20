// ============================================================================
// GET /api/health — Vercel serverless function.
// Exact mirror of the original Express GET /api/health in backend/server.js.
// ============================================================================
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const geminiKeyCount = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean).length
const pexelsKeyCount = [process.env.PEXELS_API_KEY_1, process.env.PEXELS_API_KEY_2].filter(Boolean)
  .length

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  return res.status(200).json({
    ok: true,
    hasKey: geminiKeyCount > 0,
    geminiKeyCount,
    pexelsKeyCount,
    model: MODEL,
  })
}
