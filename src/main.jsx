import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Soulmate App Error]', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#ffffff',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '540px',
            border: '2px solid #dc2626',
            backgroundColor: '#09090b',
            padding: '28px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.2)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
              Find My Soulmate (Dev Edition)
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' }}>
              An unexpected error occurred during rendering. You can safely reload the app or reset session storage.
            </p>
            <div style={{
              backgroundColor: '#000000',
              border: '1px solid #27272a',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#f87171',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '20px',
            }}>
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Reload App
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#18181b',
                  color: '#d4d4d8',
                  border: '1px solid #3f3f46',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
