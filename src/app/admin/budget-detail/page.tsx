'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import BudgetDetailEditor from '@/components/admin/BudgetDetailEditor';
import type { BudgetData } from '@/types';

export default function AdminBudgetDetailPage() {
  const router = useRouter();
  const [data, setData] = useState<BudgetData | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data/budget', { cache: 'no-store' });
    return (await res.json()) as BudgetData;
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

  if (!data) return <div className="p-8 text-slate-500">예산 상세 데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">예산서 세부 집행 입력</h1>
        <p className="mt-1 text-sm text-slate-500">남구청 제출 예산서 항목별 실집행액, 품의상태, 보탬e 메모를 입력합니다.</p>
      </div>

      <BudgetDetailEditor data={data} onSaved={reload} />
    </div>
  );
}
