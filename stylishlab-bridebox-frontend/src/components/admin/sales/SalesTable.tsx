import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { SaleResponse } from "@/api/generated/model";
import { formatCurrency, formatDate, statusConfig } from "./utils";

interface SalesTableProps {
  sales: SaleResponse[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
  totalElements: number;
  totalPages: number;
  onViewDetails: (sale: SaleResponse) => void;
  onPrintReceipt: (sale: SaleResponse) => void;
}

export function SalesTable({
  sales,
  isLoading,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalElements,
  totalPages,
  onViewDetails,
  onPrintReceipt,
}: SalesTableProps) {
  return (
    <Card className="glass-card border-muted-foreground/10 overflow-hidden shadow-xl shadow-emerald-500/5">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10 border-b border-muted-foreground/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-5 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground/70 w-[140px]">
                  Invoice
                </TableHead>
                <TableHead className="py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70 min-w-[150px]">
                  Service
                </TableHead>
                <TableHead className="py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
                  Customer
                </TableHead>
                <TableHead className="py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
                  Employee
                </TableHead>
                <TableHead className="py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70 text-right">
                  Price
                </TableHead>
                <TableHead className="py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
                  Status
                </TableHead>
                <TableHead className="py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70 text-right">
                  Due
                </TableHead>
                <TableHead className="py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
                  Date
                </TableHead>
                <TableHead className="py-5 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground/70 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground italic">
                      <LoadingSpinner message="Fetching transactions..." />
                    </div>
                  </TableCell>
                </TableRow>
              ) : sales.length > 0 ? (
                sales.map((s) => (
                  <TableRow
                    key={s.id}
                    className="group border-b border-muted-foreground/5 hover:bg-emerald-500/3 transition-all duration-300"
                  >
                    <TableCell className="py-5 px-6">
                      <span className="font-mono text-[10px] font-bold tracking-tight bg-muted/50 px-2 py-1 rounded-md text-muted-foreground border border-border/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {s.invoiceNo}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="font-semibold text-sm tracking-tight text-foreground/90">
                        {s.serviceNameSnapshot}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-medium text-muted-foreground/80">
                        {s.customerName}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-medium text-muted-foreground/80">
                        {s.employeeName}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right font-semibold text-sm tracking-tight text-foreground">
                      {formatCurrency(s.servicePriceSnapshot)}
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-2 border-0 shadow-sm",
                          statusConfig[s.paymentStatus ?? ""]?.className,
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {statusConfig[s.paymentStatus ?? ""]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 text-right">
                      {s.dueAmount && s.dueAmount > 0 ? (
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                          {formatCurrency(s.dueAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/20 text-xs">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                            "h-9 w-9 rounded-xl hover:bg-background shadow-none border-transparent hover:border-border/50 hover:shadow-sm transition-all",
                          )}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 p-1.5 rounded-xl"
                        >
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/70 px-2 py-1.5">
                            Options
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="opacity-50" />
                          <DropdownMenuItem
                            className="gap-3 rounded-lg py-2 focus:bg-emerald-500/10 focus:text-emerald-700 dark:focus:text-emerald-400 cursor-pointer"
                            onClick={() => onViewDetails(s)}
                          >
                            <div className="p-1.5 rounded-md bg-muted group-hover:bg-background transition-colors">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-xs">
                              View Details
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-3 rounded-lg py-2 focus:bg-emerald-500/10 focus:text-emerald-700 dark:focus:text-emerald-400 cursor-pointer"
                            onClick={() => onPrintReceipt(s)}
                          >
                            <div className="p-1.5 rounded-md bg-muted group-hover:bg-background transition-colors">
                              <Printer className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-xs">
                              Print Receipt
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-24">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <div className="p-4 rounded-full bg-muted">
                        <ShoppingCart className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">
                          No transactions found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search filters or record a new
                          sale.
                        </p>
                      </div>
                    </div>
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
                <span className="hidden lg:inline text-xs">Rows per page</span>
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
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
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
  );
}
