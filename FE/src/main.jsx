import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// In production, use the Azure gateway URL. In dev, Vite proxy handles /api
if (import.meta.env.PROD) {
  axios.defaults.baseURL = 'https://instavibe-gateway-ebfcedbwcffqhras.polandcentral-01.azurewebsites.net';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
