import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseFiltersProps {
  kpiPeriod: "daily" | "weekly" | "monthly" | "yearly" | "total";
  setKpiPeriod: (p: "daily" | "weekly" | "monthly" | "yearly" | "total") => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  onReset: () => void;
  onOpenCreate: () => void;
}

export function ExpenseFilters({
  kpiPeriod,
  setKpiPeriod,
  selectedDate,
  setSelectedDate,
  onReset,
  onOpenCreate,
}: ExpenseFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm">
      <div className="flex-1 min-w-[200px]">
        <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block ml-1">
          Analytics Period
        </Label>
        <div className="flex gap-1.5 bg-background/50 p-1 rounded-xl border border-border/50">
          {["daily", "weekly", "monthly", "yearly", "total"].map((p) => (
            <Button
              key={p}
              variant={kpiPeriod === p ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-[10px] uppercase font-bold flex-1 px-0 transition-all duration-300",
                kpiPeriod === p ? "shadow-sm" : "hover:bg-background/80",
              )}
              onClick={() => setKpiPeriod(p as "daily" | "weekly" | "monthly" | "yearly" | "total")}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-[180px]">
        <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block ml-1">
          Select Date
        </Label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-9 text-xs bg-background/50 border-border/50 rounded-lg"
        />
      </div>

      <div className="flex items-end self-stretch pb-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          onClick={onReset}
        >
          <FilterX className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          Reset
        </Button>
      </div>

      <div className="ml-auto flex items-end self-stretch pb-0.5">
        <Button
          onClick={onOpenCreate}
          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" /> Record Expense
        </Button>
      </div>
    </div>
  );
}
