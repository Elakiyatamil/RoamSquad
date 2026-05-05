import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // This is intentionally console-only (no secrets).
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>App error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff4f4', padding: 12, borderRadius: 8 }}>
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

