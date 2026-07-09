import { Skeleton } from "@/components/skeletons/Skeleton";

export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <Skeleton className="mb-6 h-9 w-48" />
      <div className="glass-strong rounded-3xl p-6">
        <Skeleton className="h-5 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mt-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-1.5 h-12 w-full rounded-2xl" />
          </div>
        ))}
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
