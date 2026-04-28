'use client';

import { Archive, FileCheck2, HandCoins, Home, LineChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { EvidenceGroup, FundingGroup, OperationStatus, OperationsData } from '@/types';

interface OperationsDashboardProps {
  data: OperationsData;
}

const statusMap: Record<OperationStatus, { label: string; variant: 'pending' | 'info' | 'success' | 'amber' }> = {
  not_started: { label: '대기', variant: 'pending' },
  in_progress: { label: '진행', variant: 'info' },
  completed: { label: '완료', variant: 'success' },
  risk: { label: '주의', variant: 'amber' },
};

function StatusBadge({ status }: { status: OperationStatus }) {
  const meta = statusMap[status] ?? statusMap.not_started;
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function evidenceTotals(groups: EvidenceGroup[]) {
  return groups.reduce(
    (acc, group) => {
      acc.required += group.required;
      acc.completed += group.completed;
      return acc;
    },
    { required: 0, completed: 0 },
  );
}

function fundingTotals(groups: FundingGroup[]) {
  return groups.reduce(
    (acc, group) => {
      for (const item of group.disbursements) {
        acc.planned += item.plannedAmount;
        acc.current += item.currentAmount;
      }
      return acc;
    },
    { planned: 0, current: 0 },
  );
}

function SummaryCard({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OperationsDashboard({ data }: OperationsDashboardProps) {
  const evidence = evidenceTotals(data.evidence);
  const funding = fundingTotals(data.funding);
  const caseTarget = data.casePipeline.reduce((acc, item) => acc + item.target, 0);
  const caseCurrent = data.casePipeline.reduce((acc, item) => acc + item.current, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Operations</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">보조금 운영관리</h1>
            <p className="mt-2 text-sm text-slate-600">증빙자료, 지원금 교부, 성과측정, 주거 상담 케이스를 사업계획서 기준으로 점검합니다.</p>
          </div>
          <Badge variant="outline">기준일 {data.lastUpdated}</Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<FileCheck2 className="h-5 w-5" />}
          label="증빙 완료율"
          value={`${formatPercent(evidence.completed, evidence.required)}%`}
          helper={`${formatNumber(evidence.completed)} / ${formatNumber(evidence.required)}개`}
        />
        <SummaryCard
          icon={<HandCoins className="h-5 w-5" />}
          label="교부 진행률"
          value={`${formatPercent(funding.current, funding.planned)}%`}
          helper={`${formatNumber(funding.current)} / ${formatNumber(funding.planned)}천원`}
        />
        <SummaryCard
          icon={<LineChart className="h-5 w-5" />}
          label="성과측정 항목"
          value={`${formatNumber(data.measurements.length)}개`}
          helper="사전·사후 또는 만족도 기반"
        />
        <SummaryCard
          icon={<Home className="h-5 w-5" />}
          label="주거 케이스"
          value={`${formatPercent(caseCurrent, caseTarget)}%`}
          helper={`${formatNumber(caseCurrent)} / ${formatNumber(caseTarget)}건·회`}
        />
      </section>

      <Tabs defaultValue="evidence" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="evidence">증빙자료</TabsTrigger>
          <TabsTrigger value="funding">지원금 교부</TabsTrigger>
          <TabsTrigger value="measurements">성과측정</TabsTrigger>
          <TabsTrigger value="cases">상담케이스</TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="space-y-4">
          {data.evidence.map((group) => (
            <Card key={group.program}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{group.label}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    완료 {formatNumber(group.completed)} / 필수 {formatNumber(group.required)}
                  </p>
                </div>
                <Badge variant="secondary">{formatPercent(group.completed, group.required)}%</Badge>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>증빙 항목</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>기한</TableHead>
                        <TableHead>담당</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item) => (
                        <TableRow key={`${group.program}-${item.name}`}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.due}</TableCell>
                          <TableCell>{item.owner}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="funding" className="space-y-4">
          {data.funding.map((group) => (
            <Card key={group.program}>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">{group.label}</h2>
                <p className="mt-1 text-sm text-slate-500">지원 계획 {formatNumber(group.totalBudget)}천원</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>단계</TableHead>
                        <TableHead>조건</TableHead>
                        <TableHead className="text-right">계획</TableHead>
                        <TableHead className="text-right">집행</TableHead>
                        <TableHead className="text-right">진행률</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.disbursements.map((item) => (
                        <TableRow key={`${group.program}-${item.stage}`}>
                          <TableCell>
                            {item.stage}
                            {item.ratio ? <span className="ml-1 text-xs text-slate-500">({item.ratio}%)</span> : null}
                          </TableCell>
                          <TableCell>{item.condition}</TableCell>
                          <TableCell className="text-right">{formatNumber(item.plannedAmount)}천원</TableCell>
                          <TableCell className="text-right">{formatNumber(item.currentAmount)}천원</TableCell>
                          <TableCell className="text-right">{formatPercent(item.currentAmount, item.plannedAmount)}%</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">성과측정 항목</h2>
            </CardHeader>
            <CardContent>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.measurements.map((item) => (
                      <TableRow key={`${item.program}-${item.label}`}>
                        <TableCell>{item.program}</TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.tool}</TableCell>
                        <TableCell>{item.target}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(item.current)}
                          {item.unit}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Archive className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">안심전월세 케이스 파이프라인</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {data.casePipeline.map((item) => (
                  <article key={item.label} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-slate-800">{item.label}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, formatPercent(item.current, item.target))}%` }} />
                    </div>
                    <p className="text-sm text-slate-600">
                      {formatNumber(item.current)} / {formatNumber(item.target)}
                      {item.unit}
                    </p>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
