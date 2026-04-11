"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  CalendarDays,
  RotateCcw,
} from "lucide-react";

interface SalaryFiltersProps {
  tab: string;
  filter: string;
  setFilter: (val: string) => void;
  // Advance filters
  advStatus: string;
  setAdvStatus: (val: string) => void;
  advFromDate: string;
  setAdvFromDate: (val: string) => void;
  advToDate: string;
  setAdvToDate: (val: string) => void;
  clearAdvFilters: () => void;
  hasAdvFilters: boolean;
  // History filters
  histFromDate: string;
  setHistFromDate: (val: string) => void;
  histToDate: string;
  setHistToDate: (val: string) => void;
  clearHistFilters: () => void;
  hasHistFilters: boolean;
}

export function SalaryFilters({
  tab,
  filter,
  setFilter,
  advStatus,
  setAdvStatus,
  advFromDate,
  setAdvFromDate,
  advToDate,
  setAdvToDate,
  clearAdvFilters,
  hasAdvFilters,
  histFromDate,
  setHistFromDate,
  histToDate,
  setHistToDate,
  clearHistFilters,
  hasHistFilters,
}: SalaryFiltersProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] max-w-sm">
              <Label className="text-xs text-muted-foreground mb-1.5 block font-bold uppercase tracking-wider">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={
                    tab === "LIVE"
                      ? "Search by employee name..."
                      : tab === "ADVANCES"
                        ? "Search by name or note..."
                        : "Search by name, note, or admin..."
                  }
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-background/50 border-muted/20"
                />
              </div>
            </div>

            {tab === "ADVANCES" && (
              <>
                <div className="min-w-[140px]">
                  <Label className="text-xs text-muted-foreground mb-1.5 block font-bold uppercase tracking-wider">
                    Status
                  </Label>
                  <Select value={advStatus} onValueChange={(v) => setAdvStatus(v ?? "ALL")}>
                    <SelectTrigger className="h-10 text-xs rounded-xl bg-background/50 border-muted/20">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PENDING">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                        </span>
                      </SelectItem>
                      <SelectItem value="APPROVED">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approved
                        </span>
                      </SelectItem>
                      <SelectItem value="REJECTED">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Rejected
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[140px]">
                  <Label className="text-xs text-muted-foreground mb-1.5 block font-bold uppercase tracking-wider">
                    From Date
                  </Label>
                  <Input
                    type="date"
                    value={advFromDate}
                    onChange={(e) => setAdvFromDate(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background/50 border-muted/20"
                  />
                </div>
                <div className="min-w-[140px]">
                  <Label className="text-xs text-muted-foreground mb-1.5 block font-bold uppercase tracking-wider">
                    To Date
                  </Label>
                  <Input
                    type="date"
                    value={advToDate}
                    onChange={(e) => setAdvToDate(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background/50 border-muted/20"
                  />
                </div>
                {hasAdvFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 gap-1.5 text-xs text-muted-foreground hover:text-destructive rounded-xl"
                    onClick={clearAdvFilters}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </Button>
                )}
              </>
            )}

            {tab === "HISTORY" && (
              <>
                <div className="min-w-[140px]">
                  <Label className="text-xs text-muted-foreground mb-1.5 block font-bold uppercase tracking-wider">
                    From Date
                  </Label>
                  <Input
                    type="date"
                    value={histFromDate}
                    onChange={(e) => setHistFromDate(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background/50 border-muted/20"
                  />
                </div>
                <div className="min-w-[140px]">
                  <Label className="text-xs text-muted-foreground mb-1.5 block font-bold uppercase tracking-wider">
                    To Date
                  </Label>
                  <Input
                    type="date"
                    value={histToDate}
                    onChange={(e) => setHistToDate(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background/50 border-muted/20"
                  />
                </div>
                {hasHistFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 gap-1.5 text-xs text-muted-foreground hover:text-destructive rounded-xl"
                    onClick={clearHistFilters}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </Button>
                )}
              </>
            )}
          </div>

          {(hasAdvFilters && tab === "ADVANCES") && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span>Active filters:</span>
              {advStatus !== "ALL" && (
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  Status: {advStatus}
                </Badge>
              )}
              {advFromDate && (
                <Badge variant="secondary" className="text-[10px] font-semibold gap-1">
                  <CalendarDays className="w-3 h-3" /> From: {advFromDate}
                </Badge>
              )}
              {advToDate && (
                <Badge variant="secondary" className="text-[10px] font-semibold gap-1">
                  <CalendarDays className="w-3 h-3" /> To: {advToDate}
                </Badge>
              )}
            </div>
          )}

          {(hasHistFilters && tab === "HISTORY") && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span>Active filters:</span>
              {histFromDate && (
                <Badge variant="secondary" className="text-[10px] font-semibold gap-1">
                  <CalendarDays className="w-3 h-3" /> From: {histFromDate}
                </Badge>
              )}
              {histToDate && (
                <Badge variant="secondary" className="text-[10px] font-semibold gap-1">
                  <CalendarDays className="w-3 h-3" /> To: {histToDate}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
