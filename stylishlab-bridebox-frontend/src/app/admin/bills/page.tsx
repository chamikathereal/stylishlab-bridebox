"use client";

import React, { useState } from "react";
import { usePeriodFilter } from "@/hooks/usePeriodFilter";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll6,
  useCreate5,
  useSettle,
} from "@/api/generated/endpoints/monthly-bills/monthly-bills";
import { useGetAllActive } from "@/api/generated/endpoints/bill-categories/bill-categories";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BillResponse } from "@/api/generated/model";

// Sub-components
import { BillStats } from "@/components/admin/bills/BillStats";
import { BillFilters } from "@/components/admin/bills/BillFilters";
import { BillLedger } from "@/components/admin/bills/BillLedger";
import { BillModals } from "@/components/admin/bills/BillModals";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function BillsPage() {
  const { data: res, isLoading } = useGetAll6();
  const { data: catRes } = useGetAllActive();
  const createMutation = useCreate5();
  const settleMutation = useSettle();
  const queryClient = useQueryClient();
  const bills = React.useMemo(
    () => (res?.data ?? []) as BillResponse[],
    [res?.data],
  );
  const categories = React.useMemo(
    () => (catRes?.data ?? []) as any[],
    [catRes?.data],
  );

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    billType: "",
    amount: "",
    billMonth: "",
    paidDate: "",
    note: "",
  });

  const {
    kpiPeriod,
    setKpiPeriod,
    selectedDate,
    setSelectedDate,
    isDateInSelectedPeriod,
    reset: resetFilters,
  } = usePeriodFilter();

  const filteredBills = React.useMemo(() => {
    return bills.filter((b) => isDateInSelectedPeriod(b.billMonth));
  }, [bills, isDateInSelectedPeriod]);

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

      <BillStats
        kpis={kpis}
        kpiPeriod={kpiPeriod}
        formatCurrency={formatCurrency}
      />

      <BillFilters
        kpiPeriod={kpiPeriod}
        setKpiPeriod={setKpiPeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        resetFilters={resetFilters}
      />

      <BillModals
        open={open}
        onOpenChange={setOpen}
        form={form}
        setForm={setForm}
        categories={categories}
        onCreate={handleCreate}
        isCreating={createMutation.isPending}
      />

      <BillLedger
        bills={filteredBills}
        formatCurrency={formatCurrency}
        onSettle={handleSettle}
      />
    </div>
  );
}
