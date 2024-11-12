"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="hover:bg-gray-700"
      >
        Previous
      </Button>

      <span className="mx-4">
        {currentPage} of {totalPages}
      </span>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="hover:bg-gray-700"
      >
        Next
      </Button>
    </div>
  );
}
