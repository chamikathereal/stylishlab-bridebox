'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Wallet,
  User,
} from 'lucide-react';

const tabs = [
  { href: '/employee/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/employee/customers', label: 'Clients', icon: Users },
  { href: '/employee/new-sale', label: 'Sale', icon: PlusCircle, isMain: true },
  { href: '/employee/earnings', label: 'Earnings', icon: Wallet },
  { href: '/employee/profile', label: 'Profile', icon: User },
];

export function EmployeeBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          if (tab.isMain) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
                  <tab.icon className="w-6 h-6 text-white" />
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors min-w-[56px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
