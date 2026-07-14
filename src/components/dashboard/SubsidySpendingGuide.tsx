'use client';

import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  subsidyBudgetAndSettlementRules,
  subsidyCategoryGuides,
  subsidyContractRules,
  subsidyExecutionPrinciples,
  subsidyRatioRules,
  subsidySelfChecklist,
  subsidySourceLinks,
} from '@/lib/subsidy-guidelines';

const CRITICAL_KEYWORDS = new Set(['불인정', '환수', '절대 금지']);
const CRITICAL_KEYWORD_PATTERN = /(절대 금지|불인정|환수)/g;

function HighlightedText({ text }: { text: string }) {
  return (
    <>
      {text.split(CRITICAL_KEYWORD_PATTERN).map((part, index) =>
        CRITICAL_KEYWORDS.has(part) ? (
          <strong key={`${part}-${index}`} className="subsidy-critical-keyword">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function SectionHeading({ id, number, title, helper }: { id: string; number: number; title: string; helper: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
          {number}
        </span>
        <h3 id={id} className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="mt-1 pl-8 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}

export default function SubsidySpendingGuide() {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const checkedCount = checkedIds.length;
  const remainingCount = subsidySelfChecklist.length - checkedCount;
  const completionRate = Math.round((checkedCount / subsidySelfChecklist.length) * 100);
  const isComplete = remainingCount === 0;

  function toggleCheck(id: string) {
    setCheckedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm" aria-labelledby="subsidy-guide-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 id="subsidy-guide-title" className="text-lg font-semibold text-slate-900">
              보조금 집행지침 자가점검
            </h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            2026 전략사업별 지역생태계 활성화 사업 워크숍 책자의 사업별 기준과 현행 공통 규정을 구분해 정리했습니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="자가점검 현황" aria-live="polite">
          <Badge variant={checkedCount ? 'info' : 'pending'}>체크한 문항 {checkedCount}/{subsidySelfChecklist.length}</Badge>
          <Badge variant={remainingCount ? 'amber' : 'info'}>미확인 {remainingCount}건</Badge>
          <Badge variant="outline">검토 기준일 2026. 7. 14.</Badge>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        <section aria-labelledby="subsidy-core-rules-title">
          <SectionHeading
            id="subsidy-core-rules-title"
            number={1}
            title="집행 전 핵심 기준"
            helper="공통 원칙을 먼저 확인하고, 금액 기준은 이 사업의 교부조건·세부지침과 다시 대조하세요."
          />

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {subsidyExecutionPrinciples.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-2">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      <HighlightedText text={item.detail} />
                    </p>
                    <p className="mt-2 text-xs text-slate-400">{item.sourcePages}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <section aria-labelledby="contract-rules-title">
              <div className="flex flex-wrap items-center gap-2">
                <h4 id="contract-rules-title" className="text-sm font-semibold text-slate-900">
                  계약·검수 기준
                </h4>
                <Badge variant="amber">첨부 책자 사업별 기준</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {subsidyContractRules.map((rule) => (
                  <div key={rule.label} className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[112px_1fr]">
                    <Badge variant="success" className="h-fit w-fit">
                      {rule.label}
                    </Badge>
                    <div>
                      <p className="text-sm leading-6 text-slate-600">
                        <HighlightedText text={rule.detail} />
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{rule.sourcePages}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="change-settlement-title">
              <div className="flex flex-wrap items-center gap-2">
                <h4 id="change-settlement-title" className="text-sm font-semibold text-slate-900">
                  예산변경·정산 기준
                </h4>
                <Badge variant="amber">첨부 책자 사업별 기준</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {subsidyBudgetAndSettlementRules.map((rule) => (
                  <div key={rule.detail} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm leading-6 text-slate-600">
                      <HighlightedText text={rule.detail} />
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{rule.sourcePages}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-5" aria-labelledby="ratio-rules-title">
            <div className="flex flex-wrap items-center gap-2">
              <h4 id="ratio-rules-title" className="text-sm font-semibold text-slate-900">
                사업비 편성비율
              </h4>
              <Badge variant="amber">첨부 책자 사업별 기준 · p.63</Badge>
            </div>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium">기준</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">인건비</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">직접사업비</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">간접사업비</th>
                  </tr>
                </thead>
                <tbody>
                  {subsidyRatioRules.map((rule) => (
                    <tr key={rule.type} className="border-t border-slate-200">
                      <th scope="row" className="px-4 py-3 text-left font-medium text-slate-800">{rule.type}</th>
                      <td className="px-4 py-3 text-slate-600">{rule.labor}</td>
                      <td className="px-4 py-3 text-slate-600">{rule.direct}</td>
                      <td className="px-4 py-3 text-slate-600">{rule.indirect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              승인된 예산서에 별도 비율 또는 예외 승인이 반영되어 있다면 해당 승인 문서와 담당기관 확인 결과를 함께 보관하세요.
            </p>
          </section>
        </section>

        <section aria-labelledby="denial-cases-title">
          <SectionHeading
            id="denial-cases-title"
            number={2}
            title="세목별 불인정 사례"
            helper="집행하려는 세목을 펼쳐 불인정 위험과 준비할 증빙을 함께 확인하세요."
          />

          <div className="mt-4 grid gap-3 2xl:grid-cols-2">
            {subsidyCategoryGuides.map((guide) => (
              <details key={guide.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700">
                  <span className="block">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{guide.category}</span>
                      <Badge variant="amber">{guide.badge}</Badge>
                      <span className="text-xs text-slate-400">{guide.sourcePages}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">{guide.summary}</span>
                  </span>
                  <ChevronDown
                    className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>

                <div className="grid gap-4 border-t border-slate-200 bg-slate-50 p-4">
                  <section aria-label={`${guide.category} 불인정 사례`}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                      <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                      불인정·환수 위험
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {guide.denialCases.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CircleAlert className="mt-1.5 h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />
                          <span>
                            <HighlightedText text={item} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section aria-label={`${guide.category} 필수 증빙`}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                      준비할 증빙
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {guide.evidence.map((item) => (
                        <li key={item} className="flex gap-2">
                          <Check className="mt-1.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="self-check-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="self-check-title"
              number={3}
              title="지출 전 자가진단 체크리스트"
              helper="각 문항을 실제 서류와 대조한 뒤 체크하세요. 체크는 확인 기록일 뿐 적합 판정이나 집행 승인을 의미하지 않으며 현재 화면에서만 유지됩니다."
            />
            <button
              type="button"
              onClick={() => setCheckedIds([])}
              disabled={!checkedCount}
              className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              점검 초기화
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">
                점검 진행률 <span className="font-bold text-slate-900">{completionRate}%</span>
              </p>
              <p className="text-xs text-slate-500" aria-live="polite">
                {checkedCount}개 확인 · {remainingCount}개 남음
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="보조금 지출 전 자가진단 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionRate}
            >
              <Progress
                value={completionRate}
                className="mt-2 h-2.5"
                indicatorColor="#2563EB"
              />
            </div>

            <fieldset className="mt-4 grid gap-3 lg:grid-cols-2">
              <legend className="sr-only">보조금 지출 전 자가진단 문항</legend>
              {subsidySelfChecklist.map((item) => {
                const isChecked = checkedIds.includes(item.id);
                const helperId = `subsidy-check-${item.id}-helper`;

                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-700 ${
                      isChecked ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(item.id)}
                      aria-describedby={helperId}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-700"
                    />
                    <span>
                      <span className="block text-sm font-medium leading-6 text-slate-800">{item.title}</span>
                      <span id={helperId} className="mt-1 block text-xs leading-5 text-slate-500">
                        {item.helper}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">{item.sourcePages}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            {isComplete ? (
              <div className="mt-4 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" role="status">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>
                  {subsidySelfChecklist.length}개 문항을 모두 체크했습니다. 이 상태는 적합 판정이나 집행 승인이 아니므로, 실제 집행 전 증빙 원본과 담당기관의 승인 여부를 다시 확인하세요.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <aside className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4" aria-label="적용 기준 안내">
        <div className="flex gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-950">집행 전 반드시 확인하세요</p>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              이 안내는 「보조금 관리에 관한 법률」, 「국고보조금 통합관리지침」 및 「고용노동분야 국고보조사업
              관리규정」의 공통 핵심사항을 요약한 참고자료입니다. 실제 집행에는 해당 사업의 공고, 교부결정서·교부조건,
              협약 및 세부지침이 함께 적용되며 더 구체적이거나 엄격한 기준이 있을 수 있습니다. 금액·비율·기한·승인권자는
              집행 전 사업 담당기관에 확인하세요.
            </p>
            <p className="mt-2 text-xs leading-5 text-amber-800">
              지방비가 지방보조금으로 교부되는 경우에는 지방보조금법, 행정안전부 관리기준, 지자체 조례·교부조건도 함께
              적용될 수 있습니다. 검토 기준일 2026. 7. 14. · 법령·지침 개정 시 달라질 수 있습니다.
            </p>
          </div>
        </div>
      </aside>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
        {subsidySourceLinks.map((source) =>
          source.href ? (
            <a
              key={source.label}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline decoration-slate-300 underline-offset-4 hover:text-slate-800"
            >
              <span>{source.label} · {source.meta}</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">새 창에서 열기</span>
            </a>
          ) : (
            <span key={source.label} title={source.meta}>
              {source.label} · {source.meta}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
