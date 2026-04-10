import React, { useState } from "react";
import {
  useRecord,
  useGetCategories,
  useGetMyExpenses,
  useUpdate2,
  useDelete,
} from "@/api/generated/endpoints/expense-management/expense-management";
import { useGetAll2 as useGetPayees } from "@/api/generated/endpoints/payee-debtor-management/payee-debtor-management";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Plus,
  History,
  Pencil,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  ExpenseResponse,
  ExpenseCategoryResponse,
  PayeeResponse,
} from "@/api/generated/model";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PayeeRegistrationDialog } from "@/components/shared/PayeeRegistrationDialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmployeeExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_REASONS = [
  "Wrong Amount",
  "Wrong Category",
  "Wrong Payee",
  "Duplicate Entry",
  "Incorrect Note",
  "Special Reason",
];

export function EmployeeExpenseModal({
  open,
  onOpenChange,
}: EmployeeExpenseModalProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"RECORD" | "HISTORY">("RECORD");
  const [filter, setFilter] = useState("");

  const { user } = useAuth();

  // Form State
  const [form, setForm] = useState({
    categoryId: "",
    payeeId: "",
    amount: "",
    paidBy: user?.username || "",
    note: "",
  });

  const [showPayeeDialog, setShowPayeeDialog] = useState(false);

  const handleAddPayeeSuccess = (p: PayeeResponse) => {
    setForm((prev) => ({ ...prev, payeeId: p.id?.toString() || "" }));
  };

  // Reset form with user name when modal opens
  React.useEffect(() => {
    if (open && user?.username) {
      setForm((prev) => ({ ...prev, paidBy: user.username }));
    }
  }, [open, user?.username]);

  // Edit State
  const [editItem, setEditItem] = useState<ExpenseResponse | null>(null);
  const [editForm, setEditForm] = useState({
    categoryId: "",
    payeeId: "",
    amount: "",
    paidBy: "",
    note: "",
    editReason: "",
    editNote: "",
  });

  const [viewAuditItem, setViewAuditItem] = useState<ExpenseResponse | null>(
    null,
  );

  // API Hooks
  const { data: catRes } = useGetCategories({ query: { enabled: open } });
  const { data: payeeRes } = useGetPayees({ query: { enabled: open } });
  const { data: historyRes, isLoading: historyLoading } = useGetMyExpenses({
    query: { enabled: open },
  });

  const recordMutation = useRecord();
  const updateMutation = useUpdate2();
  const deleteMutation = useDelete();

  const categories = (catRes?.data ?? []) as ExpenseCategoryResponse[];
  const payees = (payeeRes?.data ?? []) as PayeeResponse[];
  const history = (historyRes?.data ?? []) as ExpenseResponse[];

  // Filtering Payees logic (standard refined logic)
  const getFilteredPayees = (categoryId: string) => {
    if (!categoryId) return payees.filter((p) => p.isActive);
    const selectedCat = categories.find((c) => c.id?.toString() === categoryId);
    if (!selectedCat) return payees.filter((p) => p.isActive);

    return payees.filter((p) => {
      if (!p.isActive) return false;
      const pType = (p.type || "").toLowerCase();
      const cType = (selectedCat.categoryType || "").toLowerCase();
      const cName = (selectedCat.categoryName || "").toLowerCase();
      return (
        cType.includes(pType) || pType.includes(cType) || cName.includes(pType)
      );
    });
  };

  const handleRecord = () => {
    if (!form.categoryId || !form.payeeId || !form.amount || !form.paidBy) {
      toast.error("Please fill all required fields");
      return;
    }

    recordMutation.mutate(
      {
        data: {
          categoryId: parseInt(form.categoryId),
          payeeId: form.payeeId ? parseInt(form.payeeId) : undefined,
          amount: parseFloat(form.amount),
          note: form.note || undefined,
          paidBy: form.paidBy,
        },
      },
      {
        onSuccess: () => {
          toast.success("Expense recorded successfully!");
          queryClient.invalidateQueries();
          setForm({
            categoryId: "",
            payeeId: "",
            amount: "",
            paidBy: user?.username || "",
            note: "",
          });
          setTab("HISTORY");
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || "Failed to record");
        },
      },
    );
  };

  const handleUpdate = () => {
    if (
      !editItem ||
      !editForm.categoryId ||
      !editForm.payeeId ||
      !editForm.amount ||
      !editForm.editReason
    ) {
      toast.error("Required fields and edit reason are missing");
      return;
    }

    if (editForm.editReason === "Special Reason" && !editForm.editNote) {
      toast.error("Please add a note for the special reason");
      return;
    }

    updateMutation.mutate(
      {
        id: editItem.id!,
        data: {
          categoryId: parseInt(editForm.categoryId),
          payeeId: editForm.payeeId ? parseInt(editForm.payeeId) : undefined,
          amount: parseFloat(editForm.amount),
          note: editForm.note || undefined,
          paidBy: editForm.paidBy,
          editReason: editForm.editReason,
          editNote: editForm.editNote || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Expense updated!");
          queryClient.invalidateQueries();
          setEditItem(null);
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || "Failed to update");
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Expense deleted");
          queryClient.invalidateQueries();
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || "Failed to delete");
        },
      },
    );
  };

  const isEditable = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  const formatCurrency = (val?: number) =>
    `Rs. ${(val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredHistory = history
    .filter(
      (e) =>
        ((e.categoryName || "") as string)
          .toLowerCase()
          .includes(filter.toLowerCase()) ||
        ((e.payeeName || "") as string)
          .toLowerCase()
          .includes(filter.toLowerCase()) ||
        ((e.note || "") as string)
          .toLowerCase()
          .includes(filter.toLowerCase()) ||
        formatCurrency(e.amount ?? undefined).includes(filter),
    )
    .sort(
      (a, b) =>
        new Date(b.expenseDate || "").getTime() -
        new Date(a.expenseDate || "").getTime(),
    );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Expense Management
                  </DialogTitle>
                  <DialogDescription>
                    Record payments to suppliers or collectors.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
              <Button
                variant={tab === "RECORD" ? "default" : "ghost"}
                className={
                  tab === "RECORD"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                    : ""
                }
                size="sm"
                onClick={() => setTab("RECORD")}
              >
                <Plus className="w-4 h-4 mr-2" /> Record Expense
              </Button>
              <Button
                variant={tab === "HISTORY" ? "default" : "ghost"}
                className={
                  tab === "HISTORY"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                    : ""
                }
                size="sm"
                onClick={() => setTab("HISTORY")}
              >
                <History className="w-4 h-4 mr-2" /> My History
              </Button>
            </div>

            {tab === "RECORD" ? (
              <Card className="border-muted/20 shadow-none bg-muted/10">
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Category *
                      </Label>
                      <Select
                        value={form.categoryId || ""}
                        onValueChange={(val) =>
                          setForm({
                            ...form,
                            categoryId: val || "",
                            payeeId: "",
                          })
                        }
                      >
                        <SelectTrigger className="w-full p-6 h-11 bg-background border-muted/30 rounded-xl px-3 flex items-center">
                          <SelectValue placeholder="Select category">
                            {form.categoryId
                              ? categories.find(
                                  (c) => c.id?.toString() === form.categoryId,
                                )?.categoryName
                              : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem
                              key={c.id}
                              value={c.id?.toString() || ""}
                            >
                              {c.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Payee *
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={form.payeeId || ""}
                          onValueChange={(val) =>
                            setForm({ ...form, payeeId: val || "" })
                          }
                        >
                          <SelectTrigger className="w-full h-11 p-6 bg-background border-muted/30 rounded-xl px-3 flex items-center">
                            <SelectValue placeholder="Select payee">
                              {form.payeeId
                                ? getFilteredPayees(form.categoryId).find(
                                    (p) => p.id?.toString() === form.payeeId,
                                  )?.name
                                : null}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {getFilteredPayees(form.categoryId).map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id?.toString() || ""}
                              >
                                {p.name} ({p.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "icon",
                              }),
                              "h-11 w-11 shrink-0 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/40",
                            )}
                            onClick={() => setShowPayeeDialog(true)}
                          >
                            <Plus className="w-5 h-5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Quick Add Payee</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Amount (Rs.) *
                      </Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-11 bg-background border-muted/30"
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Paid By *
                      </Label>
                      <Input
                        readOnly
                        placeholder="e.g. Cash Drawer"
                        className="h-11 bg-background border-muted/30"
                        value={form.paidBy}
                        onChange={(e) =>
                          setForm({ ...form, paidBy: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Note (Optional)
                    </Label>
                    <Input
                      placeholder="Add any additional details..."
                      className="h-11 bg-background border-muted/30"
                      value={form.note}
                      onChange={(e) =>
                        setForm({ ...form, note: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/20 mt-2"
                    onClick={handleRecord}
                    disabled={recordMutation.isPending}
                  >
                    {recordMutation.isPending
                      ? "Recording..."
                      : "Verify & Record Expense"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search history..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 w-full max-w-sm h-10 rounded-xl border-muted/20 bg-background/50"
                  />
                </div>

                {historyLoading ? (
                  <div className="py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Card className="border shadow-none sm:rounded-xl min-w-0 w-full overflow-hidden bg-background">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto w-full max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                          <TableRow className="hover:bg-transparent text-[11px] uppercase tracking-wider font-bold">
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Payee</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHistory.length > 0 ? (
                            filteredHistory.map((e) => (
                              <TableRow
                                key={e.id}
                                className="hover:bg-muted/5 group border-muted/10"
                              >
                                <TableCell className="text-xs font-medium">
                                  <div className="flex items-center gap-1">
                                    {formatDate(e.expenseDate || "")}
                                    {e.lastEditReason && (
                                      <Badge
                                        variant="secondary"
                                        className="scale-75 origin-left bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0 cursor-pointer hover:bg-amber-500/20"
                                        onClick={() => setViewAuditItem(e)}
                                      >
                                        Edited
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs font-semibold">
                                  {e.categoryName || "-"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {e.payeeName || "-"}
                                </TableCell>
                                <TableCell className="text-right font-bold text-emerald-600 text-xs">
                                  {formatCurrency(e.amount ?? undefined)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    {isEditable(e.expenseDate || undefined) && (
                                      <>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8 rounded-lg border-blue-500/30 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-600 transition-all active:scale-90"
                                          onClick={() => {
                                            setEditItem(e);
                                            setEditForm({
                                              categoryId:
                                                e.categoryId?.toString() || "",
                                              payeeId:
                                                e.payeeId?.toString() || "",
                                              amount:
                                                e.amount?.toString() || "",
                                              paidBy: e.paidBy || "",
                                              note: e.note || "",
                                              editReason: "",
                                              editNote: "",
                                            });
                                          }}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        {/* <Button
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8 rounded-lg border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all active:scale-90"
                                          onClick={() => handleDelete(e.id!)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button> */}
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="h-32 text-center text-muted-foreground italic"
                              >
                                <History className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                No matching records found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden divide-y divide-muted/10 w-full">
                      {filteredHistory.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground bg-muted/5">
                          <History className="w-8 h-8 opacity-20 mx-auto mb-2" />
                          <p className="text-sm">No expenses recorded yet.</p>
                        </div>
                      ) : (
                        filteredHistory.map((e) => (
                          <div
                            key={e.id}
                            className="p-4 space-y-3 bg-card hover:bg-muted/5 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                                  <Wallet className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm truncate">
                                      {e.categoryName || "-"}
                                    </p>
                                    {e.lastEditReason && (
                                      <Badge
                                        variant="secondary"
                                        className="scale-75 origin-left bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0 h-4 cursor-pointer hover:bg-amber-500/20"
                                        onClick={() => setViewAuditItem(e)}
                                      >
                                        Edited
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">
                                    {formatDate(e.expenseDate || "")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                                  {formatCurrency(e.amount ?? undefined)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-[11px] text-muted-foreground">
                                <span className="font-medium">Payee:</span>{" "}
                                {e.payeeName || "-"}
                              </div>

                              {isEditable(e.expenseDate || undefined) && (
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 rounded-xl border-blue-500/30 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 active:scale-95 transition-all shadow-sm shadow-blue-500/5"
                                    onClick={() => {
                                      setEditItem(e);
                                      setEditForm({
                                        categoryId:
                                          e.categoryId?.toString() || "",
                                        payeeId: e.payeeId?.toString() || "",
                                        amount: e.amount?.toString() || "",
                                        paidBy: e.paidBy || "",
                                        note: e.note || "",
                                        editReason: "",
                                        editNote: "",
                                      });
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  {/* <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 rounded-xl border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive/50 active:scale-95 transition-all shadow-sm shadow-destructive/5"
                                    onClick={() => handleDelete(e.id!)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button> */}
                                </div>
                              )}
                            </div>

                            {e.note && (
                              <div className="text-[11px] text-muted-foreground italic bg-muted/30 p-2 rounded-lg border border-muted/20">
                                <p className="leading-tight line-clamp-2">
                                  Note: {e.note}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
      >
        <DialogContent className="w-[92vw] sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-500" /> Edit Record
            </DialogTitle>
            <DialogDescription>
              Correction must be made before today&apos;s cutoff.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={editForm.categoryId || ""}
                  onValueChange={(val) =>
                    setEditForm({
                      ...editForm,
                      categoryId: val || "",
                      payeeId: "",
                    })
                  }
                >
                  <SelectTrigger className="w-full h-10 text-xs">
                    <SelectValue placeholder="Select category">
                      {editForm.categoryId
                        ? categories.find(
                            (c) => c.id?.toString() === editForm.categoryId,
                          )?.categoryName
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id?.toString() || ""}>
                        {c.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Payee
                </Label>
                <Select
                  value={editForm.payeeId || ""}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, payeeId: val || "" })
                  }
                >
                  <SelectTrigger className="w-full h-10 text-xs text-left">
                    <SelectValue placeholder="Select payee">
                      {editForm.payeeId
                        ? getFilteredPayees(editForm.categoryId).find(
                            (p) => p.id?.toString() === editForm.payeeId,
                          )?.name
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredPayees(editForm.categoryId).map((p) => (
                      <SelectItem key={p.id} value={p.id?.toString() || ""}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                Amount (Rs.)
              </Label>
              <Input
                type="number"
                className="h-10"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2 border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-tight font-medium">
                  Financial auditing is active. Please provide a valid reason
                  for this modification.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-amber-900">
                  Reason for Change *
                </Label>
                <Select
                  value={editForm.editReason || ""}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, editReason: val || "" })
                  }
                >
                  <SelectTrigger className="h-10 border-amber-200 focus:ring-amber-500/20">
                    <SelectValue placeholder="Why is this being edited?" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editForm.editReason === "Special Reason" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-[11px] font-bold text-amber-900">
                    Specify Reason *
                  </Label>
                  <Input
                    placeholder="Enter details..."
                    className="h-10 border-amber-200"
                    value={editForm.editNote}
                    onChange={(e) =>
                      setEditForm({ ...editForm, editNote: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-500/20 mt-2"
              onClick={() => setEditItem(null)}
            >
              Cancel
            </Button>
            <Button
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 mt-2"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              <Pencil className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Verify & Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Detail Dialog */}
      <Dialog
        open={!!viewAuditItem}
        onOpenChange={(v) => !v && setViewAuditItem(null)}
      >
        <DialogContent className="w-[92vw] sm:max-w-sm rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-amber-500/10 p-6 flex flex-col items-center gap-3 text-center border-b border-amber-500/10">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-amber-900">
                Modification Details
              </DialogTitle>
              <DialogDescription className="text-amber-700/70 text-xs">
                Audit trail for record manual adjustment
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reason for Change
                </span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-none px-2 py-0.5 text-[11px] font-bold">
                    {viewAuditItem?.lastEditReason}
                  </Badge>
                </div>
              </div>

              {viewAuditItem?.lastEditNote && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/30 border border-muted/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Additional Note
                  </span>
                  <p className="text-xs text-foreground italic leading-relaxed">
                    &ldquo;{viewAuditItem.lastEditNote}&rdquo;
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-muted/10 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {viewAuditItem?.lastAmount !== undefined &&
                    viewAuditItem?.lastAmount !== null &&
                    viewAuditItem?.lastAmount !== viewAuditItem?.amount
                      ? "Corrected Amount"
                      : "Amount"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-emerald-600">
                      {formatCurrency(viewAuditItem?.amount ?? 0)}
                    </span>
                    {viewAuditItem?.lastAmount !== undefined &&
                      viewAuditItem?.lastAmount !== null &&
                      viewAuditItem?.lastAmount !== viewAuditItem?.amount && (
                        <span className="text-[10px] text-amber-700 font-bold line-through opacity-70">
                          Original: {formatCurrency(viewAuditItem.lastAmount)}
                        </span>
                      )}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Adjusted Date
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(viewAuditItem?.expenseDate || undefined)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-500/20"
              onClick={() => setViewAuditItem(null)}
            >
              Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PayeeRegistrationDialog
        open={showPayeeDialog}
        onOpenChange={setShowPayeeDialog}
        onSuccess={handleAddPayeeSuccess}
      />
    </>
  );
}
