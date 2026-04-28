import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  indicatorColor?: string;
}

export function Progress({ value, className, indicatorClassName, indicatorColor }: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-200', className)}>
      <div
        className={cn('h-full rounded-full bg-slate-900 transition-all', indicatorClassName)}
        style={{ width: `${safeValue}%`, backgroundColor: indicatorColor }}
      />
    </div>
  );
}
