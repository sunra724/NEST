'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import TimelineEditor from '@/components/admin/TimelineEditor';
import type { TimelineData } from '@/types';

export default function AdminTimelinePage() {
  const router = useRouter();
  const [data, setData] = useState<TimelineData | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data/timeline', { cache: 'no-store' });
    return (await res.json()) as TimelineData;
  }, []);

  const reload = useCallback(async () => {
    setData(await fetchData());
    router.refresh();
  }, [fetchData, router]);

  useEffect(() => {
    let active = true;
    void fetchData().then((nextData) => {
      if (active) setData(nextData);
    });
    return () => {
      active = false;
    };
  }, [fetchData]);

  if (!data) return <div className="p-8 text-slate-500">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">추진 일정 상태 관리</h1>
        <p className="mt-1 text-sm text-slate-500">각 태스크의 상태 버튼을 클릭하면 즉시 저장됩니다.</p>
      </div>
      <TimelineEditor data={data} onSaved={reload} />
    </div>
  );
}
