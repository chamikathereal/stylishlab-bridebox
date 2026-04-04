'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetAll1, useCreate1 } from '@/api/generated/endpoints/sales-transactions/sales-transactions';
import { useGetAll5 as useGetCustomers } from '@/api/generated/endpoints/customer-management/customer-management';
import { useGetActive } from '@/api/generated/endpoints/service-packages/service-packages';
import { useGetAll4 as useGetEmployees } from '@/api/generated/endpoints/employee-management/employee-management';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CreateSaleRequestPaymentStatus, SaleResponse, CustomerResponse, ServiceResponse, EmployeeResponse } from '@/api/generated/model';

function formatCurrency(val?: number) { return `Rs. ${(val ?? 0).toLocaleString()}`; }
function formatDate(d?: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'; }

const statusColors: Record<string, string> = {
  FULLY_PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CREDIT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PARTIAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function SalesPage() {
  const { data: res, isLoading } = useGetAll1();
  const { data: custRes } = useGetCustomers();
  const { data: svcRes } = useGetActive();
  const { data: empRes } = useGetEmployees();
  const createMutation = useCreate1();
  const queryClient = useQueryClient();

  const sales = (res?.data ?? []) as SaleResponse[];
  const customers = (custRes?.data ?? []) as CustomerResponse[];
  const services = (svcRes?.data ?? []) as ServiceResponse[];
  const employees = (empRes?.data ?? []) as EmployeeResponse[];

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ customerId: '', employeeId: '', serviceId: '', paymentStatus: 'FULLY_PAID' as CreateSaleRequestPaymentStatus, paidAmount: '' });

  const filtered = sales.filter(s =>
    s.customerName?.toLowerCase().includes(filter.toLowerCase()) ||
    s.employeeName?.toLowerCase().includes(filter.toLowerCase()) ||
    s.serviceNameSnapshot?.toLowerCase().includes(filter.toLowerCase()) ||
    s.invoiceNo?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.customerId || !form.employeeId || !form.serviceId) { toast.error('Please fill all fields'); return; }
    createMutation.mutate(
      { data: { customerId: parseInt(form.customerId), employeeId: parseInt(form.employeeId), serviceId: parseInt(form.serviceId), paymentStatus: form.paymentStatus, paidAmount: form.paidAmount ? parseFloat(form.paidAmount) : undefined } },
      { onSuccess: () => { toast.success('Sale recorded!'); queryClient.invalidateQueries(); setOpen(false); }, onError: () => toast.error('Failed to record sale') }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Sales History" description={`${sales.length} total transactions`}>
        <Button className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Sale</Button>
      </PageHeader>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record New Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Customer *</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                <option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.customerName}</option>)}
              </select></div>
            <div><Label>Employee *</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Select employee</option>{employees.filter(e => e.status === 'ACTIVE').map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select></div>
            <div><Label>Service *</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })}>
                <option value="">Select service</option>{services.map(s => <option key={s.id} value={s.id}>{s.serviceName} — Rs. {s.price?.toLocaleString()}</option>)}
              </select></div>
            <div><Label>Payment Status</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value as CreateSaleRequestPaymentStatus })}>
                <option value="FULLY_PAID">Fully Paid</option><option value="CREDIT">Credit</option><option value="PARTIAL">Partial</option>
              </select></div>
            {form.paymentStatus === 'PARTIAL' && <div><Label>Paid Amount</Label><Input type="number" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} /></div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createMutation.isPending}>Record Sale</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search sales..." value={filter} onChange={e => setFilter(e.target.value)} className="pl-10" />
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Service</TableHead><TableHead>Customer</TableHead><TableHead>Employee</TableHead><TableHead className="text-right">Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Due</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((s) => (
                <TableRow key={s.id}><TableCell className="font-mono text-xs">{s.invoiceNo}</TableCell><TableCell className="font-medium">{s.serviceNameSnapshot}</TableCell><TableCell>{s.customerName}</TableCell><TableCell>{s.employeeName}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(s.servicePriceSnapshot)}</TableCell><TableCell><Badge className={statusColors[s.paymentStatus ?? '']}>{s.paymentStatus}</Badge></TableCell><TableCell className="text-right">{s.dueAmount && s.dueAmount > 0 ? formatCurrency(s.dueAmount) : '-'}</TableCell><TableCell className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</TableCell></TableRow>
              )) : <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground"><ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />No sales found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
