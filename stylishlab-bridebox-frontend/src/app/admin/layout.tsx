'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname.split('/').filter(Boolean).slice(1);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'ADMIN') {
        router.replace('/employee/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <PageLoader />;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/5">
        <header className="flex h-16 shrink-0 items-center gap-2 px-6 sticky top-0 z-30 bg-background/60 backdrop-blur-xl border-b border-border/20 transition-all duration-300">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2 hover:bg-primary/10 hover:text-primary transition-all duration-300" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground cursor-default">Admin</span>
              {currentPath.map((segment, index) => (
                <React.Fragment key={segment}>
                  <span className="text-muted-foreground/50">/</span>
                  <span className={cn(
                    "font-medium",
                    index === currentPath.length - 1 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-sm font-semibold text-muted-foreground md:hidden gradient-text">Stylish Lab</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
