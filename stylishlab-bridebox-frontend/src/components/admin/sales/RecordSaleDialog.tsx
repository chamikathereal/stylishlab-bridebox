import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CustomerResponse,
  EmployeeResponse,
  ServiceResponse,
  CreateSaleRequestPaymentStatus,
} from "@/api/generated/model";

interface SaleForm {
  customerId: string;
  employeeId: string;
  serviceId: string;
  paymentStatus: CreateSaleRequestPaymentStatus;
  paidAmount: string;
}

interface RecordSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: CustomerResponse[];
  employees: EmployeeResponse[];
  services: ServiceResponse[];
  form: SaleForm;
  setForm: (form: SaleForm) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function RecordSaleDialog({
  open,
  onOpenChange,
  customers,
  employees,
  services,
  form,
  setForm,
  onSubmit,
  isPending,
}: RecordSaleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2">Customer *</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm mb-2">Employee *</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            >
              <option value="">Select employee</option>
              {employees
                .filter((e) => e.status === "ACTIVE")
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label className="text-sm mb-2">Service *</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            >
              <option value="">Select service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.serviceName} — Rs. {s.price?.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm mb-2">Payment Status</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.paymentStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentStatus: e.target.value as CreateSaleRequestPaymentStatus,
                })
              }
            >
              <option value="FULLY_PAID">Fully Paid</option>
              <option value="CREDIT">Credit</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>
          {form.paymentStatus === "PARTIAL" && (
            <div>
              <Label className="text-sm mb-2">Paid Amount</Label>
              <Input
                type="number"
                value={form.paidAmount}
                onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending}>
            Record Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
