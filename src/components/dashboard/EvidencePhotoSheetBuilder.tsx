'use client';

/* eslint-disable @next/next/no-img-element */
import { ArrowDown, ArrowUp, FileImage, FolderOpen, Images, Printer, RotateCcw, Save, Trash2, Upload } from 'lucide-react';
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
  dataUrl: string;
  caption: string;
}

interface SavedPhotoItem {
  id: string;
  fileName: string;
  dataUrl: string;
  caption: string;
}

interface SavedEvidenceDocument {
  id: string;
  title: string;
  info: SheetInfo;
  photos: SavedPhotoItem[];
  createdAt: string;
  updatedAt: string;
}

const SAVED_DOCUMENT_DB = 'nest-evidence-documents';
const SAVED_DOCUMENT_STORE = 'documents';

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

function getTodayInputValue() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function createDefaultSheetInfo(): SheetInfo {
  return {
    projectName: '청년 N.E.S.T.',
    usageDate: '',
    expenditureContent: '',
    vendor: '',
    amount: '',
    submitTo: '대구광역시 남구',
    operator: '협동조합 소이랩',
    preparedDate: getTodayInputValue(),
  };
}

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

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function makeDocumentTitle(info: SheetInfo, photos: PhotoItem[]) {
  const title = [formatDate(info.usageDate), info.vendor.trim(), info.expenditureContent.trim()].filter(Boolean).join(' · ');

  if (title) {
    return title.slice(0, 80);
  }

  return `${formatDate(info.preparedDate) || formatDate(getTodayInputValue())} 증빙사진 첨부지 (${photos.length}장)`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function openSavedDocumentDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('이 브라우저에서 보관함을 사용할 수 없습니다.'));
      return;
    }

    const request = indexedDB.open(SAVED_DOCUMENT_DB, 1);

    request.onerror = () => reject(request.error ?? new Error('보관함을 열지 못했습니다.'));
    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(SAVED_DOCUMENT_STORE)) {
        db.createObjectStore(SAVED_DOCUMENT_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function getSavedDocuments() {
  const db = await openSavedDocumentDb();

  return new Promise<SavedEvidenceDocument[]>((resolve, reject) => {
    const transaction = db.transaction(SAVED_DOCUMENT_STORE, 'readonly');
    const request = transaction.objectStore(SAVED_DOCUMENT_STORE).getAll();
    let result: SavedEvidenceDocument[] = [];

    request.onsuccess = () => {
      result = (request.result as SavedEvidenceDocument[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    };
    request.onerror = () => reject(request.error ?? new Error('저장 목록을 불러오지 못했습니다.'));
    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error('저장 목록을 불러오지 못했습니다.'));
    };
  });
}

async function putSavedDocument(document: SavedEvidenceDocument) {
  const db = await openSavedDocumentDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(SAVED_DOCUMENT_STORE, 'readwrite');

    transaction.objectStore(SAVED_DOCUMENT_STORE).put(document);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error('저장하지 못했습니다.'));
    };
  });
}

async function removeSavedDocument(id: string) {
  const db = await openSavedDocumentDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(SAVED_DOCUMENT_STORE, 'readwrite');

    transaction.objectStore(SAVED_DOCUMENT_STORE).delete(id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error('삭제하지 못했습니다.'));
    };
  });
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
  const [info, setInfo] = useState<SheetInfo>(() => createDefaultSheetInfo());
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<SavedEvidenceDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState('');
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void refreshSavedDocuments();
  }, []);

  const pages = useMemo(() => chunkPhotos(photos), [photos]);
  const photoCountLabel = `${photos.length}장 / ${pages.length}쪽`;

  function updateField(name: keyof SheetInfo, value: string) {
    setInfo((current) => ({ ...current, [name]: value }));
  }

  async function refreshSavedDocuments() {
    try {
      const documents = await getSavedDocuments();
      setSavedDocuments(documents);
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : '보관함을 불러오지 못했습니다.');
    }
  }

  async function addFiles(files: FileList | null) {
    const imageFiles = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) return;

    setIsReadingFiles(true);
    setStorageStatus('');

    try {
      const nextPhotos = await Promise.all(
        imageFiles.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);

          return {
            id: createPhotoId(),
            fileName: file.name,
            url: dataUrl,
            dataUrl,
            caption: fileNameToCaption(file.name),
          };
        }),
      );

      setPhotos((current) => [...current, ...nextPhotos]);
      setStorageStatus(`${nextPhotos.length}장 추가했습니다.`);
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : '사진을 추가하지 못했습니다.');
    } finally {
      setIsReadingFiles(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function clearPhotos() {
    setPhotos([]);
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

  function createNewDocument() {
    setInfo(createDefaultSheetInfo());
    setPhotos([]);
    setActiveDocumentId(null);
    setStorageStatus('새 첨부지를 시작했습니다.');
  }

  async function saveCurrentDocument() {
    setIsSaving(true);
    setStorageStatus('');

    try {
      const now = new Date().toISOString();
      const id = activeDocumentId ?? createPhotoId();
      const existingDocument = savedDocuments.find((document) => document.id === id);
      const document: SavedEvidenceDocument = {
        id,
        title: makeDocumentTitle(info, photos),
        info,
        photos: photos.map(({ id: photoId, fileName, dataUrl, caption }) => ({ id: photoId, fileName, dataUrl, caption })),
        createdAt: existingDocument?.createdAt ?? now,
        updatedAt: now,
      };

      await putSavedDocument(document);
      setActiveDocumentId(id);
      await refreshSavedDocuments();
      setStorageStatus('보관함에 저장했습니다.');
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : '저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  function loadDocument(document: SavedEvidenceDocument) {
    setInfo(document.info);
    setPhotos(document.photos.map((photo) => ({ ...photo, url: photo.dataUrl })));
    setActiveDocumentId(document.id);
    setStorageStatus('저장된 첨부지를 불러왔습니다.');
  }

  async function deleteDocument(document: SavedEvidenceDocument) {
    if (!window.confirm(`'${document.title}' 저장본을 삭제할까요?`)) {
      return;
    }

    try {
      await removeSavedDocument(document.id);
      if (activeDocumentId === document.id) {
        setActiveDocumentId(null);
      }
      await refreshSavedDocuments();
      setStorageStatus('저장본을 삭제했습니다.');
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : '삭제하지 못했습니다.');
    }
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
                void addFiles(event.target.files);
                event.target.value = '';
              }}
            />
            <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isReadingFiles}>
              <Upload className="h-4 w-4" />
              {isReadingFiles ? '사진 추가 중' : '사진 선택'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={createNewDocument}>
              <RotateCcw className="h-4 w-4" />새 첨부지
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => void saveCurrentDocument()} disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? '저장 중' : '저장'}
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
        {storageStatus ? <p className="mt-3 text-sm text-slate-500">{storageStatus}</p> : null}

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

        <div className="mt-4 rounded-lg border border-slate-200 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-800">
              <FolderOpen className="h-4 w-4" />
              <h2 className="font-semibold">보관함</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{savedDocuments.length}개 저장됨</span>
          </div>

          {savedDocuments.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {savedDocuments.map((document) => (
                <article
                  key={document.id}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3',
                    activeDocumentId === document.id && 'border-indigo-300 bg-indigo-50/60',
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{document.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      사진 {document.photos.length}장 · 수정 {formatSavedDate(document.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => loadDocument(document)}>
                      <FolderOpen className="h-4 w-4" />
                      불러오기
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:bg-red-50" onClick={() => void deleteDocument(document)} aria-label="저장본 삭제">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-400">저장된 첨부지가 없습니다.</div>
          )}
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
