'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, WarningCircle, XCircle } from '@phosphor-icons/react';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle size={18} weight="fill" className="text-accent-text shrink-0" />,
  error: <XCircle size={18} weight="fill" className="text-danger shrink-0" />,
  info: <WarningCircle size={18} weight="fill" className="text-text-muted shrink-0" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value: ToastContextValue = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-2.5 bg-surface-3 border border-border-strong rounded-xl shadow-lg shadow-black/40 px-3.5 py-3 text-sm text-text animate-[toast-in_0.18s_ease-out]"
          >
            {ICONS[t.kind]}
            <span className="min-w-0 break-words">{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="status"] { animation: none !important; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
