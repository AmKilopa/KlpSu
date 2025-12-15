const SKELETON_COUNT = 3;

export const SkeletonLoader = () => {
  return (
    <div className="space-y-3" role="status" aria-label="Загрузка списка ссылок">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div
          key={i}
          className="border border-zinc-800/80 rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-zinc-950 to-zinc-900 shadow-md shadow-black/40 animate-pulse"
          aria-hidden="true"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="flex gap-3">
                <div className="h-3 bg-zinc-800 rounded w-20" />
                <div className="h-3 bg-zinc-800 rounded w-24" />
              </div>
              <div className="h-1.5 bg-zinc-800 rounded w-full" />
            </div>
            <div className="h-10 w-full sm:w-24 bg-zinc-800 rounded-lg" />
          </div>
        </div>
      ))}
      <span className="sr-only">Загрузка вариантов ссылок...</span>
    </div>
  );
};
