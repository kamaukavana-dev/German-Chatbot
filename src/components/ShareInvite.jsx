import { useState } from 'react'
import { sound } from '../lib/SoundEngine.js'

// Friend invites: builds a shareable message + WhatsApp/Facebook/Twitter links
// and a copy-to-clipboard button. Referral tracking (?ref=) is handled in App.
export default function ShareInvite({ username }) {
  const [copied, setCopied] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hans.app'
  const inviteUrl = `${appUrl}?ref=${encodeURIComponent(username || 'friend')}`
  const message = `🇩🇪 I'm learning German with HANS! Join me and let's compete on the leaderboard. ${inviteUrl}`

  const enc = encodeURIComponent(message)
  const encUrl = encodeURIComponent(inviteUrl)

  const links = [
    { name: 'WhatsApp', icon: 'ti-brand-whatsapp', color: '#25D366', url: `https://wa.me/?text=${enc}` },
    {
      name: 'Facebook',
      icon: 'ti-brand-facebook',
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${enc}`,
    },
    { name: 'X', icon: 'ti-brand-x', color: '#000000', url: `https://twitter.com/intent/tweet?text=${enc}` },
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
    } catch {
      /* clipboard blocked — ignore */
    }
    sound.play('button_click')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border-2 p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
        Invite a friend
      </div>
      <div className="flex gap-2">
        {links.map((l) => (
          <a
            key={l.name}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.play('button_click')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold text-white"
            style={{ background: l.color }}
          >
            <i className={`ti ${l.icon} text-lg`} />
            <span className="hidden sm:inline">{l.name}</span>
          </a>
        ))}
      </div>
      <button
        onClick={copy}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-extrabold"
        style={{ borderColor: 'var(--border)', color: copied ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        <i className={`ti ${copied ? 'ti-check' : 'ti-link'}`} />
        {copied ? 'Copied!' : 'Copy invite link'}
      </button>
    </div>
  )
}
