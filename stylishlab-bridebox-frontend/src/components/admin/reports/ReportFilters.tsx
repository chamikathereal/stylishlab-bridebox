import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterX, Calendar } from "lucide-react";

interface ReportFiltersProps {
  kpiPeriod: string;
  selectedYear: number;
  selectedMonth: string;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  reset: () => void;
}

export function ReportFilters({
  kpiPeriod,
  selectedYear,
  selectedMonth,
  selectedDate,
  setSelectedDate,
  reset,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm">
      <div className="w-[180px]">
        <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block ml-1">
          {kpiPeriod === "yearly"
            ? "Select Year"
            : kpiPeriod === "monthly"
            ? "Select Month"
            : "Select Date"}
        </Label>
        {kpiPeriod === "yearly" ? (
          <Select
            value={selectedYear.toString()}
            onValueChange={(val: string | null) =>
              val && setSelectedDate(`${val}-01-01`)
            }
          >
            <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50 rounded-lg">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i,
              ).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={kpiPeriod === "monthly" ? "month" : "date"}
            value={kpiPeriod === "monthly" ? selectedMonth : selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={kpiPeriod === "total"}
            className="h-9 text-xs bg-background/50 border-border/50 rounded-lg"
          />
        )}
      </div>

      <div className="flex items-end self-stretch pb-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          onClick={reset}
        >
          <FilterX className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          Reset
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2 bg-background/50 p-1 rounded-xl border border-border/50">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-2 mr-1" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase mr-2">
          Display Mode
        </span>
      </div>
    </div>
  );
}
