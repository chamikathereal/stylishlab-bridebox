"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/shared/StatCard";
import { cn, getLocalDateString } from "@/lib/utils";
import {
  useGetAll4,
  useCreate3,
  useToggleStatus2,
  useUpdateCommission,
  useUpdate3,
  useResetPassword1,
} from "@/api/generated/endpoints/employee-management/employee-management";
import {
  useEmployeeEarnings,
  useDaily,
  useWeekly,
  useMonthly,
  useYearly,
  useTotal,
} from "@/api/generated/endpoints/reports-analytics/reports-analytics";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  UserCheck,
  UserX,
  Percent,
  Phone,
  BarChart3,
  TrendingUp,
  DollarSign,
  LayoutGrid,
  List,
  Target,
  Users,
  Zap,
  Calendar,
  RotateCcw,
  EyeOff,
  Eye,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  EmployeeResponse,
  EmployeeEarningsResponse,
} from "@/api/generated/model";

export default function EmployeesPage() {
  const { data: res, isLoading } = useGetAll4();
  const createMutation = useCreate3();
  const toggleMutation = useToggleStatus2();
  const updateDetailsMutation = useUpdate3();
  const updateCommissionMutation = useUpdateCommission();
  const resetPasswordMutation = useResetPassword1();
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
  // Unified Edit State
  const [editEmployee, setEditEmployee] = useState<EmployeeResponse | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    fullName: "",
    mobile: "",
    employeePercent: "",
    ownerPercent: "",
  });

  const [perfEmployeeId, setPerfEmployeeId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");

  // KPI States
  const [kpiEmployeeId, setKpiEmployeeId] = useState<string>("all");
  const [kpiPeriod, setKpiPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "total"
  >("monthly");
  const [resetPassEmployee, setResetPassEmployee] =
    useState<EmployeeResponse | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const today = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);

  // Computed Date Parts
  const selectedMonth = selectedDate.substring(0, 7);
  const selectedYear = parseInt(selectedDate.substring(0, 4));

  // Aggregated Queries
  const dailyQuery = useDaily(
    { date: selectedDate },
    { query: { enabled: kpiEmployeeId === "all" && kpiPeriod === "daily" } },
  );
  const weeklyQuery = useWeekly(
    { date: selectedDate },
    { query: { enabled: kpiEmployeeId === "all" && kpiPeriod === "weekly" } },
  );
  const monthlyQuery = useMonthly(
    { yearMonth: selectedMonth },
    { query: { enabled: kpiEmployeeId === "all" && kpiPeriod === "monthly" } },
  );
  const yearlyQuery = useYearly(
    { year: selectedYear },
    { query: { enabled: kpiEmployeeId === "all" && kpiPeriod === "yearly" } },
  );
  const totalQuery = useTotal({
    query: { enabled: kpiEmployeeId === "all" && kpiPeriod === "total" },
  });

  // Individual Query
  const individualQuery = useEmployeeEarnings(
    kpiEmployeeId === "all" ? 0 : parseInt(kpiEmployeeId),
    { date: selectedDate },
    { query: { enabled: kpiEmployeeId !== "all" } },
  );

  // KPI Data Resolution
  const getKpiData = () => {
    if (kpiEmployeeId === "all") {
      const source =
        kpiPeriod === "daily"
          ? dailyQuery.data
          : kpiPeriod === "weekly"
            ? weeklyQuery.data
            : kpiPeriod === "monthly"
              ? monthlyQuery.data
              : kpiPeriod === "yearly"
                ? yearlyQuery.data
                : totalQuery.data;

      const d = source?.data;
      return {
        sales: d?.totalSales ?? 0,
        services: d?.totalTransactions ?? 0,
        commission: d?.employeeCommissions ?? 0,
        efficiency: (d?.totalSales ?? 0) / (d?.totalTransactions || 1),
      };
    } else {
      const d = individualQuery.data?.data;
      const earnings =
        kpiPeriod === "daily"
          ? d?.todayEarnings
          : kpiPeriod === "weekly"
            ? d?.weekEarnings
            : kpiPeriod === "monthly"
              ? d?.monthEarnings
              : d?.yearEarnings; // No "total" for individual in this hook

      const services =
        kpiPeriod === "daily"
          ? d?.todayServices
          : kpiPeriod === "weekly"
            ? d?.weekServices
            : kpiPeriod === "monthly"
              ? d?.monthServices
              : d?.yearServices;

      return {
        sales: earnings ?? 0,
        services: services ?? 0,
        commission: (earnings ?? 0) * 0.5, // Estimating 50% commission for the KPI summary if not provided by API
        efficiency: (earnings ?? 0) / (services || 1),
      };
    }
  };

  const kpis = getKpiData();

  const { data: perfRes, isLoading: perfLoading } = useEmployeeEarnings(
    perfEmployeeId ?? 0,
    { date: selectedDate },
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

  const handleUpdate = async () => {
    if (!editEmployee?.id) return;

    const commData = {
      employeePercent: parseFloat(editForm.employeePercent),
      ownerPercent: parseFloat(editForm.ownerPercent),
    };

    if (commData.employeePercent + commData.ownerPercent !== 100) {
      toast.error("Commission total must be 100%");
      return;
    }

    try {
      const promises = [];

      // Check if details changed
      if (
        editForm.fullName !== editEmployee.fullName ||
        editForm.mobile !== editEmployee.mobile
      ) {
        promises.push(
          updateDetailsMutation.mutateAsync({
            id: editEmployee.id,
            data: { fullName: editForm.fullName, mobile: editForm.mobile },
          }),
        );
      }

      // Check if commission changed
      if (
        parseFloat(editForm.employeePercent) !==
          editEmployee.currentEmployeePercent ||
        parseFloat(editForm.ownerPercent) !== editEmployee.currentOwnerPercent
      ) {
        promises.push(
          updateCommissionMutation.mutateAsync({
            id: editEmployee.id,
            data: commData,
          }),
        );
      }

      if (promises.length === 0) {
        setEditEmployee(null);
        return;
      }

      await Promise.all(promises);
      toast.success("Employee updated successfully");
      queryClient.invalidateQueries();
      setEditEmployee(null);
    } catch {
      toast.error("Failed to update employee");
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassEmployee?.id || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    resetPasswordMutation.mutate(
      {
        id: resetPassEmployee.id,
        data: { 
          newPassword,
          token: "direct-admin-reset" // Required by ResetPasswordRequest type, provided as dummy for admin forced reset
        },
      },
      {
        onSuccess: () => {
          toast.success("Password reset successfully!");
          setResetPassEmployee(null);
          setNewPassword("");
        },
        onError: (error: any) => {
          const msg =
            error.response?.data?.message || "Failed to reset password";
          toast.error(msg);
        },
      },
    );
  };

  function formatCurrency(val?: number) {
    return `Rs. ${(val ?? 0).toLocaleString()}`;
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard
          title="Revenue Generated"
          value={formatCurrency(kpis.sales)}
          icon={DollarSign}
          subtitle={`${kpiPeriod === "yearly" ? selectedYear : kpiPeriod === "total" ? "All Time" : kpiPeriod === "monthly" ? selectedMonth : selectedDate}`}
          variant="primary"
        />
        <StatCard
          title="Services Rendered"
          value={kpis.services.toString()}
          icon={Users}
          subtitle="Client count"
          variant="primary"
        />
        {kpiEmployeeId === "all" ? (
          <StatCard
            title="Team Payout"
            value={formatCurrency(kpis.commission)}
            icon={Zap}
            subtitle="Employee Commissions"
            variant="success"
          />
        ) : (
          <StatCard
            title="Avg. Ticket"
            value={formatCurrency(kpis.efficiency)}
            icon={Target}
            subtitle="Per service average"
            variant="warning"
          />
        )}
      </div>

      {/* Optimized Filter Row */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 ml-1">
            Target Selection
          </Label>
          <Select
            value={kpiEmployeeId}
            onValueChange={(val) => val && setKpiEmployeeId(val)}
          >
            <SelectTrigger className="h-9 w-full text-xs bg-background/50 border-border/50 rounded-lg">
              <SelectValue placeholder="All Team">
                {kpiEmployeeId === "all"
                  ? "All Team Members"
                  : employees.find((e) => e.id?.toString() === kpiEmployeeId)
                      ?.fullName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id!.toString()}>
                  {e.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 ml-1">
            Time Filter
          </Label>
          <Select
            value={kpiPeriod}
            onValueChange={(v) => v && setKpiPeriod(v as typeof kpiPeriod)}
          >
            <SelectTrigger className="h-9 w-full text-xs bg-background/50 border-border/50 rounded-lg">
              <SelectValue placeholder="Monthly" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              {kpiEmployeeId === "all" && (
                <SelectItem value="total">All Time</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 flex items-center gap-1 ml-1">
            <Calendar className="w-2.5 h-2.5" /> Select Date
          </Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 w-full text-xs bg-background/50 border-border/50 rounded-lg font-medium"
          />
        </div>

        <div className="flex items-end self-end mb-px">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs gap-1.5 hover:bg-background/80 hover:text-primary transition-all rounded-lg border border-transparent hover:border-border/50 group"
            onClick={() => {
              setKpiEmployeeId("all");
              setKpiPeriod("monthly");
              setSelectedDate(today);
              toast.success("Filters reset to default");
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-180deg] transition-transform duration-500" />
            Reset
          </Button>
        </div>
      </div>

      <PageHeader
        title="Employees"
        description={`${employees.length} team members`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 px-3 text-xs gap-1.5",
                view === "grid" && "bg-background shadow-xs",
              )}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 px-3 text-xs gap-1.5",
                view === "list" && "bg-background shadow-xs",
              )}
              onClick={() => setView("list")}
            >
              <List className="w-3.5 h-3.5" /> List
            </Button>
          </div>
          <Button
            className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </PageHeader>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-2">Full Name *</Label>
              <Input
                value={form.fullName}
                className="h-10"
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs mb-2">Mobile</Label>
              <Input
                value={form.mobile}
                className="h-10"
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs mb-2">Username *</Label>
              <Input
                value={form.username}
                className="h-10"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs mb-2">Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="h-10"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-2">Employee %</Label>
                <Input
                  type="number"
                  className="h-10"
                  value={form.employeePercent}
                  onChange={(e) =>
                    setForm({ ...form, employeePercent: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs mb-2">Owner %</Label>
                <Input
                  type="number"
                  className="h-10"
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

      {view === "grid" ? (
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
                      onClick={() => {
                        if (emp.id) handleToggle(emp.id);
                      }}
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
                        setEditEmployee(emp);
                        setEditForm({
                          fullName: emp.fullName ?? "",
                          mobile: emp.mobile ?? "",
                          employeePercent: String(
                            emp.currentEmployeePercent ?? 50,
                          ),
                          ownerPercent: String(emp.currentOwnerPercent ?? 50),
                        });
                      }}
                    >
                      <Percent className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 text-xs bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20"
                      onClick={() => {
                        setResetPassEmployee(emp);
                        setNewPassword("");
                      }}
                    >
                      <Key className="w-3 h-3 mr-1" /> Reset
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full p-5 text-xs gap-2 bg-linear-to-r mt-4 from-teal-600/10 to-emerald-600/10 text-blue-100 hover:text-white"
                    onClick={() => {
                      if (emp.id) setPerfEmployeeId(emp.id);
                    }}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> View Business
                    Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[300px]">Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} className="border-border/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarFallback className="bg-teal-500/10 text-teal-600 text-xs font-bold">
                          {emp.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {emp.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          @{emp.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        emp.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={cn(
                        "text-[10px] py-0 h-5 border-none",
                        emp.status === "ACTIVE"
                          ? "bg-teal-500/10 text-teal-600"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 text-[11px] items-center">
                      <span className="text-muted-foreground font-medium">
                        {emp.currentEmployeePercent}%
                      </span>
                      <span className="text-muted-foreground/30">/</span>
                      <span className="font-medium">
                        {emp.currentOwnerPercent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {emp.mobile || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => {
                          setEditEmployee(emp);
                          setEditForm({
                            fullName: emp.fullName ?? "",
                            mobile: emp.mobile ?? "",
                            employeePercent: String(
                              emp.currentEmployeePercent ?? 50,
                            ),
                            ownerPercent: String(emp.currentOwnerPercent ?? 50),
                          });
                        }}
                        title="Edit Details"
                      >
                        <Percent className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10"
                        onClick={() => {
                          if (emp.id) setPerfEmployeeId(emp.id);
                        }}
                        title="View Performance"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8",
                          emp.status === "ACTIVE"
                            ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            : "text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10",
                        )}
                        onClick={() => {
                          if (emp.id) handleToggle(emp.id);
                        }}
                        title={
                          emp.status === "ACTIVE" ? "Deactivate" : "Activate"
                        }
                      >
                        {emp.status === "ACTIVE" ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                        onClick={() => {
                          setResetPassEmployee(emp);
                          setNewPassword("");
                        }}
                        title="Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editEmployee}
        onOpenChange={(o: boolean) => {
          if (!o) setEditEmployee(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee: {editEmployee?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2">Full Name</Label>
              <Input
                value={editForm.fullName}
                onChange={(e) =>
                  setEditForm({ ...editForm, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-2">Mobile</Label>
              <Input
                value={editForm.mobile}
                onChange={(e) =>
                  setEditForm({ ...editForm, mobile: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Employee %</Label>
                <Input
                  type="number"
                  value={editForm.employeePercent}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      employeePercent: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="mb-2">Owner %</Label>
                <Input
                  type="number"
                  value={editForm.ownerPercent}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ownerPercent: e.target.value })
                  }
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-teal-500/10">
              <Percent className="w-3 h-3 text-teal-600 shrink-0" />
              <span>
                <strong>Data Integrity Note:</strong> Commission changes create
                a new record. Historical sales will NOT be affected.
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmployee(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                updateDetailsMutation.isPending ||
                updateCommissionMutation.isPending
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog
        open={!!perfEmployeeId}
        onOpenChange={(o: boolean) => {
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

      {/* Reset Password Dialog */}
      <Dialog
        open={!!resetPassEmployee}
        onOpenChange={(o) => {
          if (!o) setResetPassEmployee(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="flex flex-col gap-1.5 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg mb-2">
              <span className="text-[10px] uppercase font-bold text-amber-600">
                Target Account
              </span>
              <span className="font-semibold text-sm">
                {resetPassEmployee?.fullName} (@{resetPassEmployee?.username})
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pass" className="text-xs">
                New Secure Password
              </Label>
              <div className="relative">
                <Input
                  id="new-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  className="h-10 pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPassEmployee(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending || !newPassword}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
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
