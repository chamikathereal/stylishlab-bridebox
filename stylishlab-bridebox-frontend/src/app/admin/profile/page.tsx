'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGetProfile, useChangePassword, useUpdateProfile } from '@/api/generated/endpoints/profile-management/profile-management';
import { useForgotPassword } from '@/api/generated/endpoints/authentication/authentication';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { User, Lock, Shield, Mail, Edit2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminProfile() {
  const { data: res, isLoading, refetch } = useGetProfile();
  const changePwdMutation = useChangePassword();
  const updateProfileMutation = useUpdateProfile();
  const forgotPwdMutation = useForgotPassword();
  const profile = res?.data;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleOpenEdit = () => {
    setEmail(profile?.email || '');
    setIsEditOpen(true);
  };

  const handleUpdateProfile = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    updateProfileMutation.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          toast.success('Profile updated!');
          refetch();
          setIsEditOpen(false);
        },
        onError: () => toast.error('Failed to update profile'),
      }
    );
  };

  const handleForgotPasswordRequest = () => {
    if (!profile?.email) {
      toast.error('Please configure a recovery email first');
      return;
    }
    forgotPwdMutation.mutate(
      { data: { email: profile.email } },
      {
        onSuccess: () => toast.success(`Reset link sent to ${profile.email}`),
        onError: () => toast.error('Failed to send reset email'),
      }
    );
  };

  const handleChangePwd = () => {
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
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
        <Card className="glass-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Profile Information
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleOpenEdit} className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-3xl font-bold shadow-inner">
                {profile?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{profile?.fullName ?? profile?.username}</p>
                <div className="flex items-center gap-2 mt-1 px-2.5 py-1 bg-primary/10 rounded-full w-fit">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{profile?.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-semibold">{profile?.username}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/10 pt-3">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <span className="font-semibold text-primary">{profile?.email || 'Not configured'}</span>
                </div>
              </div>
              
              {profile?.mobile && (
                <div className="p-4 rounded-xl border border-border/50 text-sm flex justify-between items-center">
                  <span className="text-muted-foreground">Mobile Contact</span>
                  <span className="font-medium">{profile?.mobile}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Change Password
            </CardTitle>
            <CardDescription className="text-[11px]">Update your access credentials securely</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex justify-between items-center">
                <Label>Current Password</Label>
                <button 
                  onClick={handleForgotPasswordRequest}
                  disabled={forgotPwdMutation.isPending}
                  className="text-[9px] text-primary hover:underline flex items-center gap-1 normal-case"
                >
                  {forgotPwdMutation.isPending ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <AlertCircle className="w-2.5 h-2.5" />
                  )}
                  Forgot current password?
                </button>
              </div>
              <Input type="password" placeholder="••••••••" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className="h-10 bg-background/50" />
            </div>
            <div className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Label>New Password</Label>
              <Input type="password" placeholder="Minimum 8 chars" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="h-10 bg-background/50" />
            </div>
            <div className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Repeat new password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="h-10 bg-background/50" />
            </div>
            <Button onClick={handleChangePwd} disabled={changePwdMutation.isPending} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 mt-2 font-semibold">
              {changePwdMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Update Profile
            </DialogTitle>
            <DialogDescription>
              Adjust your recovery email and contact information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                Recovery Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="h-11 pl-10 focus-visible:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                * This email will receive password reset links.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="flex-1">Cancel</Button>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={updateProfileMutation.isPending} 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
