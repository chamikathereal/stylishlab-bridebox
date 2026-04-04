'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetAll3, useRecord, useGetCategories } from '@/api/generated/endpoints/expense-management/expense-management';
import { useGetAll2 as useGetPayees } from '@/api/generated/endpoints/payee-debtor-management/payee-debtor-management';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { ExpenseResponse, ExpenseCategoryResponse, PayeeResponse } from '@/api/generated/model';

function formatCurrency(val?: number) { return `Rs. ${(val ?? 0).toLocaleString()}`; }

export default function ExpensesPage() {
  const { data: res, isLoading } = useGetAll3();
  const { data: catRes } = useGetCategories();
  const { data: payeeRes } = useGetPayees();
  const createMutation = useRecord();
  const queryClient = useQueryClient();

  const expenses = (res?.data ?? []) as ExpenseResponse[];
  const categories = (catRes?.data ?? []) as ExpenseCategoryResponse[];
  const payees = (payeeRes?.data ?? []) as PayeeResponse[];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ categoryId: '', payeeId: '', amount: '', note: '', paidBy: '' });

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const handleCreate = () => {
    if (!form.categoryId || !form.amount || !form.paidBy) { toast.error('Category, amount, and paid by are required'); return; }
    createMutation.mutate(
      { data: { categoryId: parseInt(form.categoryId), payeeId: form.payeeId ? parseInt(form.payeeId) : undefined, amount: parseFloat(form.amount), note: form.note || undefined, paidBy: form.paidBy } },
      { onSuccess: () => { toast.success('Expense recorded!'); queryClient.invalidateQueries(); setOpen(false); setForm({ categoryId: '', payeeId: '', amount: '', note: '', paidBy: '' }); }, onError: () => toast.error('Failed to record expense') }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Expenses" description={`Total: ${formatCurrency(totalExpenses)}`}>
        <Button className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Record Expense</Button>
      </PageHeader>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Category *</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}</select></div>
            <div><Label>Payee (optional)</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.payeeId} onChange={e => setForm({ ...form, payeeId: e.target.value })}><option value="">No payee</option>{payees.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}</select></div>
            <div><Label>Amount (Rs.) *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>Paid By *</Label><Input value={form.paidBy} onChange={e => setForm({ ...form, paidBy: e.target.value })} placeholder="Who paid?" /></div>
            <div><Label>Note</Label><Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createMutation.isPending}>Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Payee</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Paid By</TableHead><TableHead>Note</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {expenses.length > 0 ? expenses.map((e) => (
                <TableRow key={e.id}><TableCell className="font-medium">{e.categoryName}</TableCell><TableCell>{e.payeeName ?? '-'}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(e.amount)}</TableCell><TableCell>{e.paidBy}</TableCell><TableCell className="text-muted-foreground text-xs">{e.note ?? '-'}</TableCell><TableCell className="text-xs text-muted-foreground">{e.expenseDate}</TableCell></TableRow>
              )) : <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground"><Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />No expenses recorded</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
