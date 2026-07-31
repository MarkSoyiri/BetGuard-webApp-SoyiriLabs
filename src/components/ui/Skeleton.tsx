interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`shimmer-bg rounded-xl ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="w-full space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="size-11 shrink-0" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-5 h-64 w-full" />
    </div>
  );
}
