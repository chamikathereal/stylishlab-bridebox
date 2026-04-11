"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetStats,
  useGetAllTrackers,
  useGetAllHistory,
  useGetAllAdvances,
  useSettleSalary,
  useProcessAdvance,
} from "@/api/generated/endpoints/admin-payroll-management/admin-payroll-management";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  AdminPayrollStatsResponse,
  SalaryTrackerResponse,
  PayrollResponse,
  AdvanceRequestResponse,
  GetAllAdvancesStatus,
} from "@/api/generated/model";

// Modular Components
import { SalaryStats } from "@/components/admin/salary/SalaryStats";
import { SalaryFilters } from "@/components/admin/salary/SalaryFilters";
import { SalarySummaryBar } from "@/components/admin/salary/SalarySummaryBar";
import { LiveSalariesTable } from "@/components/admin/salary/LiveSalariesTable";
import { AdvanceRequestsTable } from "@/components/admin/salary/AdvanceRequestsTable";
import { PayrollHistoryTable } from "@/components/admin/salary/PayrollHistoryTable";
import { SettleSalaryDialog } from "@/components/admin/salary/SettleSalaryDialog";
import { ProcessAdvanceDialog } from "@/components/admin/salary/ProcessAdvanceDialog";

export default function AdminSalaryPage() {
  const [tab, setTab] = useState<"LIVE" | "HISTORY" | "ADVANCES" | string>("LIVE");
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");

  // Pagination states
  const [livePage, setLivePage] = useState(1);
  const [liveSize, setLiveSize] = useState(10);
  const [advPage, setAdvPage] = useState(1);
  const [advSize, setAdvSize] = useState(10);
  const [histPage, setHistPage] = useState(1);
  const [histSize, setHistSize] = useState(10);

  // Filter states
  const [advStatus, setAdvStatus] = useState<string>("ALL");
  const [advFromDate, setAdvFromDate] = useState("");
  const [advToDate, setAdvToDate] = useState("");
  const [histFromDate, setHistFromDate] = useState("");
  const [histToDate, setHistToDate] = useState("");

  // Dialog & Selection states
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<SalaryTrackerResponse | null>(null);
  const [settleNote, setSettleNote] = useState("");

  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<AdvanceRequestResponse | null>(null);
  const [approveAmount, setApproveAmount] = useState("");

  const queryClient = useQueryClient();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
      setLivePage(1);
      setAdvPage(1);
      setHistPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [filter]);

  // API Queries
  const { data: statsRes, isLoading: statsLoading } = useGetStats();

  const { data: trackersRes, isLoading: trackersLoading } = useGetAllTrackers(
    {
      search: debouncedFilter || undefined,
      page: livePage - 1,
      size: liveSize,
      sort: ["employee.fullName,asc"],
    },
    { query: { placeholderData: keepPreviousData } }
  );

  const { data: advancesRes, isLoading: advancesLoading } = useGetAllAdvances(
    {
      search: debouncedFilter || undefined,
      page: advPage - 1,
      size: advSize,
      sort: ["requestedAt,desc"],
      status: advStatus !== "ALL" ? (advStatus as GetAllAdvancesStatus) : undefined,
      fromDate: advFromDate || undefined,
      toDate: advToDate || undefined,
    },
    { query: { placeholderData: keepPreviousData } }
  );

  const { data: historyRes, isLoading: historyLoading } = useGetAllHistory(
    {
      search: debouncedFilter || undefined,
      page: histPage - 1,
      size: histSize,
      sort: ["settledAt,desc"],
      fromDate: histFromDate || undefined,
      toDate: histToDate || undefined,
    },
    { query: { placeholderData: keepPreviousData } }
  );

  // Mutations
  const settleMutation = useSettleSalary();
  const processMutation = useProcessAdvance();

  const handleSettleSubmit = () => {
    if (!selectedTracker?.employeeId) return;
    settleMutation.mutate(
      { data: { employeeId: selectedTracker.employeeId, note: settleNote } },
      {
        onSuccess: () => {
          toast.success("Salary settled successfully!");
          queryClient.invalidateQueries();
          setSettleOpen(false);
          setSettleNote("");
        },
        onError: () => toast.error("Failed to settle salary"),
      }
    );
  };

  const handleProcessAdvance = (status: "APPROVED" | "REJECTED") => {
    if (!selectedAdvance?.id) return;
    processMutation.mutate(
      {
        id: selectedAdvance.id,
        data: {
          status,
          approvedAmount: status === "APPROVED" ? parseFloat(approveAmount) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Advance request ${status.toLowerCase()}!`);
          queryClient.invalidateQueries();
          setAdvanceOpen(false);
          setApproveAmount("");
        },
        onError: (err: any) => {
          const errorMsg = err?.response?.data?.error || `Failed to ${status.toLowerCase()} advance`;
          toast.error(errorMsg);
        },
      }
    );
  };

  // Helper logic
  const clearAdvFilters = () => { setAdvStatus("ALL"); setAdvFromDate(""); setAdvToDate(""); setAdvPage(1); };
  const clearHistFilters = () => { setHistFromDate(""); setHistToDate(""); setHistPage(1); };
  const hasAdvFilters = !!(advStatus !== "ALL" || advFromDate || advToDate);
  const hasHistFilters = !!(histFromDate || histToDate);
  const hasGlobalFilters = !!(hasAdvFilters || hasHistFilters || debouncedFilter.length > 0);

  const stats = (statsRes?.data ?? {}) as AdminPayrollStatsResponse;
  const trackers = (trackersRes?.data?.content ?? []) as SalaryTrackerResponse[];
  const trackersTotal = trackersRes?.data?.totalElements ?? 0;
  const history = (historyRes?.data?.content ?? []) as PayrollResponse[];
  const historyTotal = historyRes?.data?.totalElements ?? 0;
  const advances = (advancesRes?.data?.content ?? []) as AdvanceRequestResponse[];
  const advancesTotal = advancesRes?.data?.totalElements ?? 0;

  if (statsLoading || trackersLoading || historyLoading || advancesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        description="Monitor staff earnings, process advances and settle monthly salaries."
      />

      <SalaryStats stats={stats} />

      <div className="flex gap-2 p-1.5 bg-muted/40 backdrop-blur-sm rounded-2xl w-fit border border-muted/20">
        {[
          { id: "LIVE", label: "Live Salaries", icon: null },
          { id: "ADVANCES", label: "Advance Requests", count: stats.pendingAdvanceRequestsCount },
          { id: "HISTORY", label: "Settlement History", icon: null },
        ].map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTab(t.id)}
            className="rounded-xl px-4 font-bold text-xs uppercase tracking-wider transition-all"
          >
            {t.label}
            {t.count && t.count > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-black animate-pulse">
                {t.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      <SalaryFilters
        tab={tab}
        filter={filter}
        setFilter={setFilter}
        advStatus={advStatus}
        setAdvStatus={setAdvStatus}
        advFromDate={advFromDate}
        setAdvFromDate={setAdvFromDate}
        advToDate={advToDate}
        setAdvToDate={setAdvToDate}
        clearAdvFilters={clearAdvFilters}
        hasAdvFilters={hasAdvFilters}
        histFromDate={histFromDate}
        setHistFromDate={setHistFromDate}
        histToDate={histToDate}
        setHistToDate={setHistToDate}
        clearHistFilters={clearHistFilters}
        hasHistFilters={hasHistFilters}
      />

      <SalarySummaryBar
        tab={tab}
        trackers={trackers}
        trackersTotal={trackersTotal}
        advances={advances}
        advancesTotal={advancesTotal}
        history={history}
        historyTotal={historyTotal}
        hasFilters={hasGlobalFilters}
      />

      <Card className="glass-card overflow-hidden border-muted/20 rounded-2xl shadow-xl">
        <CardContent className="p-0">
          {tab === "LIVE" && (
            <LiveSalariesTable
              trackers={trackers}
              trackersTotal={trackersTotal}
              page={livePage}
              setPage={setLivePage}
              size={liveSize}
              setSize={setLiveSize}
              onSettle={(t) => { setSelectedTracker(t); setSettleOpen(true); }}
            />
          )}
          {tab === "ADVANCES" && (
            <AdvanceRequestsTable
              advances={advances}
              advancesTotal={advancesTotal}
              page={advPage}
              setPage={setAdvPage}
              size={advSize}
              setSize={setAdvSize}
              onProcess={(a) => { setSelectedAdvance(a); setApproveAmount(a.requestedAmount?.toString() || ""); setAdvanceOpen(true); }}
            />
          )}
          {tab === "HISTORY" && (
            <PayrollHistoryTable
              history={history}
              historyTotal={historyTotal}
              page={histPage}
              setPage={setHistPage}
              size={histSize}
              setSize={setHistSize}
            />
          )}
        </CardContent>
      </Card>

      <SettleSalaryDialog
        open={settleOpen}
        onOpenChange={setSettleOpen}
        selectedTracker={selectedTracker}
        settleNote={settleNote}
        setSettleNote={setSettleNote}
        onConfirm={handleSettleSubmit}
        isPending={settleMutation.isPending}
      />

      <ProcessAdvanceDialog
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
        selectedAdvance={selectedAdvance}
        approveAmount={approveAmount}
        setApproveAmount={setApproveAmount}
        onProcess={handleProcessAdvance}
        isPending={processMutation.isPending}
      />
    </div>
  );
}
