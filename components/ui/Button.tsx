import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary: 'bg-accent hover:bg-accent-strong text-black',
  secondary: 'bg-surface-3 hover:bg-border-strong text-text border border-border',
  ghost: 'text-text-muted hover:text-text hover:bg-surface-3',
  danger: 'bg-danger-strong hover:brightness-90 text-white',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-4 py-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className = '', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});
