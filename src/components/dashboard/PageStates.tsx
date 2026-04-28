import { AlertCircle, Inbox } from 'lucide-react';

export function ErrorState() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p className="font-medium">데이터를 불러올 수 없습니다</p>
      </div>
    </div>
  );
}

export function EmptyState({ message = '아직 등록된 데이터가 없습니다' }: { message?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
      <Inbox className="mx-auto mb-2 h-6 w-6 text-slate-400" />
      <p>{message}</p>
    </div>
  );
}
