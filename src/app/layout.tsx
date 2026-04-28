import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: '청년 N.E.S.T. 성과관리 대시보드',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-slate-100 text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
