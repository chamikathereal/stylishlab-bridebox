"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAllBills,
  useCreateBill,
  useSettleBill,
  useUpdateBill,
  useDeleteBill,
} from "@/api/generated/endpoints/monthly-bills/monthly-bills";
import { useGetAllActive } from "@/api/generated/endpoints/bill-categories/bill-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { BillResponse, BillCategory } from "@/api/generated/model";

// Sub-components
import { BillStats } from "@/components/admin/bills/BillStats";
import { BillLedger } from "@/components/admin/bills/BillLedger";
import { BillModals } from "@/components/admin/bills/BillModals";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function BillsPage() {
  // Pagination & search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: res, isLoading } = useGetAllBills(
    {
      search: debouncedSearch || undefined,
      page: currentPage - 1,
      size: itemsPerPage,
      sort: ["billMonth,desc"],
    },
    { query: { placeholderData: keepPreviousData } },
  );

  const { data: catRes } = useGetAllActive();
  const createMutation = useCreateBill();
  const updateMutation = useUpdateBill();
  const deleteMutation = useDeleteBill();
  const settleMutation = useSettleBill();
  const queryClient = useQueryClient();

  const bills = React.useMemo(
    () => (res?.data?.content ?? []) as BillResponse[],
    [res?.data?.content],
  );
  const totalElements = res?.data?.totalElements ?? 0;
  const totalPages = res?.data?.totalPages ?? 0;

  const categories = React.useMemo(
    () => (catRes?.data ?? []) as BillCategory[],
    [catRes?.data],
  );

  const [open, setOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billIdToDelete, setBillIdToDelete] = useState<number | null>(null);
  const [form, setForm] = useState({
    billType: "",
    amount: "",
    billMonth: "",
    paidDate: "",
    note: "",
  });

  // Removed useEffect for form population to avoid cascading renders
  // Form population is now handled in the edit/add handlers directly

  // KPI calculations from current page data + server totals
  const kpis = React.useMemo(() => {
    const total = bills.reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const paid = bills
      .filter((b) => b.status === "PAID")
      .reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const outstanding = total - paid;
    const pendingCount = bills.filter((b) => b.status !== "PAID").length;

    return { total, paid, outstanding, pendingCount };
  }, [bills]);

  const handleSave = () => {
    if (!form.billType || !form.amount || !form.billMonth) {
      toast.error("Type, amount, and month required");
      return;
    }

    const payload = {
      billType: form.billType,
      amount: parseFloat(form.amount),
      billMonth: form.billMonth,
      paidDate: form.paidDate || undefined,
      note: form.note || undefined,
    };

    if (editingBill?.id) {
      updateMutation.mutate(
        { id: editingBill.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Bill updated!");
            queryClient.invalidateQueries();
            setOpen(false);
            setEditingBill(null);
          },
          onError: () => toast.error("Failed to update bill"),
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast.success("Bill created!");
            queryClient.invalidateQueries();
            setOpen(false);
          },
          onError: () => toast.error("Failed to create bill"),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    setBillIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!billIdToDelete) return;
    deleteMutation.mutate(
      { id: billIdToDelete },
      {
        onSuccess: () => {
          toast.success("Bill deleted!");
          queryClient.invalidateQueries();
          setDeleteDialogOpen(false);
          setBillIdToDelete(null);
        },
        onError: () => toast.error("Failed to delete bill"),
      }
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
        description={`${totalElements} bills tracked`}
      >
        <Button
          className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
          onClick={() => {
            setEditingBill(null);
            setForm({
              billType: "",
              amount: "",
              billMonth: "",
              paidDate: "",
              note: "",
            });
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> Add Bill
        </Button>
      </PageHeader>

      <BillStats
        kpis={kpis}
        kpiPeriod="all"
        formatCurrency={formatCurrency}
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search bills by type, month, status, or note..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      <BillModals
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) setEditingBill(null);
        }}
        form={form}
        setForm={setForm}
        categories={categories}
        onCreate={handleSave}
        isCreating={createMutation.isPending || updateMutation.isPending}
        isEditing={!!editingBill}
        deleteConfirmOpen={deleteDialogOpen}
        setDeleteConfirmOpen={setDeleteDialogOpen}
        onDeleteConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      <BillLedger
        bills={bills}
        formatCurrency={formatCurrency}
        onSettle={handleSettle}
        onEdit={(b) => {
          setEditingBill(b);
          setForm({
            billType: b.billType ?? "",
            amount: b.amount?.toString() ?? "",
            billMonth: b.billMonth ?? "",
            paidDate: b.paidDate ?? "",
            note: b.note ?? "",
          });
          setOpen(true);
        }}
        onDelete={handleDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalElements={totalElements}
        totalPages={totalPages}
      />
    </div>
  );
}
