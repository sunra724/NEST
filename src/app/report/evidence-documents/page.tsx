import type { Metadata } from 'next';
import EvidencePhotoSheetBuilder from '@/components/dashboard/EvidencePhotoSheetBuilder';

export const metadata: Metadata = {
  title: '증빙서류 만들기 | 청년 N.E.S.T.',
};

export default function EvidenceDocumentsPage() {
  return <EvidencePhotoSheetBuilder />;
}
