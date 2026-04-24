"use client";

import { useMemo, useState } from "react";
import {
  useGetServiceCommissionsByService,
  useGetServiceCommissionsByEmployee,
  useCreateServiceCommission,
  useDeleteServiceCommission,
} from "@/api/generated/endpoints/service-commissions/service-commissions";
import { useGetAllServices } from "@/api/generated/endpoints/service-packages/service-packages";
import { useGetAllEmployees } from "@/api/generated/endpoints/employee-management/employee-management";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Percent, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  ServiceResponse,
  EmployeeResponse,
  CreateServiceCommissionRequest,
} from "@/api/generated/model";

interface ServiceCommissionManagerProps {
  serviceId?: number;
  employeeId?: number;
  title: string;
  servicePrice?: number;
}

export const COMMISSION_TYPES = {
  PERCENTAGE: "PERCENTAGE",
  FIXED_AMOUNT: "FIXED_AMOUNT",
} as const;

type CommissionType = (typeof COMMISSION_TYPES)[keyof typeof COMMISSION_TYPES];

interface OverrideState {
  targetId: string;
  commissionType: CommissionType;
  employeeValue: string;
  ownerValue: string;
}

export function ServiceCommissionManager({
  serviceId,
  employeeId,
  servicePrice,
}: ServiceCommissionManagerProps) {
  const queryClient = useQueryClient();

  // Fetch overrides based on context
  const serviceOverrides = useGetServiceCommissionsByService(serviceId!, {
    query: { enabled: !!serviceId },
  });
  const employeeOverrides = useGetServiceCommissionsByEmployee(employeeId!, {
    query: { enabled: !!employeeId },
  });

  const overrides = serviceId
    ? serviceOverrides.data?.data || []
    : employeeOverrides.data?.data || [];

  const isLoading = serviceId
    ? serviceOverrides.isLoading
    : employeeOverrides.isLoading;

  const allServices = useGetAllServices({ query: { enabled: !!employeeId } });
  const allEmployees = useGetAllEmployees({ query: { enabled: !!serviceId } });

  const createMutation = useCreateServiceCommission();
  const deleteMutation = useDeleteServiceCommission();

  const [newOverride, setNewOverride] = useState<OverrideState>({
    targetId: "",
    commissionType: COMMISSION_TYPES.PERCENTAGE,
    employeeValue: "50",
    ownerValue: "50",
  });

  const selectedEmployee = useMemo(
    () =>
      (allEmployees.data?.data as EmployeeResponse[])?.find(
        (e) => e.id?.toString() === newOverride.targetId,
      ),
    [allEmployees.data, newOverride.targetId],
  );

  const selectedService = useMemo(
    () =>
      (allServices.data?.data as ServiceResponse[])?.find(
        (s) => s.id?.toString() === newOverride.targetId,
      ),
    [allServices.data, newOverride.targetId],
  );

  const handleAdd = () => {
    if (!newOverride.targetId) {
      toast.error("Please select a target");
      return;
    }

    const payload: CreateServiceCommissionRequest = {
      employeeId: employeeId || parseInt(newOverride.targetId),
      serviceId: serviceId || parseInt(newOverride.targetId),
      commissionType: newOverride.commissionType,
    };

    if (newOverride.commissionType === "PERCENTAGE") {
      payload.employeePercent = parseFloat(newOverride.employeeValue);
      payload.ownerPercent = parseFloat(newOverride.ownerValue);
    } else {
      payload.employeeFixedAmount = parseFloat(newOverride.employeeValue);
      payload.ownerFixedAmount = parseFloat(newOverride.ownerValue);
    }

    createMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast.success("Commission override added");
          queryClient.invalidateQueries();
          setNewOverride((prev) => ({
            ...prev,
            targetId: "",
            employeeValue: "50",
            ownerValue: "50",
            commissionType: COMMISSION_TYPES.PERCENTAGE,
          }));
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to add override");
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Override removed");
          queryClient.invalidateQueries();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Override
          </h4>
          {(servicePrice || selectedService?.price) && (
            <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-[11px] font-bold">
              Service Price: Rs.{" "}
              {(servicePrice || selectedService?.price)?.toLocaleString()}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">
              {serviceId ? "Select Employee" : "Select Service"}
            </Label>
            <Select
              value={newOverride.targetId}
              onValueChange={(v) => {
                const targetId = v || "";
                const updates: Partial<OverrideState> = { targetId };
                
                // If we are in Employee context (selecting services)
                // and commission type is FIXED_AMOUNT, auto-calculate 50/50 of the selected service's price
                if (employeeId && newOverride.commissionType === COMMISSION_TYPES.FIXED_AMOUNT) {
                  const service = (allServices.data?.data as ServiceResponse[])?.find(
                    (s) => s.id?.toString() === targetId
                  );
                  if (service?.price) {
                    const half = service.price / 2;
                    updates.employeeValue = half.toString();
                    updates.ownerValue = half.toString();
                  }
                }
                
                setNewOverride({ ...newOverride, ...updates });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={serviceId ? "Select Employee" : "Select Service"}
                >
                  {serviceId
                    ? selectedEmployee?.fullName
                    : selectedService
                      ? `${selectedService.serviceName} (Rs.${selectedService.price})`
                      : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {serviceId
                  ? (allEmployees.data?.data as EmployeeResponse[])?.map(
                      (e) => (
                        <SelectItem key={e.id} value={e.id!.toString()}>
                          {e.fullName || "Unnamed Employee"}
                        </SelectItem>
                      ),
                    )
                  : (allServices.data?.data as ServiceResponse[])?.map((s) => (
                      <SelectItem key={s.id} value={s.id!.toString()}>
                        {s.serviceName} (Rs.{s.price})
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Commission Type</Label>
            <Select
              value={newOverride.commissionType}
              onValueChange={(v: string | null) => {
                const newType =
                  (v as CommissionType) || COMMISSION_TYPES.PERCENTAGE;
                const updates: Partial<OverrideState> = {
                  commissionType: newType,
                };

                const price = servicePrice || selectedService?.price || 0;

                if (newType === COMMISSION_TYPES.FIXED_AMOUNT && price > 0) {
                  const half = price / 2;
                  updates.employeeValue = half.toString();
                  updates.ownerValue = half.toString();
                } else if (newType === COMMISSION_TYPES.PERCENTAGE) {
                  updates.employeeValue = "50";
                  updates.ownerValue = "50";
                }

                setNewOverride({ ...newOverride, ...updates });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {newOverride.commissionType === COMMISSION_TYPES.PERCENTAGE
                    ? "Percentage (%)"
                    : "Fixed Amount (Rs.)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={COMMISSION_TYPES.PERCENTAGE}>
                  <div className="flex items-center gap-2">
                    <Percent className="w-3.5 h-3.5 text-blue-500" />
                    <span>Percentage (%)</span>
                  </div>
                </SelectItem>
                <SelectItem value={COMMISSION_TYPES.FIXED_AMOUNT}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fixed Amount (Rs.)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              Employee{" "}
              {newOverride.commissionType === "PERCENTAGE" ? "%" : "Amount"}
            </Label>
            <Input
              type="number"
              value={newOverride.employeeValue}
              onChange={(e) =>
                setNewOverride({
                  ...newOverride,
                  employeeValue: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              Owner{" "}
              {newOverride.commissionType === "PERCENTAGE" ? "%" : "Amount"}
            </Label>
            <Input
              type="number"
              value={newOverride.ownerValue}
              onChange={(e) =>
                setNewOverride({ ...newOverride, ownerValue: e.target.value })
              }
            />
            {newOverride.commissionType === COMMISSION_TYPES.FIXED_AMOUNT &&
              (servicePrice || selectedService?.price) && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Remaining: Rs.{" "}
                  {(
                    (servicePrice || selectedService?.price || 0) -
                    parseFloat(newOverride.employeeValue || "0") -
                    parseFloat(newOverride.ownerValue || "0")
                  ).toLocaleString()}
                </p>
              )}
          </div>
        </div>
        <Button
          className="w-full"
          onClick={handleAdd}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Add Override
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Active Overrides</h4>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : overrides.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">
            No custom commissions set for this{" "}
            {serviceId ? "service" : "employee"}.
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{serviceId ? "Employee" : "Service"}</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.map((ov) => (
                  <TableRow key={ov.id}>
                    <TableCell className="font-medium text-xs">
                      {serviceId ? ov.employeeName : ov.serviceName}
                    </TableCell>
                    <TableCell>
                      {ov.commissionType === "PERCENTAGE" ? (
                        <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full w-fit">
                          <Percent className="w-2.5 h-2.5" /> Percent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full w-fit">
                          <DollarSign className="w-2.5 h-2.5" /> Fixed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {ov.commissionType === "PERCENTAGE"
                        ? `${ov.employeePercent}%`
                        : `Rs.${ov.employeeFixedAmount}`}
                    </TableCell>
                    <TableCell className="text-xs">
                      {ov.commissionType === "PERCENTAGE"
                        ? `${ov.ownerPercent}%`
                        : `Rs.${ov.ownerFixedAmount}`}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => ov.id && handleDelete(ov.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
