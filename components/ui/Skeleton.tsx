export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-3 ${className}`} />;
}

/** A skeleton shaped like a row in the dashboard/session tables. */
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border/60 last:border-0">
      <Skeleton className="h-3.5 w-28" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-3.5 w-12 ml-auto" />
      ))}
    </div>
  );
}

/** A skeleton shaped like a card row in a vertical list (Sessions page style). */
export function SkeletonListItem() {
  return (
    <div className="bg-surface-2 border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}
