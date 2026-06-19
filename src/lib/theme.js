// ============================================================================
// THEME — dark (default) / light via a class on <html> + CSS custom properties.
// The actual variable values live in index.css. We only toggle the class here.
// A tiny inline script in index.html applies the saved theme BEFORE React renders
// to eliminate the flash of wrong theme.
// ============================================================================

export const THEME_KEY = 'hans_theme'

export function loadTheme() {
  try {
    const t = window.localStorage.getItem(THEME_KEY)
    return t === 'light' ? 'light' : 'dark' // default dark
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark'
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(t)
  try {
    window.localStorage.setItem(THEME_KEY, t)
  } catch {
    /* ignore */
  }
  return t
}
