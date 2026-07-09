import { Skeleton } from "@/components/skeletons/Skeleton";

export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-20">
      <div className="glass-strong rounded-3xl p-8 text-center">
        <Skeleton className="mx-auto h-9 w-48" />
        <Skeleton className="mx-auto mt-4 h-4 w-full max-w-xl" />
        <Skeleton className="mx-auto mt-2 h-4 w-full max-w-lg" />
        <Skeleton className="mx-auto mt-2 h-4 w-3/4 max-w-md" />
      </div>
    </div>
  );
}
