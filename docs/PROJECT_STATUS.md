# PROJECT_STATUS.md

이 문서는 N.E.S.T. 대시보드의 현재 구축 상태, 남은 작업, 보조금 사업계획서와의 정합성 검토 항목을 기록합니다.

## 현재 구축 상태

- Next.js 기반 N.E.S.T. 사업 성과관리 대시보드 구축
- 소이랩 업무용 인트라넷 형태의 첫 화면 로그인 적용
- 일반 열람 로그인과 관리자 로그인 분리
- 관리자 전용 데이터 입력/수정 화면 구성
- Supabase `dashboard_documents` 테이블 연동
- Supabase 미설정 시 로컬 JSON fallback 구조 유지
- Vercel 배포 및 GitHub 연동
- 커스텀 도메인 `nest.soilabcoop.kr` 연결
- DNS 이슈 확인 및 해결
- 공개 화면에서 참여자 개인정보가 노출되지 않도록 데이터 응답 정리

## 현재 운영 URL

- 일반 접속: `https://nest.soilabcoop.kr/login`
- 관리자 접속: `https://nest.soilabcoop.kr/admin/login`
- Vercel 기본 도메인: `https://nest-green.vercel.app`

## 인증 및 권한

- `/login`: 일반 열람 비밀번호 사용
- `/admin/login`: 관리자 비밀번호 사용
- `/admin/*`: 관리자 쿠키가 있어야 접근 가능
- `/api/data/*`: 로그인 사용자에게 데이터 제공
- `/api/admin/*`: 관리자 전용

실제 비밀번호, JWT secret, Supabase key는 문서에 기록하지 않습니다.

## 데이터 저장 방식

- 운영 저장소: Supabase
- 테이블: `dashboard_documents`
- 저장 문서:
  - `overview`
  - `kpi`
  - `budget`
  - `timeline`
  - `program-n`
  - `program-e`
  - `program-s`
  - `program-t`
  - `changelog`

## 관리자 입력 기능

| 영역 | 경로 | 현재 상태 |
| --- | --- | --- |
| KPI 실적 | `/admin/kpi` | 구축됨 |
| 예산 집행 | `/admin/budget` | 구축됨 |
| 일정 상태 | `/admin/timeline` | 구축됨 |
| N 프로그램 참여자 | `/admin/programs/n` | 구축됨 |
| E 프로그램 참여자 | `/admin/programs/e` | 구축됨 |
| S 프로그램 참여자 | `/admin/programs/s` | 구축됨 |
| T 프로그램 참여자 | `/admin/programs/t` | 구축됨 |
| 변경 이력 | `changelog` | 자동 기록 |

## 확인 완료한 작업

- 로컬 개발 서버 실행
- `npm run lint` 통과
- `npm run build` 통과
- Supabase schema 작성
- Supabase 초기 데이터 seed
- 관리자 저장 후 Supabase 반영 확인
- 일반/관리자 로그인 분리
- 공개 데이터 개인정보 제거
- GitHub 원격 저장소 push
- Vercel 배포
- 커스텀 도메인 연결
- Vercel 환경변수 설정 후 로그인 확인

## 최근 이슈와 해결

### KT DNS 지연

- 증상: `nest.soilabcoop.kr` 접속 시 `DNS_PROBE_FINISHED_NXDOMAIN`
- 원인: KT DNS `168.126.63.1`, `168.126.63.2`가 신규 CNAME을 늦게 반영
- 확인: Google DNS, Cloudflare DNS, Gabia 권한 DNS에서는 정상 조회
- 해결: PC DNS를 `8.8.8.8`, `1.1.1.1`로 변경 후 접속 확인

### Vercel 운영 비밀번호 불일치

- 증상: `/admin/login`에서 비밀번호 입력 후 진입 실패
- 원인: 로컬 `.env.local` 값과 Vercel Production 환경변수가 일치하지 않음
- 해결: Vercel Project Settings > Environment Variables에서 Production 값 수정 후 redeploy

## 남은 우선 작업

1. 실제 운영 데이터 입력
2. 관리자 저장 기능을 실제 업무 데이터로 재점검
3. 보조금 신청 사업계획서와 대시보드 항목 비교
4. 대시보드 문구와 지표명을 사업계획서 표현과 맞춤
5. 보고용 요약 화면 또는 월간 보고 항목 정리
6. 운영 비밀번호와 관리자 권한 관리 기준 확정
7. Supabase 데이터 백업 절차 정리

## 사업계획서 정합성 비교 계획

보조금 신청 당시 작성한 사업계획서를 기준 문서로 삼아, 현재 대시보드가 신청 내용과 맞게 설계 및 구축되었는지 비교합니다.

검토 대상 문서:

- 보조금 신청 사업계획서
- 현재 대시보드 화면
- Supabase 데이터 구조
- 관리자 입력 화면
- 공개 열람 화면

## 비교 기준

| 비교 영역 | 확인할 내용 | 현재 판단 |
| --- | --- | --- |
| 사업 목적 | 사업계획서의 목적이 대시보드 첫 화면과 요약 지표에 드러나는가 | 사업계획서 확인 필요 |
| 핵심 성과지표 | 신청서에 적은 정량/정성 지표가 KPI에 반영되었는가 | 사업계획서 확인 필요 |
| 예산 계획 | 예산 항목과 집행 입력 구조가 신청서 예산표와 맞는가 | 사업계획서 확인 필요 |
| 추진 일정 | 사업계획서 일정과 대시보드 timeline 항목이 맞는가 | 사업계획서 확인 필요 |
| 프로그램 구성 | N/E/S/T 프로그램명이 신청서의 세부사업과 일치하는가 | 사업계획서 확인 필요 |
| 참여자 관리 | 신청서의 대상자, 모집 규모, 관리 방식이 반영되었는가 | 사업계획서 확인 필요 |
| 산출물 | 보고서, 교육, 콘텐츠, 행사 등 산출물이 추적 가능한가 | 사업계획서 확인 필요 |
| 보고 편의성 | 보조금 정산/성과보고에 필요한 수치를 바로 뽑을 수 있는가 | 사업계획서 확인 필요 |
| 개인정보 보호 | 일반 열람 화면에서 개인정보가 노출되지 않는가 | 기본 구조 반영됨 |

## 사업계획서 검토 후 작성할 산출물

사업계획서 파일을 받은 뒤 아래 결과물을 추가로 작성합니다.

- 사업계획서 요구사항 요약
- 현재 대시보드 반영 여부 표
- 누락된 지표 및 화면 목록
- 수정이 필요한 용어 목록
- 보조금 성과보고에 필요한 추가 데이터 항목
- 우선 개발 작업 목록

