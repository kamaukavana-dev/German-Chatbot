// ============================================================================
// TOAST — tiny event-bus toaster. Call toast('message') from anywhere; mount
// <ToastHost/> once near the app root. No external deps.
// ============================================================================
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const listeners = new Set()
let counter = 0

export function toast(message, { icon = 'ti-bell', duration = 3000 } = {}) {
  const t = { id: ++counter, message, icon, duration }
  listeners.forEach((fn) => fn(t))
  return t.id
}

export function ToastHost() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const onToast = (t) => {
      setItems((cur) => [...cur, t])
      setTimeout(() => {
        setItems((cur) => cur.filter((x) => x.id !== t.id))
      }, t.duration)
    }
    listeners.add(onToast)
    return () => listeners.delete(onToast)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 font-mono-hans">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur"
            style={{
              background: 'color-mix(in srgb, var(--bg-card) 85%, transparent)',
              borderColor: 'var(--accent)',
              color: 'var(--text-primary)',
            }}
          >
            <i className={`ti ${t.icon}`} style={{ color: 'var(--accent)' }} />
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
