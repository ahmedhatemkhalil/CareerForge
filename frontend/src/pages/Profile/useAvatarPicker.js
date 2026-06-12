import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024

export const useAvatarPicker = () => {
  const avatarInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const openFilePicker = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      event.target.value = ''
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Image must be smaller than 5MB')
      event.target.value = ''
      return
    }

    setAvatarFile(file)
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const clearAvatarSelection = () => {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setAvatarFile(null)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  return {
    avatarInputRef,
    avatarPreview,
    avatarFile,
    openFilePicker,
    handleAvatarChange,
    clearAvatarSelection,
  }
}
