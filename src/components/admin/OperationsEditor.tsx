'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { OperationStatus, OperationsData } from '@/types';

interface Props {
  data: OperationsData;
  onSaved: () => void;
}

const STATUS_OPTIONS: { value: OperationStatus; label: string }[] = [
  { value: 'not_started', label: '대기' },
  { value: 'in_progress', label: '진행' },
  { value: 'completed', label: '완료' },
  { value: 'risk', label: '주의' },
];

const STATUS_VARIANTS: Record<OperationStatus, 'pending' | 'info' | 'success' | 'amber'> = {
  not_started: 'pending',
  in_progress: 'info',
  completed: 'success',
  risk: 'amber',
};

function statusLabel(status: OperationStatus) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: OperationStatus;
  onChange: (status: OperationStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as OperationStatus)}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function StatusBadge({ status }: { status: OperationStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{statusLabel(status)}</Badge>;
}

function SaveButton({ changed, saving, onClick }: { changed: boolean; saving: boolean; onClick: () => void }) {
  return (
    <Button size="sm" variant={changed ? 'default' : 'outline'} className="w-16 shrink-0" disabled={!changed || saving} onClick={onClick}>
      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : changed ? '저장' : <Check className="h-3 w-3 text-slate-400" />}
    </Button>
  );
}

export default function OperationsEditor({ data, onSaved }: Props) {
  const [evidenceEdits, setEvidenceEdits] = useState<Record<string, OperationStatus>>({});
  const [fundingEdits, setFundingEdits] = useState<Record<string, { currentAmount: number; status: OperationStatus }>>({});
  const [measurementEdits, setMeasurementEdits] = useState<Record<string, { current: number; status: OperationStatus }>>({});
  const [caseEdits, setCaseEdits] = useState<Record<string, { current: number; status: OperationStatus }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function save(body: Record<string, unknown>, key: string, message: string) {
    setSaving(key);
    try {
      const res = await fetch('/api/admin/operations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(message);
      onSaved();
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(null);
    }
  }

  return (
    <Tabs defaultValue="evidence" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="evidence">증빙</TabsTrigger>
        <TabsTrigger value="funding">지원금</TabsTrigger>
        <TabsTrigger value="measurements">성과측정</TabsTrigger>
        <TabsTrigger value="cases">상담 케이스</TabsTrigger>
      </TabsList>

      <TabsContent value="evidence" className="space-y-4">
        {data.evidence.map((group) => (
          <section key={group.program} className="overflow-hidden rounded-xl border bg-white">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-800">{group.label}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  완료 {formatNumber(group.completed)} / 필수 {formatNumber(group.required)}개
                </p>
              </div>
              <Badge variant="secondary">{formatPercent(group.completed, group.required)}%</Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>항목</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>기한</TableHead>
                    <TableHead>담당</TableHead>
                    <TableHead>현재</TableHead>
                    <TableHead>변경</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((item) => {
                    const key = `${group.program}|${item.name}`;
                    const editStatus = evidenceEdits[key] ?? item.status;
                    const changed = editStatus !== item.status;
                    return (
                      <TableRow key={key}>
                        <TableCell className="min-w-52 font-medium text-slate-800">{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.due}</TableCell>
                        <TableCell>{item.owner}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <StatusSelect value={editStatus} disabled={saving === key} onChange={(status) => setEvidenceEdits((prev) => ({ ...prev, [key]: status }))} />
                        </TableCell>
                        <TableCell>
                          <SaveButton
                            changed={changed}
                            saving={saving === key}
                            onClick={() => save({ type: 'evidence', program: group.program, name: item.name, status: editStatus }, key, '증빙 상태를 저장했습니다')}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </TabsContent>

      <TabsContent value="funding" className="space-y-4">
        {data.funding.map((group) => (
          <section key={group.program} className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-slate-800">{group.label}</h2>
              <p className="mt-1 text-xs text-slate-500">지원 계획 {formatNumber(group.totalBudget)}천원</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>단계</TableHead>
                    <TableHead>조건</TableHead>
                    <TableHead className="text-right">계획</TableHead>
                    <TableHead className="text-right">집행</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">수정 집행</TableHead>
                    <TableHead>수정 상태</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.disbursements.map((item) => {
                    const key = `${group.program}|${item.stage}`;
                    const edit = fundingEdits[key] ?? { currentAmount: item.currentAmount, status: item.status };
                    const changed = edit.currentAmount !== item.currentAmount || edit.status !== item.status;
                    return (
                      <TableRow key={key}>
                        <TableCell>
                          {item.stage}
                          {item.ratio ? <span className="ml-1 text-xs text-slate-500">({item.ratio}%)</span> : null}
                        </TableCell>
                        <TableCell className="min-w-72">{item.condition}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(item.plannedAmount)}천원</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(item.currentAmount)}천원</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-28 text-right tabular-nums"
                            value={edit.currentAmount}
                            onChange={(event) =>
                              setFundingEdits((prev) => ({ ...prev, [key]: { ...edit, currentAmount: Number(event.target.value) } }))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <StatusSelect value={edit.status} disabled={saving === key} onChange={(status) => setFundingEdits((prev) => ({ ...prev, [key]: { ...edit, status } }))} />
                        </TableCell>
                        <TableCell>
                          <SaveButton
                            changed={changed}
                            saving={saving === key}
                            onClick={() =>
                              save(
                                { type: 'funding', program: group.program, stage: item.stage, currentAmount: edit.currentAmount, status: edit.status },
                                key,
                                '지원금 정보를 저장했습니다',
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </TabsContent>

      <TabsContent value="measurements">
        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사업</TableHead>
                  <TableHead>지표</TableHead>
                  <TableHead>도구</TableHead>
                  <TableHead>목표</TableHead>
                  <TableHead className="text-right">현재</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">수정 현재</TableHead>
                  <TableHead>수정 상태</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.measurements.map((item) => {
                  const key = `${item.program}|${item.label}`;
                  const edit = measurementEdits[key] ?? { current: item.current, status: item.status };
                  const changed = edit.current !== item.current || edit.status !== item.status;
                  return (
                    <TableRow key={key}>
                      <TableCell>{item.program}</TableCell>
                      <TableCell className="min-w-44 font-medium text-slate-800">{item.label}</TableCell>
                      <TableCell>{item.tool}</TableCell>
                      <TableCell>{item.target}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.current)}
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="w-24 text-right tabular-nums"
                          value={edit.current}
                          onChange={(event) => setMeasurementEdits((prev) => ({ ...prev, [key]: { ...edit, current: Number(event.target.value) } }))}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusSelect value={edit.status} disabled={saving === key} onChange={(status) => setMeasurementEdits((prev) => ({ ...prev, [key]: { ...edit, status } }))} />
                      </TableCell>
                      <TableCell>
                        <SaveButton
                          changed={changed}
                          saving={saving === key}
                          onClick={() =>
                            save(
                              { type: 'measurement', program: item.program, label: item.label, current: edit.current, status: edit.status },
                              key,
                              '성과측정 값을 저장했습니다',
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      </TabsContent>

      <TabsContent value="cases">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.casePipeline.map((item) => {
            const edit = caseEdits[item.label] ?? { current: item.current, status: item.status };
            const changed = edit.current !== item.current || edit.status !== item.status;
            return (
              <article key={item.label} className="rounded-xl border bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-800">{item.label}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      목표 {formatNumber(item.target)}
                      {item.unit}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, formatPercent(item.current, item.target))}%` }} />
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    type="number"
                    min={0}
                    className="text-right tabular-nums"
                    value={edit.current}
                    onChange={(event) => setCaseEdits((prev) => ({ ...prev, [item.label]: { ...edit, current: Number(event.target.value) } }))}
                  />
                  <StatusSelect value={edit.status} disabled={saving === item.label} onChange={(status) => setCaseEdits((prev) => ({ ...prev, [item.label]: { ...edit, status } }))} />
                  <div className="text-xs text-slate-500">
                    현재 {formatNumber(item.current)} / {formatNumber(item.target)}
                    {item.unit}
                  </div>
                  <SaveButton
                    changed={changed}
                    saving={saving === item.label}
                    onClick={() => save({ type: 'case', label: item.label, current: edit.current, status: edit.status }, item.label, '상담 케이스 값을 저장했습니다')}
                  />
                </div>
              </article>
            );
          })}
        </section>
      </TabsContent>
    </Tabs>
  );
}
