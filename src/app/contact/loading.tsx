import { Skeleton } from "@/components/skeletons/Skeleton";

export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <Skeleton className="mb-6 h-9 w-40" />
      <div className="glass-strong rounded-3xl p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mt-4 first:mt-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-1.5 h-12 w-full rounded-2xl" />
          </div>
        ))}
        <Skeleton className="mt-4 h-28 w-full rounded-2xl" />
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
