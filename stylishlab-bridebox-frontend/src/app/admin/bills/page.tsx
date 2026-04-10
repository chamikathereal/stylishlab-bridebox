"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll6,
  useCreate5,
  useSettle,
} from "@/api/generated/endpoints/monthly-bills/monthly-bills";
import { useGetAllActive } from "@/api/generated/endpoints/bill-categories/bill-categories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { StatCard } from "@/components/shared/StatCard";
import { cn } from "@/lib/utils";
import {
  Plus,
  FileText,
  Check,
  TrendingDown,
  Wallet,
  AlertCircle,
  CheckCircle,
  FilterX,
  Activity,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BillResponse } from "@/api/generated/model";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function BillsPage() {
  const { data: res, isLoading } = useGetAll6();
  const { data: catRes } = useGetAllActive();
  const createMutation = useCreate5();
  const settleMutation = useSettle();
  const queryClient = useQueryClient();
  const bills = (res?.data ?? []) as BillResponse[];
  const categories = catRes?.data ?? [];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    billType: "",
    amount: "",
    billMonth: "",
    paidDate: "",
    note: "",
  });

  // Analytics State
  const [kpiPeriod, setKpiPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "total"
  >("monthly");
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Computed Date Parts
  const selectedMonth = selectedDate.substring(0, 7); // YYYY-MM
  const selectedYear = parseInt(selectedDate.substring(0, 4));

  const isDateInSelectedWeek = (dateStr: string, targetDate: string) => {
    const date = new Date(dateStr);
    const target = new Date(targetDate);
    const day = target.getDay();
    const first = target.getDate() - day;
    const last = first + 6;
    
    const firstDay = new Date(new Date(targetDate).setDate(first));
    const lastDay = new Date(new Date(targetDate).setDate(last));
    
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);
    return date >= firstDay && date <= lastDay;
  };

  const filteredBills = React.useMemo(() => {
    if (kpiPeriod === "total") return bills;

    return bills.filter((b) => {
      if (!b.billMonth) return kpiPeriod === "total";

      const belongsToPeriod = () => {
        if (kpiPeriod === "daily") return b.billMonth === selectedMonth;
        if (kpiPeriod === "monthly") return b.billMonth === selectedMonth;
        if (kpiPeriod === "yearly")
          return b.billMonth.startsWith(selectedYear.toString());
        if (kpiPeriod === "weekly")
          return isDateInSelectedWeek(`${b.billMonth}-01`, selectedDate);
        return true;
      };

      return belongsToPeriod();
    });
  }, [bills, kpiPeriod, selectedDate, selectedMonth, selectedYear]);

  const kpis = React.useMemo(() => {
    const total = filteredBills.reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const paid = filteredBills
      .filter((b) => b.status === "PAID")
      .reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const outstanding = total - paid;
    const pendingCount = filteredBills.filter((b) => b.status !== "PAID").length;

    return { total, paid, outstanding, pendingCount };
  }, [filteredBills]);

  const handleCreate = () => {
    if (!form.billType || !form.amount || !form.billMonth) {
      toast.error("Type, amount, and month required");
      return;
    }
    createMutation.mutate(
      {
        data: {
          billType: form.billType,
          amount: parseFloat(form.amount),
          billMonth: form.billMonth,
          paidDate: form.paidDate || undefined,
          note: form.note || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Bill created!");
          queryClient.invalidateQueries();
          setOpen(false);
          setForm({
            billType: "",
            amount: "",
            billMonth: "",
            paidDate: "",
            note: "",
          });
        },
        onError: () => toast.error("Failed to create bill"),
      },
    );
  };

  const handleSettle = (id: number) => {
    settleMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Bill settled!");
          queryClient.invalidateQueries();
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Bills"
        description={`${filteredBills.length} bills tracked for this period`}
      >
        <Button
          className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" /> Add Bill
        </Button>
      </PageHeader>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bill Amount"
          value={formatCurrency(kpis.total)}
          icon={Wallet}
          variant="primary"
          subtitle={`Obligations for ${kpiPeriod}`}
        />
        <StatCard
          title="Paid Amount"
          value={formatCurrency(kpis.paid)}
          icon={CheckCircle}
          variant="success"
          subtitle="Total settled so far"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(kpis.outstanding)}
          icon={TrendingDown}
          variant="warning"
          subtitle="Amount yet to be paid"
        />
        <StatCard
          title="Pending Bills"
          value={`${kpis.pendingCount} Bills`}
          icon={AlertCircle}
          variant={kpis.pendingCount > 0 ? "destructive" : "primary"}
          subtitle="Action required"
        />
      </div>

      {/* Analytics Toolbar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block ml-1">
            Analytics Period
          </Label>
          <div className="flex gap-1.5 bg-background/50 p-1 rounded-xl border border-border/50">
            {["daily", "weekly", "monthly", "yearly", "total"].map((p) => (
              <Button
                key={p}
                variant={kpiPeriod === p ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-[10px] uppercase font-bold flex-1 px-0 transition-all duration-300",
                  kpiPeriod === p ? "shadow-sm" : "hover:bg-background/80",
                )}
                onClick={() =>
                  setKpiPeriod(
                    p as "daily" | "weekly" | "monthly" | "yearly" | "total",
                  )
                }
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="min-w-[180px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block ml-1">
            Reference Date
          </Label>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 pl-9 text-xs font-medium bg-background/50 border-border/50 rounded-xl focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-end h-full self-end ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setKpiPeriod("monthly");
              setSelectedDate(today);
            }}
            className="h-9 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <FilterX className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Monthly Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Bill Type *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.billType}
                onChange={(e) => setForm({ ...form, billType: e.target.value })}
              >
                <option value="">Select type</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name!}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2">Amount (Rs.) *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-2">Bill Month *</Label>
              <Input
                type="month"
                value={form.billMonth}
                onChange={(e) =>
                  setForm({ ...form, billMonth: e.target.value })
                }
              />
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                The period this bill belongs to (e.g. May Rent)
              </p>
            </div>
            <div>
              <Label className="mb-2">Payment Date (Optional)</Label>
              <Input
                type="date"
                value={form.paidDate}
                onChange={(e) => setForm({ ...form, paidDate: e.target.value })}
              />
              <p className="text-[10px] text-emerald-600/70 mt-1 italic">
                Select a date if the bill is already paid today or earlier
              </p>
            </div>
            <div>
              <Label className="mb-2">Note</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 bg-muted/10 flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Bill Ledger
            </h3>
            <div className="text-[10px] uppercase text-muted-foreground font-bold italic">
              Detailed breakdown of monthly utility and operation costs
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-muted-foreground/10 bg-muted/5">
                <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider text-blue-600">
                  Bill Period
                </TableHead>
                <TableHead className="px-8 py-4 text-right font-bold text-xs uppercase tracking-wider text-emerald-600">
                  Amount
                </TableHead>
                <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider text-teal-600">
                  Transaction Date
                </TableHead>
                <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider">
                  Note
                </TableHead>
                <TableHead className="px-8 py-4 text-right font-bold text-xs uppercase tracking-wider">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.length > 0 ? (
                filteredBills.map((b) => (
                  <TableRow
                    key={b.id}
                    className="group hover:bg-emerald-500/2 transition-colors border-muted-foreground/10"
                  >
                    <TableCell className="px-8 py-5 font-bold text-sm tracking-tight">
                      {b.billType}
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                          <Calendar className="w-3 h-3" />
                          {b.billMonth}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Billing Cycle</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right font-black text-sm text-emerald-600">
                      {formatCurrency(b.amount)}
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <Badge
                        variant={b.status === "PAID" ? "default" : "secondary"}
                        className={cn(
                          "font-bold text-[10px] tracking-widest",
                          b.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        )}
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      {b.paidDate ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-teal-600 font-bold text-[11px]">
                            <CheckCircle className="w-3 h-3" />
                            {b.paidDate}
                          </div>
                          <span className="text-[9px] text-muted-foreground uppercase font-medium">Payment Recorded</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-tighter italic">Not Settled Yet</span>
                      )}
                    </TableCell>
                    <TableCell className="px-8 py-5 text-[11px] font-medium text-muted-foreground italic">
                      {b.note || "-"}
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      {b.status !== "PAID" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
                          onClick={() => handleSettle(b.id!)}
                        >
                          <Check className="w-3 h-3" /> Settle
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-20 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <FileText className="w-12 h-12" />
                      <p className="text-sm font-bold uppercase tracking-tighter">
                        No bills recorded for this period
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
