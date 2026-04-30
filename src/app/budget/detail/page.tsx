import type { Metadata } from 'next';
import BudgetDetailView from '@/components/dashboard/BudgetDetailView';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import { loadJSON } from '@/lib/data';
import type { BudgetData } from '@/types';

export const metadata: Metadata = {
  title: '예산서 세부내역 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getBudgetData() {
  try {
    return await loadJSON<BudgetData>('budget.json');
  } catch {
    return null;
  }
}

export default async function BudgetDetailPage() {
  const budget = await getBudgetData();

  if (!budget) {
    return <ErrorState />;
  }

  if (!budget.detailItems?.length) {
    return <EmptyState />;
  }

  return <BudgetDetailView budget={budget} />;
}
