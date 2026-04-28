This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔐 접속 구조

- `/login`: 소이랩 업무용 열람 비밀번호(`SITE_PASSWORD`)로 접속
- `/admin/login`: 관리자 비밀번호(`ADMIN_PASSWORD`)로 접속
- `/admin`: KPI, 예산, 일정, 참여자 데이터를 수정하는 관리자 모드

Supabase 환경변수가 설정되어 있으면 관리자 수정 데이터는 Supabase `dashboard_documents`에 저장됩니다. 환경변수가 없으면 로컬 `public/data/*.json`을 fallback으로 사용합니다.

## 🔐 관리자 기능

### 로그인
`localhost:3000/admin` → `/admin/login` 리다이렉트 → 관리자 비밀번호 입력

관리자 비밀번호: `.env.local`의 `ADMIN_PASSWORD` 값

### 수정 가능 항목
| 메뉴 | URL | 기능 |
|---|---|---|
| KPI 실적 | /admin/kpi | 각 KPI current 값 입력 |
| 예산 집행 | /admin/budget | 집행액·월별 실집행액 입력 |
| 일정 상태 | /admin/timeline | 태스크 상태 3단계 전환 |
| 참여자 | /admin/programs/{n,e,s,t} | 참여자 추가·삭제 |

### 변경 이력
모든 수정은 Supabase 또는 로컬 fallback의 `changelog` 문서에 자동 기록됩니다.

### ⚠️ 주의사항
- Vercel 배포에서는 `SITE_PASSWORD`, `ADMIN_PASSWORD`, `JWT_SECRET`, Supabase 환경변수를 반드시 설정합니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 환경변수로만 사용하고 `NEXT_PUBLIC_`를 붙이지 않습니다.
