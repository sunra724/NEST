# 배포 체크리스트

## 로컬 완료 조건

```bash
npm run lint
npm run build
```

두 명령이 모두 통과해야 합니다.

## Supabase

1. Supabase SQL Editor에서 `supabase/schema.sql` 실행
2. 로컬 `.env.local`에 Supabase 환경변수 입력
3. 최초 1회만 현재 JSON 데이터를 업로드

```bash
npm run seed:supabase
```

4. `http://127.0.0.1:3000/api/data/overview`가 200으로 응답하는지 확인
5. 관리자 화면에서 저장 후 Supabase `dashboard_documents`의 해당 문서가 갱신되는지 확인

## GitHub

`.env.local`은 커밋하지 않습니다. `.env.example`만 커밋합니다.

권장 커밋 전 확인:

```bash
git status --short
git diff --stat
```

## Vercel

GitHub repo를 Vercel에 import한 뒤 Project Settings > Environment Variables에 아래 값을 넣습니다.

```env
ADMIN_PASSWORD=...
JWT_SECRET=...
JWT_EXPIRES_IN=8h
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY`에는 `NEXT_PUBLIC_`를 붙이지 않습니다.

## 공개 데이터 주의

공개 `/api/data/program-*` 응답은 참여자 연락처, 등록일 등 관리자용 필드를 제거합니다. 관리자 쿠키가 있는 요청에서만 원본 참여자 데이터가 반환됩니다.
