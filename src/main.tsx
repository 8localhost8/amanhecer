import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPWAUpdater } from './services/pwa-updater'

// Activate automatic background & foreground PWA update checks
initPWAUpdater();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
