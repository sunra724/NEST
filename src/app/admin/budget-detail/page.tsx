import BudgetDetailAdminClient from '@/components/admin/BudgetDetailAdminClient';
import { readJSON } from '@/lib/data-writer';
import type { BudgetData } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminBudgetDetailPage() {
  const data = await readJSON<BudgetData>('budget.json');

  return <BudgetDetailAdminClient initialData={data} />;
}
