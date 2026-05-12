import type { BudgetDetailApprovalStatus } from '@/types';

export const BUDGET_EXECUTION_STATUS_OPTIONS: { value: BudgetDetailApprovalStatus; label: string }[] = [
  { value: 'not_requested', label: '집행등록' },
  { value: 'requested', label: '집행요청' },
  { value: 'paid', label: '집행완료' },
];

export function normalizeBudgetExecutionStatus(status: BudgetDetailApprovalStatus): BudgetDetailApprovalStatus {
  if (status === 'approved' || status === 'needs_review') {
    return 'requested';
  }
  return status;
}

export function getBudgetExecutionStatusLabel(status: BudgetDetailApprovalStatus) {
  return BUDGET_EXECUTION_STATUS_OPTIONS.find((option) => option.value === normalizeBudgetExecutionStatus(status))?.label ?? status;
}

export function getBudgetExecutionStatusVariant(status: BudgetDetailApprovalStatus): 'pending' | 'info' | 'success' | 'amber' {
  const normalized = normalizeBudgetExecutionStatus(status);
  if (normalized === 'paid') return 'success';
  if (normalized === 'requested') return 'info';
  return 'pending';
}
