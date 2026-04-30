'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import BudgetDetailEditor from '@/components/admin/BudgetDetailEditor';
import BudgetSheetSyncPanel from '@/components/admin/BudgetSheetSyncPanel';
import type { BudgetData } from '@/types';

interface Props {
  initialData: BudgetData;
}

export default function BudgetDetailAdminClient({ initialData }: Props) {
  const router = useRouter();
  const [data, setData] = useState<BudgetData>(initialData);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setError('');
    const res = await fetch('/api/data/budget', { cache: 'no-store' });
    if (!res.ok) {
      setError('예산 상세 데이터를 다시 불러오지 못했습니다. 로그인 상태를 확인해 주세요.');
      return;
    }
    setData((await res.json()) as BudgetData);
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">예산서 세부 집행 입력</h1>
        <p className="mt-1 text-sm text-slate-500">남구청 제출 예산서 항목별 실집행액, 품의상태, 보탬e 메모를 입력합니다.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <BudgetSheetSyncPanel onSynced={reload} />
      <BudgetDetailEditor data={data} onSaved={reload} />
    </div>
  );
}
