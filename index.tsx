import React, { ReactNode, StrictMode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Componente de Error Boundary para capturar erros de renderização
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  // Explicitly declare props to satisfy TypeScript compiler if React types aren't fully inferred
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-slate-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Algo deu errado</h1>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Ocorreu um erro ao carregar a aplicação. Tente recarregar a página.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors w-full"
            >
              Recarregar Página
            </button>
            {this.state.error && (
              <div className="mt-6 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Detalhes técnicos:</p>
                <pre className="text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto max-h-32 border border-red-100 font-mono">
                  {this.state.error.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding:20px;">FATAL: Root element not found</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (e: any) {
    console.error("FATAL: Error during root render", e);
    rootElement.innerHTML = `
      <div style="font-family:sans-serif; padding: 2rem; text-align: center;">
        <h2 style="color: #e11d48;">Erro Fatal de Inicialização</h2>
        <p style="color: #475569;">Não foi possível iniciar o React.</p>
        <pre style="background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; text-align: left; overflow: auto; font-size: 0.8rem; color: #334155;">${e?.message || String(e)}</pre>
      </div>
    `;
  }
}