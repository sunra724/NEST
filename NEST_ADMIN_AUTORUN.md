# 🔐 청년 N.E.S.T. 대시보드 — 관리자 기능 추가 자동실행 명령서

---

## ⚙️ AI 실행 프로토콜 (최우선 준수)

이 파일을 받은 AI는 **기존 `nest-dashboard` 프로젝트에 관리자 기능을 Phase 0부터 Phase 7까지 순서대로 전부 완성**한다.

**실행 규칙 — 예외 없음:**

1. 이 파일 전체를 먼저 읽고 전체 구조를 파악한다
2. **기존 파일을 절대 삭제하거나 덮어쓰지 않는다** — 추가/수정만 한다
3. 각 Phase의 모든 작업을 완료한 뒤 스스로 완료 기준을 점검한다
4. 완료 기준 미달 시 해당 Phase 내에서 즉시 수정하고 재점검한다
5. 사용자에게 "다음을 진행할까요?"라고 묻지 않는다 — 무조건 자동 진행한다
6. 터미널 명령은 AI가 직접 실행한다

**Phase 전환 선언 형식:**
```
✅ Phase N 완료 — [완료 기준 전부 통과]
▶ Phase N+1 시작합니다
```

## Phase 체크리스트

- [x] Phase 0 — 기존 프로젝트 확인 + 의존성 추가 + 환경 변수 설정
- [x] Phase 1 — 인증 시스템 (JWT + 쿠키 + 미들웨어)
- [x] Phase 2 — 데이터 쓰기 API 라우트 4종
- [x] Phase 3 — KPI 실적 입력 관리 페이지
- [x] Phase 4 — 예산 집행 관리 페이지
- [x] Phase 5 — 추진 일정 상태 관리 페이지
- [x] Phase 6 — 프로그램 참여자 관리 페이지
- [x] Phase 7 — 관리자 레이아웃 + 대시보드 + 최종 통합

---

## 🗺️ 추가 기능 컨텍스트

```
■ 기존 상태: nest-dashboard 열람 전용 완성본
■ 추가 목표: 관리자 로그인 → 데이터 직접 입력/수정 → 대시보드 즉시 반영
■ 인증 방식: 비밀번호 + JWT 쿠키 (서버사이드 검증)
■ 데이터 저장: API Route → Node.js fs → public/data/*.json 직접 기록
■ 관리자 진입: /admin (사이드바 하단 잠금 아이콘)
■ 수정 가능 항목:
     KPI        — 프로그램별 current 값
     예산        — 프로그램별 spent 값 + 월별 actual 값
     추진 일정   — 태스크 status (pending / in_progress / completed)
     참여자      — 각 프로그램 participants 배열 추가/삭제
■ 변경 이력: public/data/changelog.json 에 자동 기록
■ 주의: 로컬 실행 전용 (Vercel 배포 시 fs 쓰기 불가 — README에 명시)
```

---

## 추가될 파일 구조 (기존 구조에 병합)

```
nest-dashboard/
├── .env.local                          ← NEW: 관리자 비밀번호 + JWT 시크릿
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx              ← NEW: 관리자 전용 레이아웃
│   │   │   ├── page.tsx                ← NEW: 관리자 대시보드 (변경이력 포함)
│   │   │   ├── kpi/page.tsx            ← NEW: KPI 실적 입력
│   │   │   ├── budget/page.tsx         ← NEW: 예산 집행 입력
│   │   │   ├── timeline/page.tsx       ← NEW: 일정 상태 변경
│   │   │   └── programs/[id]/page.tsx  ← NEW: 참여자 관리
│   │   ├── login/page.tsx              ← NEW: 관리자 로그인
│   │   └── api/
│   │       └── admin/
│   │           ├── auth/route.ts       ← NEW: 로그인/로그아웃
│   │           ├── kpi/route.ts        ← NEW: KPI 쓰기 API
│   │           ├── budget/route.ts     ← NEW: 예산 쓰기 API
│   │           ├── timeline/route.ts   ← NEW: 일정 쓰기 API
│   │           └── programs/route.ts   ← NEW: 참여자 쓰기 API
│   ├── components/
│   │   └── admin/
│   │       ├── AdminNav.tsx            ← NEW: 관리자 좌측 내비게이션
│   │       ├── KpiEditor.tsx           ← NEW: KPI 인라인 편집 테이블
│   │       ├── BudgetEditor.tsx        ← NEW: 예산 인라인 편집 테이블
│   │       ├── TimelineEditor.tsx      ← NEW: 일정 상태 토글 UI
│   │       └── ParticipantEditor.tsx   ← NEW: 참여자 추가/삭제 폼
│   ├── lib/
│   │   └── auth.ts                     ← NEW: JWT 발급/검증 유틸
│   └── middleware.ts                   ← NEW: /admin 라우트 보호
```

---
---

# Phase 0 — 기존 프로젝트 확인 + 의존성 추가 + 환경 변수 설정

## 실행할 작업

### 1. 기존 프로젝트 상태 확인

아래 명령을 실행해 기존 구조가 온전한지 확인한다:

```bash
cd nest-dashboard
ls public/data/
ls src/app/
npm run build 2>&1 | tail -5
```

빌드 에러가 있으면 먼저 수정한 뒤 다음으로 진행한다.

### 2. 추가 의존성 설치

```bash
npm install jose
npx shadcn@latest add input label dialog alert-dialog toast sonner
```

- `jose`: 순수 JS JWT 라이브러리 (Edge Runtime 호환, jsonwebtoken 대신 사용)

### 3. .env.local 생성

프로젝트 루트에 `.env.local` 파일을 생성한다:

```env
# 관리자 비밀번호 (운영자가 직접 변경할 것)
ADMIN_PASSWORD=change-me

# JWT 서명 시크릿 (32자 이상 랜덤 문자열)
JWT_SECRET=change-me-to-a-long-random-secret

# 토큰 만료 시간
JWT_EXPIRES_IN=8h
```

`.gitignore`에 `.env.local`이 포함되어 있는지 확인하고 없으면 추가한다:

```bash
grep -q '.env.local' .gitignore || echo '.env.local' >> .gitignore
```

### 4. public/data/changelog.json 초기화

```json
{
  "entries": []
}
```

## Phase 0 완료 기준

- `jose` 패키지 `node_modules`에 존재
- `.env.local` 파일에 세 가지 키 모두 존재
- `.gitignore`에 `.env.local` 포함
- `public/data/changelog.json` 존재
- `npm run build` 에러 없음

---
---

# Phase 1 — 인증 시스템 (JWT + 쿠키 + 미들웨어)

## 실행할 작업

### src/lib/auth.ts — JWT 발급 및 검증 유틸

```typescript
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret'
);

export async function signToken(payload: Record<string, string>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '8h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
```

### src/middleware.ts — /admin 라우트 전체 보호

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PROTECTED = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('admin_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### src/app/api/admin/auth/route.ts — 로그인/로그아웃 API

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

// POST /api/admin/auth — 로그인
export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });
  }

  const token = await signToken({ role: 'admin' });

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8시간
    path: '/',
  });
  return response;
}

// DELETE /api/admin/auth — 로그아웃
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('admin_token');
  return response;
}
```

### src/app/login/page.tsx — 관리자 로그인 페이지

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

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
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error ?? '로그인 실패');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        {/* 헤더 */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
            <Lock className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">관리자 로그인</h1>
          <p className="text-sm text-slate-500 text-center">
            청년 N.E.S.T. 성과관리 대시보드
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password">관리자 비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '확인 중...' : '로그인'}
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          .env.local의 ADMIN_PASSWORD로 로그인합니다
        </p>
      </div>
    </div>
  );
}
```

## Phase 1 완료 기준

- `src/lib/auth.ts` — signToken / verifyToken 함수 존재
- `src/middleware.ts` — /admin 경로 쿠키 검증 로직 존재
- `src/app/api/admin/auth/route.ts` — POST(로그인) / DELETE(로그아웃) 존재
- `src/app/login/page.tsx` — 로그인 폼 UI 존재
- `npm run build` 에러 없음
- `localhost:3000/admin` 접근 시 `/login`으로 리다이렉트 (빌드 후 확인)

---
---

# Phase 2 — 데이터 쓰기 API 라우트 4종

## 실행할 작업

모든 API 라우트는 아래 공통 원칙을 따른다:
- 쿠키 토큰 검증 → 미인증이면 401 반환
- `fs.readFileSync` + `JSON.parse` → 데이터 수정 → `fs.writeFileSync`
- `changelog.json`에 변경 이력 추가 (타임스탬프, 수정자, 변경 내용 요약)
- 성공 시 수정된 전체 데이터 반환

### 공통 헬퍼 함수 — src/lib/data-writer.ts

```typescript
import fs from 'fs';
import path from 'path';
import { verifyToken } from './auth';
import { cookies } from 'next/headers';

export const DATA_DIR = path.join(process.cwd(), 'public', 'data');

export function readJSON<T>(filename: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

export function writeJSON(filename: string, data: unknown): void {
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

export function appendChangelog(entry: {
  action: string;
  target: string;
  summary: string;
}) {
  const changelog = readJSON<{ entries: unknown[] }>('changelog.json');
  changelog.entries.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // 최근 200개만 유지
  changelog.entries = changelog.entries.slice(0, 200);
  writeJSON('changelog.json', changelog);
}

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null;
}
```

### src/app/api/admin/kpi/route.ts — KPI current 값 수정

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, appendChangelog, verifyAdmin } from '@/lib/data-writer';

// PATCH /api/admin/kpi
// body: { programId: "N", kpiId: "N-1", current: 25 }
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { programId, kpiId, current } = await request.json();
  if (!programId || !kpiId || typeof current !== 'number') {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const data = readJSON<any>('kpi.json');

  // programs[programId].kpis 배열에서 해당 id 찾아 current 업데이트
  const program = data.programs?.[programId];
  if (!program) {
    return NextResponse.json({ error: `프로그램 ${programId} 없음` }, { status: 404 });
  }
  const kpi = program.kpis?.find((k: any) => k.id === kpiId);
  if (!kpi) {
    return NextResponse.json({ error: `KPI ${kpiId} 없음` }, { status: 404 });
  }

  const prev = kpi.current;
  kpi.current = current;
  writeJSON('kpi.json', data);

  appendChangelog({
    action: 'KPI_UPDATE',
    target: `${programId} / ${kpiId}`,
    summary: `${kpi.label}: ${prev} → ${current} ${kpi.unit}`,
  });

  return NextResponse.json({ ok: true, data });
}
```

### src/app/api/admin/budget/route.ts — 예산 spent / monthly actual 수정

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, appendChangelog, verifyAdmin } from '@/lib/data-writer';

// PATCH /api/admin/budget
// body (프로그램 집행액):   { type: "program", programId: "N", spent: 12000 }
// body (월별 실집행):       { type: "monthly", month: "2026-04", actual: 30000 }
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const body = await request.json();
  const data = readJSON<any>('budget.json');

  if (body.type === 'program') {
    const { programId, spent } = body;
    const prog = data.byProgram?.find((p: any) => p.id === programId);
    if (!prog) return NextResponse.json({ error: '프로그램 없음' }, { status: 404 });
    const prev = prog.spent;
    prog.spent = spent;
    writeJSON('budget.json', data);
    appendChangelog({
      action: 'BUDGET_PROGRAM_UPDATE',
      target: `예산 / ${programId}`,
      summary: `${prog.name} 집행액: ${prev.toLocaleString()} → ${spent.toLocaleString()} 천원`,
    });
  } else if (body.type === 'monthly') {
    const { month, actual } = body;
    const entry = data.monthlyExecution?.find((m: any) => m.month === month);
    if (!entry) return NextResponse.json({ error: '월 데이터 없음' }, { status: 404 });
    const prev = entry.actual;
    entry.actual = actual;
    writeJSON('budget.json', data);
    appendChangelog({
      action: 'BUDGET_MONTHLY_UPDATE',
      target: `예산 / 월별 / ${month}`,
      summary: `${month} 실집행: ${prev.toLocaleString()} → ${actual.toLocaleString()} 천원`,
    });
  } else {
    return NextResponse.json({ error: '잘못된 type' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data });
}
```

### src/app/api/admin/timeline/route.ts — 태스크 status 변경

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, appendChangelog, verifyAdmin } from '@/lib/data-writer';

// PATCH /api/admin/timeline
// body: { categoryId: "N", taskName: "운영 준비 및 홍보", status: "completed" }
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { categoryId, taskName, status } = await request.json();
  const allowed = ['pending', 'in_progress', 'completed'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: '허용되지 않은 status 값' }, { status: 400 });
  }

  const data = readJSON<any>('timeline.json');
  const category = data.categories?.find((c: any) => c.id === categoryId);
  if (!category) return NextResponse.json({ error: '카테고리 없음' }, { status: 404 });
  const task = category.tasks?.find((t: any) => t.name === taskName);
  if (!task) return NextResponse.json({ error: '태스크 없음' }, { status: 404 });

  const prev = task.status;
  task.status = status;
  writeJSON('timeline.json', data);

  appendChangelog({
    action: 'TIMELINE_UPDATE',
    target: `일정 / ${categoryId} / ${taskName}`,
    summary: `상태: ${prev} → ${status}`,
  });

  return NextResponse.json({ ok: true, data });
}
```

### src/app/api/admin/programs/route.ts — 참여자 추가/삭제

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, appendChangelog, verifyAdmin } from '@/lib/data-writer';

// POST /api/admin/programs — 참여자 추가
// body: { programId: "n", participant: { name, contact, cohort, joinedAt, note } }
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { programId, participant } = await request.json();
  const filename = `program-${programId.toLowerCase()}.json`;
  const data = readJSON<any>(filename);

  const newEntry = {
    id: Date.now().toString(),
    ...participant,
    registeredAt: new Date().toISOString(),
  };
  data.participants = data.participants ?? [];
  data.participants.push(newEntry);
  writeJSON(filename, data);

  appendChangelog({
    action: 'PARTICIPANT_ADD',
    target: `참여자 / [${programId.toUpperCase()}]`,
    summary: `${participant.name} 추가 (${participant.cohort ?? '-'})`,
  });

  return NextResponse.json({ ok: true, data });
}

// DELETE /api/admin/programs — 참여자 삭제
// body: { programId: "n", participantId: "1234567890" }
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { programId, participantId } = await request.json();
  const filename = `program-${programId.toLowerCase()}.json`;
  const data = readJSON<any>(filename);

  const target = data.participants?.find((p: any) => p.id === participantId);
  if (!target) return NextResponse.json({ error: '참여자 없음' }, { status: 404 });

  data.participants = data.participants.filter((p: any) => p.id !== participantId);
  writeJSON(filename, data);

  appendChangelog({
    action: 'PARTICIPANT_DELETE',
    target: `참여자 / [${programId.toUpperCase()}]`,
    summary: `${target.name} 삭제`,
  });

  return NextResponse.json({ ok: true, data });
}
```

## Phase 2 완료 기준

- `src/lib/data-writer.ts` — readJSON / writeJSON / appendChangelog / verifyAdmin 존재
- API 라우트 4개 파일 존재 (auth 제외)
- 각 라우트 TypeScript 에러 없음
- `npm run build` 에러 없음

---
---

# Phase 3 — KPI 실적 입력 관리 페이지

## 실행할 작업

### src/components/admin/KpiEditor.tsx

```tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { NEST_COLORS } from '@/lib/constants';
import { toast } from 'sonner';
import type { KpiItem } from '@/types';

interface Props {
  programId: string;
  kpis: KpiItem[];
  onSaved: () => void;
}

export default function KpiEditor({ programId, kpis, onSaved }: Props) {
  const color = NEST_COLORS[programId as keyof typeof NEST_COLORS];
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSave(kpiId: string, current: number) {
    setSaving(kpiId);
    try {
      const res = await fetch('/api/admin/kpi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, kpiId, current }),
      });
      if (!res.ok) throw new Error();
      toast.success('저장되었습니다');
      onSaved();
    } catch {
      toast.error('저장 실패');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      {kpis.map((kpi) => {
        const editVal = edits[kpi.id] ?? kpi.current;
        const changed = editVal !== kpi.current;
        const pct = kpi.target > 0 ? Math.round((editVal / kpi.target) * 100) : 0;

        return (
          <div key={kpi.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border hover:border-slate-300 transition-colors">
            {/* KPI 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">{kpi.id}</span>
                <span className="text-sm font-medium text-slate-800 truncate">{kpi.label}</span>
              </div>
              {/* 프로그레스 바 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: (color as any)?.primary ?? '#6366F1' }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
              </div>
            </div>

            {/* 수치 입력 */}
            <div className="flex items-center gap-2 shrink-0">
              <Input
                type="number"
                min={0}
                max={kpi.target * 2}
                className="w-24 text-right tabular-nums"
                value={editVal}
                onChange={(e) =>
                  setEdits((prev) => ({ ...prev, [kpi.id]: Number(e.target.value) }))
                }
              />
              <span className="text-xs text-slate-400 w-16">/ {kpi.target} {kpi.unit}</span>
              <Button
                size="sm"
                variant={changed ? 'default' : 'outline'}
                className="w-16"
                disabled={!changed || saving === kpi.id}
                onClick={() => handleSave(kpi.id, editVal)}
              >
                {saving === kpi.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : changed ? (
                  '저장'
                ) : (
                  <Check className="w-3 h-3 text-slate-400" />
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### src/app/admin/kpi/page.tsx

```tsx
import { loadJSON } from '@/lib/data';
import type { KpiData } from '@/types';
import KpiEditor from '@/components/admin/KpiEditor';
import { NEST_COLORS, PROGRAM_IDS } from '@/lib/constants';

export const metadata = { title: 'KPI 실적 입력 | 관리자' };

export default async function AdminKpiPage() {
  const kpiData = await loadJSON<KpiData>('kpi.json');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">KPI 실적 입력</h1>
        <p className="text-sm text-slate-500 mt-1">
          각 항목의 현재 실적을 입력하고 저장 버튼을 누르세요. 변경 즉시 대시보드에 반영됩니다.
        </p>
      </div>

      {PROGRAM_IDS.map((id) => {
        const prog = kpiData.programs[id];
        const color = NEST_COLORS[id];
        return (
          <section key={id}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: color.primary }}
              >
                {id}
              </div>
              <h2 className="text-base font-semibold text-slate-700">
                {prog.name}
              </h2>
              <span className="text-xs text-slate-400">
                {prog.kpis.filter((k) => k.current > 0).length}/{prog.kpis.length} 항목 입력됨
              </span>
            </div>
            {/* 클라이언트 컴포넌트에 데이터 전달 */}
            <KpiEditorWrapper programId={id} kpis={prog.kpis} />
          </section>
        );
      })}

      {/* 공통 KPI */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">공통 KPI</h2>
        <KpiEditorWrapper programId="common" kpis={kpiData.common.kpis} />
      </section>
    </div>
  );
}

// 서버 컴포넌트에서 클라이언트 컴포넌트 감싸기
// (revalidate 없이 즉시 저장되므로 Router.refresh 사용)
function KpiEditorWrapper({ programId, kpis }: { programId: string; kpis: any[] }) {
  'use client';
  // 이 래퍼는 실제로는 클라이언트 컴포넌트 파일로 분리해야 한다
  // Phase 3에서는 KpiEditor 직접 사용
  return null;
}
```

**주의**: `KpiEditorWrapper`는 실제로는 별도 클라이언트 컴포넌트 파일로 분리한다.
`src/app/admin/kpi/page.tsx`를 `'use client'`로 전환하고 `useRouter().refresh()`로 저장 후 갱신한다:

```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import KpiEditor from '@/components/admin/KpiEditor';
import { NEST_COLORS, PROGRAM_IDS } from '@/lib/constants';
import type { KpiData } from '@/types';

export default function AdminKpiPage() {
  const router = useRouter();
  const [data, setData] = useState<KpiData | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch('/data/kpi.json', { cache: 'no-store' });
    setData(await res.json());
    router.refresh();
  }, [router]);

  useEffect(() => { reload(); }, [reload]);

  if (!data) return <div className="p-8 text-slate-500">데이터 로딩 중...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">KPI 실적 입력</h1>
        <p className="text-sm text-slate-500 mt-1">
          수치를 수정하고 저장하면 즉시 대시보드에 반영됩니다.
        </p>
      </div>

      {PROGRAM_IDS.map((id) => {
        const prog = data.programs[id];
        const color = NEST_COLORS[id];
        return (
          <section key={id}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: color.primary }}
              >
                {id}
              </div>
              <h2 className="text-base font-semibold text-slate-700">{prog.name}</h2>
              <span className="text-xs text-slate-400">
                {prog.kpis.filter((k) => k.current > 0).length} / {prog.kpis.length} 입력됨
              </span>
            </div>
            <KpiEditor programId={id} kpis={prog.kpis} onSaved={reload} />
          </section>
        );
      })}

      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">공통 KPI</h2>
        <KpiEditor programId="common" kpis={data.common.kpis} onSaved={reload} />
      </section>
    </div>
  );
}
```

## Phase 3 완료 기준

- `KpiEditor.tsx` — 인라인 수치 편집 + 저장 버튼 존재
- `admin/kpi/page.tsx` — 4개 프로그램 + 공통 KPI 섹션 존재
- 저장 후 `router.refresh()`로 데이터 재로딩 로직 존재
- `npm run build` 에러 없음

---
---

# Phase 4 — 예산 집행 관리 페이지

## 실행할 작업

### src/components/admin/BudgetEditor.tsx

프로그램별 집행액과 월별 실집행액 두 가지 편집 기능을 제공한다.

```tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { NEST_COLORS } from '@/lib/constants';
import type { BudgetData } from '@/types';

interface Props {
  data: BudgetData;
  onSaved: () => void;
}

export default function BudgetEditor({ data, onSaved }: Props) {
  const [programEdits, setProgramEdits] = useState<Record<string, number>>({});
  const [monthlyEdits, setMonthlyEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function saveProgramSpent(programId: string, spent: number) {
    setSaving(`prog_${programId}`);
    try {
      const res = await fetch('/api/admin/budget', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'program', programId, spent }),
      });
      if (!res.ok) throw new Error();
      toast.success('저장되었습니다');
      onSaved();
    } catch {
      toast.error('저장 실패');
    } finally {
      setSaving(null);
    }
  }

  async function saveMonthlyActual(month: string, actual: number) {
    setSaving(`month_${month}`);
    try {
      const res = await fetch('/api/admin/budget', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'monthly', month, actual }),
      });
      if (!res.ok) throw new Error();
      toast.success('저장되었습니다');
      onSaved();
    } catch {
      toast.error('저장 실패');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* 프로그램별 집행액 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          프로그램별 집행액 (단위: 천원)
        </h3>
        <div className="space-y-2">
          {data.byProgram.map((prog) => {
            const color = NEST_COLORS[prog.id as keyof typeof NEST_COLORS];
            const editVal = programEdits[prog.id] ?? prog.spent;
            const changed = editVal !== prog.spent;
            const pct = prog.budget > 0 ? Math.round((editVal / prog.budget) * 100) : 0;

            return (
              <div key={prog.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border hover:border-slate-300 transition-colors">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: (color as any)?.primary ?? '#6366F1' }}
                >
                  {prog.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{prog.name}</span>
                    <span className="text-xs text-slate-400">예산 {prog.budget.toLocaleString()}천원</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: (color as any)?.primary ?? '#6366F1' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{pct}%</span>
                  </div>
                </div>
                <Input
                  type="number" min={0} className="w-28 text-right tabular-nums shrink-0"
                  value={editVal}
                  onChange={(e) => setProgramEdits((p) => ({ ...p, [prog.id]: Number(e.target.value) }))}
                />
                <Button size="sm" variant={changed ? 'default' : 'outline'} className="w-16 shrink-0"
                  disabled={!changed || saving === `prog_${prog.id}`}
                  onClick={() => saveProgramSpent(prog.id, editVal)}>
                  {saving === `prog_${prog.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : changed ? '저장' : <Check className="w-3 h-3 text-slate-400" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 월별 실집행액 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          월별 실집행액 (단위: 천원)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.monthlyExecution.map((entry) => {
            const monthLabel = entry.month.replace('2026-', '') + '월';
            const editVal = monthlyEdits[entry.month] ?? entry.actual;
            const changed = editVal !== entry.actual;

            return (
              <div key={entry.month} className="p-3 bg-white rounded-xl border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{monthLabel}</span>
                  <span className="text-xs text-slate-400">계획 {entry.planned.toLocaleString()}</span>
                </div>
                <Input
                  type="number" min={0} className="w-full text-right tabular-nums text-sm"
                  placeholder="0"
                  value={editVal || ''}
                  onChange={(e) => setMonthlyEdits((p) => ({ ...p, [entry.month]: Number(e.target.value) }))}
                />
                {changed && (
                  <Button size="sm" className="w-full text-xs h-7"
                    disabled={saving === `month_${entry.month}`}
                    onClick={() => saveMonthlyActual(entry.month, editVal)}>
                    {saving === `month_${entry.month}` ? <Loader2 className="w-3 h-3 animate-spin" /> : '저장'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### src/app/admin/budget/page.tsx

```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BudgetEditor from '@/components/admin/BudgetEditor';
import type { BudgetData } from '@/types';

export default function AdminBudgetPage() {
  const router = useRouter();
  const [data, setData] = useState<BudgetData | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch('/data/budget.json', { cache: 'no-store' });
    setData(await res.json());
    router.refresh();
  }, [router]);

  useEffect(() => { reload(); }, [reload]);

  if (!data) return <div className="p-8 text-slate-500">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">예산 집행 입력</h1>
        <p className="text-sm text-slate-500 mt-1">
          프로그램별 집행액과 월별 실집행액을 입력합니다. 단위는 천원입니다.
        </p>
      </div>
      <BudgetEditor data={data} onSaved={reload} />
    </div>
  );
}
```

## Phase 4 완료 기준

- `BudgetEditor.tsx` — 프로그램별 / 월별 두 섹션 존재
- `admin/budget/page.tsx` — 데이터 로딩 + BudgetEditor 렌더링
- `npm run build` 에러 없음

---
---

# Phase 5 — 추진 일정 상태 관리 페이지

## 실행할 작업

### src/components/admin/TimelineEditor.tsx

```tsx
'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import type { TimelineData, TaskStatus } from '@/types';

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending',     label: '예정',    color: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
  { value: 'in_progress', label: '진행중',  color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'completed',   label: '완료',    color: 'bg-green-100 text-green-700 hover:bg-green-200' },
];

interface Props {
  data: TimelineData;
  onSaved: () => void;
}

export default function TimelineEditor({ data, onSaved }: Props) {
  const [saving, setSaving] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  async function handleStatusChange(
    categoryId: string, taskName: string, status: TaskStatus
  ) {
    const key = `${categoryId}_${taskName}`;
    setSaving(key);
    try {
      const res = await fetch('/api/admin/timeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, taskName, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`"${taskName}" → ${status}`);
      onSaved();
    } catch {
      toast.error('저장 실패');
    } finally {
      setSaving(null);
    }
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {data.categories.map((cat) => (
        <div key={cat.id} className="bg-white rounded-xl border overflow-hidden">
          {/* 카테고리 헤더 */}
          <button
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
            onClick={() => toggleCollapse(cat.id)}
          >
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="font-semibold text-slate-800 flex-1 text-left">{cat.label}</span>
            <span className="text-xs text-slate-400">
              완료 {cat.tasks.filter((t) => t.status === 'completed').length} /
              진행 {cat.tasks.filter((t) => t.status === 'in_progress').length} /
              예정 {cat.tasks.filter((t) => t.status === 'pending').length}
            </span>
            {collapsed.has(cat.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </button>

          {/* 태스크 목록 */}
          {!collapsed.has(cat.id) && (
            <div className="border-t divide-y">
              {cat.tasks.map((task) => {
                const key = `${cat.id}_${task.name}`;
                const monthLabel = `${Math.min(...task.months)}~${Math.max(...task.months)}월`;

                return (
                  <div key={task.name} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-sm text-slate-700 flex-1">{task.name}</span>
                    <span className="text-xs text-slate-400 w-16 text-center">{monthLabel}</span>

                    {/* 상태 토글 버튼 3개 */}
                    <div className="flex items-center gap-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          disabled={saving === key}
                          onClick={() => handleStatusChange(cat.id, task.name, opt.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            task.status === opt.value
                              ? opt.color + ' ring-2 ring-offset-1 ring-current'
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {saving === key && task.status !== opt.value ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            opt.label
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### src/app/admin/timeline/page.tsx

```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TimelineEditor from '@/components/admin/TimelineEditor';
import type { TimelineData } from '@/types';

export default function AdminTimelinePage() {
  const router = useRouter();
  const [data, setData] = useState<TimelineData | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch('/data/timeline.json', { cache: 'no-store' });
    setData(await res.json());
    router.refresh();
  }, [router]);

  useEffect(() => { reload(); }, [reload]);

  if (!data) return <div className="p-8 text-slate-500">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">추진 일정 상태 관리</h1>
        <p className="text-sm text-slate-500 mt-1">
          각 태스크의 상태 버튼을 클릭하면 즉시 저장됩니다.
        </p>
      </div>
      <TimelineEditor data={data} onSaved={reload} />
    </div>
  );
}
```

## Phase 5 완료 기준

- `TimelineEditor.tsx` — 카테고리별 접기/펼치기 + 상태 토글 3버튼 존재
- `admin/timeline/page.tsx` — 데이터 로딩 + TimelineEditor 렌더링
- `npm run build` 에러 없음

---
---

# Phase 6 — 프로그램 참여자 관리 페이지

## 실행할 작업

### src/components/admin/ParticipantEditor.tsx

```tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  id: string; name: string; contact?: string;
  cohort?: string; joinedAt?: string; note?: string;
  registeredAt: string;
}

interface Props {
  programId: string;
  programName: string;
  participants: Participant[];
  cohortOptions: string[];
  onSaved: () => void;
}

const EMPTY_FORM = { name: '', contact: '', cohort: '', note: '' };

export default function ParticipantEditor({
  programId, programName, participants, cohortOptions, onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleAdd() {
    if (!form.name.trim()) { toast.error('이름을 입력하세요'); return; }
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
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">
          현재 등록 <strong>{participants.length}</strong>명
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" /> 참여자 추가
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
                  <Input placeholder="홍길동" value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>연락처</Label>
                  <Input placeholder="010-0000-0000" value={form.contact}
                    onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>기수 / 트랙</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={form.cohort}
                  onChange={(e) => setForm((p) => ({ ...p, cohort: e.target.value }))}
                >
                  <option value="">선택 없음</option>
                  {cohortOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>비고</Label>
                <Input placeholder="메모" value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
              </div>
              <Button className="w-full" disabled={saving} onClick={handleAdd}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                등록
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 참여자 테이블 */}
      {participants.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed">
          아직 등록된 참여자가 없습니다
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['이름', '연락처', '기수/트랙', '등록일', '비고', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.contact ?? '-'}</td>
                  <td className="px-4 py-3">
                    {p.cohort ? <Badge variant="outline">{p.cohort}</Badge> : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(p.registeredAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.note ?? '-'}</td>
                  <td className="px-4 py-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-600">
                          {deleting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{p.name}을(를) 삭제하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDelete(p.id, p.name)}>
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
```

### src/app/admin/programs/[id]/page.tsx

```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ParticipantEditor from '@/components/admin/ParticipantEditor';
import { NEST_COLORS } from '@/lib/constants';

export default function AdminProgramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  const reload = useCallback(async () => {
    const res = await fetch(`/data/program-${id}.json`, { cache: 'no-store' });
    setData(await res.json());
    router.refresh();
  }, [id, router]);

  useEffect(() => { reload(); }, [reload]);

  if (!data) return <div className="p-8 text-slate-500">로딩 중...</div>;

  const color = NEST_COLORS[id.toUpperCase() as keyof typeof NEST_COLORS];
  const cohortOptions = data.cohorts?.map((c: any) => c.label) ??
    data.tracks ? Object.values(data.tracks).map((t: any) => t.label) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: (color as any)?.primary ?? '#6366F1' }}
        >
          {id.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{data.name} — 참여자 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            참여자를 추가하거나 삭제할 수 있습니다.
          </p>
        </div>
      </div>
      <ParticipantEditor
        programId={id}
        programName={data.name}
        participants={data.participants ?? []}
        cohortOptions={cohortOptions}
        onSaved={reload}
      />
    </div>
  );
}
```

## Phase 6 완료 기준

- `ParticipantEditor.tsx` — 추가 다이얼로그 + 삭제 확인 다이얼로그 존재
- `admin/programs/[id]/page.tsx` — N/E/S/T 4개 경로에서 동작
- `npm run build` 에러 없음

---
---

# Phase 7 — 관리자 레이아웃 + 대시보드 + 최종 통합

## 실행할 작업

### src/components/admin/AdminNav.tsx

```tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Wallet, CalendarDays, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { NEST_COLORS } from '@/lib/constants';

const NAV = [
  { href: '/admin',           label: '관리자 대시보드', icon: LayoutDashboard },
  { href: '/admin/kpi',       label: 'KPI 실적 입력',   icon: TrendingUp },
  { href: '/admin/budget',    label: '예산 집행 입력',   icon: Wallet },
  { href: '/admin/timeline',  label: '일정 상태 관리',   icon: CalendarDays },
];

const PROGRAMS = [
  { id: 'n', label: '[N] 마음충전소' },
  { id: 'e', label: '[E] 캠퍼스타운 챌린지' },
  { id: 's', label: '[S] 둥지 시드머니' },
  { id: 't', label: '[T] 안심전월세 지킴이' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    toast.info('로그아웃되었습니다');
    router.push('/login');
  }

  return (
    <aside className="w-60 shrink-0 min-h-screen bg-slate-900 flex flex-col">
      {/* 헤더 */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-white">🔐 관리자</span>
        </div>
        <p className="text-xs text-slate-400">청년 N.E.S.T. 데이터 관리</p>
      </div>

      {/* 메인 메뉴 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === href
                ? 'bg-slate-800 text-white border-l-2 border-indigo-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}

        {/* 참여자 관리 서브메뉴 */}
        <div className="pt-2">
          <p className="px-3 pb-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">참여자 관리</p>
          {PROGRAMS.map(({ id, label }) => {
            const href = `/admin/programs/${id}`;
            const color = NEST_COLORS[id.toUpperCase() as keyof typeof NEST_COLORS];
            return (
              <Link key={id} href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === href
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: (color as any)?.primary }} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 하단: 열람 대시보드 링크 + 로그아웃 */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-2">
        <Link href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          ← 열람 대시보드로
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-slate-800 px-3"
          onClick={handleLogout}>
          <LogOut className="w-4 h-4" />로그아웃
        </Button>
      </div>
    </aside>
  );
}
```

### src/app/admin/layout.tsx

```tsx
import AdminNav from '@/components/admin/AdminNav';
import { Toaster } from 'sonner';

export const metadata = { title: '관리자 | 청년 N.E.S.T.' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav />
      <main className="flex-1 p-8 max-w-5xl">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
```

### src/app/admin/page.tsx — 관리자 대시보드 (변경이력 + 데이터 요약)

```tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Wallet, CalendarDays, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChangelogEntry {
  action: string; target: string; summary: string; timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  KPI_UPDATE:             { label: 'KPI',   color: 'bg-blue-100 text-blue-700' },
  BUDGET_PROGRAM_UPDATE:  { label: '예산',   color: 'bg-amber-100 text-amber-700' },
  BUDGET_MONTHLY_UPDATE:  { label: '월별예산', color: 'bg-orange-100 text-orange-700' },
  TIMELINE_UPDATE:        { label: '일정',   color: 'bg-green-100 text-green-700' },
  PARTICIPANT_ADD:        { label: '참여자+', color: 'bg-indigo-100 text-indigo-700' },
  PARTICIPANT_DELETE:     { label: '참여자-', color: 'bg-red-100 text-red-700' },
};

const SHORTCUTS = [
  { href: '/admin/kpi',      label: 'KPI 실적 입력',   icon: TrendingUp,   desc: '프로그램별 current 값 수정' },
  { href: '/admin/budget',   label: '예산 집행 입력',   icon: Wallet,       desc: '집행액, 월별 실집행액 입력' },
  { href: '/admin/timeline', label: '일정 상태 관리',   icon: CalendarDays, desc: '태스크 상태 변경' },
  { href: '/admin/programs/n', label: '참여자 관리',    icon: Users,        desc: 'N/E/S/T 참여자 추가·삭제' },
];

export default function AdminDashboard() {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    fetch('/data/changelog.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setChangelog(d.entries ?? []));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
        <p className="text-sm text-slate-500 mt-1">
          데이터를 수정하면 공개 대시보드에 즉시 반영됩니다.
        </p>
      </div>

      {/* 바로가기 카드 */}
      <div className="grid grid-cols-2 gap-4">
        {SHORTCUTS.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="group bg-white rounded-xl border p-5 hover:border-indigo-300 hover:shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-sm">{label}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 변경 이력 */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          최근 변경 이력
          <span className="ml-2 text-xs text-slate-400 font-normal">최근 20건 표시</span>
        </h2>
        {changelog.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed text-sm">
            아직 변경 이력이 없습니다
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['시각', '유형', '대상', '내용'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {changelog.slice(0, 20).map((entry, i) => {
                  const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{entry.target}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{entry.summary}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 기존 Sidebar.tsx에 관리자 진입 링크 추가

기존 `src/components/layout/Sidebar.tsx` 파일의 하단 고정 텍스트 바로 위에 아래 링크를 추가한다:

```tsx
// 사이드바 하단 기존 텍스트 위에 삽입
<Link
  href="/admin"
  className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs"
>
  <Lock className="w-3.5 h-3.5" />
  관리자
</Link>
```

상단에 `import { Lock } from 'lucide-react'`가 없으면 추가한다.

### README.md 관리자 섹션 추가

```markdown
## 🔐 관리자 기능

### 로그인
`localhost:3000/admin` → `/login` 리다이렉트 → 비밀번호 입력

비밀번호: `.env.local`의 `ADMIN_PASSWORD` 값

### 수정 가능 항목
| 메뉴 | URL | 기능 |
|---|---|---|
| KPI 실적 | /admin/kpi | 각 KPI current 값 입력 |
| 예산 집행 | /admin/budget | 집행액·월별 실집행액 입력 |
| 일정 상태 | /admin/timeline | 태스크 상태 3단계 전환 |
| 참여자 | /admin/programs/{n,e,s,t} | 참여자 추가·삭제 |

### 변경 이력
모든 수정은 `public/data/changelog.json`에 자동 기록됩니다.

### ⚠️ 주의사항
- 이 기능은 **로컬 실행 전용**입니다
- Vercel 등 서버리스 환경에서는 `fs.writeFile`이 작동하지 않습니다
- 배포된 URL은 열람 전용으로만 사용하세요
```

## Phase 7 완료 기준

- `AdminNav.tsx` — 메뉴 + 로그아웃 버튼 존재
- `admin/layout.tsx` — AdminNav + Toaster 구조
- `admin/page.tsx` — 바로가기 4개 + 변경이력 테이블
- 기존 `Sidebar.tsx` — 하단에 관리자 진입 링크 추가
- `npm run build` 에러 없음
- `localhost:3000/admin` → 로그인 페이지 → 성공 시 관리자 대시보드 진입 확인

---
---

## 🎉 전체 빌드 완료 선언

모든 Phase 완료 시 아래 형식으로 선언한다:

```
═══════════════════════════════════════════════
✅ 청년 N.E.S.T. 관리자 기능 추가 완료
═══════════════════════════════════════════════
Phase 0 ✅ 의존성 + 환경변수 설정
Phase 1 ✅ JWT 인증 + 미들웨어 + 로그인 페이지
Phase 2 ✅ 데이터 쓰기 API 4종
Phase 3 ✅ KPI 실적 입력 UI
Phase 4 ✅ 예산 집행 입력 UI
Phase 5 ✅ 일정 상태 관리 UI
Phase 6 ✅ 참여자 추가/삭제 UI
Phase 7 ✅ 관리자 레이아웃 + 대시보드 + 통합

접속 방법:
  npm run dev → localhost:3000/admin
  비밀번호: .env.local ADMIN_PASSWORD 참조

⚠️  로컬 전용 — 배포 환경에서는 열람만 가능
═══════════════════════════════════════════════
```
