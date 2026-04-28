import { CalendarClock, HandCoins, LayoutGrid, UsersRound } from 'lucide-react';
import { formatBudget, formatNumber } from '@/lib/utils';
import type { OverviewData } from '@/types';

interface OverviewCardsProps {
  overview: OverviewData;
}

const iconClasses = 'inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700';

export default function OverviewCards({ overview }: OverviewCardsProps) {
  const cards = [
    {
      icon: <HandCoins className="h-5 w-5" />,
      label: '총 예산',
      value: formatBudget(overview.totalBudget),
    },
    {
      icon: <UsersRound className="h-5 w-5" />,
      label: '직접 수혜자',
      value: `${formatNumber(overview.totalBeneficiaries)}명+`,
    },
    {
      icon: <LayoutGrid className="h-5 w-5" />,
      label: '세부사업',
      value: `${formatNumber(overview.programs.length)}개`,
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      label: '사업기간',
      value: `${overview.period.start.replace('-', '.')}~${overview.period.end.slice(-2)}`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm">
          <div className={iconClasses}>{card.icon}</div>
          <div>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
