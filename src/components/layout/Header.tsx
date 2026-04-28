'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const PATH_TITLES: Record<string, string> = {
  '/': '대시보드',
  '/budget': '예산 관리',
  '/programs/n': '프로그램 > [N] 마음충전소',
  '/programs/e': '프로그램 > [E] 캠퍼스타운 챌린지',
  '/programs/s': '프로그램 > [S] 둥지 시드머니',
  '/programs/t': '프로그램 > [T] 안심전월세 지킴이',
  '/timeline': '추진 일정',
  '/report': '보고서',
};

export default function Header() {
  const pathname = usePathname();
  const title = PATH_TITLES[pathname] ?? '대시보드';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] bg-slate-900 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <p className="text-base font-semibold text-slate-800">{title}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-600 sm:inline">2026.02 기준</span>
          <Badge variant="amber">열람 전용</Badge>
        </div>
      </div>
    </header>
  );
}
