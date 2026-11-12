import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ [Venfidata ErrorBoundary]: Fallo controlado en componente hijo:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      if (this.props.silent) {
        return null;
      }
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

