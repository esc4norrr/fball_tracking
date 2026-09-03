type Tone = 'neutral' | 'accent' | 'danger' | 'warn';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-text-muted',
  accent: 'bg-accent/15 text-accent-text',
  danger: 'bg-danger-strong/15 text-danger',
  warn: 'bg-warn/15 text-warn',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
