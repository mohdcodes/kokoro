import { Skeleton, OrderRowSkeleton } from "@/components/skeletons/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-40 rounded-full" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <OrderRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
