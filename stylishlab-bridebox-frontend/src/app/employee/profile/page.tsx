"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetProfile,
  useChangePassword,
} from "@/api/generated/endpoints/profile-management/profile-management";
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
import { Lock, Shield, LogOut, KeyRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { EmployeeSalaryModal } from "@/components/employee/EmployeeSalaryModal";

export default function EmployeeProfile() {
  const { logout } = useAuth();
  const { data: res, isLoading } = useGetProfile();
  const changePwdMutation = useChangePassword();
  const profile = res?.data;

  const [isPwdOpen, setIsPwdOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/5 flex items-center justify-center text-primary text-3xl font-extrabold shadow-inner">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">
                {profile?.fullName ?? profile?.username}
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full w-fit border border-primary/10">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {profile?.role}
                </span>
              </div>
            </div>
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
    </div>
  );
}
