import React from "react";
import { StatCard } from "@/components/shared/StatCard";
import { Wallet, CheckCircle, TrendingDown, AlertCircle } from "lucide-react";

interface BillStatsProps {
  kpis: {
    total: number;
    paid: number;
    outstanding: number;
    pendingCount: number;
  };
  kpiPeriod: string;
  formatCurrency: (val?: number) => string;
}

export function BillStats({ kpis, kpiPeriod, formatCurrency }: BillStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Bill Amount"
        value={formatCurrency(kpis.total)}
        icon={Wallet}
        variant="primary"
        subtitle={`Obligations for ${kpiPeriod}`}
      />
      <StatCard
        title="Paid Amount"
        value={formatCurrency(kpis.paid)}
        icon={CheckCircle}
        variant="success"
        subtitle="Total settled so far"
      />
      <StatCard
        title="Outstanding"
        value={formatCurrency(kpis.outstanding)}
        icon={TrendingDown}
        variant="warning"
        subtitle="Amount yet to be paid"
      />
      <StatCard
        title="Pending Bills"
        value={`${kpis.pendingCount} Bills`}
        icon={AlertCircle}
        variant={kpis.pendingCount > 0 ? "danger" : "primary"}
        subtitle="Action required"
      />
    </div>
  );
}
