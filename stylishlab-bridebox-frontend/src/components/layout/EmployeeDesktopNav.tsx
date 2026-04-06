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
  { href: '/employee/new-sale', label: 'Sale', icon: PlusCircle },
  { href: '/employee/earnings', label: 'Earnings', icon: Wallet },
  { href: '/employee/profile', label: 'Profile', icon: User },
];

export function EmployeeDesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center bg-muted/30 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium relative group',
              isActive 
                ? 'text-primary bg-background shadow-xs' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <tab.icon className={cn('w-4 h-4 transition-transform duration-200 group-hover:scale-110', isActive && 'text-primary')} />
            <span>{tab.label}</span>
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
