import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import './index.css'
import App from './App.tsx'
import theme from './theme'
import { RoleProvider } from './context/RoleContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <RoleProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </RoleProvider>
    </ThemeProvider>
  </StrictMode>,
)
