/** Purple shimmer skeleton block. Compose these to roughly match real content shapes. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/** A glass card containing a menu-item-shaped skeleton. */
export function MenuCardSkeleton() {
  return (
    <div className="tile flex flex-col overflow-hidden rounded-3xl">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** A glass card shaped like an order-list row. */
export function OrderRowSkeleton() {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-40" />
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}
