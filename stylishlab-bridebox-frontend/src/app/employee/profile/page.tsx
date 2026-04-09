"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetProfile,
  useChangePassword,
  useUpdateProfile,
} from "@/api/generated/endpoints/profile-management/profile-management";
import { useForgotPassword } from "@/api/generated/endpoints/authentication/authentication";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, Shield, LogOut, KeyRound, Wallet, Plus, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { EmployeeSalaryModal } from "@/components/employee/EmployeeSalaryModal";
import { EmployeeExpenseModal } from "@/components/employee/EmployeeExpenseModal";

export default function EmployeeProfile() {
  const { logout } = useAuth();
  const { data: res, isLoading, refetch } = useGetProfile();
  const changePwdMutation = useChangePassword();
  const updateProfileMutation = useUpdateProfile();
  const forgotPwdMutation = useForgotPassword();
  const profile = res?.data;

  const [isPwdOpen, setIsPwdOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleOpenEdit = () => {
    setEmail(profile?.email || "");
    setIsEditOpen(true);
  };

  const handleUpdateProfile = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    updateProfileMutation.mutate(
      {
        data: {
          email: email,
        },
      },
      {
        onSuccess: () => {
          toast.success("Profile updated!");
          refetch();
          setIsEditOpen(false);
        },
        onError: () => toast.error("Failed to update profile"),
      }
    );
  };

  const handleChangePwd = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("At least 6 characters");
      return;
    }
    changePwdMutation.mutate(
      {
        data: {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
      },
      {
        onSuccess: () => {
          toast.success("Password changed!");
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setIsPwdOpen(false);
        },
        onError: () => toast.error("Check current password"),
      },
    );
  };

  const handleForgotPassword = () => {
    if (!profile?.email) {
      toast.error("Please add an email to your profile first");
      return;
    }

    forgotPwdMutation.mutate(
      {
        data: {
          email: profile.email,
        },
      },
      {
        onSuccess: () => {
          toast.success("Reset link sent! Check your email.");
          setIsPwdOpen(false);
        },
        onError: (error: unknown) => {
          const apiError = error as { response?: { data?: { message?: string } } };
          const msg = apiError.response?.data?.message || "Failed to send reset email";
          toast.error(msg);
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="My Profile"
        description="Manage your account settings"
      />

      {/* User Info Card */}
      <Card className="glass-card shadow-sm border-muted/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/5 flex items-center justify-center text-primary text-3xl font-extrabold shadow-inner">
                {profile?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">
                  {profile?.fullName ?? profile?.username}
                </h2>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full w-fit border border-primary/10">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {profile?.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-1">
                    {profile?.email || "No email set"}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleOpenEdit} className="text-primary hover:text-primary hover:bg-primary/5">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Sections */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          className="w-full h-14 justify-start px-6 gap-4 text-base font-medium border-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all rounded-xl"
          onClick={() => setIsPwdOpen(true)}
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex-1 text-left">
            <p>Change Password</p>
            <p className="text-[10px] text-muted-foreground font-normal">
              Secure your account with a new password
            </p>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsSalaryOpen(true)}
          className="w-full h-14 justify-start px-6 gap-4 text-base font-medium border-muted/20 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all rounded-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 text-left">
            <p>Salary & Advances</p>
            <p className="text-[10px] text-muted-foreground font-normal">
              Check pending payroll, history, and advance amounts
            </p>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsExpenseOpen(true)}
          className="w-full h-14 justify-start px-6 gap-4 text-base font-medium border-muted/20 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all rounded-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Plus className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 text-left">
            <p>Record Expenses</p>
            <p className="text-[10px] text-muted-foreground font-normal">
              Directly record payments to suppliers or collectors
            </p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-14 justify-start px-6 gap-4 text-base font-medium border-muted/20 hover:bg-destructive/5 hover:border-destructive/30 text-destructive transition-all rounded-xl"
          onClick={logout}
        >
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 text-left">
            <p>Sign Out</p>
            <p className="text-[10px] text-muted-foreground font-normal">
              Securely end your current session
            </p>
          </div>
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] border-muted/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" /> Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal information to stay connected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 pl-10 focus-visible:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                * Required for password recovery
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPwdOpen} onOpenChange={setIsPwdOpen}>
        <DialogContent className="sm:max-w-[425px] border-muted/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a secure new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="current"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Current Password
              </Label>
              <Input
                id="current"
                type="password"
                className="h-11 focus-visible:ring-primary"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
              />
              <div className="flex justify-end">
                <Button
                  variant="link"
                  className="px-0 h-auto text-[11px] text-primary hover:text-primary/80 transition-colors"
                  onClick={handleForgotPassword}
                  disabled={forgotPwdMutation.isPending}
                >
                  {forgotPwdMutation.isPending ? "Sending link..." : "Forgot current password?"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="new"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                New Password
              </Label>
              <Input
                id="new"
                type="password"
                className="h-11 focus-visible:ring-primary"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirm"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirm"
                type="password"
                className="h-11 focus-visible:ring-primary"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsPwdOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              onClick={handleChangePwd}
              disabled={changePwdMutation.isPending}
            >
              {changePwdMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EmployeeSalaryModal open={isSalaryOpen} onOpenChange={setIsSalaryOpen} />
      <EmployeeExpenseModal open={isExpenseOpen} onOpenChange={setIsExpenseOpen} />
    </div>
  );
}
