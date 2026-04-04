'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'from-slate-500/20 to-slate-600/20 text-slate-400',
  primary: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
  success: 'from-green-500/20 to-emerald-500/20 text-green-400',
  warning: 'from-amber-500/20 to-orange-500/20 text-amber-400',
  danger: 'from-rose-500/20 to-red-500/20 text-rose-400',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('glass-card-hover group', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'w-11 h-11 rounded-xl bg-linear-to-br flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
              variantStyles[variant]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
