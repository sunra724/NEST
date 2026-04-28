export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatBudget(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}억원`;
  if (n >= 10000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}천만원`;
  return `${n.toLocaleString('ko-KR')}천원`;
}

export function formatPercent(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((current / target) * 1000) / 10;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}
