import { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

const controlCls =
  'w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-text-muted">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-text-faint">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlCls} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlCls} ${props.className ?? ''}`} />;
}
