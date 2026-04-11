import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calendar, FilterX } from "lucide-react";

interface BillFiltersProps {
  kpiPeriod: string;
  setKpiPeriod: (p: "daily" | "weekly" | "monthly" | "yearly" | "total") => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  resetFilters: () => void;
}

export function BillFilters({
  kpiPeriod,
  setKpiPeriod,
  selectedDate,
  setSelectedDate,
  resetFilters,
}: BillFiltersProps) {
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
              onClick={() =>
                setKpiPeriod(
                  p as "daily" | "weekly" | "monthly" | "yearly" | "total",
                )
              }
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-w-[180px]">
        <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block ml-1">
          Reference Date
        </Label>
        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 pl-9 text-xs font-medium bg-background/50 border-border/50 rounded-xl focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-end h-full self-end ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-9 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <FilterX className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
}
