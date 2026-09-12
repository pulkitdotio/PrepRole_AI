import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('PrepRole AI could not render the current view.', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-boundary">
          <p className="page-eyebrow">Something went wrong</p>
          <h1>PrepRole AI couldn’t display this page.</h1>
          <p>Reload the page to try again, or return to the public homepage.</p>
          <div className="app-error-boundary__actions">
            <button type="button" className="button button--primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
            <a href="/" className="button button--secondary">Back to homepage</a>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
