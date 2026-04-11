"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  setCurrentPage: (page: number | ((p: number) => number)) => void;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
  totalElements: number;
  totalPages: number;
}

export function TablePagination({
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalElements,
  totalPages,
}: TablePaginationProps) {
  if (totalElements === 0) return null;

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-muted-foreground/10 bg-muted/5">
      <div className="flex flex-col sm:flex-row items-center gap-4 order-2 sm:order-1">
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          Total{" "}
          <span className="font-bold text-foreground">{totalElements}</span>{" "}
          records
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(v) => {
              if (v) {
                setItemsPerPage(parseInt(v));
                setCurrentPage(1);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs bg-background border-muted-foreground/20">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((v) => (
                <SelectItem key={v} value={v.toString()}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex border-muted-foreground/20"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-muted-foreground/20"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-center min-w-[100px] text-sm font-medium">
          Page {currentPage} of {totalPages || 1}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-muted-foreground/20"
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages, (p as number) + 1))
          }
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex border-muted-foreground/20"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
