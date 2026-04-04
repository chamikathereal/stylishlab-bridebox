'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EmployeeBottomNav } from '@/components/layout/EmployeeBottomNav';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Scissors, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">Stylish Lab</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user.username}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {children}
      </main>

      <EmployeeBottomNav />
    </div>
  );
}
