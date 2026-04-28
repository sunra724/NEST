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
import type { EvidenceSource, OperationStatus, OperationsData } from '@/types';

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

const EVIDENCE_STATUS_OPTIONS: { value: OperationStatus; label: string }[] = [
  { value: 'not_started', label: '대기' },
  { value: 'in_progress', label: '준비중' },
  { value: 'completed', label: '등록완료' },
  { value: 'risk', label: '보완필요' },
];

const SOURCE_OPTIONS: { value: EvidenceSource; label: string }[] = [
  { value: 'botem-e', label: '보탬e' },
  { value: 'google-drive', label: 'Google Drive' },
  { value: 'internal', label: '내부보관' },
  { value: 'other', label: '기타' },
];

const STATUS_VARIANTS: Record<OperationStatus, 'pending' | 'info' | 'success' | 'amber'> = {
  not_started: 'pending',
  in_progress: 'info',
  completed: 'success',
  risk: 'amber',
};

interface EvidenceEdit {
  status: OperationStatus;
  source: EvidenceSource;
  referenceNo: string;
  url: string;
  submittedAt: string;
  memo: string;
}

function statusLabel(status: OperationStatus, evidence = false) {
  const options = evidence ? EVIDENCE_STATUS_OPTIONS : STATUS_OPTIONS;
  return options.find((option) => option.value === status)?.label ?? status;
}

function sourceLabel(source: EvidenceSource) {
  return SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source;
}

function StatusSelect({
  value,
  onChange,
  disabled,
  evidence = false,
}: {
  value: OperationStatus;
  onChange: (status: OperationStatus) => void;
  disabled?: boolean;
  evidence?: boolean;
}) {
  const options = evidence ? EVIDENCE_STATUS_OPTIONS : STATUS_OPTIONS;
  return (
    <select
      className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as OperationStatus)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SourceSelect({ value, onChange, disabled }: { value: EvidenceSource; onChange: (source: EvidenceSource) => void; disabled?: boolean }) {
  return (
    <select
      className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as EvidenceSource)}
    >
      {SOURCE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function StatusBadge({ status, evidence = false }: { status: OperationStatus; evidence?: boolean }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{statusLabel(status, evidence)}</Badge>;
}

function SaveButton({ changed, saving, onClick }: { changed: boolean; saving: boolean; onClick: () => void }) {
  return (
    <Button size="sm" variant={changed ? 'default' : 'outline'} className="w-16 shrink-0" disabled={!changed || saving} onClick={onClick}>
      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : changed ? '저장' : <Check className="h-3 w-3 text-slate-400" />}
    </Button>
  );
}

export default function OperationsEditor({ data, onSaved }: Props) {
  const [evidenceEdits, setEvidenceEdits] = useState<Record<string, EvidenceEdit>>({});
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

  function getEvidenceEdit(key: string, item: OperationsData['evidence'][number]['items'][number]): EvidenceEdit {
    return (
      evidenceEdits[key] ?? {
        status: item.status,
        source: item.source ?? 'internal',
        referenceNo: item.referenceNo ?? '',
        url: item.url ?? '',
        submittedAt: item.submittedAt ?? '',
        memo: item.memo ?? '',
      }
    );
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
                  등록완료 {formatNumber(group.completed)} / 필수 {formatNumber(group.required)}개
                </p>
              </div>
              <Badge variant="secondary">{formatPercent(group.completed, group.required)}%</Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>항목</TableHead>
                    <TableHead>출처</TableHead>
                    <TableHead>관리번호</TableHead>
                    <TableHead>링크</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>메모</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((item) => {
                    const key = `${group.program}|${item.name}`;
                    const edit = getEvidenceEdit(key, item);
                    const changed =
                      edit.status !== item.status ||
                      edit.source !== (item.source ?? 'internal') ||
                      edit.referenceNo !== (item.referenceNo ?? '') ||
                      edit.url !== (item.url ?? '') ||
                      edit.submittedAt !== (item.submittedAt ?? '') ||
                      edit.memo !== (item.memo ?? '');
                    return (
                      <TableRow key={key}>
                        <TableCell className="min-w-56">
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.type} · {item.due} · {item.owner}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">현재 출처: {sourceLabel(item.source ?? 'internal')}</p>
                        </TableCell>
                        <TableCell>
                          <SourceSelect
                            value={edit.source}
                            disabled={saving === key}
                            onChange={(source) => setEvidenceEdits((prev) => ({ ...prev, [key]: { ...edit, source } }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-40"
                            placeholder="보탬e 번호/내부번호"
                            value={edit.referenceNo}
                            onChange={(event) => setEvidenceEdits((prev) => ({ ...prev, [key]: { ...edit, referenceNo: event.target.value } }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-56"
                            placeholder="Drive 또는 외부 URL"
                            value={edit.url}
                            onChange={(event) => setEvidenceEdits((prev) => ({ ...prev, [key]: { ...edit, url: event.target.value } }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            className="w-36"
                            value={edit.submittedAt}
                            onChange={(event) => setEvidenceEdits((prev) => ({ ...prev, [key]: { ...edit, submittedAt: event.target.value } }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-56"
                            placeholder="미비사항 또는 보관 위치"
                            value={edit.memo}
                            onChange={(event) => setEvidenceEdits((prev) => ({ ...prev, [key]: { ...edit, memo: event.target.value } }))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <StatusBadge status={item.status} evidence />
                            <StatusSelect
                              value={edit.status}
                              disabled={saving === key}
                              evidence
                              onChange={(status) => setEvidenceEdits((prev) => ({ ...prev, [key]: { ...edit, status } }))}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <SaveButton
                            changed={changed}
                            saving={saving === key}
                            onClick={() => save({ type: 'evidence', program: group.program, name: item.name, ...edit }, key, '증빙 정보를 저장했습니다')}
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
