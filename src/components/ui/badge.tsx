import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'info' | 'pending' | 'amber' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-900 text-white',
  secondary: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  info: 'bg-blue-100 text-blue-700',
  pending: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-100 text-amber-700',
  outline: 'border border-slate-300 bg-white text-slate-700',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
