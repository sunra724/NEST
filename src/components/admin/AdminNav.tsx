'use client';

import { CalendarDays, LayoutDashboard, LogOut, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NEST_COLORS, type ProgramId } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/admin', label: '관리자 대시보드', icon: LayoutDashboard },
  { href: '/admin/kpi', label: 'KPI 실적 입력', icon: TrendingUp },
  { href: '/admin/budget', label: '예산 집행 입력', icon: Wallet },
  { href: '/admin/timeline', label: '일정 상태 관리', icon: CalendarDays },
];

const PROGRAMS = [
  { id: 'n', label: '[N] 마음충전소' },
  { id: 'e', label: '[E] 캠퍼스타운 챌린지' },
  { id: 's', label: '[S] 둥지 시드머니' },
  { id: 't', label: '[T] 안심전월세 지킴이' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    toast.info('로그아웃되었습니다');
    router.push('/login');
  }

  return (
    <aside className="flex min-h-screen w-60 shrink-0 flex-col bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-bold text-white">🔐 관리자</span>
        </div>
        <p className="text-xs text-slate-400">청년 N.E.S.T. 데이터 관리</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname === href ? 'border-l-2 border-indigo-400 bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-2">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-600">참여자 관리</p>
          {PROGRAMS.map(({ id, label }) => {
            const href = `/admin/programs/${id}`;
            const color = NEST_COLORS[id.toUpperCase() as ProgramId];
            return (
              <Link
                key={id}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === href ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color.primary }} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="space-y-2 border-t border-slate-800 px-3 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
          ← 열람 대시보드로
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-red-400 hover:bg-slate-800 hover:text-red-300"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
