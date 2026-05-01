"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetPendingCredits,
  useRecordCreditPayment,
} from "@/api/generated/endpoints/credit-management/credit-management";
import { useGetPendingSales } from "@/api/generated/endpoints/sales-transactions/sales-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  CustomerCreditSummaryResponse,
  SaleResponse,
} from "@/api/generated/model";
import { cn } from "@/lib/utils";

function formatCurrency(val?: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(val ?? 0);
}

export default function CreditsPage() {
  const queryClient = useQueryClient();
  const { data: pendingRes, isLoading: isPendingLoading } =
    useGetPendingCredits();
  const { data: salesRes, isLoading: isSalesLoading } = useGetPendingSales();
  const payMutation = useRecordCreditPayment();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [payDialog, setPayDialog] = useState<{
    saleId: number;
    customer: string;
    max: number;
    invoice: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const pending: CustomerCreditSummaryResponse[] = pendingRes?.data ?? [];
  const creditSales: SaleResponse[] = salesRes?.data ?? [];

  const filteredSales = creditSales
    .filter(
      (s) =>
        s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.invoiceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serviceNameSnapshot?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "due-desc":
          return (b.dueAmount ?? 0) - (a.dueAmount ?? 0);
        case "due-asc":
          return (a.dueAmount ?? 0) - (b.dueAmount ?? 0);
        case "date-desc":
          return (
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
          );
        case "name-asc":
          return (a.customerName ?? "").localeCompare(b.customerName ?? "");
        case "price-desc":
          return (
            (b.servicePriceSnapshot ?? 0) - (a.servicePriceSnapshot ?? 0)
          );
        default:
          return 0;
      }
    });

  const totalOutstanding = pending.reduce(
    (sum, c) => sum + (c.totalDue ?? 0),
    0,
  );

  const totalServiceValue = filteredSales.reduce(
    (sum, s) => sum + (s.servicePriceSnapshot ?? 0),
    0,
  );

  const handlePay = () => {
    if (!payDialog || !amount) return;
    const payAmount = parseFloat(amount);

    if (isNaN(payAmount) || payAmount <= 0)
      return toast.error("Please enter a valid amount");
    if (payAmount > payDialog.max) return toast.error("Amount exceeds balance");

    payMutation.mutate(
      {
        saleId: payDialog.saleId,
        data: { amountPaid: payAmount, note: note || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded successfully!");
          queryClient.invalidateQueries();
          setPayDialog(null);
          setAmount("");
          setNote("");
        },
        onError: () => toast.error("Failed to record payment"),
      },
    );
  };

  if (isPendingLoading || isSalesLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Management"
        description="Track and settle outstanding customer payments"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-l-4 border-l-primary overflow-hidden relative">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Total Sales Value
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalServiceValue)}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <DollarSign className="w-24 h-24 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-l-4 border-l-amber-500 overflow-hidden relative">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Total Outstanding
              </p>
              <p className="text-2xl font-bold text-amber-500">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <CreditCard className="w-24 h-24 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-success overflow-hidden relative">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Filter className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Pending Sales
              </p>
              <p className="text-2xl font-bold">{creditSales.length}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <Filter className="w-24 h-24 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/2">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer or invoice..."
                  className="pl-9 bg-background/40 border-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                  <SelectTrigger className="w-full md:w-48 bg-background/40 border-white/10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="due-desc">Highest Due</SelectItem>
                    <SelectItem value="due-asc">Lowest Due</SelectItem>
                    <SelectItem value="price-desc">Highest Value</SelectItem>
                    <SelectItem value="name-asc">Customer A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {filteredSales.length}
              </span>{" "}
              records
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/2 border-b-white/5 hover:bg-transparent">
                  <TableHead className="font-bold px-6 py-4 uppercase text-[11px] tracking-widest text-muted-foreground">
                    Customer & Invoice
                  </TableHead>
                  <TableHead className="font-bold text-center uppercase text-[11px] tracking-widest text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-right uppercase text-[11px] tracking-widest text-muted-foreground">
                    Total
                  </TableHead>
                  <TableHead className="font-bold text-right uppercase text-[11px] tracking-widest text-muted-foreground">
                    Due Balance
                  </TableHead>
                  <TableHead className="font-bold text-right px-6 uppercase text-[11px] tracking-widest text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="border-b-white/5 hover:bg-white/3 transition-colors group"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {sale.customerName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded font-mono text-muted-foreground tracking-tighter">
                            #{sale.invoiceNo}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {sale.serviceNameSnapshot}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] uppercase font-bold tracking-widest h-5",
                          sale.paymentStatus === "PARTIAL"
                            ? "border-amber-500/50 text-amber-500 bg-amber-500/5"
                            : "border-red-500/50 text-red-500 bg-red-400/5",
                        )}
                      >
                        {sale.paymentStatus === "PARTIAL"
                          ? "Partial"
                          : "Credit"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-medium">
                      {formatCurrency(sale.servicePriceSnapshot)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-500 tabular-nums">
                      {formatCurrency(sale.dueAmount)}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                        onClick={() =>
                          setPayDialog({
                            saleId: sale.id!,
                            customer: sale.customerName!,
                            max: sale.dueAmount!,
                            invoice: sale.invoiceNo!,
                          })
                        }
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Settle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CreditCard className="w-12 h-12 mb-4 opacity-5 animate-pulse" />
                        <p className="text-lg font-medium opacity-40">
                          No pending credit records found
                        </p>
                        <p className="text-sm opacity-30">
                          All accounts are currently balanced.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settlement Dialog */}
      <Dialog
        open={!!payDialog}
        onOpenChange={(o) => {
          if (!o) setPayDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md glass-card border-white/10 shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                Settle Credit Payment
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Debtor
                </p>
                <p className="font-bold text-lg text-foreground leading-tight">
                  {payDialog?.customer}
                </p>
                <p className="text-xs text-muted-foreground/60 font-mono">
                  Invoice #{payDialog?.invoice}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Due Amount
                </p>
                <p className="font-black text-2xl text-amber-500 tabular-nums">
                  {formatCurrency(payDialog?.max)}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-0.5">
                  <Label className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                    Payment Amount
                  </Label>
                  <button
                    className="text-[10px] text-primary hover:text-primary/80 font-black uppercase tracking-tighter transition-colors bg-primary/5 px-2 py-0.5 rounded cursor-pointer"
                    onClick={() => setAmount(payDialog?.max.toString() || "")}
                  >
                    Pay Full Balance
                  </button>
                </div>
                <div className="relative group">
                  <span
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black transition-colors",
                      amount ? "text-primary" : "text-muted-foreground/30",
                    )}
                  >
                    LKR
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-14 h-14 text-2xl font-black bg-white/2 border-white/10 group-focus-within:border-primary/50 transition-all rounded-xl tabular-nums"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={payDialog?.max}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                  Internal Reference Note
                </Label>
                <Input
                  placeholder="e.g. Paid via Bank Transfer"
                  className="bg-white/2 border-white/10 h-11 rounded-lg"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-2 bg-white/2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setPayDialog(null)}
              className="h-11 flex-1 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[11px]"
            >
              Cancel
            </Button>
            <Button
              className="h-11 flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
              onClick={handlePay}
              disabled={payMutation.isPending || !amount}
            >
              {payMutation.isPending ? "Processing..." : "Record Payment"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
