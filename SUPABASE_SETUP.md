# Supabase 연결 절차

이 프로젝트는 기본값으로 `public/data/*.json`을 읽고 씁니다. 아래 환경변수를 넣으면 같은 코드가 Supabase `dashboard_documents` 테이블을 사용합니다.

## 1. Supabase 테이블 생성

Supabase SQL Editor에서 `supabase/schema.sql` 내용을 실행합니다.

## 2. 환경변수 설정

로컬 `.env.local`과 Vercel Project Settings > Environment Variables에 아래 값을 추가합니다.

```env
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=8h
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용입니다. 클라이언트 컴포넌트나 `NEXT_PUBLIC_` 변수로 노출하지 않습니다.

## 3. 기존 JSON 데이터 업로드

환경변수를 설정한 터미널에서 실행합니다.

```bash
npm run seed:supabase
```

업로드 대상은 `overview`, `kpi`, `budget`, `timeline`, `program-n`, `program-e`, `program-s`, `program-t`, `changelog`입니다.

## 4. 동작 확인

```bash
npm run dev
```

- 공개 화면: `http://localhost:3000`
- 관리자: `http://localhost:3000/admin`

Supabase 환경변수가 없으면 로컬 JSON 파일을 계속 사용합니다.

## 공개/관리자 데이터 분리

- 공개 요청: `/api/data/program-*`에서 참여자 `contact`, `registeredAt`, `note` 같은 관리자용 필드를 제거합니다.
- 관리자 요청: 로그인 쿠키가 있으면 원본 문서를 반환하므로 참여자 관리 화면에서 연락처를 볼 수 있습니다.
- 공개 프로그램 상세 페이지는 참여자 개별 정보가 아니라 총원과 기수/트랙별 집계만 표시합니다.
