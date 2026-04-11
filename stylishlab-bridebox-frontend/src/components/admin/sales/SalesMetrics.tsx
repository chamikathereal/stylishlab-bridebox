import { StatCard } from "@/components/shared/StatCard";
import { TrendingUp, Wallet, CreditCard, History } from "lucide-react";
import { PeriodReportResponse } from "@/api/generated/model";
import { formatCurrency } from "./utils";
import { type PeriodType } from "@/hooks/usePeriodFilter";

interface SalesMetricsProps {
  kpis: PeriodReportResponse;
  kpiPeriod: PeriodType;
  selectedYear: number;
  selectedMonth: string;
  selectedDate: string;
}

export function SalesMetrics({
  kpis,
  kpiPeriod,
  selectedYear,
  selectedMonth,
  selectedDate,
}: SalesMetricsProps) {
  const getSubTitle = () => {
    switch (kpiPeriod) {
      case "yearly":
        return selectedYear.toString();
      case "total":
        return "All Time";
      case "monthly":
        return selectedMonth;
      default:
        return selectedDate;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(kpis.totalSales)}
        icon={TrendingUp}
        subtitle={getSubTitle()}
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
  );
}
