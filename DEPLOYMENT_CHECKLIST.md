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
SITE_PASSWORD=...
JWT_SECRET=...
JWT_EXPIRES_IN=8h
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY`에는 `NEXT_PUBLIC_`를 붙이지 않습니다.

## 커스텀 도메인

목표 도메인: `nest.soilabcoop.kr`

1. Vercel Project Settings > Domains에서 `nest.soilabcoop.kr` 추가
2. 도메인을 관리하는 DNS 서비스에서 아래 레코드 추가

```text
Type: CNAME
Name/Host: nest
Value/Target: Vercel이 Domains 화면에서 안내하는 CNAME 값
```

Vercel은 서브도메인 연결 시 프로젝트별 CNAME 값을 안내합니다. 대시보드 안내값을 우선 사용합니다.

3. DNS 전파 후 Vercel Domains 화면에서 Verified 상태 확인
4. `https://nest.soilabcoop.kr/login` 접속 확인

## 로그인 구조

- `/login`: 업무용 열람 비밀번호 `SITE_PASSWORD`
- `/admin/login`: 관리자 비밀번호 `ADMIN_PASSWORD`
- `/admin`: 데이터 입력/수정 권한이 있는 관리자만 접근

## 공개 데이터 주의

공개 `/api/data/program-*` 응답은 참여자 연락처, 등록일 등 관리자용 필드를 제거합니다. 관리자 쿠키가 있는 요청에서만 원본 참여자 데이터가 반환됩니다.
