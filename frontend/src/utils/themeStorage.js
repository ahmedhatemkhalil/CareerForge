export const THEME_STORAGE_KEY = 'theme'

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const applyTheme = (theme) => {
  const resolved = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark', resolved === 'dark')

  try {
    localStorage.setItem(THEME_STORAGE_KEY, resolved)
  } catch {
    // ignore write failures (e.g. private browsing)
  }

  return resolved
}

export const initTheme = () => {
  applyTheme(getStoredTheme())
}
