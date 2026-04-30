# AGENTS.md

이 문서는 N.E.S.T. 대시보드를 이어서 작업하는 AI/개발자가 먼저 읽어야 할 프로젝트 운영 맥락입니다.

## 프로젝트 개요

- 프로젝트명: N.E.S.T. 대시보드
- 운영 목적: 소이랩 N.E.S.T 사업 성과관리 및 내부 업무용 인트라넷
- 운영 도메인: `https://nest.soilabcoop.kr`
- GitHub 저장소: `https://github.com/sunra724/NEST.git`
- 배포: Vercel
- 데이터 저장소: Supabase `dashboard_documents`
- 로컬 fallback 데이터: `public/data/*.json`

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- Recharts
- lucide-react
- jose JWT

## 접속 및 권한 구조

- `/login`: 업무용 열람 비밀번호로 접속하는 일반 인트라넷 입구
- `/admin/login`: 데이터 수정 권한을 가진 관리자 로그인
- `/admin/*`: 관리자 전용 데이터 입력/수정 화면
- `/api/data/*`: 로그인 사용자에게 데이터 제공
- `/api/admin/*`: 관리자 전용 API

비밀번호는 코드나 문서에 직접 적지 않습니다. 환경변수 이름만 기록합니다.

## 필수 환경변수

```env
SITE_PASSWORD=
ADMIN_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=8h
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

- `SITE_PASSWORD`: `/login`에서 사용하는 일반 열람 비밀번호
- `ADMIN_PASSWORD`: `/admin/login`에서 사용하는 관리자 비밀번호
- `JWT_SECRET`: 로그인 쿠키 서명용 비밀값
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 키이며 절대 클라이언트나 공개 문서에 노출하지 않음

## 데이터 구조

Supabase 사용 시 `dashboard_documents` 테이블에 아래 문서 키를 저장합니다.

- `overview`
- `kpi`
- `budget`
- `timeline`
- `program-n`
- `program-e`
- `program-s`
- `program-t`
- `operations`
- `changelog`

Supabase 환경변수가 없으면 같은 키를 기준으로 `public/data/*.json` 파일을 읽는 fallback 구조입니다.
Supabase에 특정 문서가 아직 없을 때도 같은 로컬 JSON을 읽어 기본 화면이 깨지지 않게 합니다. 새 문서 키를 추가할 때는 `supabase/schema.sql`의 check constraint도 함께 갱신해야 합니다.

## 관리자 기능

- KPI 실적 입력: `/admin/kpi`
- 예산 집행 입력: `/admin/budget`
- 예산서 상세 입력: `/admin/budget-detail`
- 운영관리 입력: `/admin/operations`
- 월간 운영보고 입력: `/admin/monthly-report`
- 일정 상태 관리: `/admin/timeline`
- 참여자 관리: `/admin/programs/n`, `/admin/programs/e`, `/admin/programs/s`, `/admin/programs/t`
- 보조금 운영관리 조회: `/operations`
- 예산서 상세 조회: `/budget/detail`
- 월간 운영보고 조회: `/monthly-report`
- 변경 이력: `changelog` 문서에 자동 기록

## 예산서 상세 관리 원칙

`남구청 청년둥지 예산서.xlsx`는 `budget.detailItems`의 기준 자료입니다. 총괄 예산 화면은 천원 단위 요약을 보여주고, `/budget/detail`과 `/admin/budget-detail`은 품목별 원 단위 계획금액, 실집행액, 품의상태, 보탬e 메모를 관리합니다.

향후 Google Sheets와 연동할 때도 이 구조를 기준으로 삼습니다. 담당자가 입력하는 값은 원칙적으로 실집행액, 품의상태, 메모이며, 계획 예산 품목 자체를 바꾸는 작업은 원본 예산서 변경 이력이 남도록 별도 검토합니다.

## 증빙관리 원칙

회계·예산 증빙의 공식 원장은 보탬e입니다. 이 대시보드는 보탬e를 대체하지 않고, 보탬e 등록여부·관리번호·등록일·보완사항을 추적하는 운영 대장 역할을 합니다. 사업 운영 증빙은 Google Drive 또는 내부보관 위치를 기준으로 두고, 대시보드에는 파일 원본이 아니라 링크, 보관 위치, 메모를 저장합니다.

## 공개 데이터 보호 원칙

일반 열람 사용자는 참여자 개인 식별 정보나 연락처를 보면 안 됩니다.

- 공개 `/api/data/program-*` 응답에서는 참여자 연락처, 등록일, 메모 등 관리자용 필드를 제거합니다.
- 관리자 쿠키가 있는 요청에서만 원본 참여자 데이터를 반환합니다.
- 공개 프로그램 상세 화면은 참여자 개별 목록 대신 총원과 기수/트랙별 집계를 표시합니다.

## 개발 명령

```bash
npm run dev
npm run lint
npm run build
npm run seed:supabase
```

커밋이나 배포 전에는 최소한 아래를 확인합니다.

```bash
npm run lint
npm run build
git status --short
```

## 배포 메모

- `.env.local`은 로컬 전용이며 GitHub/Vercel에 올라가지 않습니다.
- Vercel 환경변수는 Project Settings > Environment Variables에서 Production 범위에 설정해야 합니다.
- 환경변수 수정 후에는 반드시 Production redeploy가 필요합니다.
- 커스텀 도메인은 `nest.soilabcoop.kr`입니다.
- DNS는 `nest` CNAME을 Vercel Domains 화면에서 안내한 값으로 연결합니다.
- KT DNS가 신규 CNAME을 늦게 반영한 사례가 있었으므로, DNS 문제 확인 시 `8.8.8.8` 또는 `1.1.1.1`로도 조회합니다.

## 사업계획서 정합성 검토 원칙

보조금 신청 당시 사업계획서와 대시보드를 비교할 때는 아래 관점으로 확인합니다.

상위 공공 기본계획과 소이랩 신청서류가 함께 제공되면, 공공 기본계획은 정책 방향과 총괄 예산의 기준으로 보고 소이랩 신청서류는 실제 운영 KPI, 일정, 관리자 입력 항목의 기준으로 봅니다. 두 문서가 다르면 대시보드 운영 데이터는 소이랩 신청서류를 우선 반영합니다.

- 사업 목표와 대시보드 핵심 지표가 일치하는가
- 신청서의 성과지표가 KPI 화면에 반영되어 있는가
- 예산 항목과 예산 집행 입력 구조가 맞는가
- 사업 일정과 대시보드 일정 관리 항목이 맞는가
- N/E/S/T 각 프로그램의 명칭, 대상, 산출물이 사업계획서와 맞는가
- 보고서 작성에 필요한 수치와 근거 데이터가 대시보드에서 바로 확인되는가
- 개인정보 또는 민감정보가 일반 열람 화면에 노출되지 않는가
