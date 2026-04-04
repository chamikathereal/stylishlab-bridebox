'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetPending, useRecordPayment } from '@/api/generated/endpoints/credit-management/credit-management';
import { useGetAll1 } from '@/api/generated/endpoints/sales-transactions/sales-transactions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CreditCard, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CustomerCreditSummaryResponse, SaleResponse } from '@/api/generated/model';

function formatCurrency(val?: number) { return `Rs. ${(val ?? 0).toLocaleString()}`; }

export default function CreditsPage() {
  const { data: pendingRes, isLoading } = useGetPending();
  const { data: salesRes } = useGetAll1();
  const payMutation = useRecordPayment();
  const queryClient = useQueryClient();

  const pending = (pendingRes?.data ?? []) as CustomerCreditSummaryResponse[];
  const creditSales = ((salesRes?.data ?? []) as SaleResponse[]).filter(s => s.paymentStatus === 'CREDIT' || s.paymentStatus === 'PARTIAL');
  const [payDialog, setPayDialog] = useState<{ saleId: number; max: number } | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handlePay = () => {
    if (!payDialog || !amount) return;
    payMutation.mutate(
      { saleId: payDialog.saleId, data: { amountPaid: parseFloat(amount), note: note || undefined } },
      { onSuccess: () => { toast.success('Payment recorded!'); queryClient.invalidateQueries(); setPayDialog(null); setAmount(''); setNote(''); }, onError: () => toast.error('Failed to record payment') }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Credit Management" description={`${pending.length} customers with pending balances`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {pending.map((c) => (
          <Card key={c.customerId} className="glass-card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-amber-400" /></div>
                  <div><p className="font-semibold">{c.customerName}</p><p className="text-xs text-muted-foreground">{c.pendingSalesCount} pending sale{(c.pendingSalesCount ?? 0) > 1 ? 's' : ''}</p></div>
                </div>
                <p className="text-lg font-bold text-amber-400">{formatCurrency(c.totalDue)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && <div className="col-span-full py-16 text-center text-muted-foreground"><CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No pending credits — all clear! 🎉</p></div>}
      </div>

      {creditSales.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Outstanding Sales</h3>
            <div className="space-y-3">
              {creditSales.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div><p className="text-sm font-medium">{s.serviceNameSnapshot} — {s.customerName}</p><p className="text-xs text-muted-foreground">#{s.invoiceNo} · Due: {formatCurrency(s.dueAmount)}</p></div>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setPayDialog({ saleId: s.id!, max: s.dueAmount ?? 0 })}><DollarSign className="w-3 h-3" /> Pay</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!payDialog} onOpenChange={(o) => { if (!o) setPayDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Credit Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Amount (Max: {formatCurrency(payDialog?.max)})</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={payDialog?.max} /></div>
            <div><Label>Note</Label><Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional payment note" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPayDialog(null)}>Cancel</Button><Button onClick={handlePay} disabled={payMutation.isPending}>Record Payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
