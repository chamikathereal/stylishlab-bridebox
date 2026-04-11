"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  ExpenseResponse,
  ExpenseCategoryResponse,
  PayeeResponse,
} from "@/api/generated/model";
import { PayeeRegistrationDialog } from "@/components/shared/PayeeRegistrationDialog";

// Sub-components
import { ExpenseStats } from "@/components/admin/expenses/ExpenseStats";
import { ExpenseFilters } from "@/components/admin/expenses/ExpenseFilters";
import { ExpenseLedger } from "@/components/admin/expenses/ExpenseLedger";
import { ExpenseModals } from "@/components/admin/expenses/ExpenseModals";

import { usePeriodFilter } from "@/hooks/usePeriodFilter";

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

  const {
    kpiPeriod,
    setKpiPeriod,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    selectedYear,
    isDateInSelectedPeriod,
    getKpiData,
    reset: resetFilters,
  } = usePeriodFilter();

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
    const d = getKpiData({
      dailyRes,
      weeklyRes,
      monthlyRes,
      yearlyRes,
      totalRes,
    });
    return {
      totalExpenses: d?.totalExpenses ?? 0,
      netProfit: d?.netProfit ?? 0,
      totalBills: d?.totalBills ?? 0,
      transactions: d?.totalTransactions ?? 0,
    };
  }, [
    dailyRes,
    weeklyRes,
    monthlyRes,
    yearlyRes,
    totalRes,
    getKpiData,
  ]);

  React.useEffect(() => {
    if (open && user?.username) {
      setForm((prev) => ({ ...prev, paidBy: user.username }));
    }
  }, [open, user?.username]);

  const filteredRecords = React.useMemo(() => {
    return expenses.filter((e) =>
      isDateInSelectedPeriod(e.expenseDate || e.createdAt),
    );
  }, [expenses, isDateInSelectedPeriod]);

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
      if (!p.type) return true;
      const pType = p.type.toLowerCase();
      const cType = (selectedCat.categoryType || "").toLowerCase();
      const cName = (selectedCat.categoryName || "").toLowerCase();
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
        onError: (err: any) =>
          toast.error(err.response?.data?.message || "Failed to update"),
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
        onError: (err: any) =>
          toast.error(err.response?.data?.message || "Failed to delete"),
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

      <ExpenseStats
        kpis={kpis}
        kpiPeriod={kpiPeriod}
        filteredCount={filteredRecords.length}
        formatCurrency={formatCurrency}
      />

      <ExpenseFilters
        kpiPeriod={kpiPeriod}
        setKpiPeriod={setKpiPeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onReset={resetFilters}
        onOpenCreate={() => setOpen(true)}
      />

      <ExpenseLedger
        records={filteredRecords}
        onViewAudit={setViewAuditItem}
        onEdit={(record) => {
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
        onDelete={handleDelete}
        formatCurrency={formatCurrency}
        totalAmount={totalExpensesAudit}
      />

      <PayeeRegistrationDialog
        open={payeeDialogOpen}
        onOpenChange={setPayeeDialogOpen}
        onSuccess={(newPayee) => {
          if (newPayee.id) {
            setForm((prev) => ({ ...prev, payeeId: newPayee.id!.toString() }));
            setEditForm((prev) => ({
              ...prev,
              payeeId: newPayee.id!.toString(),
            }));
          }
        }}
      />

      <ExpenseModals
        open={open}
        setOpen={setOpen}
        form={form}
        setForm={setForm}
        handleCreate={handleCreate}
        categories={categories}
        filteredPayees={filteredPayees}
        setPayeeDialogOpen={setPayeeDialogOpen}
        isCreatePending={createMutation.isPending}
        handleCategoryChange={handleCategoryChange}
        viewAuditItem={viewAuditItem}
        setViewAuditItem={setViewAuditItem}
        formatCurrency={formatCurrency}
        editItem={editItem}
        setEditItem={setEditItem}
        editForm={editForm}
        setEditForm={setEditForm}
        handleUpdate={handleUpdate}
        isUpdatePending={updateMutation.isPending}
        commonReasons={COMMON_REASONS}
        payees={payees}
      />
    </div>
  );
}
