import React from "react";
import { StatCard } from "@/components/shared/StatCard";
import { TrendingDown, DollarSign, ReceiptText, Activity } from "lucide-react";

interface ExpenseStatsProps {
  kpis: {
    totalExpenses: number;
    netProfit: number;
    totalBills: number;
    transactions: number;
  };
  kpiPeriod: string;
  filteredCount: number;
  formatCurrency: (val?: number) => string;
}

export function ExpenseStats({ kpis, kpiPeriod, filteredCount, formatCurrency }: ExpenseStatsProps) {
  return (
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
        value={`${filteredCount} Records`}
        icon={Activity}
        variant="primary"
        subtitle="Transaction volume"
      />
    </div>
  );
}
