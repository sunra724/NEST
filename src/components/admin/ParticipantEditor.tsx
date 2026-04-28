'use client';

import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Participant {
  id: string;
  name: string;
  contact?: string;
  cohort?: string;
  joinedAt?: string;
  note?: string;
  registeredAt: string;
}

interface Props {
  programId: string;
  programName: string;
  participants: Participant[];
  cohortOptions: string[];
  onSaved: () => void;
}

const EMPTY_FORM = {
  name: '',
  contact: '',
  cohort: '',
  note: '',
};

export default function ParticipantEditor({ programId, programName, participants, cohortOptions, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleAdd() {
    if (!form.name.trim()) {
      toast.error('이름을 입력하세요');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, participant: form }),
      });
      if (!res.ok) throw new Error();

      toast.success(`${form.name} 등록 완료`);
      setForm(EMPTY_FORM);
      setOpen(false);
      onSaved();
    } catch {
      toast.error('등록 실패');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(participantId: string, name: string) {
    setDeleting(participantId);
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, participantId }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${name} 삭제 완료`);
      onSaved();
    } catch {
      toast.error('삭제 실패');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">
          현재 등록 <strong>{participants.length}</strong>명
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              참여자 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{programName} — 참여자 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>이름 *</Label>
                  <Input placeholder="홍길동" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>연락처</Label>
                  <Input placeholder="010-0000-0000" value={form.contact} onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>기수 / 트랙</Label>
                <select
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={form.cohort}
                  onChange={(e) => setForm((prev) => ({ ...prev, cohort: e.target.value }))}
                >
                  <option value="">선택 없음</option>
                  {cohortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>비고</Label>
                <Input placeholder="메모" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
              </div>

              <Button className="w-full" disabled={saving} onClick={handleAdd}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                등록
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white py-12 text-center text-slate-400">아직 등록된 참여자가 없습니다</div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                {['이름', '연락처', '기수/트랙', '등록일', '비고', ''].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {participants.map((participant) => (
                <tr key={participant.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{participant.name}</td>
                  <td className="px-4 py-3 text-slate-500">{participant.contact ?? '-'}</td>
                  <td className="px-4 py-3">{participant.cohort ? <Badge variant="outline">{participant.cohort}</Badge> : '-'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(participant.registeredAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{participant.note ?? '-'}</td>
                  <td className="px-4 py-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600">
                          {deleting === participant.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{participant.name}을(를) 삭제하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDelete(participant.id, participant.name)}>
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
