'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EmployeeBottomNav } from '@/components/layout/EmployeeBottomNav';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Scissors, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/shared/ModeToggle';

import { EmployeeDesktopNav } from '@/components/layout/EmployeeDesktopNav';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0 bg-background/50">
      {/* Universal Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm gradient-text hidden sm:inline-block">Stylish Lab</span>
          </div>

          {/* Desktop Navigation */}
          <EmployeeDesktopNav />

          <div className="flex items-center gap-2">
            <ModeToggle />
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[10px] font-bold text-primary leading-none uppercase tracking-wider">Employee</span>
              <span className="text-xs text-muted-foreground font-medium">{user.username}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200" 
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl lg:max-w-4xl mx-auto min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>

      <EmployeeBottomNav />
    </div>
  );
}
