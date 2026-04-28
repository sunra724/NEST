# 🪺 청년 N.E.S.T. 성과관리 대시보드 — 자동실행 빌드 명령서

---

## ⚙️ AI 실행 프로토콜 (최우선 준수)

이 파일을 받은 AI는 **지금 즉시 아래 Phase 0부터 Phase 8까지 순서대로 전부 완성**한다.

**실행 규칙 — 예외 없음:**

1. 이 파일 전체를 먼저 읽고 전체 구조를 파악한다
2. Phase 0부터 시작해 각 Phase의 모든 작업을 완료한다
3. 각 Phase 완료 후 **스스로 완료 기준을 점검**하고 통과하면 다음 Phase로 자동 진행한다
4. 완료 기준 미달 시 **해당 Phase 내에서 즉시 수정**하고 재점검한다
5. **사용자에게 "다음을 진행할까요?"라고 묻지 않는다** — 무조건 자동 진행한다
6. 터미널 명령은 AI가 직접 실행한다 (Claude Code bash 도구 사용)
7. 한 Phase라도 건너뛰면 이후 Phase의 의존성이 깨진다 — 절대 건너뛰지 않는다

**Phase 전환 선언 형식 (각 Phase 완료 시 반드시 출력):**
```
✅ Phase N 완료 — [완료 기준 N개 전부 통과]
▶ Phase N+1 시작합니다
```

## Phase 체크리스트

- [x] Phase 0 — 프로젝트 초기 설정
- [x] Phase 1 — JSON 데이터 전체 작성
- [x] Phase 2 — 레이아웃 및 네비게이션
- [x] Phase 3 — 메인 대시보드 페이지
- [x] Phase 4 — 예산 관리 페이지
- [x] Phase 5 — 프로그램 상세 페이지 4종
- [x] Phase 6 — 추진 일정 간트 차트
- [x] Phase 7 — 보고서 출력 페이지
- [x] Phase 8 — 최종 점검 및 배포 준비

---

## 🗺️ 프로젝트 컨텍스트

```
■ 사업명: 청년친화적 도시 조성 사업 — 청년 N.E.S.T.
■ 발주: 대구광역시 남구 인구총괄과 | 운영: 협동조합 소이랩
■ 예산: 6.5억원(지역소멸기금) | 기간: 2026.01~12

■ 4개 세부사업
  [N] 마음충전소        5천만원  (7.7%)   고립·은둔 청년 상담 100명
  [E] 캠퍼스타운 챌린지  3억원    (46.2%)  지역문제해결 리빙랩 80명/20팀
  [S] 둥지 시드머니     2.8억원  (43.1%)  초기 창업 18팀
  [T] 안심전월세 지킴이  2천만원  (3.1%)   전월세 상담 200건

■ 선순환: N(관계형성) → E(역량강화) → S(자립기반) → T(정주안전망)
■ 대시보드: 웹 열람 전용 / 수정은 로컬 JSON만
■ 스택: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Recharts
```

---
---

# Phase 0 — 프로젝트 초기 설정

## 실행할 작업

아래 터미널 명령을 순서대로 실행한다:

```bash
npx create-next-app@latest nest-dashboard \
  --typescript --tailwind --app --src-dir --no-eslint --use-npm
cd nest-dashboard
npx shadcn@latest init --defaults
npm install recharts lucide-react
```

그 다음, 아래 파일 및 폴더 구조를 생성한다. 이 단계에서 JSON과 컴포넌트 내용은 비워도 된다 — 파일 경로와 기본 export만 있으면 된다.

```
nest-dashboard/
├── public/data/
│   ├── overview.json        ← {} 로 초기화
│   ├── budget.json          ← {} 로 초기화
│   ├── kpi.json             ← {} 로 초기화
│   ├── timeline.json        ← {} 로 초기화
│   ├── program-n.json       ← {} 로 초기화
│   ├── program-e.json       ← {} 로 초기화
│   ├── program-s.json       ← {} 로 초기화
│   └── program-t.json       ← {} 로 초기화
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── budget/page.tsx
│   │   ├── programs/n/page.tsx
│   │   ├── programs/e/page.tsx
│   │   ├── programs/s/page.tsx
│   │   ├── programs/t/page.tsx
│   │   ├── timeline/page.tsx
│   │   └── report/page.tsx
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── layout/Header.tsx
│   │   ├── dashboard/OverviewCards.tsx
│   │   ├── dashboard/NestFlowDiagram.tsx
│   │   ├── dashboard/KpiProgressSection.tsx
│   │   ├── dashboard/BudgetOverview.tsx
│   │   ├── dashboard/MonthlySchedule.tsx
│   │   └── dashboard/ProgramDetailTemplate.tsx
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── data.ts
│   │   └── utils.ts
│   └── types/index.ts
```

### src/lib/constants.ts — 전체 프로젝트에서 참조하는 색상 및 상수

```typescript
export const NEST_COLORS = {
  N: { primary: '#3B82F6', light: '#DBEAFE', label: '마음충전소' },
  E: { primary: '#10B981', light: '#D1FAE5', label: '캠퍼스타운 챌린지' },
  S: { primary: '#F59E0B', light: '#FEF3C7', label: '둥지 시드머니' },
  T: { primary: '#EF4444', light: '#FEE2E2', label: '안심전월세 지킴이' },
  common: { bg: '#F8FAFC', text: '#1E293B', accent: '#6366F1' },
} as const;

export const PROGRAM_IDS = ['N', 'E', 'S', 'T'] as const;
export type ProgramId = typeof PROGRAM_IDS[number];
```

### src/types/index.ts — 모든 데이터 인터페이스

```typescript
export interface ProgramSummary {
  id: string; name: string; tagline: string;
  budget: number; budgetRatio: number;
  target: string; scale: string; period: string;
}
export interface OverviewData {
  projectName: string; subtitle: string;
  organization: string; operator: string; supervisor: string;
  period: { start: string; end: string };
  totalBudget: number; totalBeneficiaries: number;
  nestMeaning: Record<string, { en: string; ko: string }>;
  programs: ProgramSummary[];
  lastUpdated: string;
}
export interface KpiItem { id: string; label: string; target: number; current: number; unit: string; }
export interface KpiData {
  programs: Record<string, { name: string; kpis: KpiItem[] }>;
  common: { kpis: KpiItem[] };
  aggregate: Record<string, { target: number; current: number; unit?: string }>;
}
export interface BudgetProgram {
  id: string; name: string; budget: number; spent: number;
  direct: number; indirect: number; labor: number;
}
export interface BudgetData {
  totalBudget: number;
  byCategory: Record<string, { budget: number; spent: number; ratio: number }>;
  byProgram: BudgetProgram[];
  directCostDetail: Record<string, { budget: number; spent: number; label: string }>;
  monthlyExecution: { month: string; planned: number; actual: number }[];
  laborDetail: {
    total: number; pmSalary: number; managerSalary: number; overhead: number;
    staff: { name: string; title: string; program: string; role: string; rate?: string }[];
  };
  lastUpdated: string;
}
export type TaskStatus = 'completed' | 'in_progress' | 'pending';
export interface TimelineTask { name: string; months: number[]; status: TaskStatus; }
export interface TimelineCategory { id: string; label: string; color: string; tasks: TimelineTask[]; }
export interface TimelineData { categories: TimelineCategory[]; }
export interface ProgramDetailData {
  id: string; name: string; purpose: string;
  cohorts?: { label: string; period: string; capacity: number; status: string }[];
  tracks?: Record<string, { label: string; teams: number; budgetPerTeam: number; period: string; focus: string }>;
  stages?: { name: string; duration: string; activities?: string[] }[];
  kpis?: KpiItem[];
  budget?: number;
  partners?: string[];
  connections?: { target: string; desc: string }[];
  participants: unknown[];
  [key: string]: unknown;
}
```

### src/lib/data.ts

```typescript
export async function loadJSON<T>(filename: string): Promise<T> {
  const res = await fetch(`/data/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}`);
  return res.json();
}
```

## Phase 0 완료 기준 (AI가 스스로 점검)

- `public/data/` 아래 JSON 파일 8개 존재
- `src/types/index.ts` 인터페이스 존재
- `src/lib/constants.ts` NEST_COLORS 존재
- `src/lib/data.ts` loadJSON 존재
- `npm run build` 에러 없음 (빈 파일이므로 통과해야 함)

---
---

# Phase 1 — JSON 데이터 전체 작성

## 실행할 작업

`public/data/` 아래 8개 파일에 실제 데이터를 채운다.
Phase 0에서 정의한 TypeScript 타입과 구조가 반드시 일치해야 한다.

### public/data/overview.json

```json
{
  "projectName": "청년 N.E.S.T.",
  "subtitle": "청년친화적 도시 조성 사업",
  "organization": "대구광역시 남구",
  "operator": "협동조합 소이랩",
  "supervisor": "남구청 인구총괄과",
  "period": { "start": "2026-01", "end": "2026-12" },
  "totalBudget": 650000,
  "totalBeneficiaries": 380,
  "nestMeaning": {
    "N": { "en": "Networking", "ko": "관계 형성" },
    "E": { "en": "Empowerment", "ko": "역량 강화" },
    "S": { "en": "Startup", "ko": "자립 기반" },
    "T": { "en": "Trust", "ko": "정주 안전망" }
  },
  "programs": [
    { "id": "N", "name": "마음충전소", "tagline": "고립·은둔 청년 지원",
      "budget": 50000, "budgetRatio": 7.7,
      "target": "만 19~34세 고립·은둔 청년",
      "scale": "상담 100명 (4기수, 기수당 25명)", "period": "2026.04 ~ 11" },
    { "id": "E", "name": "캠퍼스타운 챌린지", "tagline": "지역문제해결 리빙랩",
      "budget": 300000, "budgetRatio": 46.2,
      "target": "남구 4개 대학 재·휴학생 및 남구 거주 청년",
      "scale": "80명 / 20팀 (2기수, 기수당 10팀)", "period": "2026.04 ~ 11" },
    { "id": "S", "name": "둥지 시드머니", "tagline": "초기 창업·사업화 지원",
      "budget": 280000, "budgetRatio": 43.1,
      "target": "남구 기반 7년 미만 초기 창업팀",
      "scale": "18팀 (트랙1 콘텐츠 10팀, 트랙2 로컬창업 8팀)", "period": "2026.04 ~ 11" },
    { "id": "T", "name": "안심전월세 지킴이", "tagline": "주거 안전망 구축",
      "budget": 20000, "budgetRatio": 3.1,
      "target": "만 19~39세 청년 (1인가구/신혼부부)",
      "scale": "상담 200건, 계약동행 50건", "period": "2026.04 ~ 12" }
  ],
  "lastUpdated": "2026-02-25"
}
```

### public/data/kpi.json

```json
{
  "programs": {
    "N": { "name": "마음충전소", "kpis": [
      { "id": "N-1", "label": "상담 참여자 수", "target": 100, "current": 0, "unit": "명" },
      { "id": "N-2", "label": "네트워크 참여율", "target": 60, "current": 0, "unit": "%" },
      { "id": "N-3", "label": "또래멘토 양성", "target": 20, "current": 0, "unit": "명" },
      { "id": "N-4", "label": "프로그램 이수율", "target": 70, "current": 0, "unit": "%" },
      { "id": "N-5", "label": "사회적 고립감 개선도", "target": 30, "current": 0, "unit": "% 감소" },
      { "id": "N-6", "label": "우울·불안 증상 개선율", "target": 25, "current": 0, "unit": "% 개선" }
    ]},
    "E": { "name": "캠퍼스타운 챌린지", "kpis": [
      { "id": "E-1", "label": "프로그램 참여자 수", "target": 80, "current": 0, "unit": "명(20팀)" },
      { "id": "E-2", "label": "프로토타입 실증", "target": 10, "current": 0, "unit": "건" },
      { "id": "E-3", "label": "정책제안", "target": 10, "current": 0, "unit": "건(채택 5건)" },
      { "id": "E-4", "label": "정착률", "target": 30, "current": 0, "unit": "%(6팀)" }
    ]},
    "S": { "name": "둥지 시드머니", "kpis": [
      { "id": "S-1", "label": "지원팀 수", "target": 18, "current": 0, "unit": "팀" },
      { "id": "S-2", "label": "사업 생존율", "target": 50, "current": 0, "unit": "%(9팀)" },
      { "id": "S-3", "label": "신규 고용 창출", "target": 15, "current": 0, "unit": "명" },
      { "id": "S-4", "label": "사업자등록", "target": 15, "current": 0, "unit": "건" },
      { "id": "S-5", "label": "참여자 정착률", "target": 60, "current": 0, "unit": "%" },
      { "id": "S-6", "label": "시제품·콘텐츠 개발", "target": 18, "current": 0, "unit": "건" }
    ]},
    "T": { "name": "안심전월세 지킴이", "kpis": [
      { "id": "T-1", "label": "전월세 상담", "target": 200, "current": 0, "unit": "건" },
      { "id": "T-2", "label": "계약 사전검토", "target": 160, "current": 0, "unit": "건(80%)" },
      { "id": "T-3", "label": "계약동행 서비스", "target": 50, "current": 0, "unit": "건" },
      { "id": "T-4", "label": "분쟁예방 교육", "target": 3, "current": 0, "unit": "회" },
      { "id": "T-5", "label": "표준문서 활용", "target": 500, "current": 0, "unit": "부" },
      { "id": "T-6", "label": "위험계약 차단율", "target": 80, "current": 0, "unit": "%" }
    ]}
  },
  "common": { "kpis": [
    { "id": "C-1", "label": "사업 만족도", "target": 85, "current": 0, "unit": "점" },
    { "id": "C-2", "label": "브랜드 인지도 상승", "target": 20, "current": 0, "unit": "%" }
  ]},
  "aggregate": {
    "totalBeneficiaries": { "target": 380, "current": 0 },
    "newEmployment": { "target": 15, "current": 0 },
    "policyProposals": { "target": 5, "current": 0 },
    "damagePreventionAmount": { "target": 500000, "current": 0, "unit": "천원" }
  }
}
```

### public/data/budget.json

```json
{
  "totalBudget": 650000,
  "byCategory": {
    "directCost": { "budget": 476500, "spent": 0, "ratio": 73.3 },
    "indirectCost": { "budget": 34500, "spent": 0, "ratio": 5.3 },
    "laborCost": { "budget": 139000, "spent": 0, "ratio": 21.4 }
  },
  "byProgram": [
    { "id": "N", "name": "마음충전소", "budget": 50000, "spent": 0, "direct": 32000, "indirect": 3000, "labor": 15000 },
    { "id": "E", "name": "캠퍼스타운 챌린지", "budget": 300000, "spent": 0, "direct": 220000, "indirect": 15000, "labor": 65000 },
    { "id": "S", "name": "둥지 시드머니", "budget": 280000, "spent": 0, "direct": 210000, "indirect": 15000, "labor": 55000 },
    { "id": "T", "name": "안심전월세 지킴이", "budget": 20000, "spent": 0, "direct": 14500, "indirect": 1500, "labor": 4000 }
  ],
  "directCostDetail": {
    "teamSupport": { "budget": 325000, "spent": 0, "label": "팀 지원비" },
    "operation":   { "budget": 42200,  "spent": 0, "label": "운영비" },
    "expertise":   { "budget": 85900,  "spent": 0, "label": "전문가 인건비" },
    "printing":    { "budget": 23400,  "spent": 0, "label": "인쇄비" }
  },
  "monthlyExecution": [
    { "month": "2026-01", "planned": 0,     "actual": 0 },
    { "month": "2026-02", "planned": 0,     "actual": 0 },
    { "month": "2026-03", "planned": 50000, "actual": 0 },
    { "month": "2026-04", "planned": 80000, "actual": 0 },
    { "month": "2026-05", "planned": 70000, "actual": 0 },
    { "month": "2026-06", "planned": 80000, "actual": 0 },
    { "month": "2026-07", "planned": 90000, "actual": 0 },
    { "month": "2026-08", "planned": 70000, "actual": 0 },
    { "month": "2026-09", "planned": 60000, "actual": 0 },
    { "month": "2026-10", "planned": 50000, "actual": 0 },
    { "month": "2026-11", "planned": 60000, "actual": 0 },
    { "month": "2026-12", "planned": 40000, "actual": 0 }
  ],
  "laborDetail": {
    "total": 139000, "pmSalary": 67200, "managerSalary": 52440, "overhead": 19360,
    "staff": [
      { "name": "강아름", "title": "대표",    "program": "공통/[S]", "role": "총괄/PM" },
      { "name": "김형준", "title": "연구소장", "program": "공통/[E]", "role": "전담/PM" },
      { "name": "이형구", "title": "경영실장", "program": "[S]/[T]", "role": "관리자" },
      { "name": "박기범", "title": "팀장",    "program": "[N]",      "role": "담당PM", "rate": "55%" },
      { "name": "신규A",  "title": "팀장급",  "program": "[E]",      "role": "관리자", "rate": "90%" },
      { "name": "신규B",  "title": "연구원급","program": "[E]/[S]",  "role": "실무보조","rate": "60%/40%" }
    ]
  },
  "lastUpdated": "2026-02-25"
}
```

### public/data/timeline.json

```json
{
  "categories": [
    {
      "id": "common", "label": "공통", "color": "#6366F1",
      "tasks": [
        { "name": "계획 수립 및 협약",  "months": [1,2],              "status": "completed"  },
        { "name": "추경 및 예산 확정",  "months": [3],                "status": "pending"    },
        { "name": "보조금 교부 및 착수","months": [4],                "status": "pending"    },
        { "name": "중간 점검",          "months": [5,6,7,9,10],       "status": "pending"    },
        { "name": "통합 성과공유회",    "months": [11],               "status": "pending"    },
        { "name": "정산 및 최종보고",   "months": [12],               "status": "pending"    }
      ]
    },
    {
      "id": "N", "label": "[N] 마음충전소", "color": "#3B82F6",
      "tasks": [
        { "name": "운영 준비 및 홍보",  "months": [2,3,4],            "status": "in_progress"},
        { "name": "상담 프로그램 운영", "months": [4,5,6,7,8,9,10,11],"status": "pending"    },
        { "name": "네트워크 프로그램",  "months": [5,6,7,8,9,10,11], "status": "pending"    }
      ]
    },
    {
      "id": "E", "label": "[E] 캠퍼스타운 챌린지", "color": "#10B981",
      "tasks": [
        { "name": "1기 모집 및 선발",  "months": [4,5],    "status": "pending" },
        { "name": "1기 킥오프",        "months": [5],      "status": "pending" },
        { "name": "1기 리빙랩 활동",   "months": [5,6,7],  "status": "pending" },
        { "name": "1기 마무리",        "months": [7],      "status": "pending" },
        { "name": "2기 모집 및 선발",  "months": [6,7],    "status": "pending" },
        { "name": "2기 킥오프",        "months": [7],      "status": "pending" },
        { "name": "2기 리빙랩 활동",   "months": [8,9,10], "status": "pending" },
        { "name": "2기 마무리",        "months": [10],     "status": "pending" },
        { "name": "통합 성과공유회",   "months": [11],     "status": "pending" }
      ]
    },
    {
      "id": "S", "label": "[S] 둥지 시드머니", "color": "#F59E0B",
      "tasks": [
        { "name": "트랙1 공모 및 선발", "months": [4,5],    "status": "pending" },
        { "name": "트랙1 협약 및 착수", "months": [5],      "status": "pending" },
        { "name": "트랙1 사업화",       "months": [6,7,8],  "status": "pending" },
        { "name": "트랙1 중간점검",     "months": [7],      "status": "pending" },
        { "name": "트랙1 마무리",       "months": [9],      "status": "pending" },
        { "name": "트랙2 공모 및 선발", "months": [7,8],    "status": "pending" },
        { "name": "트랙2 협약 및 착수", "months": [8],      "status": "pending" },
        { "name": "트랙2 사업화",       "months": [9,10,11],"status": "pending" },
        { "name": "트랙2 중간점검",     "months": [10],     "status": "pending" },
        { "name": "트랙2 마무리",       "months": [11],     "status": "pending" },
        { "name": "쇼케이스 및 데모데이","months": [11],    "status": "pending" }
      ]
    },
    {
      "id": "T", "label": "[T] 안심전월세 지킴이", "color": "#EF4444",
      "tasks": [
        { "name": "운영 준비 및 홍보",  "months": [2,3,4],              "status": "in_progress"},
        { "name": "상담창구 운영",      "months": [4,5,6,7,8,9,10,11], "status": "pending"    },
        { "name": "계약동행 서비스",    "months": [4,5,6,7,8,9,10,11], "status": "pending"    },
        { "name": "분쟁예방 교육",      "months": [5,7,9,11],           "status": "pending"    }
      ]
    }
  ]
}
```

### public/data/program-n.json

```json
{
  "id": "N", "name": "마음충전소",
  "purpose": "심리적 어려움을 겪는 청년의 사회 진입 장벽을 낮추고 지역사회와의 연결 고리를 회복하여 역외 유출 방지 및 정주 기반 마련",
  "cohorts": [
    { "label": "1기", "period": "2026.04~05", "capacity": 25, "status": "예정" },
    { "label": "2기", "period": "2026.05~07", "capacity": 25, "status": "예정" },
    { "label": "3기", "period": "2026.07~09", "capacity": 25, "status": "예정" },
    { "label": "4기", "period": "2026.09~11", "capacity": 25, "status": "예정" }
  ],
  "stages": [
    { "name": "첫만남",   "duration": "1~2회" },
    { "name": "함께걷기", "duration": "6~8회" },
    { "name": "날개펴기", "duration": "2~3회" },
    { "name": "동행하기", "duration": "상시" }
  ],
  "programs": ["초기상담(1~2회)","집단상담(6~8회, 인지행동치료)","예술치료(2~3회)","진로탐색(1회)","수료자정기모임(월1회)","동료멘토링(상시, 20명 양성)"],
  "tools": ["PHQ-9", "GAD-7", "UCLA 외로움 척도"],
  "partners": ["남구정신건강복지센터","대구고용센터","고립·은둔청년협의체","동행정복지센터"],
  "connections": [
    { "target": "[E]", "desc": "활동의욕 회복 청년" },
    { "target": "[S]", "desc": "창업 아이디어 보유 청년" },
    { "target": "[T]", "desc": "주거 불안정 청년" }
  ],
  "participants": []
}
```

### public/data/program-e.json

```json
{
  "id": "E", "name": "캠퍼스타운 챌린지",
  "purpose": "남구 4개 대학 청년이 지역 문제를 직접 발굴·해결하여 '남구의 주인'으로 성장, 지역 애착도 고취",
  "cohorts": [
    { "label": "1기", "period": "2026.04~07", "capacity": 40, "status": "예정" },
    { "label": "2기", "period": "2026.06~09", "capacity": 40, "status": "예정" }
  ],
  "stages": [
    { "name": "발견", "duration": "4주",  "activities": ["지역문제 발굴","현장조사"] },
    { "name": "실험", "duration": "8주",  "activities": ["프로토타입 제작","실증"] },
    { "name": "연결", "duration": "4주",  "activities": ["정책제안","협력기관 연계"] },
    { "name": "확산", "duration": "11월~","activities": ["성과공유회","지속 활동"] }
  ],
  "funding": {
    "stage1": 3000,
    "stage2Max": 5000,
    "totalMax": 8000,
    "unit": "천원/팀"
  },
  "foreignStudentTarget": "10% 참여 권장",
  "partners": ["계명대","대구교대","대구대","영남이공대","대구상공회의소"],
  "connections": [
    { "target": "[S]", "desc": "우수팀 트랙2 우선 선발" },
    { "target": "[T]", "desc": "남구 외 거주 참여자 정착 지원" }
  ],
  "participants": []
}
```

### public/data/program-s.json

```json
{
  "id": "S", "name": "둥지 시드머니",
  "purpose": "발굴된 아이디어·예비 창업팀에 시드머니 지원하여 지역 내 경제적 자립 기반 마련",
  "tracks": {
    "track1": { "label": "콘텐츠",  "teams": 10, "budgetPerTeam": 8500,  "period": "4~9월",  "focus": "공연·전시·영상 창작, 대명공연거리 활용" },
    "track2": { "label": "로컬창업","teams": 8,  "budgetPerTeam": 10000, "period": "7~11월", "focus": "지역자원 기반 제품·서비스, 전통시장 연계" }
  },
  "stages": [
    { "name": "기획착수", "duration": "4주" },
    { "name": "제작개발", "duration": "8주" },
    { "name": "시장검증", "duration": "8주" },
    { "name": "성과확산", "duration": "4~8주" }
  ],
  "fundingSchedule": [40, 30, 30],
  "localResources": ["대명공연거리","앞산·겨울스토리","전통시장·상권","대학가","남구청년센터"],
  "partners": ["대명공연거리 상인회","전통시장 협의체","대구창조경제혁신센터"],
  "connections": [
    { "target": "[E]", "desc": "우수팀 유입" },
    { "target": "[T]", "desc": "사업화 후 공간 확보" }
  ],
  "participants": []
}
```

### public/data/program-t.json

```json
{
  "id": "T", "name": "안심전월세 지킴이",
  "purpose": "청년 전세 사기 피해 예방·불공정 계약 방지로 '믿고 살 수 있는' 정주 환경 조성",
  "stages": [
    { "name": "상담채널 구축", "duration": "주 2회",  "activities": ["온·오프라인 상담창구 운영"] },
    { "name": "사전검토",      "duration": "예약제",  "activities": ["등기부등본","전세가율 확인","임대인 신원"] },
    { "name": "계약동행",      "duration": "월 예약제","activities": ["협력 중개사 30개소 연계"] },
    { "name": "교육·캠페인",   "duration": "격월/분기","activities": ["분쟁예방 교육","축제 연계 부스"] }
  ],
  "partnerBrokers": 30,
  "additionalServices": [
    { "name": "찾아가는 상담소",  "cycle": "격월",   "desc": "현장 방문 상담" },
    { "name": "축제 연계 부스",   "cycle": "비정기", "desc": "지역 행사 연계 홍보" },
    { "name": "분쟁예방 교육",    "cycle": "분기",   "desc": "임대차 분쟁 예방 강의" },
    { "name": "법률 상담",        "cycle": "격월",   "desc": "무료 법률 자문" },
    { "name": "계약동행 서비스",  "cycle": "월 예약","desc": "계약 현장 동행" }
  ],
  "contents": ["임대차 체크리스트","위험신호 리스트","특약 샘플 10종","카드뉴스","리플릿"],
  "partners": ["공인중개사협회 남구지회","HUG(주택도시보증공사)","법률NPO"],
  "connections": [
    { "target": "[N][E][S]", "desc": "전 프로그램 참여자 정착 지원 최종단계" }
  ],
  "participants": []
}
```

## Phase 1 완료 기준 (AI가 스스로 점검)

- 8개 JSON 파일 모두 유효한 JSON (빈 `{}` 아님)
- `overview.json` — programs 배열 4개 항목 존재
- `kpi.json` — N/E/S/T 프로그램 KPI 모두 포함
- `budget.json` — monthlyExecution 12개월 데이터 존재
- `timeline.json` — 5개 카테고리, 태스크 총 33개
- `program-n/e/s/t.json` — participants: [] 포함
- `npm run build` 에러 없음

---
---

# Phase 2 — 레이아웃 및 네비게이션

## 실행할 작업

아래 터미널 명령을 실행한다:

```bash
npx shadcn@latest add button sheet badge
```

그 다음 아래 컴포넌트를 구현한다.

### src/components/layout/Sidebar.tsx

- 좌측 고정(240px), bg-slate-900, 흰색 텍스트
- 메뉴 구조:
  - 📊 대시보드 → `/`
  - 💰 예산 관리 → `/budget`
  - 📋 프로그램 (서브메뉴, 기본 펼침)
    - [N] 마음충전소 → `/programs/n` (도트 #3B82F6)
    - [E] 캠퍼스타운 챌린지 → `/programs/e` (도트 #10B981)
    - [S] 둥지 시드머니 → `/programs/s` (도트 #F59E0B)
    - [T] 안심전월세 지킴이 → `/programs/t` (도트 #EF4444)
  - 📅 추진 일정 → `/timeline`
  - 📄 보고서 → `/report`
- 활성 메뉴: 좌측 3px 바(#6366F1) + bg-slate-800
- hover: bg-slate-800
- 하단 고정 텍스트: "대구광역시 남구 | 협동조합 소이랩"
- Lucide React 아이콘 사용
- 1024px 미만: shadcn Sheet 컴포넌트로 오버레이 전환

### src/components/layout/Header.tsx

- 좌: `usePathname()`으로 breadcrumb 자동 생성
  - `"/"` → `"대시보드"`
  - `"/budget"` → `"예산 관리"`
  - `"/programs/n"` → `"프로그램 > [N] 마음충전소"`
  - (E/S/T/timeline/report 동일 패턴)
- 우: `"2026.02.25 기준"` + 🔒 `"열람 전용"` 뱃지(amber)

### src/app/layout.tsx

```tsx
// 구조: <html lang="ko"> → Sidebar + Header + <main>{children}</main>
// metadata: title: "청년 N.E.S.T. 성과관리 대시보드"
// 각 page.tsx는 임시 플레이스홀더로 페이지명만 표시
```

## Phase 2 완료 기준 (AI가 스스로 점검)

- Sidebar 컴포넌트 TypeScript 에러 없음
- Header 컴포넌트 TypeScript 에러 없음
- layout.tsx에 Sidebar + Header + children 구조 존재
- 모든 page.tsx 라우트에 기본 export 존재
- `npm run build` 에러 없음

---
---

# Phase 3 — 메인 대시보드 페이지

## 실행할 작업

아래 터미널 명령을 실행한다:

```bash
npx shadcn@latest add card progress
```

### src/lib/utils.ts — 공통 유틸 함수

```typescript
export function formatBudget(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}억원`;
  if (n >= 10000)  return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}천만원`;
  return `${n.toLocaleString()}천원`;
}
export function formatPercent(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((current / target) * 1000) / 10;
}
export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}
```

### src/app/page.tsx — 메인 대시보드

`overview.json`, `kpi.json`, `budget.json`, `timeline.json`을 `loadJSON`으로 로딩한다.

**섹션 1: 사업 요약 카드 4열** → `OverviewCards.tsx`
- 총 예산(6.5억원) / 직접 수혜자(380명+) / 세부사업(4개) / 사업기간(2026.01~12)
- 스타일: `bg-white rounded-xl shadow-sm p-6`, 좌측 원형 아이콘 + 우측 수치+라벨

**섹션 2: N.E.S.T. 흐름도** → `NestFlowDiagram.tsx`
- [N]파랑 → [E]초록 → [S]주황 → [T]빨강, 화살표 연결
- 각 카드: 상단 8px 색상바 + 사업명 + 영문의미 + 대표 KPI (`"상담 0/100명"`)
- 클릭 → `/programs/{id}` 이동
- 모바일: flex-col

**섹션 3: KPI 진행 현황 2열** → `KpiProgressSection.tsx`
- 좌: 4개 사업 대표 KPI 프로그레스바 (사업 색상, `"N — 상담 참여자 0/100명 (0%)"`)
- 우: 전체 달성률 반원형 게이지(SVG) + N/E/S/T 미니 원형 게이지 4개

**섹션 4: 예산 현황 2열** → `BudgetOverview.tsx`
- 좌: Recharts PieChart 도넛 (N/E/S/T 비중, 중앙 "총 6.5억원")
- 우: Recharts BarChart 수평 (직접비/인건비/간접비 비율)
- Recharts는 `'use client'` + `dynamic import + ssr:false` 적용

**섹션 5: 이번 달 주요 일정** → `MonthlySchedule.tsx`
- `timeline.json`에서 `months` 배열에 `2`(2월) 포함 태스크만 필터링
- 상태뱃지: completed=초록, in_progress=파랑, pending=회색

**공통 스타일 규칙:**
- 섹션 간격: `space-y-8`
- 카드: `bg-white rounded-xl shadow-sm p-6`
- 섹션 제목: `text-lg font-semibold` + 좌측 4px 색상바(`#6366F1`)

## Phase 3 완료 기준 (AI가 스스로 점검)

- 5개 컴포넌트 파일 존재 및 TypeScript 에러 없음
- Recharts import가 `dynamic + ssr:false` 로 처리됨 (SSR 오류 방지)
- `npm run build` 에러 없음

---
---

# Phase 4 — 예산 관리 페이지

## 실행할 작업

아래 터미널 명령을 실행한다:

```bash
npx shadcn@latest add table accordion
```

### src/app/budget/page.tsx

`budget.json`만 로딩하여 5개 섹션을 구현한다.

**섹션 1: 총괄 카드 3열**
- 총 예산 650,000천원 (보라 그라디언트 bg)
- 집행액 0천원 (파랑 테두리)
- 잔액 650,000천원 (회색 테두리)
- 각 카드 하단: 집행률 Progress 바 + 퍼센트
- 우측 상단: `"(단위: 천원)"`

**섹션 2: 프로그램별 예산 테이블 (shadcn Table)**
- 컬럼: 프로그램명(색상도트) | 총예산 | 직접비 | 간접비 | 인건비 | 집행액 | 집행률 | 잔액
- 금액: 우측 정렬, tabular-nums, 천단위 콤마
- 집행액 0: `"미집행"` 뱃지(gray)
- 합계 행: font-bold + bg-slate-50

**섹션 3: 예산 시각화 2열**
- 좌: Recharts StackedBar (4개 프로그램 × 직접비/간접비/인건비)
- 우: Recharts HorizontalBar (직접비 세부 4항목)

**섹션 4: 월별 집행 추이**
- Recharts ComposedChart: Bar(계획) + Line(실제 누적)
- X축 2월 위치: 수직 점선 + `"현재(2월)"` 레이블

**섹션 5: 인건비 상세 (shadcn Accordion)**
- 총액 + PM/관리자/부대경비 요약
- 펼치면: 담당인원 테이블 (성명 | 직책 | 담당사업 | 역할 | 투입률)

## Phase 4 완료 기준 (AI가 스스로 점검)

- `src/app/budget/page.tsx` 존재 및 TypeScript 에러 없음
- 5개 섹션 모두 구현
- `npm run build` 에러 없음

---
---

# Phase 5 — 프로그램 상세 페이지 4종

## 실행할 작업

아래 터미널 명령을 실행한다:

```bash
npx shadcn@latest add tabs collapsible
```

### src/components/dashboard/ProgramDetailTemplate.tsx — 공통 템플릿

props로 `ProgramDetailData`와 프로그램 색상을 받아 아래 7개 섹션을 렌더링한다:

1. **헤더 배너**: 색상 그라디언트(primary→light) + ID/이름/태그라인/기간/예산/규모 + 핵심 KPI 미니카드 2개
2. **사업 목적** (shadcn Collapsible, 기본 접힘)
3. **단계 흐름도**: 수평 스텝 인디케이터 (번호원형 + 단계명 + 기간, 미시작은 회색)
4. **KPI 그리드**: SVG `circle stroke-dasharray` 원형 프로그레스 + 현재/목표 텍스트
5. **기수/트랙 운영 현황 테이블**: 기수명 | 기간 | 정원 | 등록 | 상태뱃지
6. **협력기관 + N.E.S.T. 연계** (2열)
7. **참여자 현황**: 빈 배열이면 `"아직 등록된 참여자가 없습니다"` 표시

### 각 프로그램 page.tsx

각 page에서 해당 JSON만 loadJSON으로 로딩해 ProgramDetailTemplate에 전달한다.

**`/programs/n/page.tsx`** — program-n.json 로딩
- 4기수 테이블, 4단계(첫만남→함께걷기→날개펴기→동행하기)
- 측정도구 카드: PHQ-9, GAD-7, UCLA

**`/programs/e/page.tsx`** — program-e.json 로딩
- 2기수, 4단계(발견→실험→연결→확산)
- 지원금 안내 카드: 1단계 3,000 + 2단계 최대 5,000천원/팀
- 유학생 10% 권장 뱃지

**`/programs/s/page.tsx`** — program-s.json 로딩
- 트랙1 vs 트랙2 비교 카드 나란히 (10팀/8,500 vs 8팀/10,000천원)
- 지원금 3단계(40%→30%→30%) 분할 테이블

**`/programs/t/page.tsx`** — program-t.json 로딩
- 4단계 흐름, 추가서비스 테이블(서비스명|주기|설명)
- 제작콘텐츠 체크리스트 목록

## Phase 5 완료 기준 (AI가 스스로 점검)

- `ProgramDetailTemplate.tsx` 존재
- 4개 프로그램 page.tsx 각각 TypeScript 에러 없음
- `npm run build` 에러 없음

---
---

# Phase 6 — 추진 일정 간트 차트

## 실행할 작업

외부 간트 라이브러리 사용 금지. Tailwind CSS Grid로 직접 구현한다.

### src/app/timeline/page.tsx

`timeline.json`만 로딩. **하드코딩 없이 JSON 데이터만으로 동적 렌더링**한다.

**상단 필터 바**
- 토글 버튼: [전체] [공통] [N] [E] [S] [T]
- 다중 선택, 선택된 것은 프로그램 색상으로 활성화

**간트 차트 레이아웃**
- `grid-cols-[250px_1fr]`
- 좌측: 카테고리 헤더(클릭→접기/펼치기) + 들여쓴 태스크 라벨 (`sticky left-0`)
- 우측: 1~12월 컬럼 헤더 + 바 행들 (`overflow-x-auto`)
- **2월 컬럼**: 빨간 수직 점선 + `"오늘(2026.02)"` 레이블

**바 스타일 (h-6, rounded-full)**
- `completed`: 진한 프로그램 색상 + ✓ 아이콘
- `in_progress`: 프로그램 색상 + `animate-pulse`
- `pending`: 프로그램 색상 30% 투명도
- hover: 툴팁 (태스크명 + 기간 + 상태)
- 클릭: `/programs/{id}` 이동 (common 카테고리 제외)

**하단 요약**
- 이번 달(2월) 진행 중 N건 / 완료 N건 / 다음 달(3월) 예정 N건

## Phase 6 완료 기준 (AI가 스스로 점검)

- `src/app/timeline/page.tsx` TypeScript 에러 없음
- timeline.json 5개 카테고리(총 33개 태스크) 모두 처리하는 로직 존재
- `npm run build` 에러 없음

---
---

# Phase 7 — 보고서 출력 페이지

## 실행할 작업

### src/app/report/page.tsx

**상단 설정 바** (`@media print: display:none`)
- 분기 선택: [1분기 1~3월] [2분기 4~6월] [3분기 7~9월] [4분기 10~12월]
- `[🖨️ PDF 인쇄]` 버튼 → `window.print()`

**보고서 본문** (`max-w-[794px] mx-auto bg-white shadow-2xl p-[60px]`)

| 섹션 | 내용 |
|---|---|
| 헤더 | 파랑 5px 바 + 제목 + 분기/기간 + 작성일/기관 |
| 1. 사업 개요 | 사업명/총예산/기간/운영기관/세부사업 표 |
| 2. N.E.S.T. 흐름도 | 텍스트 기반 [N]→[E]→[S]→[T] |
| 3. KPI 달성 현황 | N(3개)+E(3개)+S(3개)+T(3개)+공통(1개) = 13행 테이블 |
| 4. 예산 집행 현황 | N/E/S/T + 합계행 (예산/집행/잔액/집행률) |
| 5. 분기별 주요 성과 | 점선 테두리 빈 입력 영역 4줄 |
| 6. 특이사항 및 건의 | 점선 테두리 빈 입력 영역 3줄 |
| 푸터 | 페이지번호 + "대구광역시 남구 인구총괄과 \| 협동조합 소이랩" |

**`@media print` CSS (global.css 또는 인라인 `<style>`):**
```css
@media print {
  nav, header, .no-print { display: none !important; }
  body { -webkit-print-color-adjust: exact; }
  .report-body { padding: 15mm; box-shadow: none; max-width: 210mm; margin: 0; }
  .report-body { font-size: 10pt; }
  h1, h2 { font-size: 14pt; }
  .page-break { page-break-before: always; }
}
```

## Phase 7 완료 기준 (AI가 스스로 점검)

- `src/app/report/page.tsx` TypeScript 에러 없음
- 13행 KPI 테이블 로직 존재
- `@media print` 스타일 존재
- `npm run build` 에러 없음

---
---

# Phase 8 — 최종 점검 및 배포 준비

## 실행할 작업

아래 항목을 전체 코드에서 점검하고 **발견된 문제는 즉시 수정**한다.

### 1. 전체 일관성 수정

- 색상: N=#3B82F6 / E=#10B981 / S=#F59E0B / T=#EF4444 — NEST_COLORS 상수 통해서만 참조, 하드코딩 금지
- 금액: 천단위 콤마 + `"(단위: 천원)"` 모든 예산 섹션에 표시
- 날짜 형식: `"2026.MM"` 통일
- 상태 뱃지: completed=초록 / in_progress=파랑 / pending=회색 전체 통일
- 빈 데이터: 숫자=`"0"`, 텍스트=`"-"`, 목록=`"아직 등록된 데이터가 없습니다"`

### 2. Recharts SSR 처리 확인

모든 Recharts 컴포넌트가 아래 패턴으로 임포트되어 있는지 확인하고 아니면 수정한다:

```typescript
const DonutChart = dynamic(() => import('@/components/charts/DonutChart'), { ssr: false });
```

### 3. 로딩 / 에러 / 빈 상태 처리

데이터를 fetch하는 모든 page에 아래 세 가지가 존재하는지 확인한다:
- 로딩: shadcn/ui `Skeleton`
- 에러: `"데이터를 불러올 수 없습니다"` 메시지
- 빈 배열: 아이콘 + 안내 텍스트

### 4. 메타데이터 추가

각 page.tsx에 `export const metadata` 추가:
- `/` → `"대시보드 | 청년 N.E.S.T."`
- `/budget` → `"예산 관리 | 청년 N.E.S.T."`
- `/programs/n` → `"[N] 마음충전소 | 청년 N.E.S.T."`
- `/programs/e` → `"[E] 캠퍼스타운 챌린지 | 청년 N.E.S.T."`
- `/programs/s` → `"[S] 둥지 시드머니 | 청년 N.E.S.T."`
- `/programs/t` → `"[T] 안심전월세 지킴이 | 청년 N.E.S.T."`
- `/timeline` → `"추진 일정 | 청년 N.E.S.T."`
- `/report` → `"보고서 | 청년 N.E.S.T."`

### 5. README.md 운영자 가이드 추가

README.md 하단에 아래 내용 추가:

```markdown
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
```

### 6. 최종 빌드 실행

```bash
npm run build
```

빌드 에러 0개 달성 시 완료. 에러 발생 시 즉시 수정 후 재빌드.

## Phase 8 완료 기준 (AI가 스스로 점검)

- `npm run build` 에러 0개, 경고 없음
- 모든 page.tsx에 metadata export 존재
- 모든 Recharts 컴포넌트 dynamic import 처리
- README.md에 데이터 업데이트 가이드 포함

---
---

## 🎉 전체 빌드 완료 선언

모든 Phase가 완료되면 아래 형식으로 최종 선언한다:

```
═══════════════════════════════════════════
✅ 청년 N.E.S.T. 대시보드 빌드 완료
═══════════════════════════════════════════
Phase 0 ✅ 프로젝트 초기 설정
Phase 1 ✅ JSON 데이터 전체 작성
Phase 2 ✅ 레이아웃 및 네비게이션
Phase 3 ✅ 메인 대시보드 페이지
Phase 4 ✅ 예산 관리 페이지
Phase 5 ✅ 프로그램 상세 페이지 4종
Phase 6 ✅ 추진 일정 간트 차트
Phase 7 ✅ 보고서 출력 페이지
Phase 8 ✅ 최종 점검 및 배포 준비

npm run dev → localhost:3000

🔄 데이터 업데이트: public/data/*.json 수정 → git push → Vercel 자동 반영
📌 열람 전용: 모든 수정은 로컬 JSON 파일에서만
═══════════════════════════════════════════
```
