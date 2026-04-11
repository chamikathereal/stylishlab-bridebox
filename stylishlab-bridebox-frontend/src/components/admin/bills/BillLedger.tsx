import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Calendar, CheckCircle, Check } from "lucide-react";
import { BillResponse } from "@/api/generated/model";

interface BillLedgerProps {
  bills: BillResponse[];
  formatCurrency: (val?: number) => string;
  onSettle: (id: number) => void;
}

export function BillLedger({
  bills,
  formatCurrency,
  onSettle,
}: BillLedgerProps) {
  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex justify-between items-center">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Bill Ledger
          </h3>
          <div className="text-[10px] uppercase text-muted-foreground font-bold italic">
            Detailed breakdown of monthly utility and operation costs
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-muted-foreground/10 bg-muted/5">
              <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider text-blue-600">
                Bill Period
              </TableHead>
              <TableHead className="px-8 py-4 text-right font-bold text-xs uppercase tracking-wider text-emerald-600">
                Amount
              </TableHead>
              <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider text-teal-600">
                Transaction Date
              </TableHead>
              <TableHead className="px-8 py-4 font-bold text-xs uppercase tracking-wider">
                Note
              </TableHead>
              <TableHead className="px-8 py-4 text-right font-bold text-xs uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length > 0 ? (
              bills.map((b) => (
                <TableRow
                  key={b.id}
                  className="group hover:bg-emerald-500/2 transition-colors border-muted-foreground/10"
                >
                  <TableCell className="px-8 py-5 font-bold text-sm tracking-tight">
                    {b.billType}
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                        <Calendar className="w-3 h-3" />
                        {b.billMonth}
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        Billing Cycle
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right font-black text-sm text-emerald-600">
                    {formatCurrency(b.amount)}
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <Badge
                      variant={b.status === "PAID" ? "default" : "secondary"}
                      className={cn(
                        "font-bold text-[10px] tracking-widest",
                        b.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      )}
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    {b.paidDate ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-teal-600 font-bold text-[11px]">
                          <CheckCircle className="w-3 h-3" />
                          {b.paidDate}
                        </div>
                        <span className="text-[9px] text-muted-foreground uppercase font-medium">
                          Payment Recorded
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-tighter italic">
                        Not Settled Yet
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-8 py-5 text-[11px] font-medium text-muted-foreground italic">
                    {b.note || "-"}
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    {b.status !== "PAID" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
                        onClick={() => onSettle(b.id!)}
                      >
                        <Check className="w-3 h-3" /> Settle
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-20 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <FileText className="w-12 h-12" />
                    <p className="text-sm font-bold uppercase tracking-tighter">
                      No bills recorded for this period
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
