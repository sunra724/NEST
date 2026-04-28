import { Skeleton } from '@/components/ui/skeleton';

export default function ReportLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-[900px] w-full" />
    </div>
  );
}
