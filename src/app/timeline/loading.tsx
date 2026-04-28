import { Skeleton } from '@/components/ui/skeleton';

export default function TimelineLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
