import { Component, ErrorInfo, ReactNode } from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050b12] px-6 text-slate-100">
          <div className="max-w-xl rounded-3xl border border-slate-800 bg-[#08111e] p-10 shadow-2xl shadow-slate-950/40">
            <h1 className="text-4xl font-semibold text-slate-100">Something went wrong.</h1>
            <p className="mt-4 text-slate-400">
              The desktop client hit an unexpected error. Reload the app or contact support if this keeps happening.
            </p>
            <pre className="mt-6 rounded-2xl bg-slate-950/80 p-4 text-sm text-rose-200">
              {this.state.error?.message}
            </pre>
            <button
              className="mt-6 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Reload UI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
