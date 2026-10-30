import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { StoreProvider } from './lib/store'
import { I18nProvider } from './i18n'
import './styles/tokens.css'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StoreProvider>
  </StrictMode>,
)
