import { useState } from 'react'
import { AlertTriangle, Camera, Eye, EyeOff, Save, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const inputClassName =
  'w-full h-11 rounded-xl bg-input-background border border-border px-4 text-foreground outline-none focus:border-brand-primary transition disabled:cursor-not-allowed disabled:opacity-70'

const actionButtonClassName = 'h-10 w-full sm:w-auto'

const Profile = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Profile Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground sm:h-20 sm:w-20 sm:text-xl">
                AH
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
                <Camera size={14} />
              </div>
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-foreground">Ahmed Hatem</p>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to upload a new profile picture
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Ahmed Hatem"
                className={inputClassName}
              />
            </div>

            <Button type="button" className={`${actionButtonClassName} gap-2 px-4`}>
              <Save size={16} />
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Change Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground sm:right-4"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground sm:right-4"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="button" className={`${actionButtonClassName} px-4`}>
            Update Password
          </Button>
        </CardContent>
      </Card>

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
