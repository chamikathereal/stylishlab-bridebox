import { useState } from "react";
import {
  useGetMyTracker,
  useGetMyHistory,
  useGetMyAdvances,
  useSubmitAdvanceRequest,
} from "@/api/generated/endpoints/employee-payroll-operations/employee-payroll-operations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  Search,
  History,
  AlertCircle,
  Banknote,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  SalaryTrackerResponse,
  PayrollResponse,
  AdvanceRequestResponse,
} from "@/api/generated/model";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(d?: string) {
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";
}

interface EmployeeSalaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeSalaryModal({
  open,
  onOpenChange,
}: EmployeeSalaryModalProps) {
  const [tab, setTab] = useState<"HISTORY" | "ADVANCES">("HISTORY");
  const [filter, setFilter] = useState("");

  // Fetch only when modal is open to avoid unnecessary requests on profile load
  const { data: trackerRes, isLoading: trackerLoading } = useGetMyTracker({
    query: { enabled: open },
  });
  const { data: historyRes, isLoading: historyLoading } = useGetMyHistory({
    query: { enabled: open },
  });
  const { data: advancesRes, isLoading: advancesLoading } = useGetMyAdvances({
    query: { enabled: open },
  });

  const submitAdvanceMutation = useSubmitAdvanceRequest();
  const queryClient = useQueryClient();

  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");

  const tracker = trackerRes?.data as SalaryTrackerResponse | undefined;
  const history = (historyRes?.data ?? []) as PayrollResponse[];
  const advances = (advancesRes?.data ?? []) as AdvanceRequestResponse[];

  const isLoading = trackerLoading || historyLoading || advancesLoading;

  const handleRequestAdvance = () => {
    if (
      !advanceAmount ||
      isNaN(parseFloat(advanceAmount)) ||
      parseFloat(advanceAmount) <= 0
    ) {
      toast.error("Enter a valid amount");
      return;
    }

    submitAdvanceMutation.mutate(
      {
        data: { requestedAmount: parseFloat(advanceAmount), note: advanceNote },
      },
      {
        onSuccess: () => {
          toast.success("Advance request submitted!");
          queryClient.invalidateQueries();
          setAdvanceOpen(false);
          setAdvanceAmount("");
          setAdvanceNote("");
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { error?: string } } };
          toast.error(
            error?.response?.data?.error || "Failed to submit advance request",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 md:p-6 rounded-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Wallet className="w-6 h-6 text-emerald-500" />
            Salary & Advances
          </DialogTitle>
          <DialogDescription>
            Track your earnings, view settlement history, and request advances.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6 min-w-0 w-full overflow-hidden">
            {/* Hero Card */}
            <Card className="glass-card bg-linear-to-br from-emerald-500/10 to-teal-600/5 border-emerald-500/20 shadow-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xs sm:text-sm font-semibold text-emerald-700/80 uppercase tracking-wider">
                          Live Pending Salary
                        </h2>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mr-1">
                          Generated from your sales commissions
                        </p>
                      </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-emerald-600 tracking-tight sm:pl-12 mt-1 wrap-break-word">
                      {formatCurrency(tracker?.netPayable)}
                    </h1>
                  </div>

                  <div className="flex flex-col gap-3 md:min-w-[200px] border-t md:border-t-0 md:border-l border-emerald-500/20 pt-4 md:pt-0 md:pl-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Gross Earned
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(tracker?.currentSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Advances Taken
                      </span>
                      <span className="font-semibold text-amber-600">
                        - {formatCurrency(tracker?.totalAdvances)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-emerald-500/20">
                      <span className="text-muted-foreground">
                        Last Settled:
                      </span>
                      <span className="font-medium">
                        {formatDate(tracker?.lastSettlementDate) || "Never"}
                      </span>
                    </div>
                    <Button
                      className="w-full gap-2 mt-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setAdvanceOpen(true)}
                    >
                      <Banknote className="w-4 h-4" /> Request Advance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit overflow-x-auto max-w-full">
              <Button
                variant={tab === "HISTORY" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTab("HISTORY")}
              >
                Salary History
              </Button>
              <Button
                variant={tab === "ADVANCES" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTab("ADVANCES")}
              >
                Advance Requests
                {advances.filter((a) => a.status === "PENDING").length > 0 && (
                  <span className="ml-2 bg-amber-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {advances.filter((a) => a.status === "PENDING").length}
                  </span>
                )}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-[95%] max-w-xs md:max-w-sm"
              />
            </div>

            <Card className="border shadow-none sm:rounded-xl min-w-0 w-full overflow-hidden bg-background">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto w-full max-h-[400px] overflow-y-auto">
                <Table>
                  {tab === "HISTORY" && (
                    <>
                      <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="whitespace-nowrap">
                            Settled Date
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Gross Earned
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Advances
                          </TableHead>
                          <TableHead className="text-right font-bold text-emerald-600 whitespace-nowrap">
                            Net Paid
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Note
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history
                          .filter(
                            (h) =>
                              formatCurrency(h.netPaid).includes(filter) ||
                              (h.note &&
                                h.note
                                  .toLowerCase()
                                  .includes(filter.toLowerCase())),
                          )
                          .sort(
                            (a, b) =>
                              new Date(b.settledAt!).getTime() -
                              new Date(a.settledAt!).getTime(),
                          )
                          .map((h) => (
                            <TableRow key={h.id} className="hover:bg-muted/5">
                              <TableCell className="text-sm font-medium whitespace-nowrap">
                                {formatDate(h.settledAt)}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {formatCurrency(h.totalEarnings)}
                              </TableCell>
                              <TableCell className="text-right text-destructive whitespace-nowrap">
                                {formatCurrency(h.totalAdvances)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-emerald-600 whitespace-nowrap">
                                {formatCurrency(h.netPaid)}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                                {h.note || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        {history.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-6 text-muted-foreground"
                            >
                              <History className="w-8 h-8 opacity-20 mx-auto mb-2" />
                              No settlement history
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </>
                  )}

                  {tab === "ADVANCES" && (
                    <>
                      <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="whitespace-nowrap">
                            Requested Date
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Requested
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Approved
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Status
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Note
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {advances
                          .filter(
                            (a) =>
                              formatCurrency(a.requestedAmount).includes(
                                filter,
                              ) ||
                              (a.note &&
                                a.note
                                  .toLowerCase()
                                  .includes(filter.toLowerCase())),
                          )
                          .sort(
                            (a, b) =>
                              new Date(b.requestedAt!).getTime() -
                              new Date(a.requestedAt!).getTime(),
                          )
                          .map((a) => (
                            <TableRow key={a.id} className="hover:bg-muted/5">
                              <TableCell className="text-sm font-medium whitespace-nowrap">
                                {formatDate(a.requestedAt)}
                              </TableCell>
                              <TableCell className="text-right font-semibold whitespace-nowrap">
                                {formatCurrency(a.requestedAmount)}
                              </TableCell>
                              <TableCell className="text-right text-emerald-600 whitespace-nowrap">
                                {a.approvedAmount
                                  ? formatCurrency(a.approvedAmount)
                                  : "-"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  variant={
                                    a.status === "APPROVED"
                                      ? "default"
                                      : a.status === "REJECTED"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {a.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                                {a.note || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        {advances.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-6 text-muted-foreground"
                            >
                              No advance requests found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </>
                  )}
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-muted/10 w-full">
                {tab === "HISTORY" &&
                  (history.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground bg-muted/5">
                      <History className="w-8 h-8 opacity-20 mx-auto mb-2" />
                      <p className="text-sm">No settlement history</p>
                    </div>
                  ) : (
                    history
                      .filter(
                        (h) =>
                          formatCurrency(h.netPaid).includes(filter) ||
                          (h.note &&
                            h.note
                              .toLowerCase()
                              .includes(filter.toLowerCase())),
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.settledAt!).getTime() -
                          new Date(a.settledAt!).getTime(),
                      )
                      .map((h) => (
                        <div
                          key={h.id}
                          className="p-4 space-y-3 bg-card hover:bg-muted/5 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                                <Wallet className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  Settled
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatDate(h.settledAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                                +{formatCurrency(h.netPaid)}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2 rounded-lg">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                Gross Earned
                              </p>
                              <p className="text-xs font-semibold">
                                {formatCurrency(h.totalEarnings)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                Advances Taken
                              </p>
                              <p className="text-xs font-semibold text-amber-600">
                                {(h.totalAdvances ?? 0) > 0
                                  ? `-${formatCurrency(h.totalAdvances)}`
                                  : formatCurrency(0)}
                              </p>
                            </div>
                          </div>
                          {h.note && (
                            <div className="text-[11px] text-muted-foreground italic px-1 truncate">
                              Note: {h.note}
                            </div>
                          )}
                        </div>
                      ))
                  ))}

                {tab === "ADVANCES" &&
                  (advances.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground bg-muted/5">
                      <Banknote className="w-8 h-8 opacity-20 mx-auto mb-2" />
                      <p className="text-sm">No advance requests found</p>
                    </div>
                  ) : (
                    advances
                      .filter(
                        (a) =>
                          formatCurrency(a.requestedAmount).includes(filter) ||
                          (a.note &&
                            a.note
                              .toLowerCase()
                              .includes(filter.toLowerCase())),
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.requestedAt!).getTime() -
                          new Date(a.requestedAt!).getTime(),
                      )
                      .map((a) => (
                        <div
                          key={a.id}
                          className="p-4 space-y-3 bg-card hover:bg-muted/5 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold shrink-0">
                                <Banknote className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  Request
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatDate(a.requestedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <Badge
                                variant={
                                  a.status === "APPROVED"
                                    ? "default"
                                    : a.status === "REJECTED"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-[10px] px-1.5 py-0 h-5"
                              >
                                {a.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2 rounded-lg">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                Requested
                              </p>
                              <p className="text-xs font-semibold">
                                {formatCurrency(a.requestedAmount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                Approved
                              </p>
                              <p className="text-xs font-semibold text-emerald-600">
                                {a.approvedAmount
                                  ? formatCurrency(a.approvedAmount)
                                  : "-"}
                              </p>
                            </div>
                          </div>
                          {a.note && (
                            <div className="text-[11px] text-muted-foreground italic px-1 truncate">
                              Note: {a.note}
                            </div>
                          )}
                        </div>
                      ))
                  ))}
              </div>
            </Card>
          </div>
        )}
      </DialogContent>

      {/* Nested Advance Request Modal - Must be outside main DialogContent or z-indexed carefully. 
          Actually, placing it outside the main Dialog causes fewer issues with nested DOM structures in Dialogs. */}
      {advanceOpen && (
        <Dialog open={advanceOpen} onOpenChange={setAdvanceOpen}>
          <DialogContent className="w-[92vw] sm:max-w-md rounded-2xl z-100 overflow-x-hidden p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>Request Advance Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Available Limit</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(tracker?.netPayable)}
                </span>
              </div>
              <div>
                <Label className="mb-2">Amount to Request (Rs.)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="h-10"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <Label className="mb-2">Reason / Note</Label>
                <Input
                  placeholder="e.g. Personal emergency"
                  className="h-10"
                  value={advanceNote}
                  onChange={(e) => setAdvanceNote(e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2 bg-amber-500/10 text-amber-600 p-3 rounded-lg text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Your request must be approved by an administrator before it is
                  processed. You cannot request more than your current available
                  limit.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="h-10"
                variant="outline"
                onClick={() => setAdvanceOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="gap-2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitAdvanceMutation.isPending}
                onClick={handleRequestAdvance}
              >
                <Plus className="w-4 h-4" /> Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
