import { useState } from 'react'
import { AlertTriangle, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ChangePasswordCard from './components/ChangePasswordCard'
import ProfileInformationCard from './components/ProfileInformationCard'
import { actionButtonClassName } from './profileStyles'

const Profile = () => {
  const [lightMode, setLightMode] = useState(true)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-2 sm:space-y-8 sm:pb-0">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account details and preferences
        </p>
      </div>

      <ProfileInformationCard />
      <ChangePasswordCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <Sun size={20} className="mt-0.5 shrink-0 text-status-warning sm:mt-0" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Light Mode</p>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={lightMode}
              onClick={() => setLightMode((prev) => !prev)}
              className={`relative h-7 w-12 shrink-0 self-end rounded-full transition-colors sm:self-auto ${
                lightMode ? 'bg-switch-background' : 'bg-primary'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  lightMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-status-error/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-status-error sm:text-lg">
            <AlertTriangle size={18} className="shrink-0" />
            Danger Zone
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone and there is no recovery option.
          </p>

          <Button
            type="button"
            variant="destructive"
            className={`${actionButtonClassName} bg-status-error px-4 text-white hover:bg-status-error/90`}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
