import { useEffect } from 'react'

import AppRouter from './AppRouter'
import { loadUserTheme } from './utils/theme'

const App = () => {
  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadUserTheme().catch(() => {})
    }
  }, [])

  return <AppRouter />
}

export default App
