import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { useEffect } from 'react'

// #region agent log
const __agentUiLog = (payload) => {
  try {
    fetch('http://localhost:5000/__debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => { })
  } catch (_) { }
}

const BootLog = ({ children }) => {
  useEffect(() => {
    __agentUiLog({
      hypothesisId: 'H-ui2',
      location: 'admin/src/main.jsx:BootLog',
      message: 'root mounted',
      data: { path: window.location.pathname },
    })
  }, [])
  return children
}
// #endregion agent log

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BootLog>
        <App />
      </BootLog>
    </ErrorBoundary>
  </StrictMode>,
)
