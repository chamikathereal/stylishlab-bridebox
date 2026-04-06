"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/shared/StatCard";
import {
  useDaily,
  useWeekly,
  useMonthly,
  useYearly,
  useTotal,
} from "@/api/generated/endpoints/reports-analytics/reports-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  Receipt,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";
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
import { PeriodReportResponse } from "@/api/generated/model";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

function ReportCards({ report }: { report?: PeriodReportResponse }) {
  if (!report) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Sales"
        value={formatCurrency(report.totalSales)}
        subtitle={`${report.totalTransactions ?? 0} transactions`}
        icon={DollarSign}
        variant="primary"
      />
      <StatCard
        title="Cash Received"
        value={formatCurrency(report.cashReceived)}
        icon={Wallet}
        variant="success"
      />
      <StatCard
        title="Net Profit"
        value={formatCurrency(report.netProfit)}
        icon={TrendingUp}
        variant={
          report.netProfit && report.netProfit > 0 ? "primary" : "danger"
        }
      />
      <StatCard
        title="Credit Sales"
        value={formatCurrency(report.creditSales)}
        icon={CreditCard}
        variant="warning"
      />
      <StatCard
        title="Owner Revenue"
        value={formatCurrency(report.ownerRevenue)}
        icon={BarChart3}
        variant="success"
      />
      <StatCard
        title="Employee Commissions"
        value={formatCurrency(report.employeeCommissions)}
        icon={Users}
        variant="default"
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

function ReportChart({
  report,
  title = "Financial Breakdown",
}: {
  report?: PeriodReportResponse;
  title?: string;
}) {
  if (!report) return null;

  const chartData = [
    {
      name: "Sales",
      value: Number(report.totalSales ?? 0),
      fill: "#34d399",
    },
    {
      name: "Owner Rev",
      value: Number(report.ownerRevenue ?? 0),
      fill: "#60a5fa",
    },
    {
      name: "Commissions",
      value: Number(report.employeeCommissions ?? 0),
      fill: "#fbbf24",
    },
    {
      name: "Expenses",
      value: Number(report.totalExpenses ?? 0),
      fill: "#f87171",
    },
    {
      name: "Bills",
      value: Number(report.totalBills ?? 0),
      fill: "#a78bfa",
    },
    {
      name: "Profit",
      value: Number(report.netProfit ?? 0),
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
                borderRadius: "8px",
              }}
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

export default function ReportsPage() {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");
  const [dailyDate, setDailyDate] = useState(todayStr);
  const [weeklyDate, setWeeklyDate] = useState(todayStr);
  const [monthlyYM, setMonthlyYM] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  );
  const [yearlyYear, setYearlyYear] = useState(today.getFullYear());

  const { data: dailyRes, isLoading: dailyLoading } = useDaily({
    date: dailyDate,
  });
  const { data: weeklyRes, isLoading: weeklyLoading } = useWeekly({
    date: weeklyDate,
  });
  const { data: monthlyRes, isLoading: monthlyLoading } = useMonthly({
    yearMonth: monthlyYM,
  });
  const { data: yearlyRes, isLoading: yearlyLoading } = useYearly({
    year: yearlyYear,
  });
  const { data: totalRes, isLoading: totalLoading } = useTotal();

  const yearlyReport = yearlyRes?.data as PeriodReportResponse | undefined;
  const totalReport = totalRes?.data as PeriodReportResponse | undefined;
  const dailyReport = dailyRes?.data as PeriodReportResponse | undefined;
  const weeklyReport = weeklyRes?.data as PeriodReportResponse | undefined;
  const monthlyReport = monthlyRes?.data as PeriodReportResponse | undefined;

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Business insights and financial summaries"
      />

      <Tabs defaultValue="total" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="total">All Time</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="total">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-muted-foreground">
              All-Time Business Summary
            </h3>
          </div>
          {totalLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ReportCards report={totalReport} />
              <ReportChart
                report={totalReport}
                title="All-Time Financial Breakdown"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="daily">
          <div className="mb-4">
            <Input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="w-48"
            />
          </div>
          {dailyLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ReportCards report={dailyReport} />
              <ReportChart
                report={dailyReport}
                title="Daily Financial Breakdown"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          <div className="mb-4">
            <Input
              type="date"
              value={weeklyDate}
              onChange={(e) => setWeeklyDate(e.target.value)}
              className="w-48"
            />
          </div>
          {weeklyLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ReportCards report={weeklyReport} />
              <ReportChart
                report={weeklyReport}
                title="Weekly Financial Breakdown"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="monthly">
          <div className="mb-4">
            <Input
              type="month"
              value={monthlyYM}
              onChange={(e) => setMonthlyYM(e.target.value)}
              className="w-48"
            />
          </div>
          {monthlyLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ReportCards report={monthlyReport} />
              <ReportChart
                report={monthlyReport}
                title="Monthly Financial Breakdown"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="yearly">
          <div className="mb-4">
            <Select
              value={yearlyYear.toString()}
              onValueChange={(val: string | null) => val && setYearlyYear(parseInt(val))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: 5 },
                  (_, i) => today.getFullYear() - i,
                ).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {yearlyLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ReportCards report={yearlyReport} />
              <ReportChart
                report={yearlyReport}
                title="Yearly Financial Breakdown"
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
