import { useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { getSocial, followBack, unfollow, recordInvite } from '../data/social.js'
import { sound } from '../lib/SoundEngine.js'
import { toast } from '../lib/toast.jsx'

const TABS = [
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
  { id: 'find', label: 'Find Friends' },
  { id: 'invites', label: 'Invites' },
]

function inviteUrl(username) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hans.app'
  return `${origin}?ref=${encodeURIComponent(username || 'friend')}`
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Each platform: either a direct share URL, or a copy+open action with a toast.
function buildPlatforms(username) {
  const url = inviteUrl(username)
  const msgEn = `🇩🇪 Learn German with me on HANS! ${url}`
  const msgDe = `🇩🇪 Ich lerne Deutsch mit HANS! Lern mit mir: ${url}`
  const e = encodeURIComponent
  return [
    { id: 'whatsapp', name: 'WhatsApp', icon: 'ti-brand-whatsapp', color: '#25D366', href: `https://wa.me/?text=${e(msgEn)}` },
    {
      id: 'instagram', name: 'Instagram', icon: 'ti-brand-instagram',
      color: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
      copy: msgEn, open: 'https://www.instagram.com/', toast: 'Message copied! Paste it on Instagram DMs',
    },
    { id: 'facebook', name: 'Facebook', icon: 'ti-brand-facebook', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { id: 'x', name: 'Twitter / X', icon: 'ti-brand-x', color: '#000000', href: `https://twitter.com/intent/tweet?text=${e(msgDe)}` },
    { id: 'telegram', name: 'Telegram', icon: 'ti-brand-telegram', color: '#229ED9', href: `https://t.me/share/url?url=${e(url)}&text=${e('Join me on HANS German tutor!')}` },
    {
      id: 'tiktok', name: 'TikTok', icon: 'ti-brand-tiktok', color: '#000000',
      copy: msgEn, open: 'https://www.tiktok.com', toast: 'Copied! Share it in your TikTok bio or DMs',
    },
    { id: 'snapchat', name: 'Snapchat', icon: 'ti-brand-snapchat', color: '#FFFC00', dark: true, href: `https://www.snapchat.com/scan?attachmentUrl=${e(url)}` },
    {
      id: 'discord', name: 'Discord', icon: 'ti-brand-discord', color: '#5865F2',
      copy: msgEn, toast: 'Copied! Paste in your Discord server',
    },
    { id: 'linkedin', name: 'LinkedIn', icon: 'ti-brand-linkedin', color: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}` },
    { id: 'copy', name: 'Copy Link', icon: 'ti-link', color: 'var(--accent)', copyOnly: url, toast: 'Invite link copied!' },
  ]
}

function PersonRow({ person, action, onAction }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <Avatar seed={person.avatarSeed} size={40} />
      <div className="min-w-0 flex-1 truncate text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
        {person.username}
      </div>
      {action && (
        <button
          onClick={() => onAction(person)}
          className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase"
          style={{
            background: action === 'Unfollow' ? 'transparent' : 'var(--accent)',
            color: action === 'Unfollow' ? 'var(--text-secondary)' : '#03120a',
            border: action === 'Unfollow' ? '2px solid var(--border)' : 'none',
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}

export default function Friends({ username, onClose }) {
  const [tab, setTab] = useState('followers')
  const [social, setSocialState] = useState(getSocial)
  const [query, setQuery] = useState('')
  const platforms = buildPlatforms(username)

  function doFollowBack(p) {
    sound.play('button_click')
    setSocialState(followBack(p.username))
    toast(`You followed ${p.username} back`, { icon: 'ti-user-check' })
  }
  function doUnfollow(p) {
    sound.play('button_click')
    setSocialState(unfollow(p.username))
  }

  async function handlePlatform(p) {
    sound.play('button_click')
    setSocialState(recordInvite(p.id))
    if (p.copyOnly) {
      await copyText(p.copyOnly)
      toast(p.toast, { icon: 'ti-check' })
      return
    }
    if (p.href) {
      window.open(p.href, '_blank', 'noopener')
      return
    }
    if (p.copy) {
      await copyText(p.copy)
      toast(p.toast, { icon: 'ti-check' })
      if (p.open) window.open(p.open, '_blank', 'noopener')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-mono-hans" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="text-2xl" style={{ color: 'var(--text-secondary)' }}>
          <i className="ti ti-arrow-left" />
        </button>
        <h1 className="text-2xl font-extrabold">Friends</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-surface)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { sound.play('button_click'); setTab(t.id) }}
            className="flex-1 rounded-lg py-1.5 text-xs font-extrabold"
            style={{ background: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? '#03120a' : 'var(--text-secondary)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {tab === 'followers' && (
          social.followers.length === 0
            ? <Empty text="No followers yet — invite friends to grow your circle." />
            : social.followers.map((p) => {
                const isFollowing = social.following.some((f) => f.username === p.username)
                return <PersonRow key={p.username} person={p} action={isFollowing ? null : 'Follow back'} onAction={doFollowBack} />
              })
        )}

        {tab === 'following' && (
          social.following.length === 0
            ? <Empty text="You're not following anyone yet." />
            : social.following.map((p) => <PersonRow key={p.username} person={p} action="Unfollow" onAction={doUnfollow} />)
        )}

        {tab === 'find' && (
          <>
            <div className="flex items-center gap-2 rounded-xl border-2 px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              <i className="ti ti-search" style={{ color: 'var(--text-secondary)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username…"
                className="w-full bg-transparent text-sm font-bold outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            {query && (
              <div className="rounded-xl border-2 border-dashed p-3 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                No user “{query}” found. Invite them with a platform below 👇
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {platforms.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ y: -2 }}
                  onClick={() => handlePlatform(p)}
                  className="group flex items-center gap-2 rounded-2xl border-2 px-3 py-3 text-left"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ background: p.color, color: p.dark ? '#111' : '#fff' }}
                  >
                    <i className={`ti ${p.icon}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    <span className="block text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>
                      {p.href ? 'Share' : 'Copy'}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {tab === 'invites' && (
          <>
            <div className="rounded-2xl border-2 p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Your invite link</div>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-xs" style={{ background: 'var(--bg-surface)', color: 'var(--accent)' }}>
                  {inviteUrl(username)}
                </code>
                <button
                  onClick={async () => { await copyText(inviteUrl(username)); sound.play('button_click'); toast('Invite link copied!', { icon: 'ti-check' }) }}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-extrabold uppercase"
                  style={{ background: 'var(--accent)', color: '#03120a' }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {platforms.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePlatform(p)}
                  className="flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: p.color, color: p.dark ? '#111' : '#fff' }}>
                    <i className={`ti ${p.icon}`} />
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Sent invites
            </div>
            {social.invitesSent.length === 0 ? (
              <Empty text="No invites sent yet." />
            ) : (
              social.invitesSent.slice().reverse().map((inv, i) => (
                <div key={i} className="rounded-xl border-2 px-3 py-2 text-sm font-bold capitalize" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                  <i className="ti ti-send" /> {inv.platform}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="rounded-2xl border-2 border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
      {text}
    </div>
  )
}
