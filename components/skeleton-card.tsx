'use client';

export function SkeletonCard() {
  return (
    <div className="glass p-6 space-y-4">
      <div className="h-6 bg-white/5 rounded shimmer w-32"></div>
      <div className="space-y-3">
        <div className="h-48 bg-white/5 rounded shimmer"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-white/5 rounded shimmer w-24"></div>
        <div className="h-8 bg-white/5 rounded shimmer w-24"></div>
      </div>
    </div>
  );
}
