"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReceiptPDF } from "@/components/shared/ReceiptPDF";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/shared/StatCard";
import {
  useGetByEmployee,
  getGetByEmployeeQueryKey,
} from "@/api/generated/endpoints/sales-transactions/sales-transactions";
import {
  useRecordPayment,
  getGetPendingQueryKey,
} from "@/api/generated/endpoints/credit-management/credit-management";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Scissors,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Eye,
  Receipt,
  Printer,
  X,
  Search,
  ArrowRight,
  Filter,
  Check,
  ChevronDown,
} from "lucide-react";
import { SaleResponse, CreateSaleRequestPaymentStatus } from "@/api/generated/model";
import { useAuth } from "@/lib/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from "date-fns";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    ),
  },
);

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
  },
);

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  [CreateSaleRequestPaymentStatus.FULLY_PAID]: {
    label: "Fully Paid",
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  [CreateSaleRequestPaymentStatus.CREDIT]: {
    label: "Credit",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  },
  [CreateSaleRequestPaymentStatus.PARTIAL]: {
    label: "Partial",
    className:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
};

interface StatusOption {
  id: string;
  label: string;
  icon?: boolean;
}

const STATUS_OPTIONS: readonly StatusOption[] = [
  { id: "ALL", label: "All Statuses" },
  { id: CreateSaleRequestPaymentStatus.FULLY_PAID, label: "Fully Paid" },
  { id: CreateSaleRequestPaymentStatus.PARTIAL, label: "Partially Paid" },
  { id: CreateSaleRequestPaymentStatus.CREDIT, label: "Credit Sales" },
  { id: "CREDIT_ONLY", label: "Pending Credits", icon: true },
] as const;

export default function EarningsPage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId;
  const { data: res, isLoading } = useGetByEmployee(employeeId!, {
    query: { enabled: !!employeeId },
  });

  const [period, setPeriod] = useState<
    "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  >("ALL");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Dialog states
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleNote, setSettleNote] = useState("");

  const queryClient = useQueryClient();
  const payMutation = useRecordPayment();

  const handleSettle = () => {
    if (!selectedSale || !settleAmount) return;
    const amount = parseFloat(settleAmount);

    if (isNaN(amount) || amount <= 0)
      return toast.error("Please enter a valid amount");
    if (amount > (selectedSale.dueAmount ?? 0))
      return toast.error("Amount exceeds balance");

    payMutation.mutate(
      {
        saleId: selectedSale.id!,
        data: { amountPaid: amount, note: settleNote || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded successfully!");

          // Use specific query keys to ensure 100% accurate refresh
          queryClient.invalidateQueries({
            queryKey: getGetByEmployeeQueryKey(employeeId!),
          });
          queryClient.invalidateQueries({
            queryKey: getGetPendingQueryKey(),
          });
          // Also invalidate reports just in case stats need updating
          queryClient.invalidateQueries({ queryKey: ["/api/reports"] });

          setSettleOpen(false);
          setSettleAmount("");
          setSettleNote("");
        },
        onError: () => toast.error("Failed to record payment"),
      },
    );
  };

  const filteredSales = useMemo(() => {
    const sales = (res?.data ?? []) as SaleResponse[];
    let timeFiltered = sales;

    if (period !== "ALL") {
      let start: Date, end: Date;
      switch (period) {
        case "DAILY":
          start = startOfDay(selectedDate);
          end = endOfDay(selectedDate);
          break;
        case "WEEKLY":
          start = startOfWeek(selectedDate);
          end = endOfWeek(selectedDate);
          break;
        case "MONTHLY":
          start = startOfMonth(selectedDate);
          end = endOfMonth(selectedDate);
          break;
        case "YEARLY":
          start = startOfYear(selectedDate);
          end = endOfYear(selectedDate);
          break;
        default:
          start = new Date(0);
          end = new Date();
      }

      timeFiltered = sales.filter((s) => {
        const date = new Date(s.createdAt!);
        return isWithinInterval(date, { start, end });
      });
    }

    if (statusFilter !== "ALL") {
      timeFiltered = timeFiltered.filter((s) => {
        if (statusFilter === "CREDIT_ONLY") {
          return (
            (s.paymentStatus === "CREDIT" || s.paymentStatus === "PARTIAL") &&
            (s.dueAmount ?? 0) > 0
          );
        }
        return s.paymentStatus === statusFilter;
      });
    }

    if (!searchTerm) return timeFiltered;

    const query = searchTerm.toLowerCase();
    return timeFiltered.filter(
      (s) =>
        s.customerName?.toLowerCase().includes(query) ||
        s.invoiceNo?.toLowerCase().includes(query) ||
        s.serviceNameSnapshot?.toLowerCase().includes(query),
    );
  }, [res?.data, period, selectedDate, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalEarnings = filteredSales.reduce(
      (acc, s) => acc + (s.servicePriceSnapshot ?? 0),
      0,
    );
    const totalCommission = filteredSales.reduce(
      (acc, s) => acc + (s.employeeAmount ?? 0),
      0,
    );
    const serviceCount = filteredSales.length;
    return { totalEarnings, totalCommission, serviceCount };
  }, [filteredSales]);

  const handlePrev = () => {
    switch (period) {
      case "DAILY":
        setSelectedDate(addDays(selectedDate, -1));
        break;
      case "WEEKLY":
        setSelectedDate(addWeeks(selectedDate, -1));
        break;
      case "MONTHLY":
        setSelectedDate(addMonths(selectedDate, -1));
        break;
      case "YEARLY":
        setSelectedDate(addYears(selectedDate, -1));
        break;
    }
  };

  const handleNext = () => {
    switch (period) {
      case "DAILY":
        setSelectedDate(addDays(selectedDate, 1));
        break;
      case "WEEKLY":
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case "MONTHLY":
        setSelectedDate(addMonths(selectedDate, 1));
        break;
      case "YEARLY":
        setSelectedDate(addYears(selectedDate, 1));
        break;
    }
  };

  const currentPeriodLabel = useMemo(() => {
    switch (period) {
      case "DAILY":
        return format(selectedDate, "MMMM do, yyyy");
      case "WEEKLY":
        return `Week of ${format(startOfWeek(selectedDate), "MMM do")}`;
      case "MONTHLY":
        return format(selectedDate, "MMMM yyyy");
      case "YEARLY":
        return format(selectedDate, "yyyy");
      default:
        return "All Time History";
    }
  }, [period, selectedDate]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Earnings"
        description="Your complete performance breakdown"
      />

      {/* Period Switcher */}
      <div className="flex flex-col gap-4">
        <div className="flex bg-muted/50 p-1 rounded-xl w-fit self-center sm:self-start">
          {[
            { id: "ALL", label: "All" },
            { id: "DAILY", label: "Day" },
            { id: "WEEKLY", label: "Week" },
            { id: "MONTHLY", label: "Month" },
            { id: "YEARLY", label: "Year" },
          ].map((p) => (
            <Button
              key={p.id}
              variant={period === p.id ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "px-4 rounded-lg text-xs transition-all",
                period === p.id &&
                  "shadow-sm bg-background pointer-events-none",
              )}
              onClick={() =>
                setPeriod(
                  p.id as "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
                )
              }
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          {period !== "ALL" && (
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-full border border-muted/20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-background shadow-none"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <div className="flex items-center gap-2 px-3">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
                    {currentPeriodLabel}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-background shadow-none"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-[13px] text-muted-foreground hover:text-primary font-medium"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          subtitle="Gross service value"
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Your Commission"
          value={formatCurrency(stats.totalCommission)}
          subtitle="Final take-home amount"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Services"
          value={stats.serviceCount.toString()}
          subtitle={`Completed in ${period.toLowerCase()}`}
          icon={Scissors}
          variant="warning"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search by customer name or invoice..."
            className="pl-10 h-11 bg-background border-muted/20 rounded-xl shadow-sm focus:ring-primary/20 focus:border-primary transition-all text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({
                variant: statusFilter !== "ALL" ? "secondary" : "outline",
              }),
              "h-11 rounded-xl px-4 gap-2 transition-all shrink-0 min-w-[140px] justify-between cursor-pointer",
              statusFilter !== "ALL"
                ? "bg-primary/10 text-primary border-primary/20"
                : "border-muted/20 hover:border-primary/30",
              statusFilter === "CREDIT_ONLY" &&
                "bg-amber-500/10 text-amber-600 border-amber-500/20",
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Filter
                  className={cn(
                    "w-3.5 h-3.5",
                    statusFilter !== "ALL"
                      ? "text-primary"
                      : "text-muted-foreground",
                    statusFilter === "CREDIT_ONLY" && "text-amber-500",
                  )}
                />
                <span className="text-[13px] font-semibold whitespace-nowrap">
                  {STATUS_OPTIONS.find((opt) => opt.id === statusFilter)?.label}
                </span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-white/10 p-1">
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1.5 tracking-widest">
              Payment Status
            </DropdownMenuLabel>

            {STATUS_OPTIONS.map((f) => (
              <DropdownMenuItem
                key={f.id}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2 py-2 cursor-pointer transition-colors text-sm",
                  statusFilter === f.id
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-white/5",
                )}
                onClick={() => setStatusFilter(f.id)}
              >
                <div className="flex items-center gap-2">
                  <span>{f.label}</span>
                  {f.icon && (
                    <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[8px] h-4 py-0 leading-none border-amber-500/10">
                      Credits
                    </Badge>
                  )}
                </div>
                {statusFilter === f.id && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full sm:w-px h-px sm:h-8 bg-muted/50 hidden sm:block" />

      {/* Sale History Table */}
      <Card className="glass-card shadow-sm border-muted/20 overflow-hidden mt-6">
        <div className="p-4 border-b border-muted/20 flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Detailed Sale History</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            {filteredSales.length} records
          </span>
        </div>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block max-h-[440px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow className="hover:bg-transparent bg-muted/5">
                  <TableHead className="w-12 pl-6"></TableHead>
                  <TableHead className="px-4">Customer</TableHead>
                  <TableHead className="px-4">Service</TableHead>
                  <TableHead className="px-4">Value</TableHead>
                  <TableHead className="px-4">Commission</TableHead>
                  <TableHead className="px-4">Date</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales
                  .slice()
                  .reverse()
                  .map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-muted/5 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          <User className="w-4 h-4" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium px-4">
                        {s.customerName}
                      </TableCell>
                      <TableCell className="text-sm px-4">
                        {s.serviceNameSnapshot}
                      </TableCell>
                      <TableCell className="font-semibold px-4 text-gray-700">
                        {formatCurrency(s.servicePriceSnapshot)}
                      </TableCell>
                      <TableCell className="px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          {formatCurrency(s.employeeAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>
                            {format(new Date(s.createdAt!), "MMM d, yyyy")}
                          </span>
                          <span className="opacity-70 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{" "}
                            {format(new Date(s.createdAt!), "h:mm a")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {(s.dueAmount ?? 0) > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors"
                              onClick={() => {
                                setSelectedSale(s);
                                setSettleOpen(true);
                              }}
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => {
                              setSelectedSale(s);
                              setViewDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-muted/10 max-h-[380px] overflow-y-auto scrollbar-hide">
            {filteredSales
              .slice()
              .reverse()
              .map((s) => (
                <div key={s.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {s.customerName}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />{" "}
                          {format(new Date(s.createdAt!), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        +{formatCurrency(s.employeeAmount)}
                      </span>
                      <div className="flex items-center gap-1">
                        {(s.dueAmount ?? 0) > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] gap-1 rounded-md hover:bg-amber-500/10 text-amber-600"
                            onClick={() => {
                              setSelectedSale(s);
                              setSettleOpen(true);
                            }}
                          >
                            <DollarSign className="w-3 h-3" /> Settle
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] gap-1 rounded-md hover:bg-primary/10"
                          onClick={() => {
                            setSelectedSale(s);
                            setViewDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-3 h-3" /> Details
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Service
                      </p>
                      <p className="text-xs font-medium">
                        {s.serviceNameSnapshot}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Value</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(s.servicePriceSnapshot)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {filteredSales.length === 0 && (
            <div className="py-20 text-center text-muted-foreground border-t border-muted/10">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No records found for this period</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="p-6 pt-2 space-y-4">
              <div className="rounded-2xl border border-muted/50 bg-muted/20 p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-muted-foreground font-medium">
                    Invoice No:
                  </div>
                  <div className="font-bold text-right font-mono">
                    {selectedSale.invoiceNo}
                  </div>

                  <div className="text-muted-foreground font-medium">Date:</div>
                  <div className="font-bold text-right">
                    {new Date(selectedSale.createdAt || "").toLocaleString()}
                  </div>

                  <div className="text-muted-foreground font-medium">
                    Customer:
                  </div>
                  <div className="font-bold text-right">
                    {selectedSale.customerName || "Walk-in"}
                  </div>

                  <div className="text-muted-foreground font-medium">
                    Service:
                  </div>
                  <div className="font-bold text-right text-primary">
                    {selectedSale.serviceNameSnapshot}
                  </div>

                  <div className="text-muted-foreground font-medium">
                    Amount:
                  </div>
                  <div className="font-bold text-right">
                    Rs. {selectedSale.servicePriceSnapshot?.toLocaleString()}
                  </div>

                  <div className="text-muted-foreground font-medium">
                    Employee:
                  </div>
                  <div className="font-bold text-right">
                    {selectedSale.employeeName}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-muted/50 bg-muted/20 p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-muted-foreground font-medium">
                    Total Value:
                  </div>
                  <div className="font-bold text-right">
                    Rs.{" "}
                    {(selectedSale.servicePriceSnapshot ?? 0).toLocaleString()}
                  </div>

                  <div className="text-muted-foreground font-medium">
                    Paid Amount:
                  </div>
                  <div className="font-bold text-right text-emerald-600">
                    Rs. {(selectedSale.paidAmount ?? 0).toLocaleString()}
                  </div>

                  {(selectedSale.dueAmount ?? 0) > 0 && (
                    <>
                      <div className="text-muted-foreground font-medium">
                        Remaining Due:
                      </div>
                      <div className="font-bold text-right text-destructive">
                        Rs. {selectedSale.dueAmount?.toLocaleString()}
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-muted/50 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium text-sm">
                    Status:
                  </span>
                  <Badge
                    className={cn(
                      "px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider",
                      statusConfig[selectedSale.paymentStatus!]?.className,
                    )}
                  >
                    {statusConfig[selectedSale.paymentStatus!]?.label ||
                      selectedSale.paymentStatus}
                  </Badge>
                </div>
              </div>
              <DialogFooter className="mx-0 mb-0 border-t border-muted/50 bg-muted/20 p-6 pt-4 rounded-b-2xl">
                <Button
                  onClick={() => {
                    setViewDetailsOpen(false);
                    setTimeout(() => setPrintReceiptOpen(true), 150);
                  }}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/10 gap-2 font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  <Receipt className="w-4 h-4" /> Print Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Receipt Dialog */}
      <Dialog
        open={printReceiptOpen}
        onOpenChange={(open) => {
          setPrintReceiptOpen(open);
          if (!open) {
            // Re-open details when print is closed
            setTimeout(() => setViewDetailsOpen(true), 150);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-lg h-[80vh] sm:h-[85vh] rounded-2xl overflow-hidden border-none p-0 flex flex-col shadow-2xl"
        >
          <div className="p-4 border-b bg-background/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
            <div className="flex flex-col">
              <DialogTitle className="text-lg font-bold leading-none">
                Print Receipt
              </DialogTitle>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                Preview & Download
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedSale && (
                <PDFDownloadLink
                  document={<ReceiptPDF sale={selectedSale} />}
                  fileName={`stylish-lab-${selectedSale.invoiceNo}.pdf`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 h-9 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95",
                  )}
                >
                  {({ loading }: { loading: boolean }) =>
                    loading ? (
                      "Generating..."
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5" /> Download PDF
                      </span>
                    )
                  }
                </PDFDownloadLink>
              )}
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>
          <div className="flex-1 bg-[#2b2b2b] overflow-hidden">
            {selectedSale && (
              <PDFViewer
                width="100%"
                height="100%"
                className="border-0"
                showToolbar={false}
              >
                <ReceiptPDF sale={selectedSale} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settle Payment Dialog */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="sm:max-w-md overflow-hidden p-0 border-none rounded-2xl shadow-2xl">
          <div className="bg-amber-500/5 p-6 border-b border-amber-500/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                Settle Credit Payment
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-muted/20">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Customer
                </p>
                <p className="font-bold text-lg leading-tight truncate">
                  {selectedSale?.customerName}
                </p>
                <p className="text-xs text-muted-foreground/60 font-mono">
                  INV-#{selectedSale?.invoiceNo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Balance
                </p>
                <p className="font-bold text-xl text-amber-600 tabular-nums">
                  {formatCurrency(selectedSale?.dueAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold text-foreground/80 uppercase">
                    Payment Amount
                  </Label>
                  <button
                    className="text-[10px] text-primary hover:underline font-bold"
                    onClick={() =>
                      setSettleAmount(selectedSale?.dueAmount?.toString() || "")
                    }
                  >
                    Pay Full Balance
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-12 h-14 text-2xl font-black bg-muted/20 border-muted/20 focus:border-amber-500/50 transition-all rounded-xl"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    max={selectedSale?.dueAmount}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-foreground/80 uppercase">
                  Internal Note
                </Label>
                <Input
                  placeholder="e.g. Paid cash in hand"
                  className="bg-muted/20 border-muted/20 h-11 rounded-lg"
                  value={settleNote}
                  onChange={(e) => setSettleNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-2 bg-muted/5 flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => setSettleOpen(false)}
              className="w-full sm:flex-1 order-2 sm:order-1 font-bold h-16 sm:h-11 rounded-2xl sm:rounded-xl text-base sm:text-[11px] uppercase tracking-widest border-muted-foreground/20"
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:flex-1 order-1 sm:order-2 gap-3 bg-amber-500 hover:bg-amber-600 text-white font-black h-16 sm:h-11 rounded-2xl sm:rounded-xl shadow-xl shadow-amber-500/20 text-base sm:text-[11px] uppercase tracking-widest"
              onClick={handleSettle}
              disabled={payMutation.isPending || !settleAmount}
            >
              {payMutation.isPending ? "Processing..." : "Record Payment"}
              <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
