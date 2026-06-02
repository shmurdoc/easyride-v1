import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastKind = 'success' | 'error' | 'info' | 'warn';
type Toast = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{
  push: (kind: ToastKind, message: string) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warn: (m: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const value = {
    push,
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m),
    info: (m: string) => push('info', m),
    warn: (m: string) => push('warn', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles: Record<ToastKind, string> = {
    success: 'bg-white border-accent-200 text-ink-900',
    error: 'bg-white border-danger-200 text-ink-900',
    info: 'bg-white border-primary-200 text-ink-900',
    warn: 'bg-white border-warn-200 text-ink-900',
  };
  const icons: Record<ToastKind, string> = {
    success: '✓',
    error: '✕',
    info: 'i',
    warn: '!',
  };
  const iconBg: Record<ToastKind, string> = {
    success: 'bg-accent-500 text-white',
    error: 'bg-danger-500 text-white',
    info: 'bg-primary-500 text-white',
    warn: 'bg-warn-500 text-white',
  };
  return (
    <div
      role="status"
      className={`pointer-events-auto animate-slide-down flex items-start gap-3 p-3.5 pr-2 rounded-xl border shadow-pop ${styles[toast.kind]}`}
    >
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${iconBg[toast.kind]}`}>
        {icons[toast.kind]}
      </div>
      <div className="flex-1 text-sm leading-relaxed pt-0.5">{toast.message}</div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-6 h-6 rounded-md text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors text-base leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
