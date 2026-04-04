"use client";

import { StatCard } from "@/components/shared/StatCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useMyEarnings } from "@/api/generated/endpoints/reports-analytics/reports-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Scissors,
  Calendar,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState, useMemo } from "react";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  const { data: res, isLoading } = useMyEarnings({ date: selectedDate });
  const earnings = res?.data;

  const isToday = selectedDate === todayStr;
  const displayDate = isToday ? "Today" : new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-bold gradient-text">
          {earnings?.employeeName ?? user?.username}
        </h1>
      </div>

      {/* Date Picker Section */}
      <div className="flex items-center justify-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
        <Calendar className="w-5 h-5 text-emerald-500" />
        <span className="text-sm font-medium">Viewing for:</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-sm font-bold cursor-pointer"
        />
      </div>

      {/* Hero earnings card */}
      <div className="glass-card stat-glow overflow-hidden">
        <CardContent className="p-6 text-center relative">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5" />
          <div className="relative">
            <p className="text-sm text-muted-foreground mb-1">
              {displayDate}&apos;s Earnings
            </p>
            <p className="text-4xl font-bold gradient-text">
              {formatCurrency(earnings?.todayEarnings)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <Scissors className="w-3.5 h-3.5 inline mr-1" />
              {earnings?.todayServices ?? 0} services completed
            </p>
          </div>
        </CardContent>
      </div>

      {/* Quick New Sale */}
      <Link href="/employee/new-sale">
        <Button className="w-full h-14 mb-5 text-base gap-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
          <PlusCircle className="w-5 h-5" />
          Record New Sale
        </Button>
      </Link>

      {/* Earnings Grid */}
      <div className="grid grid-cols-1 gap-3">
        <StatCard
          title="This Week"
          value={formatCurrency(earnings?.weekEarnings)}
          subtitle={`${earnings?.weekServices ?? 0} services`}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(earnings?.monthEarnings)}
          subtitle={`${earnings?.monthServices ?? 0} services`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="This Year"
          value={formatCurrency(earnings?.yearEarnings)}
          subtitle={`${earnings?.yearServices ?? 0} services`}
          icon={DollarSign}
          variant="warning"
        />
        <StatCard
          title="Today"
          value={`${earnings?.todayServices ?? 0}`}
          subtitle="services done"
          icon={Scissors}
          variant="default"
        />
      </div>
    </div>
  );
}
