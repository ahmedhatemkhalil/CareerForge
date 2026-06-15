import { useEffect, useState } from 'react'
import { Camera, Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getCurrentUser, updateCurrentUser, uploadAvatar } from '@/services/user/user'
import useAuthStore from '@/stores/authStore'
import { getInitials } from '@/utils/helpers'
import { actionButtonClassName, inputClassName } from '../profileStyles'
import { useAvatarPicker } from '../useAvatarPicker'

const ProfileInformationCard = () => {
  const setAuthUser = useAuthStore((state) => state.setUser)
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const {
    avatarInputRef,
    avatarPreview,
    avatarFile,
    openFilePicker,
    handleAvatarChange,
    clearAvatarSelection,
  } = useAvatarPicker()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUser()
        setUser(data)
        setName(data.name || '')
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to load profile',
        )
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [])

  const hasProfileChanges =
    user !== null &&
    (name.trim() !== (user.name || '').trim() || Boolean(avatarFile))

  const handleSaveProfile = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      toast.error('Full name is required')
      return
    }

    setIsSavingProfile(true)

    try {
      let updatedUser = user

      if (avatarFile) {
        updatedUser = await uploadAvatar(avatarFile)
      }

      updatedUser = await updateCurrentUser({
        name: trimmedName,
        avatar_url: updatedUser?.avatar_url ?? user?.avatar_url ?? null,
      })

      setUser(updatedUser)
      setAuthUser(updatedUser)
      setName(updatedUser.name || '')
      clearAvatarSelection()
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update profile',
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Profile Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoadingProfile ? (
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              <div className="relative shrink-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                {avatarPreview || user?.avatar_url ? (
                  <img
                    src={avatarPreview || user.avatar_url}
                    alt={user.name}
                    className="h-16 w-16 rounded-2xl object-cover sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground sm:h-20 sm:w-20 sm:text-xl">
                    {getInitials(user?.name)}
                  </div>
                )}

                <button
                  type="button"
                  onClick={openFilePicker}
                  aria-label="Upload profile picture"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:text-foreground"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSavingProfile}
                  className={inputClassName}
                />
              </div>

              <Button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile || !hasProfileChanges}
                className={`${actionButtonClassName} gap-2 px-4`}
              >
                <Save size={16} />
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ProfileInformationCard
