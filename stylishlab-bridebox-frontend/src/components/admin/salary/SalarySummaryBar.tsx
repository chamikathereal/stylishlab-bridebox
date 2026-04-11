"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUp, Filter } from "lucide-react";
import { 
  SalaryTrackerResponse, 
  AdvanceRequestResponse, 
  PayrollResponse 
} from "@/api/generated/model";

interface SalarySummaryBarProps {
  tab: string;
  trackers: SalaryTrackerResponse[];
  trackersTotal: number;
  advances: AdvanceRequestResponse[];
  advancesTotal: number;
  history: PayrollResponse[];
  historyTotal: number;
  hasFilters: boolean;
}

const formatCurrency = (val?: number) => {
  return `Rs. ${(val ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function SalarySummaryBar({
  tab,
  trackers,
  trackersTotal,
  advances,
  advancesTotal,
  history,
  historyTotal,
  hasFilters,
}: SalarySummaryBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/30 border border-muted/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        <TrendingUp className="w-4 h-4 text-emerald-500/60" />
        {tab === "LIVE" && (
          <span>
            Showing <strong className="text-foreground">{trackers.length}</strong> of{" "}
            <strong className="text-foreground">{trackersTotal}</strong> employees
            {trackers.length > 0 && (
              <>
                {" · "}Total Net Payable:{" "}
                <strong className="text-emerald-600">
                  {formatCurrency(
                    trackers.reduce((sum, t) => sum + (t.netPayable ?? 0), 0)
                  )}
                </strong>
              </>
            )}
          </span>
        )}
        {tab === "ADVANCES" && (
          <span>
            Showing <strong className="text-foreground">{advances.length}</strong> of{" "}
            <strong className="text-foreground">{advancesTotal}</strong> requests
            {advances.length > 0 && (
              <>
                {" · "}Total Requested:{" "}
                <strong className="text-amber-600">
                  {formatCurrency(
                    advances.reduce((sum, a) => sum + (a.requestedAmount ?? 0), 0)
                  )}
                </strong>
                {advances.some((a) => a.approvedAmount) && (
                  <>
                    {" · "}Total Approved:{" "}
                    <strong className="text-emerald-600">
                      {formatCurrency(
                        advances.reduce((sum, a) => sum + (a.approvedAmount ?? 0), 0)
                      )}
                    </strong>
                  </>
                )}
              </>
            )}
          </span>
        )}
        {tab === "HISTORY" && (
          <span>
            Showing <strong className="text-foreground">{history.length}</strong> of{" "}
            <strong className="text-foreground">{historyTotal}</strong> settlements
            {history.length > 0 && (
              <>
                {" · "}Net Paid:{" "}
                <strong className="text-emerald-600">
                  {formatCurrency(
                    history.reduce((sum, h) => sum + (h.netPaid ?? 0), 0)
                  )}
                </strong>
              </>
            )}
          </span>
        )}
      </div>
      {hasFilters && (
        <Badge
          variant="outline"
          className="text-[10px] font-black gap-1.5 text-primary border-primary/20 bg-primary/5 uppercase tracking-wider h-6 px-3 rounded-full"
        >
          <Filter className="w-3 h-3" /> Filtered View
        </Badge>
      )}
    </div>
  );
}
