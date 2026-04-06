'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  useGetStats,
  useGetAllTrackers,
  useGetAllHistory,
  useGetAllAdvances,
  useSettleSalary,
  useProcessAdvance
} from '@/api/generated/endpoints/admin-payroll-management/admin-payroll-management';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Check, X, Search, History, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { 
  AdminPayrollStatsResponse, 
  SalaryTrackerResponse, 
  PayrollResponse, 
  AdvanceRequestResponse 
} from '@/api/generated/model';

function formatCurrency(val?: number) { return `Rs. ${(val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function formatDate(d?: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'; }

export default function AdminSalaryPage() {
  const [tab, setTab] = useState<'LIVE' | 'HISTORY' | 'ADVANCES'>('LIVE');
  const [filter, setFilter] = useState('');
  
  const { data: statsRes, isLoading: statsLoading } = useGetStats();
  const { data: trackersRes, isLoading: trackersLoading } = useGetAllTrackers();
  const { data: historyRes, isLoading: historyLoading } = useGetAllHistory();
  const { data: advancesRes, isLoading: advancesLoading } = useGetAllAdvances();
  
  const settleMutation = useSettleSalary();
  const processMutation = useProcessAdvance();
  const queryClient = useQueryClient();

  // Dialog states
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<SalaryTrackerResponse | null>(null);
  const [settleNote, setSettleNote] = useState('');

  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<AdvanceRequestResponse | null>(null);
  const [approveAmount, setApproveAmount] = useState('');

  const stats = (statsRes?.data ?? {}) as AdminPayrollStatsResponse;
  const trackers = (trackersRes?.data ?? []) as SalaryTrackerResponse[];
  const history = (historyRes?.data ?? []) as PayrollResponse[];
  const advances = (advancesRes?.data ?? []) as AdvanceRequestResponse[];

  const isLoading = statsLoading || trackersLoading || historyLoading || advancesLoading;

  const handleSettleSubmit = () => {
    if (!selectedTracker?.employeeId) return;
    settleMutation.mutate({
      data: { employeeId: selectedTracker.employeeId, note: settleNote }
    }, {
      onSuccess: () => {
        toast.success('Salary settled successfully!');
        queryClient.invalidateQueries();
        setSettleOpen(false);
        setSettleNote('');
      },
      onError: () => toast.error('Failed to settle salary')
    });
  };

  const handleProcessAdvance = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedAdvance) return;
    processMutation.mutate({
      id: selectedAdvance.id!,
      data: {
        status,
        approvedAmount: status === 'APPROVED' ? parseFloat(approveAmount) : undefined
      }
    }, {
      onSuccess: () => {
        toast.success(`Advance request ${status.toLowerCase()}!`);
        queryClient.invalidateQueries();
        setAdvanceOpen(false);
        setApproveAmount('');
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error?.response?.data?.error || `Failed to ${status.toLowerCase()} advance`);
      }
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll Management" description="Manage employee salaries and advances" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-500/10 border-0 shadow-none">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-emerald-600 mb-1">Total Pending</p>
            <h3 className="text-2xl font-bold text-emerald-700">{formatCurrency(stats.totalPendingSalary)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-0 shadow-none">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-blue-600 mb-1">Total Paid (This Month)</p>
            <h3 className="text-2xl font-bold text-blue-700">{formatCurrency(stats.totalPaidThisMonth)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-0 shadow-none">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-amber-600 mb-1">Total Advances</p>
            <h3 className="text-2xl font-bold text-amber-700">{formatCurrency(stats.totalAdvancesGiven)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-0 shadow-none">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-purple-600 mb-1">Pending Payments</p>
            <h3 className="text-2xl font-bold text-purple-700">{stats.employeesPendingPaymentCount} Employees</h3>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        <Button variant={tab === 'LIVE' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('LIVE')}>
          Live Salaries
        </Button>
        <Button variant={tab === 'ADVANCES' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('ADVANCES')}>
          Advance Requests
          {advances.filter(a => a.status === 'PENDING').length > 0 && 
            <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
              {advances.filter(a => a.status === 'PENDING').length}
            </span>
          }
        </Button>
        <Button variant={tab === 'HISTORY' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('HISTORY')}>
          Payroll History
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={filter} onChange={e => setFilter(e.target.value)} className="pl-10 max-w-sm" />
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          {tab === 'LIVE' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Accumulated Salary</TableHead>
                  <TableHead className="text-right">Advances Token</TableHead>
                  <TableHead className="text-right font-bold text-emerald-600">Net Payable</TableHead>
                  <TableHead>Last Settled</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackers.filter(t => t.employeeName?.toLowerCase().includes(filter.toLowerCase())).map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.employeeName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(t.currentSalary)}</TableCell>
                    <TableCell className="text-right text-amber-600">{formatCurrency(t.totalAdvances)}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(t.netPayable)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(t.lastSettlementDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" disabled={t.netPayable === 0 && t.totalAdvances === 0 && t.currentSalary === 0} onClick={() => { setSelectedTracker(t); setSettleOpen(true); }}>
                        <Wallet className="w-4 h-4 mr-2" /> Settle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {trackers.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No salary data recorded</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {tab === 'ADVANCES' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.filter(a => a.employeeName?.toLowerCase().includes(filter.toLowerCase())).map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(a.requestedAt)}</TableCell>
                    <TableCell className="font-medium">{a.employeeName}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(a.requestedAmount)}</TableCell>
                    <TableCell className="text-right text-emerald-600">{a.approvedAmount ? formatCurrency(a.approvedAmount) : '-'}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{a.note || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'APPROVED' ? 'default' : a.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status === 'PENDING' && (
                        <Button size="sm" variant="outline" onClick={() => { setSelectedAdvance(a); setApproveAmount(a.requestedAmount?.toString() || ''); setAdvanceOpen(true); }}>
                          Process
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {advances.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No advance requests found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {tab === 'HISTORY' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Settled Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Earnings Settled</TableHead>
                  <TableHead className="text-right">Advances Deducted</TableHead>
                  <TableHead className="text-right font-bold text-emerald-600">Net Paid</TableHead>
                  <TableHead>Authorized By</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.filter(h => h.employeeName?.toLowerCase().includes(filter.toLowerCase())).sort((a,b) => new Date(b.settledAt!).getTime() - new Date(a.settledAt!).getTime()).map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs font-semibold">{formatDate(h.settledAt)}</TableCell>
                    <TableCell className="font-medium">{h.employeeName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(h.totalEarnings)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(h.totalAdvances)}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(h.netPaid)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{h.settledByName}</TableCell>
                    <TableCell className="text-xs">{h.note || '-'}</TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground"><History className="w-8 h-8 opacity-20 mx-auto mb-2"/>No settlement history</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Settle Modal */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Settle Salary</DialogTitle></DialogHeader>
          {selectedTracker && (
             <div className="space-y-4">
               <div className="bg-muted p-4 rounded-lg space-y-2">
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Employee</span><span className="font-medium">{selectedTracker.employeeName}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Accumulated</span><span>{formatCurrency(selectedTracker.currentSalary)}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Advances Deducted</span><span className="text-destructive">- {formatCurrency(selectedTracker.totalAdvances)}</span></div>
                 <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2"><span className="text-foreground">Net Payout</span><span className="text-emerald-500">{formatCurrency(selectedTracker.netPayable)}</span></div>
               </div>
               <div>
                  <Label>Settlement Note (Optional)</Label>
                  <Input placeholder="e.g. Cleared via Bank Transfer" value={settleNote} onChange={e => setSettleNote(e.target.value)} />
               </div>
               <div className="flex items-start gap-2 bg-blue-500/10 text-blue-600 p-3 rounded-lg text-xs">
                 <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                 <p>Settling this salary will permanently log it into history and reset the employee&apos;s current salary tracker back to Rs. 0.00.</p>
               </div>
             </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={settleMutation.isPending} onClick={handleSettleSubmit}>Confirm & Settle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Advance Modal */}
      <Dialog open={advanceOpen} onOpenChange={setAdvanceOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Advance Request</DialogTitle></DialogHeader>
          {selectedAdvance && (
             <div className="space-y-4">
               <div className="bg-muted p-4 rounded-lg space-y-2">
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Employee</span><span className="font-medium">{selectedAdvance.employeeName}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Requested Amount</span><span className="font-bold">{formatCurrency(selectedAdvance.requestedAmount)}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reason</span><span>{selectedAdvance.note || '-'}</span></div>
               </div>
               <div>
                  <Label>Approved Amount</Label>
                  <Input type="number" value={approveAmount} onChange={e => setApproveAmount(e.target.value)} />
               </div>
               <div className="flex items-start gap-2 bg-amber-500/10 text-amber-600 p-3 rounded-lg text-xs">
                 <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                 <p>Approving will override the requested amount if changed, and instantly deduct the value from their live Net Payout tracker.</p>
               </div>
             </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAdvanceOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={processMutation.isPending} onClick={() => handleProcessAdvance('REJECTED')}><X className="w-4 h-4 mr-2"/>Reject</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={processMutation.isPending} onClick={() => handleProcessAdvance('APPROVED')}><Check className="w-4 h-4 mr-2"/>Approve Advance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
