'use client';

import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useDaily } from '@/api/generated/endpoints/reports-analytics/reports-analytics';
import { useGetAll1 } from '@/api/generated/endpoints/sales-transactions/sales-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, CreditCard, Wallet, ShoppingCart, Users, Scissors, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CHART_COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString('en-CA');
  const { data: reportRes, isLoading: reportLoading } = useDaily({ date: today });
  const { data: salesRes, isLoading: salesLoading } = useGetAll1();

  const report = reportRes?.data;
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

  if (reportLoading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back! Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}>
        <div className="flex gap-2">
          <Link href="/admin/sales">
            <Button size="sm" variant="outline" className="gap-2"><ShoppingCart className="w-4 h-4" /> Sales</Button>
          </Link>
          <Link href="/admin/reports">
            <Button size="sm" className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500">
              <BarChart3 className="w-4 h-4" /> Reports
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Today's Sales" value={formatCurrency(report?.totalSales)} subtitle={`${report?.totalTransactions ?? 0} transactions`} icon={DollarSign} variant="primary" />
        <StatCard title="Cash Received" value={formatCurrency(report?.cashReceived)} icon={Wallet} variant="success" />
        <StatCard title="Credit Sales" value={formatCurrency(report?.creditSales)} icon={CreditCard} variant="warning" />
        <StatCard title="Net Profit" value={formatCurrency(report?.netProfit)} icon={TrendingUp} variant={report?.netProfit && report.netProfit > 0 ? 'primary' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Sales Trend (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#0d9488" /></linearGradient></defs>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Service Distribution</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No service data yet</div>}
            {pieData.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            )}
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
                    <div><p className="text-sm font-medium">{sale.serviceNameSnapshot}</p><p className="text-xs text-muted-foreground">{sale.customerName} · {sale.employeeName}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(sale.servicePriceSnapshot)}</p>
                    <Badge variant={sale.paymentStatus === 'FULLY_PAID' ? 'default' : 'secondary'} className="text-[10px]">{sale.paymentStatus}</Badge>
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
