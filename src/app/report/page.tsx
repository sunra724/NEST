import type { Metadata } from 'next';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import QuarterReportView from '@/components/dashboard/QuarterReportView';
import { loadJSON } from '@/lib/data';
import type { BudgetData, KpiData, OverviewData } from '@/types';

export const metadata: Metadata = {
  title: '보고서 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getReportData() {
  try {
    return await Promise.all([
      loadJSON<OverviewData>('overview.json'),
      loadJSON<KpiData>('kpi.json'),
      loadJSON<BudgetData>('budget.json'),
    ]);
  } catch {
    return null;
  }
}

export default async function ReportPage() {
  const data = await getReportData();

  if (!data) {
    return <ErrorState />;
  }

  const [overview, kpi, budget] = data;

  if (!overview.programs.length) {
    return <EmptyState />;
  }

  return <QuarterReportView overview={overview} kpi={kpi} budget={budget} />;
}
