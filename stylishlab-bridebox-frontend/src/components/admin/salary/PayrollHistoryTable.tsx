"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";
import { TablePagination } from "@/components/shared/TablePagination";
import { PayrollResponse } from "@/api/generated/model";

interface PayrollHistoryTableProps {
  history: PayrollResponse[];
  historyTotal: number;
  page: number;
  setPage: (v: number | ((p: number) => number)) => void;
  size: number;
  setSize: (v: number) => void;
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

export function PayrollHistoryTable({
  history,
  historyTotal,
  page,
  setPage,
  size,
  setSize,
}: PayrollHistoryTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-muted/20">
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Settled Date
            </TableHead>
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Employee
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Earnings Settled
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Advances Deducted
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-emerald-600">
              Net Paid
            </TableHead>
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Authorized By
            </TableHead>
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Note
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((h) => (
            <TableRow
              key={h.id}
              className="group hover:bg-muted/30 transition-colors border-muted/10 outline-none"
            >
              <TableCell className="px-6 py-5 text-xs font-bold text-foreground">
                {formatDate(h.settledAt)}
              </TableCell>
              <TableCell className="px-6 py-5 font-bold text-sm">
                {h.employeeName}
              </TableCell>
              <TableCell className="px-6 py-5 text-right font-semibold text-sm">
                {formatCurrency(h.totalEarnings)}
              </TableCell>
              <TableCell className="px-6 py-5 text-right text-destructive font-semibold text-sm">
                -{formatCurrency(h.totalAdvances)}
              </TableCell>
              <TableCell className="px-6 py-5 text-right font-black text-sm text-emerald-600">
                {formatCurrency(h.netPaid)}
              </TableCell>
              <TableCell className="px-6 py-5 text-xs text-muted-foreground font-medium italic">
                {h.settledByName}
              </TableCell>
              <TableCell className="px-6 py-5 text-xs text-muted-foreground">
                {h.note || "—"}
              </TableCell>
            </TableRow>
          ))}
          {history.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-12 text-muted-foreground italic font-medium"
              >
                <div className="flex flex-col items-center gap-2">
                  <History className="w-8 h-8 opacity-20" />
                  No settlement history found for the selected criteria.
                </div>
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
          totalElements={historyTotal}
          totalPages={Math.ceil(historyTotal / size)}
        />
      </div>
    </>
  );
}
