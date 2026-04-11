import { Filter, Calendar, RotateCcw, Search } from "lucide-react";
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
import { toast } from "sonner";
import { type PeriodType } from "@/hooks/usePeriodFilter";

interface SalesToolbarProps {
  filter: string;
  setFilter: (val: string) => void;
  kpiPeriod: PeriodType;
  setKpiPeriod: (val: PeriodType) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  reset: () => void;
  totalElements: number;
  isFetching: boolean;
  setCurrentPage: (page: number) => void;
}

export function SalesToolbar({
  filter,
  setFilter,
  kpiPeriod,
  setKpiPeriod,
  selectedDate,
  setSelectedDate,
  reset,
  totalElements,
  isFetching,
  setCurrentPage,
}: SalesToolbarProps) {
  return (
    <div className="space-y-6 mb-6">
      {/* Advanced Filter Row */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1 ml-1 text-emerald-600 dark:text-emerald-400">
            <Filter className="w-2.5 h-2.5" /> Time Filter
          </Label>
          <Select
            value={kpiPeriod}
            onValueChange={(v: string | null) => v && setKpiPeriod(v as PeriodType)}
          >
            <SelectTrigger className="h-9 w-full text-xs bg-background/50 border-border/50 rounded-lg">
              <SelectValue placeholder="Monthly" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="total">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 flex items-center gap-1 ml-1">
            <Calendar className="w-2.5 h-2.5" /> Select Date
          </Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 w-full text-xs bg-background/50 border-border/50 rounded-lg font-medium"
          />
        </div>

        <div className="flex items-end self-end mb-px">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs gap-1.5 hover:bg-background/80 hover:text-primary transition-all rounded-lg border border-transparent hover:border-border/50 group"
            onClick={() => {
              reset();
              toast.success("Sales filters reset");
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
            Reset
          </Button>
        </div>
      </div>

      {/* Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Customer, Employee or Service..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-emerald-500/20"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 px-4 py-2 rounded-xl border border-border/50">
          {isFetching && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Updating
              </span>
            </div>
          )}
          <span className="hidden sm:inline border-l border-muted-foreground/20 pl-3 h-4" />
          <span>
            Total Transactions:{" "}
            <span className="font-bold text-foreground">{totalElements}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
