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
import { AlertCircle, CreditCard, X, Check } from "lucide-react";
import { AdvanceRequestResponse } from "@/api/generated/model";

interface ProcessAdvanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAdvance: AdvanceRequestResponse | null;
  approveAmount: string;
  setApproveAmount: (v: string) => void;
  onProcess: (status: "APPROVED" | "REJECTED") => void;
  isPending: boolean;
}

const formatCurrency = (val?: number) => {
  return `Rs. ${(val ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function ProcessAdvanceDialog({
  open,
  onOpenChange,
  selectedAdvance,
  approveAmount,
  setApproveAmount,
  onProcess,
  isPending,
}: ProcessAdvanceDialogProps) {
  if (!selectedAdvance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            Process Advance Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="bg-muted/40 p-5 rounded-2xl border border-muted/20 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Employee</span>
              <span className="font-bold text-foreground">
                {selectedAdvance.employeeName}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Requested</span>
              <span className="font-black text-foreground">
                {formatCurrency(selectedAdvance.requestedAmount)}
              </span>
            </div>
            <div className="flex justify-between items-start text-sm pt-2 border-t border-muted/30">
              <span className="text-muted-foreground font-medium">Reason</span>
              <span className="flex-1 text-right italic text-muted-foreground/80 pl-8">
                {selectedAdvance.note || "No reason provided"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Final Approved Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">Rs.</span>
              <Input
                type="number"
                className="h-11 pl-10 rounded-xl bg-background border-muted/20 focus:ring-blue-500/20 font-bold"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-500/5 text-amber-600 p-4 rounded-xl border border-amber-500/10 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium text-amber-700/80">
              Approving this will instantly create a cash payout and deduct the
              approved amount from the employee&apos;s net payable balance.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:grid sm:grid-cols-3 gap-2 pt-2">
          <Button
            variant="outline"
            className="h-11 font-bold rounded-xl sm:col-span-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="h-11 font-bold rounded-xl transition-all shadow-lg shadow-red-500/10"
            disabled={isPending}
            onClick={() => onProcess("REJECTED")}
          >
            <X className="w-4 h-4 mr-1.5" /> Reject
          </Button>
          <Button
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            disabled={isPending}
            onClick={() => onProcess("APPROVED")}
          >
            <Check className="w-4 h-4 mr-1.5" /> Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
