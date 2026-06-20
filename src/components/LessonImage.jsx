import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getConceptImage } from '../lib/imageCache'

// Renders a single concept image with Pexels attribution. Returns null while
// loading or on any failure, so it can never block or break a lesson.
export default function LessonImage({ query, caption }) {
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    if (!query) return
    let alive = true
    getConceptImage(query).then((p) => {
      if (alive) setPhoto(p)
    })
    return () => {
      alive = false
    }
  }, [query])

  if (!photo) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4 rounded-xl overflow-hidden border border-gray-700"
      >
        <img
          src={photo.url}
          alt={photo.alt}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="flex justify-between items-center px-3 py-1 bg-gray-900 text-xs text-gray-500">
          <span>{caption}</span>
          <span>
            Photo by{' '}
            <a
              href={photo.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              {photo.photographer}
            </a>{' '}
            · Pexels
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
