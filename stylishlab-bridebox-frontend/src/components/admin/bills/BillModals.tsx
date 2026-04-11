import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BillModalsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    billType: string;
    amount: string;
    billMonth: string;
    paidDate: string;
    note: string;
  };
  setForm: (form: any) => void;
  categories: any[];
  onCreate: () => void;
  isCreating: boolean;
}

export function BillModals({
  open,
  onOpenChange,
  form,
  setForm,
  categories,
  onCreate,
  isCreating,
}: BillModalsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Monthly Bill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2">Bill Type *</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.billType}
              onChange={(e) => setForm({ ...form, billType: e.target.value })}
            >
              <option value="">Select type</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name!}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-2">Amount (Rs.) *</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2">Bill Month *</Label>
            <Input
              type="month"
              value={form.billMonth}
              onChange={(e) => setForm({ ...form, billMonth: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground mt-1 italic">
              The period this bill belongs to (e.g. May Rent)
            </p>
          </div>
          <div>
            <Label className="mb-2">Payment Date (Optional)</Label>
            <Input
              type="date"
              value={form.paidDate}
              onChange={(e) => setForm({ ...form, paidDate: e.target.value })}
            />
            <p className="text-[10px] text-emerald-600/70 mt-1 italic">
              Select a date if the bill is already paid today or earlier
            </p>
          </div>
          <div>
            <Label className="mb-2">Note</Label>
            <Input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={isCreating}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
