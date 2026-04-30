import type { BudgetData, BudgetDetailItem } from '@/types';

export function todayInSeoul() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function wonToThousand(value: number) {
  return Math.round(value / 1000);
}

export function recomputeBudgetSpent(data: BudgetData) {
  const items = data.detailItems ?? [];
  const sum = (predicate: (item: BudgetDetailItem) => boolean) => items.filter(predicate).reduce((acc, item) => acc + item.actualAmountWon, 0);

  for (const program of data.byProgram) {
    program.spent = wonToThousand(sum((item) => item.programId === program.id));
  }

  if (data.byCategory.directCost) {
    data.byCategory.directCost.spent = wonToThousand(sum((item) => item.category === '직접비'));
  }
  if (data.byCategory.indirectCost) {
    data.byCategory.indirectCost.spent = wonToThousand(sum((item) => item.category === '간접비'));
  }
  if (data.byCategory.laborCost) {
    data.byCategory.laborCost.spent = wonToThousand(sum((item) => item.category === '인건비'));
  }

  for (const [key, detail] of Object.entries(data.directCostDetail)) {
    detail.spent = wonToThousand(sum((item) => item.directCostKey === key));
  }
}
