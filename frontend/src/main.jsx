import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import App from './App'
import './index.css'
import { WebSocketProvider } from './providers/WebSocketProvider'

// Global error logger for debugging
window.addEventListener('error', (e) => {
  fetch('http://localhost:8000/api/users/me', { headers: { 'X-Error': e.message || 'Unknown error' } }).catch(() => {});
});
window.addEventListener('unhandledrejection', (e) => {
  fetch('http://localhost:8000/api/users/me', { headers: { 'X-Error': e.reason?.message || 'Unknown promise rejection' } }).catch(() => {});
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </Provider>
  </React.StrictMode>
)
