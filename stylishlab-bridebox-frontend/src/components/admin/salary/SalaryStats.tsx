"use client";

import { StatCard } from "@/components/shared/StatCard";
import { TrendingUp, Check, CreditCard, AlertCircle } from "lucide-react";
import { AdminPayrollStatsResponse } from "@/api/generated/model";

interface SalaryStatsProps {
  stats: AdminPayrollStatsResponse;
}

const formatCurrency = (val?: number) => {
  return `Rs. ${(val ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function SalaryStats({ stats }: SalaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Pending"
        value={formatCurrency(stats.totalPendingSalary)}
        icon={TrendingUp}
        variant="primary"
        subtitle="Awaiting settlement"
      />
      <StatCard
        title="Total Paid (Month)"
        value={formatCurrency(stats.totalPaidThisMonth)}
        icon={Check}
        variant="success"
        subtitle="Distributed this month"
      />
      <StatCard
        title="Total Advances"
        value={formatCurrency(stats.totalAdvancesGiven)}
        icon={CreditCard}
        variant="warning"
        subtitle="Temporary payouts"
      />
      <StatCard
        title="Pending Payments"
        value={`${stats.employeesPendingPaymentCount ?? 0} Employees`}
        icon={AlertCircle}
        variant="primary"
        subtitle="Requiring action"
      />
    </div>
  );
}
