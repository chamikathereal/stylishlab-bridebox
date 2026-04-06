"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Scissors,
  UserCheck,
  ShoppingCart,
  CreditCard,
  Receipt,
  Wallet,
  Building2,
  FileText,
  BarChart3,
  User,
  LogOut,
  ChevronRight,
  ChevronsUpDown,
  LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/customers", label: "Customers", icon: UserCheck },
  { href: "/admin/sales", label: "Sales", icon: ShoppingCart },
  { href: "/admin/credits", label: "Credits", icon: CreditCard },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/salary", label: "Salary", icon: Wallet },
  { href: "/admin/payees", label: "Payees", icon: Building2 },
  { href: "/admin/bills", label: "Bills", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/profile", label: "Profile", icon: User },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/10 bg-sidebar/50 backdrop-blur-xl"
    >
      <SidebarHeader
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "px-1.5 pt-4 pb-2" : "px-2 pt-4 pb-2",
        )}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-sidebar-primary-foreground shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                      <Scissors className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[state=collapsed]:hidden">
                      <span className="truncate font-bold gradient-text whitespace-nowrap tracking-tight">
                        Stylish Lab
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        Bridebox Admin
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/50 group-data-[state=collapsed]:hidden" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Scissors className="size-4 shrink-0" />
                  </div>
                  Stylish Lab
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={cn("gap-1", isCollapsed ? "px-0" : "px-2")}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-300",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4.5 h-4.5 shrink-0",
                          isActive && "text-primary",
                        )}
                      />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2 transition-all duration-300 group-data-[state=collapsed]:hidden">
                  <span className="truncate font-semibold">{user?.username}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Administrator
                  </span>
                </div>
                <ChevronRight className="ml-auto size-4 text-muted-foreground/50 group-data-[state=collapsed]:hidden" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
