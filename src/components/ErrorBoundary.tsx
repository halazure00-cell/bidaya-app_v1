import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={`min-h-screen flex items-center justify-center bg-slate-50 text-slate-900`}>
            <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto">
                <div className="inline-flex items-center justify-center p-5 bg-red-100 rounded-full mb-6 ring-8 ring-red-50">
                    <RotateCcw className="text-red-500" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Terjadi Kesalahan</h2>
                <p className="text-slate-600 leading-relaxed">
                    Aplikasi mengalami masalah yang tidak terduga. Silakan muat ulang halaman.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95">
                    Muat Ulang
                </button>
            </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
