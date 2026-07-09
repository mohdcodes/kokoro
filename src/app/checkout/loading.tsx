import { Skeleton } from "@/components/skeletons/Skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <Skeleton className="mb-6 h-9 w-40" />
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-20 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
