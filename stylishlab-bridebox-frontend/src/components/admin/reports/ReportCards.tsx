import React from "react";
import { PeriodReportResponse } from "@/api/generated/model";
import { StatCard } from "@/components/shared/StatCard";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  CreditCard,
  BarChart3,
  Users,
  Receipt,
  FileText,
} from "lucide-react";

interface ReportCardsProps {
  report?: PeriodReportResponse;
  formatCurrency: (val?: number) => string;
}

export function ReportCards({ report, formatCurrency }: ReportCardsProps) {
  if (!report) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Sales"
        value={formatCurrency(report.totalSales)}
        subtitle={`${report.totalTransactions ?? 0} transactions`}
        icon={DollarSign}
        variant="primary"
      />
      <StatCard
        title="Cash On Hand"
        value={formatCurrency(report.realizedProfit)}
        subtitle="Received - (Paid Salaries + Expenses + Bills)"
        icon={Wallet}
        variant={
          report.realizedProfit && report.realizedProfit > 0
            ? "success"
            : "danger"
        }
      />
      <StatCard
        title="Estimated Profit"
        value={formatCurrency(report.netProfit)}
        subtitle="Expected business outcome"
        icon={TrendingUp}
        variant={
          report.netProfit && report.netProfit > 0 ? "primary" : "danger"
        }
      />
      <StatCard
        title="Employee Commissions"
        value={formatCurrency(report.employeeCommissions)}
        subtitle="Total commissions earned (Debt)"
        icon={Users}
        variant="default"
      />
      <StatCard
        title="Owner's Earnings"
        value={formatCurrency(report.ownerRevenue)}
        icon={BarChart3}
        variant="success"
      />

      <StatCard
        title="Salaries Settled"
        value={formatCurrency(report.totalSalariesPaid)}
        subtitle="Actual money paid to employees"
        icon={Wallet}
        variant="success"
      />
      <StatCard
        title="Customer Credits"
        value={formatCurrency(report.creditSales)}
        subtitle="Outstanding customer debt"
        icon={CreditCard}
        variant="warning"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(report.totalExpenses)}
        icon={Receipt}
        variant="danger"
      />
      <StatCard
        title="Monthly Bills"
        value={formatCurrency(report.totalBills)}
        icon={FileText}
        variant="warning"
      />
    </div>
  );
}
