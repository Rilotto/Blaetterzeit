import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// App-Schrift Fraunces (REQ-065), lokal aus dem npm-Paket gebündelt (SIL OFL 1.1, Lizenz: public/lizenzen/).
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
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
