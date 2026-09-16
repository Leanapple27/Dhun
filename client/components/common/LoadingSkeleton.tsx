export function TrackCardSkeleton() {
  return (
    <div className="bg-surface p-4 rounded-xl w-48 animate-pulse">
      <div className="w-full aspect-square mb-4 rounded-lg bg-white/10" />
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  );
}

export function TrackListSkeleton() {
  return (
    <div className="w-full space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-2 animate-pulse">
          <div className="w-8 h-4 bg-white/10 rounded" />
          <div className="w-10 h-10 rounded bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-white/10 rounded w-1/4" />
          </div>
          <div className="w-12 h-4 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
