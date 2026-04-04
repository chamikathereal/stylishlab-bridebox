'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetProfile, useChangePassword } from '@/api/generated/endpoints/profile-management/profile-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminProfile() {
  const { data: res, isLoading } = useGetProfile();
  const changePwdMutation = useChangePassword();
  const profile = res?.data;

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleChangePwd = () => {
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    changePwdMutation.mutate(
      { data: { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword } },
      {
        onSuccess: () => { toast.success('Password changed!'); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
        onError: () => toast.error('Failed to change password. Check current password.'),
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your account settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {profile?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold">{profile?.fullName ?? profile?.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm text-muted-foreground">{profile?.role}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-muted/30">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Username</span><span className="font-medium">{profile?.username}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Role</span><span className="font-medium">{profile?.role}</span></div>
              {profile?.mobile && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mobile</span><span className="font-medium">{profile?.mobile}</span></div>}
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Current Password</Label><Input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} /></div>
            <div><Label>New Password</Label><Input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} /></div>
            <div><Label>Confirm New Password</Label><Input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} /></div>
            <Button onClick={handleChangePwd} disabled={changePwdMutation.isPending} className="w-full">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
