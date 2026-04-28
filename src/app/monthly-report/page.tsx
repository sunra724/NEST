import type { Metadata } from 'next';
import MonthlyReportView from '@/components/dashboard/MonthlyReportView';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import { loadJSON } from '@/lib/data';
import type { BudgetData, KpiData, OperationsData, OverviewData, TimelineData } from '@/types';

export const metadata: Metadata = {
  title: '월간 운영보고 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getMonthlyReportData() {
  try {
    return await Promise.all([
      loadJSON<OverviewData>('overview.json'),
      loadJSON<KpiData>('kpi.json'),
      loadJSON<BudgetData>('budget.json'),
      loadJSON<TimelineData>('timeline.json'),
      loadJSON<OperationsData>('operations.json'),
    ]);
  } catch {
    return null;
  }
}

export default async function MonthlyReportPage() {
  const data = await getMonthlyReportData();

  if (!data) {
    return <ErrorState />;
  }

  const [overview, kpi, budget, timeline, operations] = data;

  if (!overview.programs.length) {
    return <EmptyState />;
  }

  return <MonthlyReportView overview={overview} kpi={kpi} budget={budget} timeline={timeline} operations={operations} />;
}
