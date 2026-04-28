import AdminNav from '@/components/admin/AdminNav';
import { Toaster } from 'sonner';

export const metadata = { title: '관리자 | 청년 N.E.S.T.' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-5xl flex-1 p-8">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
