import { create } from 'zustand'

import { applyTheme, getStoredTheme } from '@/utils/themeStorage'

const useThemeStore = create((set) => ({
  theme: getStoredTheme(),

  setTheme: (theme) => {
    const resolved = applyTheme(theme)
    set({ theme: resolved })
  },
}))

export default useThemeStore
