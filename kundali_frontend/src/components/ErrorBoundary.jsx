import React from 'react';

/**
 * ErrorBoundary — Catches render-time errors in children components
 * and displays an informative recovery UI instead of a blank white screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Render Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem 1.5rem',
          maxWidth: '640px',
          margin: '2rem auto',
          background: '#fff',
          border: '1px solid #fca5a5',
          borderLeft: '5px solid #dc2626',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
            ⚠️ Render Error Encountered
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', margin: '0 0 1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                padding: '0.5rem 1rem',
                background: '#c8720a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔄 Try Again
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/kundali'; }}
              style={{
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ← Back to Birth Form
            </button>
          </div>
          {this.state.errorInfo && (
            <details style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#6b7280' }}>
              <summary style={{ cursor: 'pointer' }}>Component Stack Trace</summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '4px' }}>
                {String(this.state.error?.stack || '') + '\n\n' + String(this.state.errorInfo?.componentStack || '')}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
