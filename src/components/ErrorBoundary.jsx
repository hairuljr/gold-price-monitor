import { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console (in production, send to error monitoring service like Sentry)
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-container">
                        <span className="error-icon">⚠️</span>
                        <h1>Oops! Something went wrong</h1>
                        <p className="error-message">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        {this.state.error && (
                            <details className="error-details">
                                <summary>Error Details</summary>
                                <pre className="error-stack">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <button onClick={this.handleReset} className="btn-reset">
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
