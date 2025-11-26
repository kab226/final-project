import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
//I think we may want to remove this client_id - I moved it to env
const client_id = "404806796054-k3mksn952ibccuohh31nrsofek96ckj3.apps.googleusercontent.com"
// const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId = {client_id}>     
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
