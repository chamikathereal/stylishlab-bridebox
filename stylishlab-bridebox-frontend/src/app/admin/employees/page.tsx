"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll4,
  useCreate3,
  useToggleStatus2,
  useUpdateCommission,
} from "@/api/generated/endpoints/employee-management/employee-management";
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
  Plus,
  UserCheck,
  UserX,
  Percent,
  Phone,
  BarChart3,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  EmployeeResponse,
  EmployeeEarningsResponse,
} from "@/api/generated/model";
import { useEmployeeEarnings } from "@/api/generated/endpoints/reports-analytics/reports-analytics";

export default function EmployeesPage() {
  const { data: res, isLoading } = useGetAll4();
  const createMutation = useCreate3();
  const toggleMutation = useToggleStatus2();
  const commissionMutation = useUpdateCommission();
  const queryClient = useQueryClient();
  const employees = (res?.data ?? []) as EmployeeResponse[];

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    username: "",
    password: "",
    employeePercent: "50",
    ownerPercent: "50",
  });
  const [commForm, setCommForm] = useState({
    employeePercent: "",
    ownerPercent: "",
  });
  const [commEmployeeId, setCommEmployeeId] = useState<number | null>(null);
  const [perfEmployeeId, setPerfEmployeeId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const { data: perfRes, isLoading: perfLoading } = useEmployeeEarnings(
    perfEmployeeId as number,
    { query: { enabled: !!perfEmployeeId } },
  );
  const performance = perfRes?.data as EmployeeEarningsResponse | undefined;

  const handleCreate = () => {
    const ep = parseFloat(form.employeePercent);
    const op = parseFloat(form.ownerPercent);
    if (!form.fullName || !form.username || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (ep + op !== 100) {
      toast.error("Commission percentages must total 100%");
      return;
    }
    createMutation.mutate(
      {
        data: {
          fullName: form.fullName,
          mobile: form.mobile,
          username: form.username,
          password: form.password,
          employeePercent: ep,
          ownerPercent: op,
        },
      },
      {
        onSuccess: () => {
          toast.success("Employee created!");
          queryClient.invalidateQueries();
          setOpen(false);
          setForm({
            fullName: "",
            mobile: "",
            username: "",
            password: "",
            employeePercent: "50",
            ownerPercent: "50",
          });
        },
        onError: () => toast.error("Failed to create employee"),
      },
    );
  };

  const handleToggle = (id: number) => {
    toggleMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Status updated");
          queryClient.invalidateQueries();
        },
      },
    );
  };

  const handleCommission = () => {
    if (!commEmployeeId) return;
    const ep = parseFloat(commForm.employeePercent);
    const op = parseFloat(commForm.ownerPercent);
    if (ep + op !== 100) {
      toast.error("Must total 100%");
      return;
    }
    commissionMutation.mutate(
      { id: commEmployeeId, data: { employeePercent: ep, ownerPercent: op } },
      {
        onSuccess: () => {
          toast.success("Commission updated");
          queryClient.invalidateQueries();
          setCommEmployeeId(null);
        },
        onError: () => toast.error("Failed to update commission"),
      },
    );
  };

  function formatCurrency(val?: number) {
    return `Rs. ${(val ?? 0).toLocaleString()}`;
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${employees.length} team members`}
      >
        <Button
          className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </PageHeader>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>
            <div>
              <Label>Username *</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee %</Label>
                <Input
                  type="number"
                  value={form.employeePercent}
                  onChange={(e) =>
                    setForm({ ...form, employeePercent: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Owner %</Label>
                <Input
                  type="number"
                  value={form.ownerPercent}
                  onChange={(e) =>
                    setForm({ ...form, ownerPercent: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <Card key={emp.id} className="glass-card-hover border-teal-500/10">
            <CardContent className="px-5 py-2">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 font-bold">
                    {emp.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{emp.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      @{emp.username}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={emp.status === "ACTIVE" ? "default" : "secondary"}
                  className={
                    emp.status === "ACTIVE"
                      ? "bg-teal-500/20 text-teal-600 border-none"
                      : ""
                  }
                >
                  {emp.status}
                </Badge>
              </div>
              {emp.mobile && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Phone className="w-3 h-3" /> {emp.mobile}
                </div>
              )}
              <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted/30">
                <Percent className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-xs">
                  Employee: <strong>{emp.currentEmployeePercent}%</strong>
                </span>
                <span className="text-xs text-muted-foreground">
                  | Owner: <strong>{emp.currentOwnerPercent}%</strong>
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleToggle(emp.id!)}
                  >
                    {emp.status === "ACTIVE" ? (
                      <>
                        <UserX className="w-3 h-3 mr-1" /> Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" /> Activate
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setCommEmployeeId(emp.id!);
                      setCommForm({
                        employeePercent: String(
                          emp.currentEmployeePercent ?? 50,
                        ),
                        ownerPercent: String(emp.currentOwnerPercent ?? 50),
                      });
                    }}
                  >
                    <Percent className="w-3 h-3 mr-1" /> Commission
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="w-full text-xs gap-2 bg-linear-to-r mt-4 from-teal-600/10 to-emerald-600/10 text-blue-200 hover:text-white"
                  onClick={() => setPerfEmployeeId(emp.id!)}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> View Business
                  Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission Dialog */}
      <Dialog
        open={!!commEmployeeId}
        onOpenChange={(o) => {
          if (!o) setCommEmployeeId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Commission</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Employee %</Label>
              <Input
                type="number"
                value={commForm.employeePercent}
                onChange={(e) =>
                  setCommForm({ ...commForm, employeePercent: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Owner %</Label>
              <Input
                type="number"
                value={commForm.ownerPercent}
                onChange={(e) =>
                  setCommForm({ ...commForm, ownerPercent: e.target.value })
                }
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Note: Old sales will keep their original commission values.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommEmployeeId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleCommission}
              disabled={commissionMutation.isPending}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog
        open={!!perfEmployeeId}
        onOpenChange={(o) => {
          if (!o) setPerfEmployeeId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Business Performance: {performance?.employeeName}
            </DialogTitle>
          </DialogHeader>

          {perfLoading ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <PerformanceCard
                  title="Today"
                  amount={performance?.todayEarnings}
                  services={performance?.todayServices}
                />
                <PerformanceCard
                  title="This Week"
                  amount={performance?.weekEarnings}
                  services={performance?.weekServices}
                />
                <PerformanceCard
                  title="This Month"
                  amount={performance?.monthEarnings}
                  services={performance?.monthServices}
                />
                <PerformanceCard
                  title="This Year"
                  amount={performance?.yearEarnings}
                  services={performance?.yearServices}
                />
              </div>
              <p className="text-[10px] text-center text-muted-foreground">
                Amounts shown are total business generated by this employee.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setPerfEmployeeId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PerformanceCard({
  title,
  amount,
  services,
}: {
  title: string;
  amount?: number;
  services?: number;
}) {
  return (
    <div className="p-3 rounded-xl bg-muted/30 border border-muted flex flex-col gap-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {title}
      </p>
      <p className="text-sm font-bold text-teal-600">
        Rs. {(amount ?? 0).toLocaleString()}
      </p>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
        <DollarSign className="w-2.5 h-2.5" />
        {services ?? 0} services
      </div>
    </div>
  );
}
