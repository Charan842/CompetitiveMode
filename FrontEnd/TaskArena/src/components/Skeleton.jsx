const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-red-950/30 rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="glass-panel rounded-2xl p-5 space-y-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex gap-4 pt-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const MatchSkeleton = () => (
  <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
    <Skeleton className="h-4 w-4" />
  </div>
);

export const StatsSkeleton = () => (
  <div className="glass-panel rounded-2xl p-5 space-y-4">
    <Skeleton className="h-5 w-32" />
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-5 w-5 mx-auto rounded-full" />
          <Skeleton className="h-7 w-10 mx-auto" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
  </div>
);

export default Skeleton;
