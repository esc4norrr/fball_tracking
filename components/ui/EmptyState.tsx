import type { Icon } from '@phosphor-icons/react';

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
}: {
  icon: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="w-11 h-11 rounded-full bg-surface-3 flex items-center justify-center mb-3.5">
        <IconComponent size={20} className="text-text-faint" />
      </div>
      <p className="text-sm font-medium text-text-muted">{title}</p>
      {description && <p className="text-xs text-text-faint mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
