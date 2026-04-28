import type { Metadata } from 'next';
import OperationsDashboard from '@/components/dashboard/OperationsDashboard';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import { loadJSON } from '@/lib/data';
import type { OperationsData } from '@/types';

export const metadata: Metadata = {
  title: '운영관리 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getOperationsData() {
  try {
    return await loadJSON<OperationsData>('operations.json');
  } catch {
    return null;
  }
}

export default async function OperationsPage() {
  const data = await getOperationsData();

  if (!data) {
    return <ErrorState />;
  }

  if (!data.evidence.length) {
    return <EmptyState />;
  }

  return <OperationsDashboard data={data} />;
}
