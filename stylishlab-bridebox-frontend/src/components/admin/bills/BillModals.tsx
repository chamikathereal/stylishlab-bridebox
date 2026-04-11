import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  isEditing?: boolean;
  // Delete confirm props
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (open: boolean) => void;
  onDeleteConfirm: () => void;
  isDeleting: boolean;
}

export function BillModals({
  open,
  onOpenChange,
  form,
  setForm,
  categories,
  onCreate,
  isCreating,
  isEditing = false,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  onDeleteConfirm,
  isDeleting,
}: BillModalsProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Monthly Bill" : "New Monthly Bill"}
            </DialogTitle>
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
                onChange={(e) =>
                  setForm({ ...form, billMonth: e.target.value })
                }
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              onClick={onCreate}
              disabled={isCreating}
              className="w-full sm:w-auto bg-linear-to-r from-emerald-600 to-teal-600 text-white"
            >
              {isCreating
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-destructive/20 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2 text-xl font-black italic">
              ARE YOU ABSOLUTELY SURE?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              This action cannot be undone. This bill will be permanently
              deleted from the database and your
              <span className="text-rose-500 font-black px-1 uppercase tracking-tighter">
                financial reports
              </span>{" "}
              will be adjusted accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 border-none font-bold text-xs uppercase tracking-widest">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black tracking-widest uppercase text-xs px-6 py-2 shadow-lg shadow-destructive/20"
            >
              {isDeleting ? "DELETING..." : "YES, DELETE BILL"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
