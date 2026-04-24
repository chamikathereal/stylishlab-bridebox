'use client';

import { useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { useGetAllCustomers, useCreateCustomer, useSearchCustomers } from '@/api/generated/endpoints/customer-management/customer-management';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Plus, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CustomerResponse } from '@/api/generated/model';

export default function EmployeeCustomersPage() {
  const [searchName, setSearchName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const { data: allRes, isLoading } = useGetAllCustomers();
  const { data: searchRes } = useSearchCustomers({ name: searchName }, { query: { enabled: searchName.length > 1 } });
  const createMutation = useCreateCustomer();
  const queryClient = useQueryClient();

  const customers = (searchName.length > 1 ? (searchRes?.data ?? []) : (allRes?.data ?? [])) as CustomerResponse[];

  const handleCreate = () => {
    if (!newName) { toast.error('Name required'); return; }
    createMutation.mutate(
      { data: { customerName: newName, mobile: newMobile || undefined } },
      { onSuccess: () => { toast.success('Customer created!'); queryClient.invalidateQueries(); setShowNew(false); setNewName(''); setNewMobile(''); } }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Customers" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={searchName} onChange={e => setSearchName(e.target.value)} className="pl-10 h-12 text-base" />
      </div>

      <div className="space-y-2">
        {customers.map((c) => (
          <Card key={c.id} className="glass-card-hover">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
              <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{c.customerName}</p>{c.mobile && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {c.mobile}</p>}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!showNew ? (
        <Button variant="outline" className="w-full h-12 gap-2 border-dashed" onClick={() => setShowNew(true)}><Plus className="w-4 h-4" /> New Customer</Button>
      ) : (
        <Card className="glass-card"><CardContent className="p-4 space-y-3">
          <Input placeholder="Customer name *" value={newName} onChange={e => setNewName(e.target.value)} className="h-11" />
          <Input placeholder="Mobile (optional)" value={newMobile} onChange={e => setNewMobile(e.target.value)} className="h-11" />
          <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>Cancel</Button><Button className="flex-1" onClick={handleCreate}>Create</Button></div>
        </CardContent></Card>
      )}
    </div>
  );
}
