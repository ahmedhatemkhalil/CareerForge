import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";
import { initTheme } from './utils/theme'
initTheme()
createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Toaster position="top-right" />
    <App />
  </StrictMode>,
)
