"use client";

import { useState, useEffect } from "react";
import {
  useCreate2,
  useUpdate1,
} from "@/api/generated/endpoints/payee-debtor-management/payee-debtor-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2,
  Phone,
  StickyNote,
  UserSquare2,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PayeeResponse } from "@/api/generated/model";

interface PayeeRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (payee: PayeeResponse) => void;
  editingPayee?: PayeeResponse | null;
}

export function PayeeRegistrationDialog({
  open,
  onOpenChange,
  onSuccess,
  editingPayee,
}: PayeeRegistrationDialogProps) {
  const createMutation = useCreate2();
  const updateMutation = useUpdate1();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    type: "",
    mobile: "",
    notes: "",
  });

  useEffect(() => {
    if (editingPayee) {
      setForm({
        name: editingPayee.name || "",
        type: editingPayee.type || "",
        mobile: editingPayee.mobile || "",
        notes: editingPayee.notes || "",
      });
    } else {
      setForm({ name: "", type: "", mobile: "", notes: "" });
    }
  }, [editingPayee, open]);

  const resetForm = () => {
    setForm({ name: "", type: "", mobile: "", notes: "" });
  };

  const handleSubmit = () => {
    if (!form.name || !form.type) {
      toast.error("Name and type are required");
      return;
    }

    const payload = {
      data: {
        name: form.name,
        type: form.type,
        mobile: form.mobile || undefined,
        notes: form.notes || undefined,
      },
    };

    if (editingPayee) {
      updateMutation.mutate(
        { id: editingPayee.id!, data: payload.data },
        {
          onSuccess: (response) => {
            toast.success("Payee updated successfully!");
            queryClient.invalidateQueries();
            onOpenChange(false);
            if (response.data) onSuccess?.(response.data as PayeeResponse);
          },
          onError: () => toast.error("Failed to update payee"),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (response) => {
          toast.success("New payee registered!");
          queryClient.invalidateQueries();
          onOpenChange(false);
          resetForm();
          if (response.data) onSuccess?.(response.data as PayeeResponse);
        },
        onError: () => toast.error("Failed to register payee"),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val && !editingPayee) resetForm();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserSquare2 className="w-5 h-5 text-emerald-600" />
            </div>
            {editingPayee ? "Update Payee Details" : "Register New Payee"}
          </DialogTitle>
          <DialogDescription>
            {editingPayee
              ? "Modify the identity and contact information for this business entity."
              : "Add a new supplier, bank, or debtor to your business ecosystem."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                Entity Name *
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="E.g. Commercial Bank, Beauty Supplies"
                  className="pl-9 h-11"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                Classification *
              </Label>
              <select
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="BANK">Bank</option>
                <option value="OTHER">Other Management</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                Contact Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="+94 XX XXX XXXX"
                  className="pl-9 h-11"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                Administrative Notes
              </Label>
              <div className="relative">
                <StickyNote className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  placeholder="Add specific details or account info..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingPayee ? "Save Changes" : "Complete Registration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
