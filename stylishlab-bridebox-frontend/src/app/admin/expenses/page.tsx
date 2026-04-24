"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAllExpenses,
  useRecordExpense,
  useGetExpenseCategories,
  useUpdateExpense,
  useDeleteExpense,
  useGetExpensesByDateRange,
} from "@/api/generated/endpoints/expense-management/expense-management";
import { useGetAllPayees as useGetPayees } from "@/api/generated/endpoints/payee-debtor-management/payee-debtor-management";
import {
  useDaily,
  useWeekly,
  useMonthly,
  useYearly,
  useTotal,
} from "@/api/generated/endpoints/reports-analytics/reports-analytics";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
  const { data: catRes } = useGetExpenseCategories();
  const { data: payeeRes } = useGetPayees();
  const createMutation = useRecordExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const categories = React.useMemo(
    () => (catRes?.data ?? []) as ExpenseCategoryResponse[],
    [catRes],
  );
  const payees = React.useMemo(
    () => (payeeRes?.data ?? []) as PayeeResponse[],
    [payeeRes],
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

  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce filter logic
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filter]);

  const {
    kpiPeriod,
    setKpiPeriod,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    selectedYear,
    getKpiData,
    dateRange,
    reset: resetFilters,
  } = usePeriodFilter({ initialPeriod: "daily" });

  // Expenses Queries
  const expensesAllQuery = useGetAllExpenses(
    {
      search: debouncedFilter,
      pageable: {
        page: currentPage - 1,
        size: itemsPerPage,
        sort: ["createdAt,desc"],
      },
    },
    {
      query: {
        enabled: kpiPeriod === "total",
        placeholderData: keepPreviousData,
      },
    },
  );

  const expensesRangeQuery = useGetExpensesByDateRange(
    {
      from: dateRange.from,
      to: dateRange.to,
      search: debouncedFilter,
      pageable: {
        page: currentPage - 1,
        size: itemsPerPage,
        sort: ["createdAt,desc"],
      },
    },
    {
      query: {
        enabled: kpiPeriod !== "total",
        placeholderData: keepPreviousData,
      },
    },
  );

  const activeQuery = kpiPeriod === "total" ? expensesAllQuery : expensesRangeQuery;
  const isListLoading = activeQuery.isLoading;

  const expensesPageData = activeQuery.data?.data;
  const filteredRecords = (expensesPageData?.content ?? []) as ExpenseResponse[];
  const totalElements = expensesPageData?.totalElements ?? 0;
  const totalPages = expensesPageData?.totalPages ?? 0;

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

  const totalExpensesAudit = filteredRecords.reduce(
    (sum, e) => sum + (e.amount ?? 0),
    0,
  );

  const filteredPayees = React.useMemo(() => {
    const activePayees = payees.filter((p) => p.isActive);
    if (!form.categoryId) return activePayees;

    const selectedCat = categories.find(
      (c) => c.id?.toString() === form.categoryId,
    );
    if (!selectedCat) return activePayees;

    return activePayees.filter((p) => {
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
        onError: () => {
          toast.error("Failed to record expense");
        },
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
        onError: (err) => {
          const message = (err as any)?.response?.data?.message;
          toast.error(message || "Failed to update");
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Expense deleted");
          queryClient.invalidateQueries();
        },
        onError: (err) => {
          const message = (err as any)?.response?.data?.message;
          toast.error(message || "Failed to delete");
        },
      },
    );
  };

  if (isListLoading && !expensesPageData) return <LoadingSpinner />;

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
        isLoading={isListLoading}
        isFetching={activeQuery.isFetching}
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
        search={filter}
        setSearch={setFilter}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalElements={totalElements}
        totalPages={totalPages}
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
