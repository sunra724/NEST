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

## 📝 데이터 업데이트 방법 (운영자용)

웹 대시보드는 **열람 전용**입니다. 데이터 수정은 로컬 JSON 파일에서만 합니다.

1. 프로젝트 클론 후 `public/data/` 폴더 열기
2. 해당 JSON 수정:
   - KPI 실적: `kpi.json` → `"current"` 값 변경 (예: `0` → `25`)
   - 예산 집행: `budget.json` → `"spent"` 값 변경 (예: `0` → `12000`)
   - 일정 상태: `timeline.json` → `"status"` 변경 (`"pending"` → `"in_progress"`)
   - 참여자: `program-{id}.json` → `participants` 배열에 객체 추가
3. `git add . && git commit -m "데이터 업데이트: YYYY.MM" && git push`
4. Vercel 자동 배포 (약 1~2분 소요)

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
