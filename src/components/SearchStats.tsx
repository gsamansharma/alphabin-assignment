interface SearchStatsProps {
  total: number;
  queryTimeMs: number | null;
}

export function SearchStats({ total, queryTimeMs }: SearchStatsProps) {
  return (
    <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-4">
      <span>
        {total.toLocaleString()} records {queryTimeMs !== null && `in ${queryTimeMs}ms`}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Connected
      </span>
    </div>
  );
}
