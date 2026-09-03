'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import { Button } from './Button';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function close(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-sm bg-surface-2 border border-border rounded-2xl shadow-xl shadow-black/50 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              {pending.danger && (
                <WarningCircle size={22} weight="fill" className="text-danger shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <h2 id="confirm-title" className="font-semibold text-text text-sm">
                  {pending.title}
                </h2>
                {pending.description && (
                  <p className="text-text-muted text-sm mt-1.5 leading-relaxed">{pending.description}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button variant={pending.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
                {pending.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
