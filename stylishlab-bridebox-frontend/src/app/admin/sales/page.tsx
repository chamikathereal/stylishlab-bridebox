"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReceiptPDF } from "@/components/shared/ReceiptPDF";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll1,
  useCreate1,
} from "@/api/generated/endpoints/sales-transactions/sales-transactions";
import { useGetAll5 as useGetCustomers } from "@/api/generated/endpoints/customer-management/customer-management";
import { useGetActive } from "@/api/generated/endpoints/service-packages/service-packages";
import { useGetAll4 as useGetEmployees } from "@/api/generated/endpoints/employee-management/employee-management";
import {
  useDaily,
  useWeekly,
  useMonthly,
  useYearly,
  useTotal,
} from "@/api/generated/endpoints/reports-analytics/reports-analytics";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Search,
  ShoppingCart,
  MoreHorizontal,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  TrendingUp,
  Wallet,
  CreditCard,
  History,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  CreateSaleRequestPaymentStatus,
  SaleResponse,
  CustomerResponse,
  ServiceResponse,
  EmployeeResponse,
} from "@/api/generated/model";

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
function formatDate(d?: string) {
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
}

const statusConfig: Record<string, { label: string; className: string }> = {
  FULLY_PAID: {
    label: "Fully Paid",
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  CREDIT: {
    label: "Credit",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  },
  PARTIAL: {
    label: "Partial",
    className:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
};

export default function SalesPage() {
  const { data: res, isLoading } = useGetAll1();
  const { data: custRes } = useGetCustomers();
  const { data: svcRes } = useGetActive();
  const { data: empRes } = useGetEmployees();
  const createMutation = useCreate1();
  const queryClient = useQueryClient();

  const sales = (res?.data ?? []) as SaleResponse[];
  const customers = (custRes?.data ?? []) as CustomerResponse[];
  const services = (svcRes?.data ?? []) as ServiceResponse[];
  const employees = (empRes?.data ?? []) as EmployeeResponse[];

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Analytics State
  const [kpiPeriod, setKpiPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "total"
  >("monthly");
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedMonth = selectedDate.substring(0, 7); // YYYY-MM
  const selectedYear = parseInt(selectedDate.substring(0, 4));

  // Analytics Hooks
  const { data: dailyData } = useDaily({ date: selectedDate }, { query: { enabled: kpiPeriod === "daily" } });
  const { data: weeklyData } = useWeekly({ date: selectedDate }, { query: { enabled: kpiPeriod === "weekly" } });
  const { data: monthlyData } = useMonthly({ yearMonth: selectedMonth }, { query: { enabled: kpiPeriod === "monthly" } });
  const { data: yearlyData } = useYearly({ year: selectedYear }, { query: { enabled: kpiPeriod === "yearly" } });
  const { data: totalData } = useTotal({ query: { enabled: kpiPeriod === "total" } });

  const kpis = (kpiPeriod === "daily" ? dailyData?.data : 
               kpiPeriod === "weekly" ? weeklyData?.data : 
               kpiPeriod === "monthly" ? monthlyData?.data : 
               kpiPeriod === "yearly" ? yearlyData?.data : totalData?.data) ?? {};

  // Dialogs state for single sale details/printing
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    employeeId: "",
    serviceId: "",
    paymentStatus: "FULLY_PAID" as CreateSaleRequestPaymentStatus,
    paidAmount: "",
  });

  const filtered = [...sales]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .filter(
      (s) =>
        s.customerName?.toLowerCase().includes(filter.toLowerCase()) ||
        s.employeeName?.toLowerCase().includes(filter.toLowerCase()) ||
        s.serviceNameSnapshot?.toLowerCase().includes(filter.toLowerCase()) ||
        s.invoiceNo?.toLowerCase().includes(filter.toLowerCase()),
    );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedSales = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCreate = () => {
    if (!form.customerId || !form.employeeId || !form.serviceId) {
      toast.error("Please fill all fields");
      return;
    }
    createMutation.mutate(
      {
        data: {
          customerId: parseInt(form.customerId),
          employeeId: parseInt(form.employeeId),
          serviceId: parseInt(form.serviceId),
          paymentStatus: form.paymentStatus,
          paidAmount: form.paidAmount ? parseFloat(form.paidAmount) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sale recorded!");
          queryClient.invalidateQueries();
          setOpen(false);
        },
        onError: () => toast.error("Failed to record sale"),
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Sales History"
        description={`${sales.length} total transactions`}
      >
        <Button
          className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" /> New Sale
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(kpis.totalSales)}
          icon={TrendingUp}
          subtitle={`${kpiPeriod === "yearly" ? selectedYear : kpiPeriod === "total" ? "All Time" : kpiPeriod === "monthly" ? selectedMonth : selectedDate}`}
          variant="primary"
        />
        <StatCard
          title="Cash In-Hand"
          value={formatCurrency(kpis.cashReceived)}
          icon={Wallet}
          subtitle="Actual payments"
          variant="success"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(kpis.creditSales)}
          icon={CreditCard}
          subtitle="Remaining credit"
          variant="warning"
        />
        <StatCard
          title="Transactions"
          value={(kpis.totalTransactions ?? 0).toString()}
          icon={History}
          subtitle="Total sales count"
          variant="primary"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.customerId}
                onChange={(e) =>
                  setForm({ ...form, customerId: e.target.value })
                }
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Employee *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
              >
                <option value="">Select employee</option>
                {employees
                  .filter((e) => e.status === "ACTIVE")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <Label>Service *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.serviceId}
                onChange={(e) =>
                  setForm({ ...form, serviceId: e.target.value })
                }
              >
                <option value="">Select service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.serviceName} — Rs. {s.price?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.paymentStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentStatus: e.target
                      .value as CreateSaleRequestPaymentStatus,
                  })
                }
              >
                <option value="FULLY_PAID">Fully Paid</option>
                <option value="CREDIT">Credit</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
            {form.paymentStatus === "PARTIAL" && (
              <div>
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  value={form.paidAmount}
                  onChange={(e) =>
                    setForm({ ...form, paidAmount: e.target.value })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Record Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Row */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm mb-6">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1 ml-1 text-emerald-600 dark:text-emerald-400">
            <Filter className="w-2.5 h-2.5" /> Time Filter
          </Label>
          <Select
            value={kpiPeriod}
            onValueChange={(v: string | null) => v && setKpiPeriod(v as any)}
          >
            <SelectTrigger className="h-9 w-full text-xs bg-background/50 border-border/50 rounded-lg">
              <SelectValue placeholder="Monthly" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="total">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 flex items-center gap-1 ml-1">
            <Calendar className="w-2.5 h-2.5" /> Select Date
          </Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 w-full text-xs bg-background/50 border-border/50 rounded-lg font-medium"
          />
        </div>

        <div className="flex items-end self-end mb-px">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs gap-1.5 hover:bg-background/80 hover:text-primary transition-all rounded-lg border border-transparent hover:border-border/50 group"
            onClick={() => {
              setKpiPeriod("monthly");
              setSelectedDate(today);
              toast.success("Sales filters reset");
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-emerald-500/20"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Total Transactions: <span className="font-bold text-foreground">{filtered.length}</span>
          </span>
        </div>
      </div>

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
                {paginatedSales.length > 0 ? (
                  paginatedSales.map((s) => (
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
                              onClick={() => {
                                setSelectedSale(s);
                                setViewDetailsOpen(true);
                              }}
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
                              onClick={() => {
                                setSelectedSale(s);
                                setPrintReceiptOpen(true);
                              }}
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
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-muted-foreground/10 gap-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <select
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 20, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6">
                <p className="text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card text-card-foreground p-4">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-muted-foreground">Invoice No:</div>
                  <div className="font-medium text-right">
                    {selectedSale.invoiceNo}
                  </div>

                  <div className="text-muted-foreground">Date:</div>
                  <div className="font-medium text-right">
                    {new Date(selectedSale.createdAt || "").toLocaleString()}
                  </div>

                  <div className="text-muted-foreground">Customer:</div>
                  <div className="font-medium text-right">
                    {selectedSale.customerName || "Walk-in"}
                  </div>

                  <div className="text-muted-foreground">Service:</div>
                  <div className="font-medium text-right">
                    {selectedSale.serviceNameSnapshot}
                  </div>

                  <div className="text-muted-foreground">Amount:</div>
                  <div className="font-medium text-right">
                    Rs. {selectedSale.servicePriceSnapshot?.toLocaleString()}
                  </div>

                  <div className="text-muted-foreground">Employee:</div>
                  <div className="font-medium text-right">
                    {selectedSale.employeeName}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground p-4">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Total:</div>
                  <div className="font-medium text-right">
                    Rs. {(selectedSale.servicePriceSnapshot ?? 0).toLocaleString()}
                  </div>

                  <div className="text-muted-foreground">Paid:</div>
                  <div className="font-medium text-right text-emerald-600">
                    Rs. {(selectedSale.paidAmount ?? 0).toLocaleString()}
                  </div>

                  {(selectedSale.dueAmount ?? 0) > 0 && (
                    <>
                      <div className="text-muted-foreground">Due:</div>
                      <div className="font-medium text-right text-destructive">
                        Rs. {selectedSale.dueAmount?.toLocaleString()}
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Status:</span>
                  <Badge
                    className={
                      statusConfig[selectedSale.paymentStatus!]?.className
                    }
                  >
                    {statusConfig[selectedSale.paymentStatus!]?.label ||
                      selectedSale.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Receipt Dialog */}
      <Dialog open={printReceiptOpen} onOpenChange={setPrintReceiptOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-1 gap-0">
          <div className="p-4 border-b flex items-center justify-between">
            <DialogTitle>Print Receipt</DialogTitle>
            {selectedSale && (
              <PDFDownloadLink
                document={<ReceiptPDF sale={selectedSale} />}
                fileName={`stylish-lab-${selectedSale.invoiceNo}.pdf`}
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                {({ loading }: { loading: boolean }) =>
                  loading ? "Preparing PDF..." : "Download Document"
                }
              </PDFDownloadLink>
            )}
          </div>
          <div className="flex-1 overflow-hidden bg-muted/30">
            {selectedSale && printReceiptOpen && (
              <PDFViewer width="100%" height="100%" className="border-none">
                <ReceiptPDF sale={selectedSale} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
