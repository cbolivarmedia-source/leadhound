import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LeadHound from './LeadHound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LeadHound />
  </StrictMode>,
)
