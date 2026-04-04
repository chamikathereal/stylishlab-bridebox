'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLogin } from '@/api/generated/endpoints/authentication/authentication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password');
      return;
    }
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (response) => {
          const data = response.data;
          if (data) {
            authLogin(data);
            toast.success(`Welcome back, ${data.username}!`);
            if (data.role === 'ADMIN') {
              router.push('/admin/dashboard');
            } else {
              router.push('/employee/dashboard');
            }
          }
        },
        onError: () => {
          toast.error('Invalid username or password');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <Card className="w-full max-w-md glass-card relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg stat-glow">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              <span className="gradient-text">Stylish Lab</span>{' '}
              <span className="text-foreground">Bridebox</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Salon Management System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-background/50"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-background/50 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-lg transition-all duration-300 hover:shadow-emerald-500/25 hover:shadow-xl"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Contact your salon admin for login credentials
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
