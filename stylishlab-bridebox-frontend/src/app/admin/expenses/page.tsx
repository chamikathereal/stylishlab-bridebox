"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import {
  useGetAll3,
  useRecord,
  useGetCategories,
  useUpdate2,
  useDelete,
} from "@/api/generated/endpoints/expense-management/expense-management";
import { useGetAll2 as useGetPayees } from "@/api/generated/endpoints/payee-debtor-management/payee-debtor-management";
import {
  useDaily,
  useWeekly,
  useMonthly,
  useYearly,
  useTotal,
} from "@/api/generated/endpoints/reports-analytics/reports-analytics";
import { StatCard } from "@/components/shared/StatCard";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Receipt,
  AlertCircle,
  TrendingDown,
  DollarSign,
  ReceiptText,
  Activity,
  FilterX,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  ExpenseResponse,
  ExpenseCategoryResponse,
  PayeeResponse,
} from "@/api/generated/model";
import { PayeeRegistrationDialog } from "@/components/shared/PayeeRegistrationDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

const COMMON_REASONS = [
  "Typo in Amount",
  "Wrong Category",
  "Wrong Payee",
  "Duplicate Entry",
  "Incorrect Note",
  "Special Reason",
];

export default function ExpensesPage() {
  const { data: res, isLoading } = useGetAll3();
  const { data: catRes } = useGetCategories();
  const { data: payeeRes } = useGetPayees();
  const createMutation = useRecord();
  const updateMutation = useUpdate2();
  const deleteMutation = useDelete();

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const expenses = React.useMemo(
    () => (res?.data ?? []) as ExpenseResponse[],
    [res?.data],
  );
  const categories = React.useMemo(
    () => (catRes?.data ?? []) as ExpenseCategoryResponse[],
    [catRes?.data],
  );
  const payees = React.useMemo(
    () => (payeeRes?.data ?? []) as PayeeResponse[],
    [payeeRes?.data],
  );

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    payeeId: "",
    amount: "",
    note: "",
    paidBy: user?.username || "",
  });

  const [viewAuditItem, setViewAuditItem] = useState<ExpenseResponse | null>(
    null,
  );

  const [payeeDialogOpen, setPayeeDialogOpen] = useState(false);

  // Edit State
  const [editItem, setEditItem] = useState<ExpenseResponse | null>(null);
  const [editForm, setEditForm] = useState({
    categoryId: "",
    payeeId: "",
    amount: "",
    paidBy: "",
    note: "",
    editReason: "",
    editNote: "",
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

  // Analytics Hooks
  const { data: dailyRes } = useDaily(
    { date: selectedDate },
    { query: { enabled: kpiPeriod === "daily" } },
  );
  const { data: weeklyRes } = useWeekly(
    { date: selectedDate },
    { query: { enabled: kpiPeriod === "weekly" } },
  );
  const { data: monthlyRes } = useMonthly(
    { yearMonth: selectedMonth },
    { query: { enabled: kpiPeriod === "monthly" } },
  );
  const { data: yearlyRes } = useYearly(
    { year: selectedYear },
    { query: { enabled: kpiPeriod === "yearly" } },
  );
  const { data: totalRes } = useTotal({
    query: { enabled: kpiPeriod === "total" },
  });

  const kpis = React.useMemo(() => {
    const d =
      kpiPeriod === "daily"
        ? dailyRes?.data
        : kpiPeriod === "weekly"
          ? weeklyRes?.data
          : kpiPeriod === "monthly"
            ? monthlyRes?.data
            : kpiPeriod === "yearly"
              ? yearlyRes?.data
              : totalRes?.data;

    return {
      totalExpenses: d?.totalExpenses ?? 0,
      netProfit: d?.netProfit ?? 0,
      totalBills: d?.totalBills ?? 0,
      transactions: d?.totalTransactions ?? 0,
    };
  }, [dailyRes, weeklyRes, monthlyRes, yearlyRes, totalRes, kpiPeriod]);

  // Reset form with user name when modal opens
  React.useEffect(() => {
    if (open && user?.username) {
      setForm((prev) => ({ ...prev, paidBy: user.username }));
    }
  }, [open, user?.username]);

  const isDateInSelectedWeek = (dateStr: string, targetDate: string) => {
    const date = new Date(dateStr);
    const target = new Date(targetDate);
    const first = target.getDate() - target.getDay();
    const last = first + 6;
    const firstDay = new Date(target.setDate(first));
    const lastDay = new Date(target.setDate(last));
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);
    return date >= firstDay && date <= lastDay;
  };

  const filteredRecords = React.useMemo(() => {
    if (kpiPeriod === "total") return expenses;

    return expenses.filter((e) => {
      const dateStr = e.expenseDate || e.createdAt;
      if (!dateStr) return false;
      const recordDate = dateStr.split("T")[0];

      if (kpiPeriod === "daily") return recordDate === selectedDate;
      if (kpiPeriod === "monthly") return recordDate.startsWith(selectedMonth);
      if (kpiPeriod === "yearly")
        return recordDate.startsWith(selectedYear.toString());
      if (kpiPeriod === "weekly")
        return isDateInSelectedWeek(recordDate, selectedDate);

      return true;
    });
  }, [expenses, kpiPeriod, selectedDate, selectedMonth, selectedYear]);

  const totalExpensesAudit = filteredRecords.reduce(
    (sum, e) => sum + (e.amount ?? 0),
    0,
  );

  const filteredPayees = React.useMemo(() => {
    if (!form.categoryId) return payees.filter((p) => p.isActive);
    const selectedCat = categories.find(
      (c) => c.id?.toString() === form.categoryId,
    );
    if (!selectedCat) return payees.filter((p) => p.isActive);

    return payees.filter((p) => {
      if (!p.isActive) return false;
      if (!p.type) return true; // Keep payees with no type as fallback

      const pType = p.type.toLowerCase();
      const cType = (selectedCat.categoryType || "").toLowerCase();
      const cName = (selectedCat.categoryName || "").toLowerCase();

      // Match if the payee type is found in the category type OR category name
      return (
        cType.includes(pType) || pType.includes(cType) || cName.includes(pType)
      );
    });
  }, [form.categoryId, payees, categories]);

  const handleCategoryChange = (val: string) => {
    const selectedCat = categories.find((c) => c.id?.toString() === val);
    const currentPayee = payees.find((p) => p.id?.toString() === form.payeeId);

    let isCompatible = true;
    if (val && currentPayee && currentPayee.type && selectedCat) {
      const pType = currentPayee.type.toLowerCase();
      const cType = (selectedCat.categoryType || "").toLowerCase();
      const cName = (selectedCat.categoryName || "").toLowerCase();

      isCompatible =
        cType.includes(pType) || pType.includes(cType) || cName.includes(pType);
    }

    setForm({
      ...form,
      categoryId: val,
      payeeId: isCompatible ? form.payeeId : "",
    });
  };

  const handleCreate = () => {
    if (!form.categoryId || !form.payeeId || !form.amount || !form.paidBy) {
      toast.error("Category, Payee, amount, and paid by are required");
      return;
    }
    createMutation.mutate(
      {
        data: {
          categoryId: parseInt(form.categoryId),
          payeeId: parseInt(form.payeeId),
          amount: parseFloat(form.amount),
          note: form.note || undefined,
          paidBy: form.paidBy,
        },
      },
      {
        onSuccess: () => {
          toast.success("Expense recorded!");
          queryClient.invalidateQueries();
          setOpen(false);
          setForm({
            categoryId: "",
            payeeId: "",
            amount: "",
            note: "",
            paidBy: user?.username || "",
          });
        },
        onError: () => toast.error("Failed to record expense"),
      },
    );
  };

  const handleUpdate = () => {
    if (
      !editItem ||
      !editForm.categoryId ||
      !editForm.payeeId ||
      !editForm.amount ||
      !editForm.editReason
    ) {
      toast.error("Required fields and edit reason are missing");
      return;
    }

    if (editForm.editReason === "Special Reason" && !editForm.editNote) {
      toast.error("Please add a note for the special reason");
      return;
    }

    updateMutation.mutate(
      {
        id: editItem.id!,
        data: {
          categoryId: parseInt(editForm.categoryId),
          payeeId: editForm.payeeId ? parseInt(editForm.payeeId) : undefined,
          amount: parseFloat(editForm.amount),
          note: editForm.note || undefined,
          paidBy: editForm.paidBy,
          editReason: editForm.editReason,
          editNote: editForm.editNote || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Expense updated!");
          queryClient.invalidateQueries();
          setEditItem(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update");
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Expense deleted");
          queryClient.invalidateQueries();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to delete");
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description="Record and audit business expenditures"
      />

      {/* Analytics KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(kpis.totalExpenses)}
          icon={TrendingDown}
          variant="warning"
          subtitle={`Expenditures for ${kpiPeriod}`}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(kpis.netProfit)}
          icon={DollarSign}
          variant="success"
          subtitle="Revenue after all costs"
        />
        <StatCard
          title="Bill Payments"
          value={formatCurrency(kpis.totalBills)}
          icon={ReceiptText}
          variant="primary"
          subtitle="Fixed recurring costs"
        />
         <StatCard
          title="Expense Count"
          value={`${filteredRecords.length} Records`}
          icon={Activity}
          variant="primary"
          subtitle="Transaction volume"
        />
      </div>

      {/* Advanced Filter Row */}
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

        <div className="w-[180px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block ml-1">
            Select Date
          </Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 text-xs bg-background/50 border-border/50 rounded-lg"
          />
        </div>

        <div className="flex items-end self-stretch pb-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            onClick={() => {
              setKpiPeriod("monthly");
              setSelectedDate(today);
            }}
          >
            <FilterX className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            Reset
          </Button>
        </div>

        <div className="ml-auto flex items-end self-stretch pb-0.5">
          <Button
            onClick={() => setOpen(true)}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" /> Record Expense
          </Button>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 bg-muted/10 flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              Expense Ledger
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-2 pr-4 border-r border-border/50">
                Ledger Total
                <span className="text-sm font-black text-foreground tracking-tighter">
                  {formatCurrency(totalExpensesAudit)}
                </span>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-muted-foreground/10 bg-muted/5">
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                  Reference
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-amber-600">
                  Category
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-teal-600">
                  Transaction
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider text-emerald-600">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-blue-600">
                  Metadata
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider text-blue-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="group hover:bg-emerald-500/2 transition-colors border-muted-foreground/10 cursor-pointer"
                  onClick={() => {
                    if (record.lastEditReason) setViewAuditItem(record);
                  }}
                >
                  <TableCell className="px-6 py-5 text-xs text-muted-foreground font-medium">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-6 py-5 font-bold text-xs tracking-tighter text-blue-600/80">
                    EXP-{record.id?.toString().padStart(4, "0")}
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
                      <span className="font-semibold text-sm">
                        {record.payeeName}
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold italic">
                        {record.note || "No notes"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right font-black text-sm text-amber-600">
                    {formatCurrency(record.amount)}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                        Paid by: <span className="text-foreground">{record.paidBy}</span>
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                        Rec by: <span className="text-blue-600">{record.recordedByUsername}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase rounded-md text-emerald-600 border-emerald-500/20 bg-emerald-500/5"
                    >
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 transition-all duration-300">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-lg border-blue-500/30 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-600 transition-all active:scale-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditItem(record);
                          setEditForm({
                            categoryId: record.categoryId?.toString() || "",
                            payeeId: record.payeeId?.toString() || "",
                            amount: record.amount?.toString() || "",
                            paidBy: record.paidBy || "",
                            note: record.note || "",
                            editReason: "",
                            editNote: "",
                          });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-lg border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all active:scale-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id!);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-20 text-muted-foreground"
                  >
                    <Activity className="w-10 h-10 opacity-10 mx-auto mb-4" />
                    No expenses recorded in the audit ledger
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
                Category *
              </Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={form.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
                Payee *
              </Label>
              <div className="flex gap-2">
                <select
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={form.payeeId}
                  onChange={(e) => setForm({ ...form, payeeId: e.target.value })}
                >
                  <option value="">Select Payee</option>
                  {filteredPayees.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
                <Tooltip>
                  <TooltipTrigger
                    className={cn(
                      buttonVariants({ variant: "outline", size: "icon" }),
                      "h-10 w-10 shrink-0 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center justify-center"
                    )}
                    onClick={() => setPayeeDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px] font-bold">Register New Payee</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
                Amount (Rs.) *
              </Label>
              <Input
                type="number"
                className="h-10"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
                Paid By *
              </Label>
              <Input
                readOnly
                value={form.paidBy}
                className="h-10"
                onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                placeholder="Who paid?"
              />
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
                Note
              </Label>
              <Input
                value={form.note}
                className="h-25"
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Detail Dialog */}
      <Dialog
        open={!!viewAuditItem}
        onOpenChange={(v) => !v && setViewAuditItem(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-amber-500/10 p-6 flex flex-col items-center gap-3 text-center border-b border-amber-500/10">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-amber-900">
                Modification Details
              </DialogTitle>
              <DialogDescription className="text-amber-700/70 text-xs">
                Audit trail for record manual adjustment
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reason for Change
                </span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-none px-2 py-0.5 text-[11px] font-bold">
                    {viewAuditItem?.lastEditReason}
                  </Badge>
                </div>
              </div>

              {viewAuditItem?.lastEditNote && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/30 border border-muted/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Additional Note
                  </span>
                  <p className="text-xs text-foreground italic leading-relaxed">
                    &ldquo;{viewAuditItem.lastEditNote}&rdquo;
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-muted/10 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {viewAuditItem?.lastAmount !== undefined &&
                    viewAuditItem?.lastAmount !== null &&
                    viewAuditItem?.lastAmount !== viewAuditItem?.amount
                      ? "Corrected Amount"
                      : "Amount"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-emerald-600">
                      {formatCurrency(viewAuditItem?.amount || 0)}
                    </span>
                    {viewAuditItem?.lastAmount !== undefined &&
                      viewAuditItem?.lastAmount !== null &&
                      viewAuditItem?.lastAmount !== viewAuditItem?.amount && (
                        <span className="text-[10px] text-amber-700 font-bold line-through opacity-70">
                          Original: {formatCurrency(viewAuditItem.lastAmount)}
                        </span>
                      )}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Adjusted Date
                  </span>
                  <span className="text-sm font-medium">
                    {viewAuditItem?.expenseDate}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold"
              onClick={() => setViewAuditItem(null)}
            >
              Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PayeeRegistrationDialog
        open={payeeDialogOpen}
        onOpenChange={setPayeeDialogOpen}
        onSuccess={(newPayee) => {
          if (newPayee.id) {
            setForm((prev) => ({ ...prev, payeeId: newPayee.id!.toString() }));
            setEditForm((prev) => ({ ...prev, payeeId: newPayee.id!.toString() }));
          }
        }}
      />

      {/* Edit Expense Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(v) => !v && setEditItem(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              Edit Expense Record
            </DialogTitle>
            <DialogDescription>
              Modify historical expense data. Reason for audit is mandatory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Category *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value, payeeId: "" })}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Payee *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.payeeId}
                  onChange={(e) => setEditForm({ ...editForm, payeeId: e.target.value })}
                >
                  <option value="">Select Payee</option>
                  {/* Reuse filtering logic if needed, or just show all for admin */}
                  {payees.filter(p => p.isActive).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Amount (Rs.) *</Label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Paid By *</Label>
                <Input
                  value={editForm.paidBy}
                  onChange={(e) => setEditForm({ ...editForm, paidBy: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Note</Label>
              <Input
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-muted/20 space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2 border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-tight font-medium">
                  Administrative changes require an audit reason for financial transparency.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-amber-900">Reason for Change *</Label>
                <select
                  className="w-full h-10 rounded-md border border-amber-200 bg-background px-3 text-sm"
                  value={editForm.editReason}
                  onChange={(e) => setEditForm({ ...editForm, editReason: e.target.value })}
                >
                  <option value="">Why is this being edited?</option>
                  {COMMON_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {editForm.editReason === "Special Reason" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                   <Label className="text-xs font-bold uppercase text-amber-900">Specify Reason *</Label>
                   <Input 
                     placeholder="Details..."
                     value={editForm.editNote}
                     onChange={(e) => setEditForm({ ...editForm, editNote: e.target.value })}
                   />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button 
                onClick={handleUpdate} 
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
