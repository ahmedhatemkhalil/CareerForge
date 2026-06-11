import { useEffect } from 'react'

import AppRouter from './AppRouter'
import { loadUserTheme } from './utils/theme'
import { loadCurrentUser } from './utils/userProfile'

const App = () => {
  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadCurrentUser().catch(() => {})
      loadUserTheme().catch(() => {})
    }
  }, [])

  return <AppRouter />
}

export default App
