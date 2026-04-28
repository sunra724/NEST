'use client';

import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { MonthlyReportEntry, OperationsData } from '@/types';

interface Props {
  data: OperationsData;
  onSaved: () => void;
}

const MONTHS = [
  { value: '2026-03', label: '2026년 3월' },
  { value: '2026-04', label: '2026년 4월' },
  { value: '2026-05', label: '2026년 5월' },
  { value: '2026-06', label: '2026년 6월' },
  { value: '2026-07', label: '2026년 7월' },
  { value: '2026-08', label: '2026년 8월' },
  { value: '2026-09', label: '2026년 9월' },
  { value: '2026-10', label: '2026년 10월' },
  { value: '2026-11', label: '2026년 11월' },
  { value: '2026-12', label: '2026년 12월' },
];

function emptyEntry(month: string): MonthlyReportEntry {
  return {
    month,
    highlights: '',
    issues: '',
    nextPlans: '',
    supportNeeds: '',
    updatedAt: '',
  };
}

function TextArea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        className="min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default function MonthlyReportEditor({ data, onSaved }: Props) {
  const [month, setMonth] = useState('2026-04');
  const [edits, setEdits] = useState<Record<string, MonthlyReportEntry>>({});
  const [saving, setSaving] = useState(false);

  const original = data.monthlyReports?.find((entry) => entry.month === month) ?? emptyEntry(month);
  const edit = edits[month] ?? original;
  const changed =
    edit.highlights !== original.highlights ||
    edit.issues !== original.issues ||
    edit.nextPlans !== original.nextPlans ||
    edit.supportNeeds !== original.supportNeeds;

  function update(field: keyof Pick<MonthlyReportEntry, 'highlights' | 'issues' | 'nextPlans' | 'supportNeeds'>, value: string) {
    setEdits((prev) => ({
      ...prev,
      [month]: {
        ...edit,
        month,
        [field]: value,
      },
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/monthly-report', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      });
      if (!res.ok) throw new Error();
      toast.success('월간 운영보고 메모를 저장했습니다');
      setEdits((prev) => {
        const next = { ...prev };
        delete next[month];
        return next;
      });
      onSaved();
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">월 선택</h2>
            <p className="mt-1 text-xs text-slate-500">월별 운영보고에 들어갈 서술형 메모를 입력합니다.</p>
          </div>
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          >
            {MONTHS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TextArea
          label="주요 성과"
          value={edit.highlights}
          placeholder="이번 달 주요 운영 성과, 모집/선정/프로그램 진행 결과를 적습니다."
          onChange={(value) => update('highlights', value)}
        />
        <TextArea
          label="이슈/리스크"
          value={edit.issues}
          placeholder="일정 지연, 참여자 이탈, 예산 집행 이슈, 증빙 보완사항을 적습니다."
          onChange={(value) => update('issues', value)}
        />
        <TextArea
          label="다음 달 계획"
          value={edit.nextPlans}
          placeholder="다음 달 주요 일정, 준비할 자료, 프로그램 운영 계획을 적습니다."
          onChange={(value) => update('nextPlans', value)}
        />
        <TextArea
          label="지원/보완 필요"
          value={edit.supportNeeds}
          placeholder="협조 요청, 행정 지원, 보탬e/증빙 보완, 의사결정 필요사항을 적습니다."
          onChange={(value) => update('supportNeeds', value)}
        />
      </section>

      <div className="flex items-center justify-end gap-3">
        {original.updatedAt ? <span className="text-xs text-slate-400">최근 저장: {new Date(original.updatedAt).toLocaleString('ko-KR')}</span> : null}
        <Button className="gap-2" disabled={!changed || saving} onClick={save}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          저장
        </Button>
      </div>
    </div>
  );
}
