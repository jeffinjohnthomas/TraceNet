import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Verified OAuth Gateway Client ID explicitly bound natively
const GOOGLE_CLIENT_ID = '412104144621-af2g32q0q5nj7elna2d5v57jlctn5kov.apps.googleusercontent.com'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { this.setState({ info }); console.error("Global Error:", error, info); }
  render() {
    if (this.state.hasError) return <div style={{padding: '50px', background: '#fff', color: '#f00'}}><h1>RUNTIME ERROR</h1><pre>{this.state.error?.stack}</pre></div>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </StrictMode>,
)
