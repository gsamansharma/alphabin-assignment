import { Button } from '@heroui/react';

interface PaginationControlProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControl({ page, totalPages, onPageChange }: PaginationControlProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-zinc-900 pt-6">
      <span className="text-xs text-zinc-500">
        Page {page} of {totalPages}
      </span>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          isDisabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="text-zinc-400 border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          isDisabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="text-zinc-400 border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
