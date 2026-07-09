import { Skeleton } from "@/components/skeletons/Skeleton";

export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-3 w-48" />

        {/* Tracker steps */}
        <div className="mt-8 flex items-center justify-between gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-kokoro-200 pt-4">
          <Skeleton className="h-5 w-24" />
          <div className="mt-3 flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
