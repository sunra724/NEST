'use client';

import { AlertTriangle, CheckCircle2, RefreshCw, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';

interface SheetChange {
  id: string;
  programId: string;
  item: string;
  before: {
    actualAmountWon: number;
    approvalStatus: string;
    memo: string;
  };
  after: {
    actualAmountWon: number;
    approvalStatus: string;
    memo: string;
  };
}

interface SkippedRow {
  rowNumber: number;
  id?: string;
  reason: string;
}

interface PreviewData {
  sheetName: string;
  totalRows: number;
  changes: SheetChange[];
  skipped: SkippedRow[];
}

interface Props {
  onSynced: () => void;
}

export default function BudgetSheetSyncPanel({ onSynced }: Props) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('아직 미리보기를 실행하지 않았습니다.');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function loadPreview() {
    setLoading(true);
    setError('');
    setStatusMessage('Google Sheet를 읽는 중입니다...');
    try {
      const res = await fetch('/api/admin/budget-sheet-sync', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '스프레드시트를 읽지 못했습니다');
      setPreview(data);
      setStatusMessage(`미리보기 완료: 변경 예정 ${formatNumber(data.changes?.length ?? 0)}개`);
      toast.success('스프레드시트 변경사항을 확인했습니다');
    } catch (err) {
      const message = err instanceof Error ? err.message : '스프레드시트 확인에 실패했습니다';
      setError(message);
      setStatusMessage('미리보기에 실패했습니다. 아래 안내를 확인해 주세요.');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function syncSheet() {
    setSyncing(true);
    setError('');
    setStatusMessage('Google Sheet 내용을 대시보드에 반영하는 중입니다...');
    try {
      const res = await fetch('/api/admin/budget-sheet-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '스프레드시트 반영에 실패했습니다');
      setPreview(data);
      setStatusMessage(`반영 완료: ${formatNumber(data.applied ?? 0)}개 항목`);
      toast.success(`${formatNumber(data.applied ?? 0)}개 항목을 반영했습니다`);
      onSynced();
    } catch (err) {
      const message = err instanceof Error ? err.message : '스프레드시트 반영에 실패했습니다';
      setError(message);
      setStatusMessage('반영에 실패했습니다. 아래 안내를 확인해 주세요.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-800">Google Sheet 동기화</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">대시보드_입력 탭의 실집행액, 품의상태, 보탬e 메모를 예산 상세에 반영합니다.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/budget-sheet-template"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            양식 CSV
          </a>
          <Button variant="outline" onClick={loadPreview} disabled={loading || syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '확인 중...' : '미리보기'}
          </Button>
          <Button onClick={syncSheet} disabled={syncing || loading || !preview}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {syncing ? '반영 중...' : '반영'}
          </Button>
        </div>
      </div>

      <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${error ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-600'}`}>
        {statusMessage}
      </div>

      {error ? (
        <div className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p>{error}</p>
            <p className="text-xs">
              현재 `대시보드_입력` 탭은 확인되지만 서버가 시트를 읽을 권한이 없습니다. 시트 오른쪽 위 공유에서 링크 권한을 보기 가능으로 바꾸거나,
              서비스 계정 이메일을 시트에 공유한 뒤 환경변수를 설정해야 합니다.
            </p>
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <div className="flex flex-wrap gap-4">
            <span>시트: {preview.sheetName}</span>
            <span>읽은 행: {formatNumber(preview.totalRows)}</span>
            <span>변경 예정: {formatNumber(preview.changes.length)}</span>
            <span>확인 필요: {formatNumber(preview.skipped.length)}</span>
          </div>
          {preview.changes.length > 0 ? (
            <div className="mt-3 space-y-1">
              {preview.changes.slice(0, 5).map((change) => (
                <p key={change.id} className="truncate">
                  {change.id} · {change.programId} · {change.item}: {formatNumber(change.before.actualAmountWon)}원 →{' '}
                  {formatNumber(change.after.actualAmountWon)}원
                </p>
              ))}
              {preview.changes.length > 5 ? <p className="text-xs text-slate-400">외 {formatNumber(preview.changes.length - 5)}개 항목</p> : null}
            </div>
          ) : null}
          {preview.skipped.length > 0 ? (
            <p className="mt-2 text-xs text-amber-700">
              확인 필요 예: {preview.skipped[0].id ? `${preview.skipped[0].id} · ` : ''}{preview.skipped[0].reason}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
