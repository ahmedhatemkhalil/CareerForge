import { getCurrentUser } from '@/services/user/user'
import useAuthStore from '@/stores/authStore'

export const loadCurrentUser = async () => {
  const user = await getCurrentUser()
  useAuthStore.getState().setUser(user)
  return user
}
