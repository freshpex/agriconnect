import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as PaginationType } from "../../types";
import { Button } from "./Button";

export function Pagination({
  pagination,
  onPageChange,
}: {
  pagination?: PaginationType;
  onPageChange: (page: number) => void;
}) {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-stone-200 pt-4 sm:flex-row">
      <p className="text-sm text-stone-500">
        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={pagination.page <= 1}
          icon={<ChevronLeft className="h-4 w-4" />}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={pagination.page >= pagination.pages}
          icon={<ChevronRight className="h-4 w-4" />}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
