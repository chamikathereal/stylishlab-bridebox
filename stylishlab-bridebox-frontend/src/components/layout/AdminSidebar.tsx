'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  Scissors,
  UserCheck,
  ShoppingCart,
  CreditCard,
  Receipt,
  Building2,
  FileText,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/services', label: 'Services', icon: Scissors },
  { href: '/admin/customers', label: 'Customers', icon: UserCheck },
  { href: '/admin/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/admin/credits', label: 'Credits', icon: CreditCard },
  { href: '/admin/expenses', label: 'Expenses', icon: Receipt },
  { href: '/admin/payees', label: 'Payees', icon: Building2 },
  { href: '/admin/bills', label: 'Bills', icon: FileText },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/profile', label: 'Profile', icon: User },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold gradient-text whitespace-nowrap">Stylish Lab</h2>
              <p className="text-[10px] text-muted-foreground">Bridebox Admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className={cn('w-4.5 h-4.5 shrink-0', isActive && 'text-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="p-3 border-t border-border/50">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen border-r border-border/50 bg-sidebar transition-all duration-300 sticky top-0',
          collapsed ? 'w-[68px]' : 'w-[250px]'
        )}
      >
        <SidebarContent collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
        >
          <ChevronLeft className={cn('w-3 h-3 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Trigger */}
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden fixed top-3 left-3 z-50 glass-card">
              <Menu className="w-5 h-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-[250px] p-0">
          <SidebarContent collapsed={false} onNavigate={() => {}} />
        </SheetContent>
      </Sheet>
    </>
  );
}
