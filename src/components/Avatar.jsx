import { getAvatarUrl, getAvatarBackground } from '../lib/avatar.js'

// Circular anime avatar on its seed gradient. `size` in px.
export default function Avatar({ seed, size = 40, ring = false, className = '', style = {} }) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: getAvatarBackground(seed),
        boxShadow: ring ? '0 0 0 2px var(--accent)' : 'none',
        ...style,
      }}
    >
      <img src={getAvatarUrl(seed)} alt={seed || 'avatar'} className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}
