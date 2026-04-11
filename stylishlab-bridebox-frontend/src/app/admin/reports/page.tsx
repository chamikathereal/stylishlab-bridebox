"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useDaily,
  useWeekly,
  useMonthly,
  useYearly,
  useTotal,
} from "@/api/generated/endpoints/reports-analytics/reports-analytics";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodReportResponse } from "@/api/generated/model";
import { usePeriodFilter, PeriodType } from "@/hooks/usePeriodFilter";
import { useGetHistoryByDateRange } from "@/api/generated/endpoints/admin-payroll-management/admin-payroll-management";

// Sub-components
import { ReportCards } from "@/components/admin/reports/ReportCards";
import { ReportChart } from "@/components/admin/reports/ReportChart";
import { ReportFilters } from "@/components/admin/reports/ReportFilters";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function ReportsPage() {
  const {
    kpiPeriod,
    setKpiPeriod,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    selectedYear,
    getKpiData,
    dateRange,
    reset,
  } = usePeriodFilter({ initialPeriod: "total" });

  const { data: salaryHistoryRes, isLoading: salaryLoading } = useGetHistoryByDateRange(
    dateRange,
  );

  const salaryHistory = useMemo(() => salaryHistoryRes?.data ?? [], [salaryHistoryRes]);

  const { data: dailyRes, isLoading: dailyLoading } = useDaily(
    { date: selectedDate },
    { query: { enabled: kpiPeriod === "daily" } },
  );

  const { data: weeklyRes, isLoading: weeklyLoading } = useWeekly(
    { date: selectedDate },
    { query: { enabled: kpiPeriod === "weekly" } },
  );

  const { data: monthlyRes, isLoading: monthlyLoading } = useMonthly(
    { yearMonth: selectedMonth },
    { query: { enabled: kpiPeriod === "monthly" } },
  );

  const { data: yearlyRes, isLoading: yearlyLoading } = useYearly(
    { year: selectedYear },
    { query: { enabled: kpiPeriod === "yearly" } },
  );

  const { data: totalRes, isLoading: totalLoading } = useTotal({
    query: { enabled: kpiPeriod === "total" },
  });

  const activeReport = useMemo(() => {
    return getKpiData(
      {
        dailyRes,
        weeklyRes,
        monthlyRes,
        yearlyRes,
        totalRes,
      },
      salaryHistory,
    ) as PeriodReportResponse | undefined;
  }, [
    dailyRes,
    weeklyRes,
    monthlyRes,
    yearlyRes,
    totalRes,
    salaryHistory,
    getKpiData,
  ]);

  const isLoading =
    dailyLoading ||
    weeklyLoading ||
    monthlyLoading ||
    yearlyLoading ||
    totalLoading ||
    salaryLoading;

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Business insights and financial summaries"
      />

      <ReportFilters
        kpiPeriod={kpiPeriod}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        reset={reset}
      />

      <Tabs
        value={kpiPeriod}
        onValueChange={(val) => setKpiPeriod(val as PeriodType)}
        className="space-y-6"
      >
        <TabsList className="bg-muted/50">
          <TabsTrigger value="total">All Time</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {isLoading ? (
            <div className="py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <ReportCards report={activeReport} formatCurrency={formatCurrency} />
              <ReportChart
                report={activeReport}
                formatCurrency={formatCurrency}
                title={`${
                  kpiPeriod.charAt(0).toUpperCase() + kpiPeriod.slice(1)
                } Financial Breakdown`}
              />
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}
