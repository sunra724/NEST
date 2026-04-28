'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error ?? '로그인 실패');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <Lock className="h-7 w-7 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">N.E.S.T. 대시보드</h1>
          <p className="text-center text-sm text-slate-500">소이랩 N.E.S.T 사업 성과관리 대시보드</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password">열람 비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '확인 중...' : '로그인'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">업무용 열람 권한이 있는 사용자만 접속할 수 있습니다</p>
      </div>
    </div>
  );
}
