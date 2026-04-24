"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";

import {
  useGetAllSales,
  useCreateSale,
  useGetSalesByDateRange,
} from "@/api/generated/endpoints/sales-transactions/sales-transactions";
import { useGetAllCustomers as useGetCustomers } from "@/api/generated/endpoints/customer-management/customer-management";
import { useGetActiveServices as useGetActive } from "@/api/generated/endpoints/service-packages/service-packages";
import { useGetAllEmployees as useGetEmployees } from "@/api/generated/endpoints/employee-management/employee-management";
import {
  useDaily,
  useWeekly,
  useMonthly,
  useYearly,
  useTotal,
} from "@/api/generated/endpoints/reports-analytics/reports-analytics";
import { usePeriodFilter } from "@/hooks/usePeriodFilter";

import {
  CreateSaleRequestPaymentStatus,
  SaleResponse,
  CustomerResponse,
  ServiceResponse,
  EmployeeResponse,
  PeriodReportResponse,
} from "@/api/generated/model";

// Sub-components
import { SalesMetrics } from "@/components/admin/sales/SalesMetrics";
import { SalesToolbar } from "@/components/admin/sales/SalesToolbar";
import { SalesTable } from "@/components/admin/sales/SalesTable";
import { RecordSaleDialog } from "@/components/admin/sales/RecordSaleDialog";
import { SaleDetailsDialog } from "@/components/admin/sales/SaleDetailsDialog";

export default function SalesPage() {
  const { data: custRes } = useGetCustomers();
  const { data: svcRes } = useGetActive();
  const { data: empRes } = useGetEmployees();
  const createMutation = useCreateSale();
  const queryClient = useQueryClient();

  const customers = (custRes?.data ?? []) as CustomerResponse[];
  const services = (svcRes?.data ?? []) as ServiceResponse[];
  const employees = (empRes?.data ?? []) as EmployeeResponse[];

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce filter logic
  useEffect(() => {
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
    reset,
    getKpiData,
    dateRange,
  } = usePeriodFilter({ initialPeriod: "daily" });

  // Analytics Hooks
  const { data: dailyData } = useDaily(
    { date: selectedDate },
    { query: { enabled: kpiPeriod === "daily" } },
  );
  const { data: weeklyData } = useWeekly(
    { date: selectedDate },
    { query: { enabled: kpiPeriod === "weekly" } },
  );
  const { data: monthlyData } = useMonthly(
    { yearMonth: selectedMonth },
    { query: { enabled: kpiPeriod === "monthly" } },
  );
  const { data: yearlyData } = useYearly(
    { year: selectedYear },
    { query: { enabled: kpiPeriod === "yearly" } },
  );
  const { data: totalData } = useTotal({
    query: { enabled: kpiPeriod === "total" },
  });

  const kpis =
    getKpiData({
      dailyRes: dailyData,
      weeklyRes: weeklyData,
      monthlyRes: monthlyData,
      yearlyRes: yearlyData,
      totalRes: totalData,
    }) || ({} as PeriodReportResponse);

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

  const salesAllCount = useGetAllSales(
    {
      page: currentPage - 1,
      size: itemsPerPage,
      search: debouncedFilter,
      sort: "createdAt,desc",
    },
    {
      query: {
        enabled: kpiPeriod === "total",
        placeholderData: keepPreviousData,
      },
    },
  );

  const salesByRange = useGetSalesByDateRange(
    {
      from: dateRange.from,
      to: dateRange.to,
      page: currentPage - 1,
      size: itemsPerPage,
      search: debouncedFilter,
      sort: "createdAt,desc",
    },
    {
      query: {
        enabled: kpiPeriod !== "total",
        placeholderData: keepPreviousData,
      },
    },
  );

  const res = kpiPeriod === "total" ? salesAllCount : salesByRange;
  const isLoading = res.isLoading;

  const salesPageData = res?.data?.data;
  const sales = salesPageData?.content ?? [];
  const totalElements = salesPageData?.totalElements ?? 0;
  const totalPages = salesPageData?.totalPages ?? 0;

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

  return (
    <div className="space-y-6">
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

      <SalesMetrics
        kpis={kpis}
        kpiPeriod={kpiPeriod}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
      />

      <SalesToolbar
        filter={filter}
        setFilter={setFilter}
        kpiPeriod={kpiPeriod}
        setKpiPeriod={setKpiPeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        reset={reset}
        totalElements={totalElements}
        isFetching={res.isFetching}
        setCurrentPage={setCurrentPage}
      />

      <SalesTable
        sales={sales}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalElements={totalElements}
        totalPages={totalPages}
        onViewDetails={(sale) => {
          setSelectedSale(sale);
          setViewDetailsOpen(true);
        }}
        onPrintReceipt={(sale) => {
          setSelectedSale(sale);
          setPrintReceiptOpen(true);
        }}
      />

      <RecordSaleDialog
        open={open}
        onOpenChange={setOpen}
        customers={customers}
        employees={employees}
        services={services}
        form={form}
        setForm={setForm}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      <SaleDetailsDialog
        viewOpen={viewDetailsOpen}
        setViewOpen={setViewDetailsOpen}
        printOpen={printReceiptOpen}
        setPrintOpen={setPrintReceiptOpen}
        sale={selectedSale}
      />
    </div>
  );
}
