import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodReportResponse } from "@/api/generated/model";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ReportChartProps {
  report?: PeriodReportResponse;
  title?: string;
  formatCurrency: (val?: number) => string;
}

export function ReportChart({
  report,
  title = "Financial Breakdown",
  formatCurrency,
}: ReportChartProps) {
  if (!report) return null;

  const chartData = [
    {
      name: "Total Sales",
      value: Number(report.totalSales ?? 0),
      fill: "#34d399",
    },
    {
      name: "Cash On Hand",
      value: Number((report as any).realizedProfit ?? 0),
      fill: "#10b981",
    },
    {
      name: "Owner Earnings",
      value: Number(report.ownerRevenue ?? 0),
      fill: "#60a5fa",
    },
    {
      name: "Commissions",
      value: Number(report.employeeCommissions ?? 0),
      fill: "#fbbf24",
    },
    {
      name: "Salaries Paid",
      value: Number((report as any).totalSalariesPaid ?? 0),
      fill: "#10b981",
    },
    {
      name: "Expenses",
      value: Number(report.totalExpenses ?? 0),
      fill: "#f87171",
    },
    { name: "Bills", value: Number(report.totalBills ?? 0), fill: "#a78bfa" },
    {
      name: "Cash Profit",
      value: Number((report as any).realizedProfit ?? 0),
      fill: "#34d399",
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "8px 12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{
                color: "var(--foreground)",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
              itemStyle={{
                color: "var(--foreground)",
                fontSize: "12px",
              }}
              cursor={{ fill: "var(--muted)", opacity: 0.1 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [formatCurrency(Number(v))]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
