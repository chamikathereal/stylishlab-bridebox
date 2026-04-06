'use client';

import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useDaily, useWeekly, useMonthly, useYearly, useTotal } from '@/api/generated/endpoints/reports-analytics/reports-analytics';
import { useGetAll1 } from '@/api/generated/endpoints/sales-transactions/sales-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, CreditCard, Wallet, ShoppingCart, Users, Scissors, BarChart3, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const CHART_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#f97316', '#06b6d4', '#ec4899', '#84cc16', '#6366f1'
];

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function AdminDashboard() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');

  // Filter state
  const [period, setPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Data fetching
  const { data: dailyRes, isLoading: dailyLoading } = useDaily({ date: selectedDate });
  const { data: weeklyRes, isLoading: weeklyLoading } = useWeekly({ date: selectedDate });
  const { data: monthlyRes, isLoading: monthlyLoading } = useMonthly({ yearMonth: selectedMonth });
  const { data: yearlyRes, isLoading: yearlyLoading } = useYearly({ year: selectedYear });
  const { data: totalRes, isLoading: totalLoading } = useTotal();
  const { data: salesRes, isLoading: salesLoading } = useGetAll1();

  const report = useMemo(() => {
    switch (period) {
      case 'all': return totalRes?.data;
      case 'daily': return dailyRes?.data;
      case 'weekly': return weeklyRes?.data;
      case 'monthly': return monthlyRes?.data;
      case 'yearly': return yearlyRes?.data;
      default: return dailyRes?.data;
    }
  }, [period, totalRes, dailyRes, weeklyRes, monthlyRes, yearlyRes]);

  const isLoading = dailyLoading || weeklyLoading || monthlyLoading || yearlyLoading || totalLoading;
  const sales = salesRes?.data ?? [];
  const recentSales = sales.slice(0, 8);

  const serviceMap = new Map<string, number>();
  sales.forEach((s) => {
    const name = s.serviceNameSnapshot ?? 'Unknown';
    serviceMap.set(name, (serviceMap.get(name) ?? 0) + (s.servicePriceSnapshot ?? 0));
  });
  const pieData = Array.from(serviceMap.entries()).map(([name, value]) => ({ name, value }));

  const dateMap = new Map<string, number>();
  sales.forEach((s) => {
    const date = s.createdAt?.split('T')[0] ?? '';
    if (date) dateMap.set(date, (dateMap.get(date) ?? 0) + (s.servicePriceSnapshot ?? 0));
  });
  const barData = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, total]) => ({ date: date.slice(5), total }));

  if (isLoading && !report) return <LoadingSpinner message="Loading statistics..." />;

  return (
    <div>
      <PageHeader title="Overview" description={`Reviewing ${period === 'daily' ? 'performance for ' + selectedDate : period + ' statistics'}`}>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/sales">
            <Button size="sm" variant="outline" className="gap-2 h-9 px-4 rounded-lg"><ShoppingCart className="w-4 h-4" /> Sales</Button>
          </Link>
          <Link href="/admin/reports">
            <Button size="sm" className="gap-2 h-9 px-4 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-sm">
              <BarChart3 className="w-4 h-4" /> Comprehensive Reports
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="mb-8 p-4 glass-card-hover border border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            value={period} 
            onValueChange={(v: string) => setPeriod(v as 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly')} 
            className="w-full md:w-auto"
          >
            <TabsList className="bg-muted/50 p-1 h-11 rounded-xl">
              <TabsTrigger value="all" className="px-5 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">All Time</TabsTrigger>
              <TabsTrigger value="daily" className="px-5 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="px-5 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="px-5 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="px-5 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/30 self-end md:self-auto">
            <Calendar className="w-4 h-4 text-primary animate-pulse" />
            {period === 'daily' || period === 'weekly' ? (
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-36 h-8 bg-transparent border-none text-sm font-bold focus-visible:ring-0 cursor-pointer"
              />
            ) : period === 'monthly' ? (
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-36 h-8 bg-transparent border-none text-sm font-bold focus-visible:ring-0 cursor-pointer"
              />
            ) : period === 'yearly' ? (
              <Select value={selectedYear.toString()} onValueChange={(v) => v && setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-28 h-8 bg-transparent border-none text-sm font-bold focus:ring-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()} className="font-medium">{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm font-bold px-2 py-1">Comprehensive Data</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title={`${period === 'all' ? 'Total' : period.charAt(0).toUpperCase() + period.slice(1)} Sales`} value={formatCurrency(report?.totalSales)} subtitle={`${report?.totalTransactions ?? 0} transactions`} icon={DollarSign} variant="primary" />
        <StatCard title="Cash Received" value={formatCurrency(report?.cashReceived)} icon={Wallet} variant="success" />
        <StatCard title="Credit Sales" value={formatCurrency(report?.creditSales)} icon={CreditCard} variant="warning" />
        <StatCard title="Net Profit" value={formatCurrency(report?.netProfit)} icon={TrendingUp} variant={report?.netProfit && report.netProfit > 0 ? 'primary' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                    tickFormatter={(v) => `Rs.${v}`}
                    width={50}
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Revenue']} 
                  />
                  <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={30} />
                  <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>}
          </CardContent>
        </Card>

        <Card className="glass-card flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Service Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex flex-col justify-center">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-[45%]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} 
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Revenue']} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No service data</div>}
              </div>

              {pieData.length > 0 && (
                <ScrollArea className="w-full lg:flex-1 h-[240px] pr-4">
                  <div className="space-y-1 py-1">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all group cursor-default border border-transparent hover:border-border/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-xs text-muted-foreground font-medium truncate leading-tight group-hover:text-foreground transition-colors">{d.name}</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums shrink-0 bg-muted/30 px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
          <Link href="/admin/sales"><Button variant="ghost" size="sm" className="text-xs">View All →</Button></Link>
        </CardHeader>
        <CardContent>
          {salesLoading ? <LoadingSpinner /> : recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Scissors className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-sm font-medium">{sale.serviceNameSnapshot || "Untitled Service"}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.customerName || "Walk-in"} · {sale.employeeName || "Staff"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(sale.servicePriceSnapshot ?? 0)}</p>
                    <Badge variant={sale.paymentStatus === 'FULLY_PAID' ? 'default' : 'secondary'} className="text-[10px]">
                      {sale.paymentStatus || "PENDING"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground text-sm"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" />No sales recorded yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
