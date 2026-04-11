import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpenseResponse, ExpenseCategoryResponse, PayeeResponse } from "@/api/generated/model";

interface ExpenseModalsProps {
  // Create Modal
  open: boolean;
  setOpen: (v: boolean) => void;
  form: any;
  setForm: (f: any) => void;
  handleCreate: () => void;
  categories: ExpenseCategoryResponse[];
  filteredPayees: PayeeResponse[];
  setPayeeDialogOpen: (v: boolean) => void;
  isCreatePending: boolean;
  handleCategoryChange: (val: string) => void;

  // Audit Modal
  viewAuditItem: ExpenseResponse | null;
  setViewAuditItem: (item: ExpenseResponse | null) => void;
  formatCurrency: (val?: number) => string;

  // Edit Modal
  editItem: ExpenseResponse | null;
  setEditItem: (item: ExpenseResponse | null) => void;
  editForm: any;
  setEditForm: (f: any) => void;
  handleUpdate: () => void;
  isUpdatePending: boolean;
  commonReasons: string[];
  payees: PayeeResponse[];
}

export function ExpenseModals({
  open, setOpen, form, setForm, handleCreate, categories, filteredPayees, setPayeeDialogOpen, isCreatePending, handleCategoryChange,
  viewAuditItem, setViewAuditItem, formatCurrency,
  editItem, setEditItem, editForm, setEditForm, handleUpdate, isUpdatePending, commonReasons, payees
}: ExpenseModalsProps) {
  return (
    <>
      {/* Record Expense Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">Category *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={form.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (<option key={c.id!} value={c.id}>{c.categoryName}</option>))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">Payee *</Label>
              <div className="flex gap-2">
                <select
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={form.payeeId}
                  onChange={(e) => setForm({ ...form, payeeId: e.target.value })}
                >
                  <option value="">Select Payee</option>
                  {filteredPayees.map((p) => (<option key={p.id!} value={p.id}>{p.name} ({p.type})</option>))}
                </select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-10 w-10 shrink-0 border-emerald-500/30 text-emerald-600")}
                      onClick={() => setPayeeDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent><p className="text-[10px] font-bold">Register New Payee</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">Amount (Rs.) *</Label>
              <Input type="number" className="h-10" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">Paid By *</Label>
              <Input readOnly value={form.paidBy} className="h-10" placeholder="Who paid?" />
            </div>
            <div>
              <Label className="text-xs mb-2 font-semibold uppercase tracking-wider text-muted-foreground">Note</Label>
              <Input value={form.note} className="h-10" onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreatePending}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Detail Dialog */}
      <Dialog open={!!viewAuditItem} onOpenChange={(v) => !v && setViewAuditItem(null)}>
        <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-amber-500/10 p-6 flex flex-col items-center gap-3 text-center border-b border-amber-500/10">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-amber-900">Modification Details</DialogTitle>
              <DialogDescription className="text-amber-700/70 text-xs">Audit trail for record manual adjustment</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason for Change</span>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 px-2 py-0.5 text-[11px] font-bold w-fit">
                  {viewAuditItem?.lastEditReason}
                </Badge>
              </div>
              {viewAuditItem?.lastEditNote && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/30 border border-muted/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Additional Note</span>
                  <p className="text-xs text-foreground italic leading-relaxed">&ldquo;{viewAuditItem.lastEditNote}&rdquo;</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 border-t border-muted/10 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {viewAuditItem?.lastAmount !== viewAuditItem?.amount ? "Corrected Amount" : "Amount"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(viewAuditItem?.amount || 0)}</span>
                    {viewAuditItem?.lastAmount !== viewAuditItem?.amount && (
                      <span className="text-[10px] text-amber-700 font-bold line-through opacity-70">
                        Original: {formatCurrency(viewAuditItem?.lastAmount || 0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Adjusted Date</span>
                  <span className="text-sm font-medium">{viewAuditItem?.expenseDate}</span>
                </div>
              </div>
            </div>
            <Button className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold" onClick={() => setViewAuditItem(null)}>Understand</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5 text-blue-600" />Edit Expense Record</DialogTitle>
            <DialogDescription>Modify historical expense data. Reason for audit is mandatory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Category *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value, payeeId: "" })}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (<option key={c.id!} value={c.id}>{c.categoryName}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Payee *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.payeeId}
                  onChange={(e) => setEditForm({ ...editForm, payeeId: e.target.value })}
                >
                  <option value="">Select Payee</option>
                  {payees.filter(p => p.isActive).map((p) => (<option key={p.id!} value={p.id}>{p.name}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Amount (Rs.) *</Label>
                <Input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Paid By *</Label>
                <Input value={editForm.paidBy} onChange={(e) => setEditForm({ ...editForm, paidBy: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Note</Label>
              <Input value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} />
            </div>
            <div className="pt-4 border-t border-muted/20 space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2 border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-tight font-medium">Administrative changes require an audit reason for financial transparency.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-amber-900">Reason for Change *</Label>
                <select
                  className="w-full h-10 rounded-md border border-amber-200 bg-background px-3 text-sm"
                  value={editForm.editReason}
                  onChange={(e) => setEditForm({ ...editForm, editReason: e.target.value })}
                >
                  <option value="">Why is this being edited?</option>
                  {commonReasons.map((r, idx) => (<option key={idx} value={r}>{r}</option>))}
                </select>
              </div>
              {editForm.editReason === "Special Reason" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                   <Label className="text-xs font-bold uppercase text-amber-900">Specify Reason *</Label>
                   <Input placeholder="Details..." value={editForm.editNote} onChange={(e) => setEditForm({ ...editForm, editNote: e.target.value })} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isUpdatePending} className="bg-blue-600 hover:bg-blue-700 text-white">Update Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
