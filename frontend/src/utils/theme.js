import { getUserSettings } from '@/services/user/user'
import useThemeStore from '@/stores/themeStore'

export { initTheme } from '@/utils/themeStorage'
export const loadUserTheme = async () => {
  const settings = await getUserSettings()
  const theme = settings?.theme === 'dark' ? 'dark' : 'light'
  useThemeStore.getState().setTheme(theme)
}
