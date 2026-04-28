import type { Metadata } from 'next';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import KpiProgressSection from '@/components/dashboard/KpiProgressSection';
import MonthlySchedule from '@/components/dashboard/MonthlySchedule';
import NestFlowDiagram from '@/components/dashboard/NestFlowDiagram';
import OverviewCards from '@/components/dashboard/OverviewCards';
import { loadJSON } from '@/lib/data';
import type { BudgetData, KpiData, OverviewData, TimelineData } from '@/types';

export const metadata: Metadata = {
  title: '대시보드 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    return await Promise.all([
      loadJSON<OverviewData>('overview.json'),
      loadJSON<KpiData>('kpi.json'),
      loadJSON<BudgetData>('budget.json'),
      loadJSON<TimelineData>('timeline.json'),
    ]);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <ErrorState />;
  }

  const [overview, kpi, budget, timeline] = data;

  if (!overview.programs.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      <OverviewCards overview={overview} />
      <NestFlowDiagram overview={overview} kpi={kpi} />
      <KpiProgressSection kpi={kpi} />
      <BudgetOverview budget={budget} />
      <MonthlySchedule timeline={timeline} />
    </div>
  );
}
