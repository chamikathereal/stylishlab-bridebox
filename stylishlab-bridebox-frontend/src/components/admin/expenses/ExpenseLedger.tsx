import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Activity, Pencil, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle } from "lucide-react";
import { ExpenseResponse } from "@/api/generated/model";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface ExpenseLedgerProps {
  records: ExpenseResponse[];
  isLoading: boolean;
  isFetching: boolean;
  onViewAudit: (record: ExpenseResponse) => void;
  onEdit: (record: ExpenseResponse) => void;
  onDelete: (id: number) => void;
  formatCurrency: (val?: number) => string;
  totalAmount: number;
  search: string;
  setSearch: (val: string) => void;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
  totalElements: number;
  totalPages: number;
}

export function ExpenseLedger({
  records,
  isLoading,
  isFetching,
  onViewAudit,
  onEdit,
  onDelete,
  formatCurrency,
  totalAmount,
  search,
  setSearch,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalElements,
  totalPages,
}: ExpenseLedgerProps) {
  return (
    <div className="space-y-4">
      {/* Search and Summary Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Payee, category, note or user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-emerald-500/20"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 px-4 py-2 rounded-xl border border-border/50">
          {isFetching && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Updating
              </span>
            </div>
          )}
          <span className="hidden sm:inline border-l border-muted-foreground/20 pl-3 h-4" />
          <div className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-2">
            Ledger Total
            <span className="text-sm font-black text-foreground tracking-tighter">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <Card className="glass-card overflow-hidden shadow-xl shadow-emerald-500/5">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 bg-muted/10 flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2 text-foreground/80 lowercase">
              <Activity className="w-4 h-4 text-emerald-500" />
              exp_audit_ledger
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10 border-b border-muted-foreground/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
                    Reference
                  </TableHead>
                  <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-amber-600/80">
                    Category
                  </TableHead>
                  <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-teal-600/80">
                    Transaction
                  </TableHead>
                  <TableHead className="px-6 py-5 text-right font-bold text-xs uppercase tracking-wider text-emerald-600/80">
                    Amount
                  </TableHead>
                  <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-blue-600/80">
                    Metadata
                  </TableHead>
                  <TableHead className="px-6 py-5 text-right font-bold text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-5 text-right font-bold text-xs uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <LoadingSpinner message="Fetching expenditures..." />
                    </TableCell>
                  </TableRow>
                ) : records.length > 0 ? (
                  records.map((record) => (
                    <TableRow
                      key={record.id}
                      className="group hover:bg-emerald-500/3 transition-all duration-300 border-muted-foreground/5 cursor-pointer"
                      onClick={() => {
                        if (record.lastEditReason) onViewAudit(record);
                      }}
                    >
                      <TableCell className="px-6 py-5">
                        <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 whitespace-nowrap">
                          {record.createdAt
                            ? new Date(record.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="font-mono text-[10px] font-bold tracking-tight bg-muted/50 px-2 py-1 rounded-md text-muted-foreground border border-border/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          EXP-{record.id?.toString().padStart(4, "0")}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold tracking-tight bg-muted/20 border-muted-foreground/10 uppercase w-fit"
                          >
                            {record.categoryName}
                          </Badge>
                          {record.lastEditReason && (
                            <Badge
                              variant="secondary"
                              className="w-fit scale-75 origin-left bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold"
                            >
                              Edited
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm text-foreground/90 tracking-tight">
                            {record.payeeName}
                          </span>
                          <span className="text-[10px] uppercase text-muted-foreground font-bold italic opacity-70">
                            {record.note || "No notes"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right font-black text-sm text-amber-600 tracking-tight">
                        {formatCurrency(record.amount)}
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 opacity-80">
                            Paid by:{" "}
                            <span className="text-foreground">
                              {record.paidBy}
                            </span>
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 opacity-80">
                            Rec by:{" "}
                            <span className="text-blue-600">
                              {record.recordedByUsername}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold uppercase rounded-md text-emerald-600 border-emerald-500/20 bg-emerald-500/5 shadow-sm"
                        >
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-lg hover:bg-background border-muted-foreground/10 transition-all active:scale-90"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(record);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-destructive hover:bg-destructive/5 border border-muted-foreground/10 transition-all active:scale-90"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-[425px]">
                              <AlertDialogHeader>
                                <div className="flex items-center gap-3 mb-1">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                  </div>
                                  <AlertDialogTitle className="text-lg">
                                    Delete Expense Record
                                  </AlertDialogTitle>
                                </div>
                                <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                                  Are you sure you want to delete expense{" "}
                                  <span className="font-semibold text-foreground">
                                    EXP-{record.id?.toString().padStart(4, "0")}
                                  </span>
                                  {record.amount != null && (
                                    <>
                                      {" "}of{" "}
                                      <span className="font-semibold text-destructive">
                                        {formatCurrency(record.amount)}
                                      </span>
                                    </>
                                  )}
                                  ? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => onDelete(record.id!)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-24 opacity-40"
                    >
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-semibold tracking-tight">
                        No expenses found
                      </p>
                      <p className="text-sm">
                        Try narrowing your filters or record an expenditure.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalElements > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-muted-foreground/10 gap-4 bg-muted/20">
              <div className="flex items-center gap-4 text-sm text-muted-foreground order-2 sm:order-1">
                <span>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(currentPage * itemsPerPage, totalElements)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalElements}
                  </span>
                </span>

                <div className="flex items-center gap-2 border-l border-muted-foreground/20 pl-4">
                  <span className="hidden lg:inline text-xs">
                    Rows per page
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(v) => {
                      if (v) {
                        setItemsPerPage(Number(v));
                        setCurrentPage(1);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] bg-transparent border-none focus:ring-0 text-foreground font-bold text-xs px-3 shadow-none">
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
                  className="h-8 w-8 hidden sm:flex"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
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
                  className="h-8 w-8"
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
                  className="h-8 w-8 hidden sm:flex"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
