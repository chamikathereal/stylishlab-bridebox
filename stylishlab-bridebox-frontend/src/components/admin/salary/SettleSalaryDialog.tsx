"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Wallet } from "lucide-react";
import { SalaryTrackerResponse } from "@/api/generated/model";

interface SettleSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTracker: SalaryTrackerResponse | null;
  settleNote: string;
  setSettleNote: (v: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

const formatCurrency = (val?: number) => {
  return `Rs. ${(val ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function SettleSalaryDialog({
  open,
  onOpenChange,
  selectedTracker,
  settleNote,
  setSettleNote,
  onConfirm,
  isPending,
}: SettleSalaryDialogProps) {
  if (!selectedTracker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            Settle Salary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="bg-muted/40 p-5 rounded-2xl border border-muted/20 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Employee</span>
              <span className="font-bold text-foreground">
                {selectedTracker.employeeName}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Accumulated</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(selectedTracker.currentSalary)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Advances</span>
              <span className="text-destructive font-semibold">
                -{formatCurrency(selectedTracker.totalAdvances)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-muted/30 mt-3">
              <span className="text-foreground font-black uppercase tracking-tighter text-xs">
                Net Payout
              </span>
              <span className="text-xl font-black text-emerald-600">
                {formatCurrency(selectedTracker.netPayable)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Settlement Note
            </Label>
            <Input
              placeholder="e.g. Bank Transfer, Cash Payment..."
              value={settleNote}
              className="h-11 rounded-xl bg-background border-muted/20 focus:ring-emerald-500/20"
              onChange={(e) => setSettleNote(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3 bg-blue-500/5 text-blue-600 p-4 rounded-xl border border-blue-500/10 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">
              This action will permanently log the settlement into history and
              reset the employee’s live earnings tracker to zero.
            </p>
          </div>
        </div>

        <DialogFooter className="flex sm:flex-row flex-col-reverse gap-2">
          <Button
            variant="outline"
            className="h-11 flex-1 font-bold rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-11 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
            disabled={isPending || (selectedTracker.netPayable ?? 0) <= 0}
            onClick={onConfirm}
          >
            Confirm & Settle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
