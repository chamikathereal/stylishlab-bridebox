"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/shared/TablePagination";
import { AdvanceRequestResponse } from "@/api/generated/model";

interface AdvanceRequestsTableProps {
  advances: AdvanceRequestResponse[];
  advancesTotal: number;
  page: number;
  setPage: (v: number | ((p: number) => number)) => void;
  size: number;
  setSize: (v: number) => void;
  onProcess: (advance: AdvanceRequestResponse) => void;
}

const formatCurrency = (val?: number) => {
  return `Rs. ${(val ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (d?: string) => {
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";
};

export function AdvanceRequestsTable({
  advances,
  advancesTotal,
  page,
  setPage,
  size,
  setSize,
  onProcess,
}: AdvanceRequestsTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-muted/20">
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Date
            </TableHead>
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Employee
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Requested
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Approved
            </TableHead>
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Note
            </TableHead>
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Status
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {advances.map((a) => (
            <TableRow
              key={a.id}
              className="group hover:bg-muted/30 transition-colors border-muted/10 outline-none"
            >
              <TableCell className="px-6 py-5 text-xs text-muted-foreground font-medium">
                {formatDate(a.requestedAt)}
              </TableCell>
              <TableCell className="px-6 py-5 font-bold text-sm">
                {a.employeeName}
              </TableCell>
              <TableCell className="px-6 py-5 text-right font-black text-sm">
                {formatCurrency(a.requestedAmount)}
              </TableCell>
              <TableCell className="px-6 py-5 text-right text-emerald-600 font-bold text-sm">
                {a.approvedAmount ? formatCurrency(a.approvedAmount) : "—"}
              </TableCell>
              <TableCell className="px-6 py-5 text-xs max-w-[200px] truncate italic text-muted-foreground">
                {a.note || "No notes provided"}
              </TableCell>
              <TableCell className="px-6 py-5">
                <Badge
                  variant={
                    a.status === "APPROVED"
                      ? "default"
                      : a.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                  }
                  className="rounded-lg font-black text-[10px] tracking-widest h-6 px-3"
                >
                  {a.status}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-5 text-right">
                {a.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-black uppercase tracking-wider border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all rounded-xl shadow-sm px-4"
                    onClick={() => onProcess(a)}
                  >
                    Process
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {advances.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-12 text-muted-foreground italic font-medium"
              >
                No advance requests found matching your current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="p-4 border-t border-muted/10">
        <TablePagination
          currentPage={page}
          setCurrentPage={setPage}
          itemsPerPage={size}
          setItemsPerPage={setSize}
          totalElements={advancesTotal}
          totalPages={Math.ceil(advancesTotal / size)}
        />
      </div>
    </>
  );
}
