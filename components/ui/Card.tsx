export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface-2 border border-border rounded-2xl ${className}`}>{children}</div>
  );
}
