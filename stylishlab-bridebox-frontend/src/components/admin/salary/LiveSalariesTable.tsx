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
import { Wallet } from "lucide-react";
import { TablePagination } from "@/components/shared/TablePagination";
import { SalaryTrackerResponse } from "@/api/generated/model";

interface LiveSalariesTableProps {
  trackers: SalaryTrackerResponse[];
  trackersTotal: number;
  page: number;
  setPage: (v: number | ((p: number) => number)) => void;
  size: number;
  setSize: (v: number) => void;
  onSettle: (tracker: SalaryTrackerResponse) => void;
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

export function LiveSalariesTable({
  trackers,
  trackersTotal,
  page,
  setPage,
  size,
  setSize,
  onSettle,
}: LiveSalariesTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-muted/20">
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Employee
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Accumulated Salary
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Advances Taken
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-emerald-600">
              Net Payable
            </TableHead>
            <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Last Settled
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground/80">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trackers.map((t) => (
            <TableRow
              key={t.id}
              className="group hover:bg-emerald-500/5 transition-colors border-muted/10"
            >
              <TableCell className="px-6 py-5 font-bold text-sm text-foreground">
                {t.employeeName}
              </TableCell>
              <TableCell className="px-6 py-5 text-right font-semibold text-sm">
                {formatCurrency(t.currentSalary)}
              </TableCell>
              <TableCell className="px-6 py-5 text-right font-semibold text-sm text-amber-600/90">
                {formatCurrency(t.totalAdvances)}
              </TableCell>
              <TableCell className="px-6 py-5 text-right font-black text-sm text-emerald-600">
                {formatCurrency(t.netPayable)}
              </TableCell>
              <TableCell className="px-6 py-5 text-xs text-muted-foreground font-medium">
                {formatDate(t.lastSettlementDate)}
              </TableCell>
              <TableCell className="px-6 py-5 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 text-xs font-bold gap-2.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all rounded-xl shadow-sm px-4"
                  disabled={
                    (t.netPayable ?? 0) <= 0 &&
                    (t.totalAdvances ?? 0) <= 0 &&
                    (t.currentSalary ?? 0) <= 0
                  }
                  onClick={() => onSettle(t)}
                >
                  <Wallet className="w-4 h-4" /> Settle
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {trackers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic font-medium">
                No active salary tracking data found for the current period.
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
          totalElements={trackersTotal}
          totalPages={Math.ceil(trackersTotal / size)}
        />
      </div>
    </>
  );
}
