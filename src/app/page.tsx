import type { Metadata } from 'next';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import GoogleCalendarSchedule from '@/components/dashboard/GoogleCalendarSchedule';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import KpiProgressSection from '@/components/dashboard/KpiProgressSection';
import NestFlowDiagram from '@/components/dashboard/NestFlowDiagram';
import OverviewCards from '@/components/dashboard/OverviewCards';
import { loadJSON } from '@/lib/data';
import { loadNestCalendarSchedule } from '@/lib/google-calendar';
import type { BudgetData, KpiData, OverviewData } from '@/types';

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
      loadNestCalendarSchedule(),
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

  const [overview, kpi, budget, calendarSchedule] = data;

  if (!overview.programs.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      <OverviewCards overview={overview} />
      <NestFlowDiagram overview={overview} kpi={kpi} />
      <KpiProgressSection kpi={kpi} />
      <BudgetOverview budget={budget} />
      <GoogleCalendarSchedule schedule={calendarSchedule} />
    </div>
  );
}
