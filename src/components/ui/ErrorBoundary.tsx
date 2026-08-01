import { Component, type ReactNode } from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('BetGuard crashed:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
            <ShieldCheck className="size-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-ink dark:text-white">
              Something went wrong
            </h1>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              BetGuard couldn&apos;t load this section. This sometimes happens after an update —
              a quick refresh usually fixes it.
            </p>
          </div>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:shadow-primary/30"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Reload BetGuard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
