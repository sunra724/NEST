'use client';

/* eslint-disable @next/next/no-img-element */
import { ArrowDown, ArrowUp, FileImage, Images, Printer, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SheetInfo {
  projectName: string;
  usageDate: string;
  expenditureContent: string;
  vendor: string;
  amount: string;
  submitTo: string;
  operator: string;
  preparedDate: string;
}

interface PhotoItem {
  id: string;
  fileName: string;
  url: string;
  caption: string;
}

const FIELD_LABELS: Record<keyof SheetInfo, string> = {
  projectName: '사업명',
  usageDate: '집행일자',
  expenditureContent: '집행내용',
  vendor: '사용처',
  amount: '금액',
  submitTo: '제출처',
  operator: '운영기관',
  preparedDate: '작성일',
};

const defaultSheetInfo: SheetInfo = {
  projectName: '청년 N.E.S.T.',
  usageDate: '',
  expenditureContent: '',
  vendor: '',
  amount: '',
  submitTo: '대구광역시 남구',
  operator: '협동조합 소이랩',
  preparedDate: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()),
};

function createPhotoId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fileNameToCaption(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

function chunkPhotos(photos: PhotoItem[]) {
  const pages: PhotoItem[][] = [];

  for (let index = 0; index < photos.length; index += 4) {
    pages.push(photos.slice(index, index + 4));
  }

  return pages.length > 0 ? pages : [[]];
}

function formatDate(date: string) {
  if (!date) return '';
  return date.replaceAll('-', '.');
}

function PhotoSlot({ photo, index }: { photo: PhotoItem | null; index: number }) {
  return (
    <figure className="flex h-[94mm] flex-col overflow-hidden border border-slate-800 bg-white">
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        {photo ? (
          <img src={photo.url} alt={photo.caption || photo.fileName} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">사진 {index + 1}</div>
        )}
      </div>
      <figcaption className="min-h-9 border-t border-slate-800 px-2 py-1 text-center text-[10pt] leading-snug text-slate-900">
        {photo ? photo.caption || `사진 ${index + 1}` : '\u00a0'}
      </figcaption>
    </figure>
  );
}

function InfoCell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <>
      <th className="w-[25mm] border border-slate-800 bg-slate-100 px-2 py-2 text-left text-[10pt] font-semibold text-slate-900">{label}</th>
      <td className={cn('border border-slate-800 px-2 py-2 text-[10pt] text-slate-900', className)}>{value || '\u00a0'}</td>
    </>
  );
}

function SheetPage({
  info,
  photos,
  pageIndex,
  pageCount,
}: {
  info: SheetInfo;
  photos: PhotoItem[];
  pageIndex: number;
  pageCount: number;
}) {
  const slots: Array<PhotoItem | null> = [...photos];

  while (slots.length < 4) {
    slots.push(null);
  }

  return (
    <section className="evidence-sheet-page mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white p-[12mm] text-slate-900 shadow-2xl">
      <header className="mb-4 text-center">
        <p className="text-[10pt] font-semibold text-slate-500">보탬e 제출용</p>
        <h1 className="mt-1 text-[22pt] font-bold tracking-normal text-slate-950">증빙사진 첨부지</h1>
      </header>

      <table className="w-full border-collapse text-left">
        <tbody>
          <tr>
            <InfoCell label="사업명" value={info.projectName} />
            <InfoCell label="집행일자" value={formatDate(info.usageDate)} />
          </tr>
          <tr>
            <InfoCell label="집행내용" value={info.expenditureContent} className="w-[72mm]" />
            <InfoCell label="사용처" value={info.vendor} />
          </tr>
          <tr>
            <InfoCell label="금액" value={info.amount} />
            <InfoCell label="제출처" value={info.submitTo} />
          </tr>
          <tr>
            <InfoCell label="운영기관" value={info.operator} />
            <InfoCell label="작성일" value={formatDate(info.preparedDate)} />
          </tr>
        </tbody>
      </table>

      <div className="mt-5 grid flex-1 grid-cols-2 grid-rows-2 gap-4">
        {slots.map((photo, index) => (
          <PhotoSlot key={photo?.id ?? `empty-${pageIndex}-${index}`} photo={photo} index={pageIndex * 4 + index} />
        ))}
      </div>

      <footer className="mt-3 border-t border-slate-300 pt-2 text-center text-[9pt] text-slate-500">
        {info.projectName || '청년 N.E.S.T.'} · 증빙사진 첨부지 · {pageIndex + 1} / {pageCount}
      </footer>
    </section>
  );
}

function Field({
  name,
  value,
  type = 'text',
  onChange,
}: {
  name: keyof SheetInfo;
  value: string;
  type?: 'text' | 'date';
  onChange: (name: keyof SheetInfo, value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{FIELD_LABELS[name]}</span>
      <Input value={value} type={type} onChange={(event) => onChange(name, event.target.value)} />
    </label>
  );
}

export default function EvidencePhotoSheetBuilder() {
  const [info, setInfo] = useState<SheetInfo>(defaultSheetInfo);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<PhotoItem[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, []);

  const pages = useMemo(() => chunkPhotos(photos), [photos]);
  const photoCountLabel = `${photos.length}장 / ${pages.length}쪽`;

  function updateField(name: keyof SheetInfo, value: string) {
    setInfo((current) => ({ ...current, [name]: value }));
  }

  function addFiles(files: FileList | null) {
    const imageFiles = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) return;

    const nextPhotos = imageFiles.map((file) => ({
      id: createPhotoId(),
      fileName: file.name,
      url: URL.createObjectURL(file),
      caption: fileNameToCaption(file.name),
    }));

    setPhotos((current) => [...current, ...nextPhotos]);
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((photo) => photo.id !== id);
    });
  }

  function clearPhotos() {
    setPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url));
      return [];
    });
  }

  function movePhoto(id: string, direction: -1 | 1) {
    setPhotos((current) => {
      const index = current.findIndex((photo) => photo.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function updateCaption(id: string, caption: string) {
    setPhotos((current) => current.map((photo) => (photo.id === id ? { ...photo, caption } : photo)));
  }

  return (
    <div className="evidence-builder space-y-6">
      <section className="no-print rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">보고서</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">증빙서류 만들기</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = '';
              }}
            />
            <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              사진 선택
            </Button>
            <Button variant="outline" className="gap-2" onClick={clearPhotos} disabled={!photos.length}>
              <Trash2 className="h-4 w-4" />
              전체 삭제
            </Button>
            <Button className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              PDF 인쇄
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <FileImage className="h-4 w-4" />
              <h2 className="font-semibold">첨부지 정보</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="projectName" value={info.projectName} onChange={updateField} />
              <Field name="usageDate" value={info.usageDate} type="date" onChange={updateField} />
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">집행내용</span>
                <textarea
                  value={info.expenditureContent}
                  onChange={(event) => updateField('expenditureContent', event.target.value)}
                  className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                />
              </label>
              <Field name="vendor" value={info.vendor} onChange={updateField} />
              <Field name="amount" value={info.amount} onChange={updateField} />
              <Field name="submitTo" value={info.submitTo} onChange={updateField} />
              <Field name="operator" value={info.operator} onChange={updateField} />
              <Field name="preparedDate" value={info.preparedDate} type="date" onChange={updateField} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Images className="h-4 w-4" />
                <h2 className="font-semibold">사진 목록</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{photoCountLabel}</span>
            </div>

            {photos.length ? (
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {photos.map((photo, index) => (
                  <article key={photo.id} className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-md border border-slate-200 p-2">
                    <img src={photo.url} alt="" className="h-[72px] w-[72px] rounded-sm border border-slate-200 object-cover" />
                    <div className="min-w-0 space-y-2">
                      <p className="truncate text-xs text-slate-500">
                        {index + 1}. {photo.fileName}
                      </p>
                      <Input value={photo.caption} onChange={(event) => updateCaption(photo.id, event.target.value)} aria-label={`${index + 1}번 사진 설명`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => movePhoto(photo.id, -1)}
                        disabled={index === 0}
                        aria-label="위로 이동"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => movePhoto(photo.id, 1)}
                        disabled={index === photos.length - 1}
                        aria-label="아래로 이동"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => removePhoto(photo.id)} aria-label="삭제">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-400">사진 없음</div>
            )}
          </div>
        </div>
      </section>

      <div className="evidence-print-stack space-y-6">
        {pages.map((pagePhotos, index) => (
          <SheetPage key={index} info={info} photos={pagePhotos} pageIndex={index} pageCount={pages.length} />
        ))}
      </div>
    </div>
  );
}
