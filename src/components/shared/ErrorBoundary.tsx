import { Component, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="glass p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--accent-expense)]/15 flex items-center justify-center">
            <AlertOctagon size={32} className="text-[var(--accent-expense)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] font-display mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              An unexpected error occurred. Your data is safe in the browser — try reloading the page.
            </p>
          </div>
          {this.state.error && (
            <p className="text-xs text-[var(--text-muted)] font-mono bg-[var(--glass-bg)] rounded-lg px-3 py-2 break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#8b5cf6] shadow-lg shadow-[var(--accent-primary)]/25 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Persistent issue?{' '}
            <a
              href={`mailto:gianlucajdivita@gmail.com?subject=BudgetLens%20Error&body=${encodeURIComponent(this.state.error?.message || 'Unknown error')}`}
              className="text-[var(--accent-primary)] hover:underline"
            >
              Report it
            </a>
          </p>
        </div>
      </div>
    );
  }
}
