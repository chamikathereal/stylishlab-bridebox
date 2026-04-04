'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { PageLoader } from '@/components/shared/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
