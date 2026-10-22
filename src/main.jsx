import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import { Provider } from './app/provider.jsx'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <Provider>
            <App />
          </Provider>
      </BrowserRouter>
  </StrictMode>,
)
