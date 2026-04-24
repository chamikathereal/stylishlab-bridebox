"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAllServices,
  useCreateService,
  useUpdateService,
  useToggleServiceStatus,
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
import { ServiceCommissionManager } from "@/components/admin/ServiceCommissionManager";
import { PercentCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ServicesPage() {
  const { data: res, isLoading } = useGetAllServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const toggleMutation = useToggleServiceStatus();
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
  const [commissionTarget, setCommissionTarget] =
    useState<ServiceResponse | null>(null);

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
            <Card
              key={svc.id}
              className="glass-card-hover border-teal-500/10 overflow-hidden"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight">
                        {svc.serviceName}
                      </h3>
                      <Badge
                        variant={svc.isActive ? "default" : "secondary"}
                        className={cn(
                          "mt-1 text-[10px] h-4 px-1.5",
                          svc.isActive
                            ? "bg-teal-500/10 text-teal-600 border-none"
                            : "",
                        )}
                      >
                        {svc.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-teal-500/10"
                    onClick={() => svc.id && handleToggle(svc.id)}
                    title={svc.isActive ? "Deactivate" : "Activate"}
                  >
                    {svc.isActive ? (
                      <ToggleRight className="w-5 h-5 text-teal-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                <div className="mb-5">
                  <span className="text-2xl font-bold text-teal-500">
                    Rs. {svc.price?.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-9 border-teal-500/20 hover:bg-teal-500/5 font-medium"
                    onClick={() => handleOpenEdit(svc)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Service Details
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs h-9 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-none font-medium"
                    onClick={() => setCommissionTarget(svc)}
                  >
                    <PercentCircle className="w-3.5 h-3.5 mr-2" /> Manage Commissions
                  </Button>
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
                          title="Manage Commissions"
                          className="h-8 w-8 rounded-full text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          onClick={() => setCommissionTarget(svc)}
                        >
                          <PercentCircle className="w-4 h-4" />
                        </Button>
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
      <Dialog
        open={!!commissionTarget}
        onOpenChange={(o) => !o && setCommissionTarget(null)}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Manage Employee Commissions: {commissionTarget?.serviceName}
            </DialogTitle>
          </DialogHeader>
          {commissionTarget?.id && (
            <ServiceCommissionManager
              serviceId={commissionTarget.id}
              title={commissionTarget.serviceName || ""}
              servicePrice={commissionTarget.price}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
