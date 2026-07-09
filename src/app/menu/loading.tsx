import { Skeleton, MenuCardSkeleton } from "@/components/skeletons/Skeleton";

export default function MenuLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <div className="glass-strong mb-10 rounded-3xl px-6 py-10 text-center">
        <Skeleton className="mx-auto h-9 w-48" />
        <Skeleton className="mx-auto mt-3 h-4 w-64" />
      </div>

      {/* Category pill row */}
      <div className="glass scrollbar-hide overflow-hidden rounded-3xl p-2">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Skeleton className="mb-4 h-7 w-40" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
