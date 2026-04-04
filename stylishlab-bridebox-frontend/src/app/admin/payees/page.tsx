'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetAll2, useCreate2, useToggleStatus1 } from '@/api/generated/endpoints/payee-debtor-management/payee-debtor-management';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Building2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PayeeResponse } from '@/api/generated/model';

export default function PayeesPage() {
  const { data: res, isLoading } = useGetAll2();
  const createMutation = useCreate2();
  const toggleMutation = useToggleStatus1();
  const queryClient = useQueryClient();
  const payees = (res?.data ?? []) as PayeeResponse[];

  const [form, setForm] = useState({ name: '', type: '', mobile: '', notes: '' });
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (!form.name || !form.type) { toast.error('Name and type required'); return; }
    createMutation.mutate(
      { data: { name: form.name, type: form.type, mobile: form.mobile || undefined, notes: form.notes || undefined } },
      { onSuccess: () => { toast.success('Payee created!'); queryClient.invalidateQueries(); setOpen(false); setForm({ name: '', type: '', mobile: '', notes: '' }); }, onError: () => toast.error('Failed to create payee') }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Payees / Debtors" description={`${payees.length} registered payees`}>
        <Button className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add Payee</Button>
      </PageHeader>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Payee</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Type *</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="">Select type</option><option value="SUPPLIER">Supplier</option><option value="BANK">Bank</option><option value="OTHER">Other</option></select></div>
            <div><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createMutation.isPending}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payees.map((p) => (
          <Card key={p.id} className="glass-card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-primary" /></div>
                  <div><p className="font-semibold text-sm">{p.name}</p><Badge variant="secondary" className="text-[10px] mt-1">{p.type}</Badge></div>
                </div>
                <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              {p.mobile && <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><Phone className="w-3 h-3" /> {p.mobile}</p>}
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => toggleMutation.mutate({ id: p.id! }, { onSuccess: () => { toast.success('Toggled'); queryClient.invalidateQueries(); } })}>Toggle Status</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
