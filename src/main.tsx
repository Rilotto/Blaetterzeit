import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { farbVariablenAnwenden } from './theme'

// Farbvariablen auch an <html>, damit html/body den App-Hintergrund tragen (kein weißer Rand).
farbVariablenAnwenden(document.documentElement)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
