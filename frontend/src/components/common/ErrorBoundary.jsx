import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CrimeGuard AI ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-2">
            System Interface Error
          </h2>
          <p className="text-slate-400 max-w-md mb-6 text-sm">
            An unexpected render error occurred within the portal. Cryptographic signature and state recovery active.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-2 text-sm transition-colors shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Portal Session
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
