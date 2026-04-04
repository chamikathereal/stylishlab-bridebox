"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll5 as useGetCustomers,
  useCreate4 as useCreateCustomer,
  useSearch,
} from "@/api/generated/endpoints/customer-management/customer-management";
import { useGetActive as useGetActiveServices } from "@/api/generated/endpoints/service-packages/service-packages";
import { useCreate1 as useRecordASale } from "@/api/generated/endpoints/sales-transactions/sales-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Search,
  User,
  Plus,
  ChevronRight,
  ChevronLeft,
  Scissors,
  Check,
  CreditCard,
  Wallet,
  Loader2,
  DollarSign,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  CreateSaleRequestPaymentStatus,
  CustomerResponse,
  ServiceResponse,
} from "@/api/generated/model";

function formatCurrency(val?: number) {
  return `Rs. ${(val ?? 0).toLocaleString()}`;
}

export default function NewSalePage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<{
    id: number;
    name: string;
    price: number;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<CreateSaleRequestPaymentStatus>("FULLY_PAID");
  const [paidAmount, setPaidAmount] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustMobile, setNewCustMobile] = useState("");
  const [showNewCust, setShowNewCust] = useState(false);

  const { data: allCustRes } = useGetCustomers();
  const { data: searchRes } = useSearch(
    { name: searchName },
    { query: { enabled: searchName.length > 1 } },
  );
  const { data: svcRes, isLoading: svcLoading } = useGetActiveServices();
  const createCustMutation = useCreateCustomer();
  const createSaleMutation = useRecordASale();

  const customers = (
    (searchName.length > 1
      ? (searchRes?.data ?? [])
      : (allCustRes?.data ?? [])) as CustomerResponse[]
  )
    .slice()
    .sort((a, b) => (a.customerName || "").localeCompare(b.customerName || ""));
  const services = (svcRes?.data ?? []) as ServiceResponse[];

  const handleSelectGuest = () => {
    const guest = allCustRes?.data?.find(
      (c) => c.customerName === "Walk-in Customer",
    );
    if (guest) {
      setSelectedCustomer({ id: guest.id!, name: guest.customerName! });
      setStep(2);
      return;
    }
    createCustMutation.mutate(
      { data: { customerName: "Walk-in Customer" } },
      {
        onSuccess: (r) => {
          const c = r.data;
          if (c) {
            setSelectedCustomer({ id: c.id!, name: c.customerName! });
            setStep(2);
            queryClient.invalidateQueries();
          }
        },
      },
    );
  };

  const handleCreateCustomer = () => {
    if (!newCustName) {
      toast.error("Name required");
      return;
    }
    createCustMutation.mutate(
      {
        data: { customerName: newCustName, mobile: newCustMobile || undefined },
      },
      {
        onSuccess: (r) => {
          const c = r.data;
          if (c) {
            setSelectedCustomer({ id: c.id!, name: c.customerName! });
            setStep(2);
            setShowNewCust(false);
            queryClient.invalidateQueries();
          }
          toast.success("Customer created!");
        },
      },
    );
  };

  const handleSubmit = () => {
    if (!selectedCustomer || !selectedService || !user?.employeeId) return;
    createSaleMutation.mutate(
      {
        data: {
          customerId: selectedCustomer.id,
          employeeId: user.employeeId,
          serviceId: selectedService.id,
          paymentStatus,
          paidAmount:
            paymentStatus === "PARTIAL" ? parseFloat(paidAmount) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sale recorded! 🎉");
          queryClient.invalidateQueries();
          router.push("/employee/dashboard");
        },
        onError: () => toast.error("Failed to record sale"),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "flex-1 h-0.5 transition-colors",
                  step > s ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Customer */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Customer</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customer..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button
              variant="secondary"
              className="h-12 px-4 gap-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
              onClick={handleSelectGuest}
              disabled={createCustMutation.isPending}
            >
              <UserMinus className="w-4 h-4" /> Guest
            </Button>
          </div>

          {!showNewCust ? (
            <Button
              variant="outline"
              className="w-full h-12 gap-2 border-dashed"
              onClick={() => setShowNewCust(true)}
            >
              <Plus className="w-4 h-4" /> New Customer
            </Button>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Customer name *"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="h-11"
                />
                <Input
                  placeholder="Mobile (optional)"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  className="h-11"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowNewCust(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateCustomer}>
                    Create & Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2 max-h-[50vh] overflow-auto">
            {customers.map((c) => (
              <Card
                key={c.id}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedCustomer?.id === c.id
                    ? "border-primary bg-primary/5"
                    : "glass-card-hover",
                )}
                onClick={() => {
                  setSelectedCustomer({ id: c.id!, name: c.customerName! });
                  setStep(2);
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{c.customerName}</p>
                    {c.mobile && (
                      <p className="text-xs text-muted-foreground">
                        {c.mobile}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Service */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">Select Service</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Customer: <strong>{selectedCustomer?.name}</strong>
          </p>

          {svcLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {services.map((svc) => (
                <Card
                  key={svc.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedService?.id === svc.id
                      ? "border-primary bg-primary/5"
                      : "glass-card-hover",
                  )}
                  onClick={() => {
                    setSelectedService({
                      id: svc.id!,
                      name: svc.serviceName!,
                      price: svc.price!,
                    });
                    setStep(3);
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{svc.serviceName}</p>
                    </div>
                    <p className="text-lg font-bold gradient-text">
                      Rs. {svc.price?.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Payment & Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setStep(2)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">Payment</h2>
          </div>

          {/* Summary */}
          <Card className="glass-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{selectedCustomer?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-border/50">
                <span className="font-semibold">Total</span>
                <span className="font-bold gradient-text">
                  {formatCurrency(selectedService?.price)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Type</Label>
            {[
              {
                value: "FULLY_PAID" as const,
                label: "Fully Paid",
                icon: Wallet,
                desc: "Customer paid in full",
              },
              {
                value: "CREDIT" as const,
                label: "Credit (Pay Later)",
                icon: CreditCard,
                desc: "Will pay later",
              },
              {
                value: "PARTIAL" as const,
                label: "Partial Payment",
                icon: DollarSign,
                desc: "Paid partially now",
              },
            ].map((opt) => (
              <Card
                key={opt.value}
                className={cn(
                  "cursor-pointer transition-all",
                  paymentStatus === opt.value
                    ? "border-primary bg-primary/5"
                    : "glass-card-hover",
                )}
                onClick={() => setPaymentStatus(opt.value)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      paymentStatus === opt.value
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 transition-colors",
                      paymentStatus === opt.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground",
                    )}
                  >
                    {paymentStatus === opt.value && (
                      <Check className="w-3 h-3 text-primary-foreground mx-auto mt-0.5" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paymentStatus === "PARTIAL" && (
            <div>
              <Label>Paid Amount (Rs.)</Label>
              <Input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="h-12 text-lg"
                placeholder="Enter amount paid"
              />
            </div>
          )}

          <Button
            className="w-full h-14 text-base gap-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg rounded-xl"
            onClick={handleSubmit}
            disabled={createSaleMutation.isPending}
          >
            {createSaleMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Recording...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" /> Confirm Sale
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
