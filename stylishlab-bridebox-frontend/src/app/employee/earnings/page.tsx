"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/shared/StatCard";
import { useGetByEmployee } from "@/api/generated/endpoints/sales-transactions/sales-transactions";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Scissors,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
} from "lucide-react";
import { SaleResponse } from "@/api/generated/model";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from "date-fns";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function EarningsPage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId;
  const { data: res, isLoading } = useGetByEmployee(employeeId!, {
    query: { enabled: !!employeeId },
  });

  const [period, setPeriod] = useState<
    "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  >("ALL");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredSales = useMemo(() => {
    const sales = (res?.data ?? []) as SaleResponse[];
    if (period === "ALL") return sales;

    let start: Date, end: Date;
    switch (period) {
      case "DAILY":
        start = startOfDay(selectedDate);
        end = endOfDay(selectedDate);
        break;
      case "WEEKLY":
        start = startOfWeek(selectedDate);
        end = endOfWeek(selectedDate);
        break;
      case "MONTHLY":
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
        break;
      case "YEARLY":
        start = startOfYear(selectedDate);
        end = endOfYear(selectedDate);
        break;
      default:
        return sales;
    }

    return sales.filter((s) => {
      const date = new Date(s.createdAt!);
      return isWithinInterval(date, { start, end });
    });
  }, [res?.data, period, selectedDate]);

  const stats = useMemo(() => {
    const totalEarnings = filteredSales.reduce(
      (acc, s) => acc + (s.servicePriceSnapshot ?? 0),
      0,
    );
    const totalCommission = filteredSales.reduce(
      (acc, s) => acc + (s.employeeAmount ?? 0),
      0,
    );
    const serviceCount = filteredSales.length;
    return { totalEarnings, totalCommission, serviceCount };
  }, [filteredSales]);

  const handlePrev = () => {
    switch (period) {
      case "DAILY":
        setSelectedDate(addDays(selectedDate, -1));
        break;
      case "WEEKLY":
        setSelectedDate(addWeeks(selectedDate, -1));
        break;
      case "MONTHLY":
        setSelectedDate(addMonths(selectedDate, -1));
        break;
      case "YEARLY":
        setSelectedDate(addYears(selectedDate, -1));
        break;
    }
  };

  const handleNext = () => {
    switch (period) {
      case "DAILY":
        setSelectedDate(addDays(selectedDate, 1));
        break;
      case "WEEKLY":
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case "MONTHLY":
        setSelectedDate(addMonths(selectedDate, 1));
        break;
      case "YEARLY":
        setSelectedDate(addYears(selectedDate, 1));
        break;
    }
  };

  const currentPeriodLabel = useMemo(() => {
    switch (period) {
      case "DAILY":
        return format(selectedDate, "MMMM do, yyyy");
      case "WEEKLY":
        return `Week of ${format(startOfWeek(selectedDate), "MMM do")}`;
      case "MONTHLY":
        return format(selectedDate, "MMMM yyyy");
      case "YEARLY":
        return format(selectedDate, "yyyy");
      default:
        return "All Time History";
    }
  }, [period, selectedDate]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Earnings"
        description="Your complete performance breakdown"
      />

      {/* Period Switcher */}
      <div className="flex flex-col gap-4">
        <div className="flex bg-muted/50 p-1 rounded-xl w-fit self-center sm:self-start">
          {[
            { id: "ALL", label: "All" },
            { id: "DAILY", label: "Day" },
            { id: "WEEKLY", label: "Week" },
            { id: "MONTHLY", label: "Month" },
            { id: "YEARLY", label: "Year" },
          ].map((p) => (
            <Button
              key={p.id}
              variant={period === p.id ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "px-4 rounded-lg text-xs transition-all",
                period === p.id &&
                  "shadow-sm bg-background pointer-events-none",
              )}
              onClick={() => setPeriod(p.id as any)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {period !== "ALL" && (
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-background border border-muted/20 rounded-full shadow-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium min-w-[140px] text-center">
                  {currentPeriodLabel}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-muted-foreground hover:text-primary"
              onClick={() => setSelectedDate(new Date())}
            >
              Reset to Today
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          subtitle="Gross service value"
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Your Commission"
          value={formatCurrency(stats.totalCommission)}
          subtitle="Final take-home amount"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Services"
          value={stats.serviceCount.toString()}
          subtitle={`Completed in ${period.toLowerCase()}`}
          icon={Scissors}
          variant="warning"
        />
      </div>

      {/* Sale History Table */}
      <Card className="glass-card shadow-sm border-muted/20 overflow-hidden mt-6">
        <div className="p-4 border-b border-muted/20 flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Detailed Sale History</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            {filteredSales.length} records
          </span>
        </div>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block max-h-[440px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow className="hover:bg-transparent bg-muted/5">
                  <TableHead className="w-12 pl-6"></TableHead>
                  <TableHead className="px-4">Customer</TableHead>
                  <TableHead className="px-4">Service</TableHead>
                  <TableHead className="px-4">Value</TableHead>
                  <TableHead className="px-4">Commission</TableHead>
                  <TableHead className="text-right pr-6">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales
                  .slice()
                  .reverse()
                  .map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-muted/5 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          <User className="w-4 h-4" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium px-4">
                        {s.customerName}
                      </TableCell>
                      <TableCell className="text-sm px-4">
                        {s.serviceNameSnapshot}
                      </TableCell>
                      <TableCell className="font-semibold px-4 text-gray-700">
                        {formatCurrency(s.servicePriceSnapshot)}
                      </TableCell>
                      <TableCell className="px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          {formatCurrency(s.employeeAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground pr-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>
                            {format(new Date(s.createdAt!), "MMM d, yyyy")}
                          </span>
                          <span className="opacity-70 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />{" "}
                            {format(new Date(s.createdAt!), "h:mm a")}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-muted/10 max-h-[380px] overflow-y-auto scrollbar-hide">
            {filteredSales
              .slice()
              .reverse()
              .map((s) => (
                <div key={s.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {s.customerName}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />{" "}
                          {format(new Date(s.createdAt!), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        +{formatCurrency(s.employeeAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Service
                      </p>
                      <p className="text-xs font-medium">
                        {s.serviceNameSnapshot}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Value</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(s.servicePriceSnapshot)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {filteredSales.length === 0 && (
            <div className="py-20 text-center text-muted-foreground border-t border-muted/10">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No records found for this period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
