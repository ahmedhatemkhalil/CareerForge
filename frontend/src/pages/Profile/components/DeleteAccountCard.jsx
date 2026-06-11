import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

import ConfirmModal from '@/components/common/ConfirmModal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { deleteCurrentUser } from '@/services/user/user'
import useAuthStore from '@/stores/authStore'
import { actionButtonClassName } from '../profileStyles'

const DeleteAccountCard = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      const data = await deleteCurrentUser()
      logout()
      setShowDeleteConfirm(false)
      toast.success(data.message || 'Your account has been deleted successfully')
      navigate('/login')
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete account',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
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
            onClick={() => setShowDeleteConfirm(true)}
            className={`${actionButtonClassName} bg-status-error px-4 text-white hover:bg-status-error/90`}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        onConfirm={handleDeleteAccount}
        confirmVariant="destructive"
        isLoading={isDeleting}
      />
    </>
  )
}

export default DeleteAccountCard
