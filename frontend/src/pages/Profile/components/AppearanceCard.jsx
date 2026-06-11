import { useState } from 'react'
import useThemeStore from '@/stores/themeStore'
import { Sun } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { updateUserSettings } from '@/services/user/user'

const AppearanceCard = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    const previousTheme = theme

    setTheme(newTheme)
    setIsUpdating(true)

    try {
      await updateUserSettings(newTheme)
      toast.success(`Switched to ${newTheme} mode`)
    } catch (error) {
      setTheme(previousTheme)
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update theme',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const isLightMode = theme === 'light'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <Sun size={20} className="mt-0.5 shrink-0 text-status-warning sm:mt-0" />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {isLightMode ? 'Light Mode' : 'Dark Mode'}
              </p>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isLightMode}
            disabled={isUpdating}
            onClick={handleToggleTheme}
            className={`relative h-7 w-12 shrink-0 self-end rounded-full transition-colors sm:self-auto disabled:opacity-50 ${
              isLightMode ? 'bg-switch-background' : 'bg-primary'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                isLightMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AppearanceCard
