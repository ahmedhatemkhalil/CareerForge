import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { changePassword } from '@/services/user/user'
import { actionButtonClassName, inputClassName } from '../profileStyles'

const ChangePasswordCard = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const hasPasswordChanges =
    currentPassword.trim() !== '' && newPassword.trim() !== ''

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Current and new password are required')
      return
    }

    setIsUpdatingPassword(true)

    try {
      const data = await changePassword({ currentPassword, newPassword })
      toast.success(data.message || 'Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update password',
      )
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
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
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isUpdatingPassword}
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isUpdatingPassword}
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

        <Button
          type="button"
          onClick={handleChangePassword}
          disabled={isUpdatingPassword || !hasPasswordChanges}
          className={`${actionButtonClassName} px-4`}
        >
          {isUpdatingPassword ? 'Updating...' : 'Update Password'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
