'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPath = pathname === '/login';

  if (isAdminPath || isLoginPath) {
    return <>{children}</>;
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] lg:block">
        <Sidebar />
      </aside>
      <div className="flex min-h-screen flex-col lg:pl-[240px]">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
