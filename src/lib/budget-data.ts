import { applyBudgetSheetChanges, readBudgetSheetRows } from '@/lib/budget-sheet';
import { loadJSON } from '@/lib/data';
import type { BudgetData } from '@/types';

function cloneBudgetData(data: BudgetData): BudgetData {
  return JSON.parse(JSON.stringify(data)) as BudgetData;
}

export async function loadBudgetData() {
  const data = await loadJSON<BudgetData>('budget.json');

  try {
    const sheet = await readBudgetSheetRows();
    const nextData = cloneBudgetData(data);
    applyBudgetSheetChanges(nextData, sheet.rows, sheet.skipped);
    return nextData;
  } catch {
    return data;
  }
}
