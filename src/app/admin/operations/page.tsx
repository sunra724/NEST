'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import OperationsEditor from '@/components/admin/OperationsEditor';
import type { OperationsData } from '@/types';

export default function AdminOperationsPage() {
  const router = useRouter();
  const [data, setData] = useState<OperationsData | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data/operations', { cache: 'no-store' });
    return (await res.json()) as OperationsData;
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

  if (!data) return <div className="p-8 text-slate-500">운영관리 데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">운영관리 입력</h1>
        <p className="mt-1 text-sm text-slate-500">
          증빙 상태, 지원금 교부, 성과측정, 주거 상담 케이스를 입력합니다. 기준일: {data.lastUpdated}
        </p>
      </div>

      <OperationsEditor data={data} onSaved={reload} />
    </div>
  );
}
