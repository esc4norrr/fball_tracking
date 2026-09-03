import type { Icon } from '@phosphor-icons/react';

export function StatCard({
  icon: IconComponent,
  label,
  value,
  tone = 'neutral',
}: {
  icon: Icon;
  label: string;
  value: string | number;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        tone === 'danger' ? 'bg-danger-strong/10 border-danger-strong/30' : 'bg-surface-2 border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        <IconComponent size={16} className={tone === 'danger' ? 'text-danger' : 'text-text-faint'} />
      </div>
      <div className={`text-2xl font-semibold mt-1.5 ${tone === 'danger' ? 'text-danger' : 'text-text'}`}>
        {value}
      </div>
    </div>
  );
}
