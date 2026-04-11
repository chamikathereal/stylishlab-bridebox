import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Activity, Pencil, Trash2 } from "lucide-react";
import { ExpenseResponse } from "@/api/generated/model";

interface ExpenseLedgerProps {
  records: ExpenseResponse[];
  onViewAudit: (record: ExpenseResponse) => void;
  onEdit: (record: ExpenseResponse) => void;
  onDelete: (id: number) => void;
  formatCurrency: (val?: number) => string;
  totalAmount: number;
}

export function ExpenseLedger({
  records,
  onViewAudit,
  onEdit,
  onDelete,
  formatCurrency,
  totalAmount,
}: ExpenseLedgerProps) {
  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex justify-between items-center">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-500" />
            Expense Ledger
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-2 pr-4 border-r border-border/50">
              Ledger Total
              <span className="text-sm font-black text-foreground tracking-tighter">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-muted-foreground/10 bg-muted/5">
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Reference</TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-amber-600">Category</TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-teal-600">Transaction</TableHead>
              <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider text-emerald-600">Amount</TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-blue-600">Metadata</TableHead>
              <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider text-blue-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow
                key={record.id}
                className="group hover:bg-emerald-500/2 transition-colors border-muted-foreground/10 cursor-pointer"
                onClick={() => {
                  if (record.lastEditReason) onViewAudit(record);
                }}
              >
                <TableCell className="px-6 py-5 text-xs text-muted-foreground font-medium">
                  {record.createdAt
                    ? new Date(record.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </TableCell>
                <TableCell className="px-6 py-5 font-bold text-xs tracking-tighter text-blue-600/80">
                  EXP-{record.id?.toString().padStart(4, "0")}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="text-[10px] font-bold tracking-tight bg-muted/20 border-muted-foreground/10 uppercase w-fit">
                      {record.categoryName}
                    </Badge>
                    {record.lastEditReason && (
                      <Badge variant="secondary" className="w-fit scale-75 origin-left bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                        Edited
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">{record.payeeName}</span>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold italic">
                      {record.note || "No notes"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-right font-black text-sm text-amber-600">
                  {formatCurrency(record.amount)}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      Paid by: <span className="text-foreground">{record.paidBy}</span>
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      Rec by: <span className="text-blue-600">{record.recordedByUsername}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase rounded-md text-emerald-600 border-emerald-500/20 bg-emerald-500/5">
                    Completed
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 transition-all active:scale-90"
                      onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-destructive transition-all active:scale-90"
                      onClick={(e) => { e.stopPropagation(); onDelete(record.id!); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                  <Activity className="w-10 h-10 opacity-10 mx-auto mb-4" />
                  No expenses recorded in the audit ledger
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
