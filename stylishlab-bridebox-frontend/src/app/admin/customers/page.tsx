"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll5,
  useCreate4,
  useUpdate4,
  useSearch,
} from "@/api/generated/endpoints/customer-management/customer-management";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Plus,
  Search,
  User,
  Phone,
  Pencil,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerResponse } from "@/api/generated/model";

export default function CustomersPage() {
  const [searchName, setSearchName] = useState("");
  const { data: allRes, isLoading } = useGetAll5();
  const { data: searchRes } = useSearch(
    { name: searchName },
    { query: { enabled: searchName.length > 1 } },
  );
  const createMutation = useCreate4();
  const updateMutation = useUpdate4();
  const queryClient = useQueryClient();

  const customers = (
    searchName.length > 1 ? (searchRes?.data ?? []) : (allRes?.data ?? [])
  ) as CustomerResponse[];
  const [form, setForm] = useState({ customerName: "", mobile: "", notes: "" });
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerResponse | null>(null);

  const resetForm = () => {
    setForm({ customerName: "", mobile: "", notes: "" });
    setEditingCustomer(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (customer: CustomerResponse) => {
    setEditingCustomer(customer);
    setForm({
      customerName: customer.customerName || "",
      mobile: customer.mobile || "",
      notes: customer.notes || "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.customerName) {
      toast.error("Customer name required");
      return;
    }

    const data = {
      customerName: form.customerName,
      mobile: form.mobile || undefined,
      notes: form.notes || undefined,
    };

    if (editingCustomer?.id) {
      updateMutation.mutate(
        { id: editingCustomer.id, data },
        {
          onSuccess: () => {
            toast.success("Customer updated!");
            queryClient.invalidateQueries();
            setOpen(false);
            resetForm();
          },
          onError: () => toast.error("Failed to update customer"),
        },
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast.success("Customer created!");
            queryClient.invalidateQueries();
            setOpen(false);
            resetForm();
          },
          onError: () => toast.error("Failed to create customer"),
        },
      );
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${allRes?.data?.length ?? 0} registered customers`}
      >
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/50 p-1 rounded-lg mr-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("table")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button
            className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white"
            onClick={handleOpenNew}
          >
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        </div>
      </PageHeader>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Update Customer Details" : "New Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Name *</Label>
              <Input
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-2">Mobile (optional)</Label>
              <Input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-2">Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingCustomer ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <Card key={c.id} className="glass-card-hover">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {c.customerName}
                      </p>
                      {c.mobile && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {c.mobile}
                        </p>
                      )}
                      {c.notes && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {c.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full shrink-0"
                    onClick={() => handleOpenEdit(c)}
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {customers.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No customers found</p>
            </div>
          )}
        </>
      ) : (
        <Card className="glass-card shadow-sm border-muted/20 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 pl-6"></TableHead>
                  <TableHead className="px-4">Customer Name</TableHead>
                  <TableHead className="px-4">Mobile</TableHead>
                  <TableHead className="px-4">Notes</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        <User className="w-4 h-4" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium px-4">
                      {c.customerName}
                    </TableCell>
                    <TableCell className="text-sm px-4">
                      {c.mobile || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate px-4">
                      {c.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleOpenEdit(c)}
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-muted-foreground"
                    >
                      <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No customers found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
