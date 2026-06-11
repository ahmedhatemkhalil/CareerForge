import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AppearanceCard from './components/AppearanceCard'
import ChangePasswordCard from './components/ChangePasswordCard'
import ProfileInformationCard from './components/ProfileInformationCard'
import { actionButtonClassName } from './profileStyles'

const Profile = () => {
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

      <AppearanceCard />

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
