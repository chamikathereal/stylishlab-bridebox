'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetAll6, useCreate5, useSettle } from '@/api/generated/endpoints/monthly-bills/monthly-bills';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { BillResponse } from '@/api/generated/model';

function formatCurrency(val?: number) { return `Rs. ${(val ?? 0).toLocaleString()}`; }

export default function BillsPage() {
  const { data: res, isLoading } = useGetAll6();
  const createMutation = useCreate5();
  const settleMutation = useSettle();
  const queryClient = useQueryClient();
  const bills = (res?.data ?? []) as BillResponse[];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ billType: '', amount: '', billMonth: '', note: '' });

  const handleCreate = () => {
    if (!form.billType || !form.amount || !form.billMonth) { toast.error('Type, amount, and month required'); return; }
    createMutation.mutate(
      { data: { billType: form.billType, amount: parseFloat(form.amount), billMonth: form.billMonth, note: form.note || undefined } },
      { onSuccess: () => { toast.success('Bill created!'); queryClient.invalidateQueries(); setOpen(false); setForm({ billType: '', amount: '', billMonth: '', note: '' }); }, onError: () => toast.error('Failed to create bill') }
    );
  };

  const handleSettle = (id: number) => {
    settleMutation.mutate({ id }, { onSuccess: () => { toast.success('Bill settled!'); queryClient.invalidateQueries(); } });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Monthly Bills" description={`${bills.length} bills tracked`}>
        <Button className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add Bill</Button>
      </PageHeader>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Monthly Bill</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Bill Type *</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.billType} onChange={e => setForm({ ...form, billType: e.target.value })}><option value="">Select type</option><option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Rent">Rent</option><option value="Internet">Internet</option><option value="Other">Other</option></select></div>
            <div><Label>Amount (Rs.) *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>Bill Month *</Label><Input type="month" value={form.billMonth} onChange={e => setForm({ ...form, billMonth: e.target.value })} /></div>
            <div><Label>Note</Label><Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createMutation.isPending}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Month</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Paid Date</TableHead><TableHead>Note</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {bills.length > 0 ? bills.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.billType}</TableCell><TableCell>{b.billMonth}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(b.amount)}</TableCell>
                  <TableCell><Badge variant={b.status === 'PAID' ? 'default' : 'secondary'} className={b.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}>{b.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.paidDate ?? '-'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.note ?? '-'}</TableCell>
                  <TableCell>{b.status !== 'PAID' && <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleSettle(b.id!)}><Check className="w-3 h-3" /> Settle</Button>}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />No bills added</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
