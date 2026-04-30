'use client';

import { CalendarDays, ChevronDown, ClipboardCheck, FileText, FolderKanban, LayoutDashboard, Lock, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NEST_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const PROGRAM_MENUS = [
  { id: 'N', href: '/programs/n', label: '[N] 마음충전소', dot: NEST_COLORS.N.primary },
  { id: 'E', href: '/programs/e', label: '[E] 캠퍼스타운 챌린지', dot: NEST_COLORS.E.primary },
  { id: 'S', href: '/programs/s', label: '[S] 둥지 시드머니', dot: NEST_COLORS.S.primary },
  { id: 'T', href: '/programs/t', label: '[T] 안심전월세 지킴이', dot: NEST_COLORS.T.primary },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800 before:content-['']",
        active && 'bg-slate-800 before:absolute before:bottom-1 before:left-0 before:top-1 before:w-[3px] before:rounded-r before:bg-[#6366F1]',
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const isProgramPath = pathname.startsWith('/programs');

  return (
    <nav className={cn('flex h-full w-full flex-col bg-slate-900 text-white', className)}>
      <div className="border-b border-slate-700 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">N.E.S.T.</p>
        <p className="mt-1 text-base font-semibold">성과관리 대시보드</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <MenuItem href="/" label="대시보드" icon={<LayoutDashboard className="h-4 w-4" />} active={isActivePath(pathname, '/')} />
          <MenuItem href="/budget" label="예산 관리" icon={<Wallet className="h-4 w-4" />} active={pathname === '/budget'} />
          <MenuItem href="/budget/detail" label="예산서 상세" icon={<FileText className="h-4 w-4" />} active={isActivePath(pathname, '/budget/detail')} />
          <MenuItem href="/operations" label="운영관리" icon={<ClipboardCheck className="h-4 w-4" />} active={isActivePath(pathname, '/operations')} />

          <div className={cn('rounded-md border border-slate-800', isProgramPath && 'bg-slate-800/70')}>
            <div className="flex items-center justify-between px-3 py-2 text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <FolderKanban className="h-4 w-4" />
                <span>프로그램</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="space-y-1 pb-2">
              {PROGRAM_MENUS.map((program) => (
                <Link
                  key={program.id}
                  href={program.href}
                  className={cn(
                    "relative ml-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800 before:content-['']",
                    isActivePath(pathname, program.href) &&
                      'bg-slate-800 before:absolute before:bottom-1 before:left-0 before:top-1 before:w-[3px] before:rounded-r before:bg-[#6366F1]',
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: program.dot }} />
                  <span>{program.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <MenuItem href="/timeline" label="추진 일정" icon={<CalendarDays className="h-4 w-4" />} active={isActivePath(pathname, '/timeline')} />
          <MenuItem href="/monthly-report" label="월간보고" icon={<FileText className="h-4 w-4" />} active={isActivePath(pathname, '/monthly-report')} />
          <MenuItem href="/report" label="보고서" icon={<FileText className="h-4 w-4" />} active={isActivePath(pathname, '/report')} />
        </div>
      </div>

      <div className="border-t border-slate-700 px-3 py-3">
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Lock className="h-3.5 w-3.5" />
          관리자
        </Link>
      </div>

      <div className="border-t border-slate-700 px-4 py-4 text-xs text-slate-400">대구광역시 남구 | 협동조합 소이랩</div>
    </nav>
  );
}
