'use client';

import { ArrowRight, CalendarDays, ClipboardCheck, FileText, TrendingUp, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ChangelogEntry {
  action: string;
  target: string;
  summary: string;
  timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  KPI_UPDATE: { label: 'KPI', color: 'bg-blue-100 text-blue-700' },
  BUDGET_PROGRAM_UPDATE: { label: '예산', color: 'bg-amber-100 text-amber-700' },
  BUDGET_MONTHLY_UPDATE: { label: '월별예산', color: 'bg-orange-100 text-orange-700' },
  BUDGET_DETAIL_UPDATE: { label: '예산상세', color: 'bg-purple-100 text-purple-700' },
  BUDGET_SHEET_SYNC: { label: '시트동기화', color: 'bg-cyan-100 text-cyan-700' },
  TIMELINE_UPDATE: { label: '일정', color: 'bg-green-100 text-green-700' },
  PARTICIPANT_ADD: { label: '참여자+', color: 'bg-indigo-100 text-indigo-700' },
  PARTICIPANT_DELETE: { label: '참여자-', color: 'bg-red-100 text-red-700' },
};

const SHORTCUTS = [
  { href: '/admin/kpi', label: 'KPI 실적 입력', icon: TrendingUp, desc: '프로그램별 current 값 수정' },
  { href: '/admin/budget', label: '예산 집행 입력', icon: Wallet, desc: '집행액, 월별 실집행액 입력' },
  { href: '/admin/budget-detail', label: '예산서 상세 입력', icon: FileText, desc: '품목별 실집행액, 품의상태, 보탬e 메모 입력' },
  { href: '/admin/operations', label: '운영관리 입력', icon: ClipboardCheck, desc: '증빙, 지원금, 성과측정, 상담 케이스 입력' },
  { href: '/admin/monthly-report', label: '월간보고 입력', icon: CalendarDays, desc: '월별 성과, 이슈, 다음 달 계획 기록' },
  { href: '/admin/timeline', label: '일정 상태 관리', icon: CalendarDays, desc: '태스크 상태 변경' },
  { href: '/admin/programs/n', label: '참여자 관리', icon: Users, desc: 'N/E/S/T 참여자 추가·삭제' },
];

export default function AdminDashboard() {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    fetch('/api/data/changelog', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setChangelog(data.entries ?? []));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">데이터를 수정하면 공개 대시보드에 즉시 반영됩니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SHORTCUTS.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-xl border bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 transition-colors group-hover:bg-indigo-100">
              <Icon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-700">
          최근 변경 이력
          <span className="ml-2 text-xs font-normal text-slate-400">최근 20건 표시</span>
        </h2>
        {changelog.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white py-10 text-center text-sm text-slate-400">아직 변경 이력이 없습니다</div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  {['시각', '유형', '대상', '내용'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {changelog.slice(0, 20).map((entry, index) => {
                  const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                        {new Date(entry.timestamp).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{entry.target}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{entry.summary}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
