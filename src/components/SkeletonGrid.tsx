import { Card, Skeleton } from '@heroui/react';

export function SkeletonGrid({ limit }: { limit: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: limit }).map((_, i) => (
        <Card key={i} className="border border-zinc-800 bg-zinc-950/40 p-5 flex items-center gap-4 rounded-xl shadow-none">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0 bg-zinc-900" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 rounded w-2/3 bg-zinc-900" />
            <Skeleton className="h-2.5 rounded w-1/2 bg-zinc-900" />
          </div>
        </Card>
      ))}
    </div>
  );
}
