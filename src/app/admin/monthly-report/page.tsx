'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import MonthlyReportEditor from '@/components/admin/MonthlyReportEditor';
import type { OperationsData } from '@/types';

export default function AdminMonthlyReportPage() {
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

  if (!data) return <div className="p-8 text-slate-500">월간보고 데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">월간 운영보고 입력</h1>
        <p className="mt-1 text-sm text-slate-500">월별 주요 성과, 이슈, 다음 달 계획, 지원 필요사항을 기록합니다.</p>
      </div>

      <MonthlyReportEditor data={data} onSaved={reload} />
    </div>
  );
}
