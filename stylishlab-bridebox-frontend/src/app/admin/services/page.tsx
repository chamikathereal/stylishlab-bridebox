"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll,
  useCreate,
  useUpdate,
  useToggleStatus,
} from "@/api/generated/endpoints/service-packages/service-packages";
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
  Scissors,
  Pencil,
  ToggleLeft,
  ToggleRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ServiceResponse } from "@/api/generated/model";

export default function ServicesPage() {
  const { data: res, isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const toggleMutation = useToggleStatus();
  const queryClient = useQueryClient();
  const services = (res?.data ?? []) as ServiceResponse[];

  const [form, setForm] = useState({
    serviceName: "",
    price: "",
    description: "",
  });
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [editingService, setEditingService] = useState<ServiceResponse | null>(
    null,
  );

  const resetForm = () => {
    setForm({ serviceName: "", price: "", description: "" });
    setEditingService(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (svc: ServiceResponse) => {
    setEditingService(svc);
    setForm({
      serviceName: svc.serviceName || "",
      price: svc.price?.toString() || "",
      description: svc.description || "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.serviceName || !form.price) {
      toast.error("Name and price required");
      return;
    }

    const data = {
      serviceName: form.serviceName,
      price: parseFloat(form.price),
      description: form.description || undefined,
    };

    if (editingService?.id) {
      updateMutation.mutate(
        { id: editingService.id, data },
        {
          onSuccess: () => {
            toast.success("Service updated!");
            queryClient.invalidateQueries();
            setOpen(false);
            resetForm();
          },
          onError: () => toast.error("Failed to update service"),
        },
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast.success("Service created!");
            queryClient.invalidateQueries();
            setOpen(false);
            resetForm();
          },
          onError: () => toast.error("Failed to create service"),
        },
      );
    }
  };

  const handleToggle = (id: number) => {
    toggleMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Status toggled");
          queryClient.invalidateQueries();
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Service Packages"
        description={`${services.length} services configured`}
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
            <Plus className="w-4 h-4" /> Add Service
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
              {editingService
                ? "Update Service Package"
                : "New Service Package"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-3">Service Name *</Label>
              <Input
                value={form.serviceName}
                onChange={(e) =>
                  setForm({ ...form, serviceName: e.target.value })
                }
                placeholder="e.g. Haircut"
              />
            </div>
            <div>
              <Label className="mb-3">Price (Rs.) *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="350"
              />
            </div>
            <div>
              <Label className="mb-3">Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description"
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
              {editingService ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((svc) => (
            <Card key={svc.id} className="glass-card-hover group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Scissors className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant={svc.isActive ? "default" : "secondary"}>
                    {svc.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{svc.serviceName}</h3>
                {svc.description && (
                  <p className="text-xs text-muted-foreground mb-3">
                    {svc.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-bold gradient-text">
                    Rs. {svc.price?.toLocaleString()}
                  </span>
                  <div className="flex gap-1 items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleOpenEdit(svc)}
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleToggle(svc.id!)}
                    >
                      {svc.isActive ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card shadow-sm border-muted/20 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 pl-6"></TableHead>
                  <TableHead className="px-4">Service Name</TableHead>
                  <TableHead className="px-4">Description</TableHead>
                  <TableHead className="text-right px-4">Price</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="pl-6">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-primary" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium px-4">
                      {svc.serviceName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate px-4">
                      {svc.description || "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold px-4">
                      Rs. {svc.price?.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant={svc.isActive ? "default" : "secondary"}>
                        {svc.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex gap-1 justify-end items-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleOpenEdit(svc)}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleToggle(svc.id!)}
                        >
                          {svc.isActive ? (
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
