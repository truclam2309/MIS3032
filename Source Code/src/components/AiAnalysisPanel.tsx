import React from 'react';
import { AlertTriangleIcon, HelpCircleIcon, TrophyIcon } from 'lucide-react';
import { AssistantCard } from './AssistantCard';
import type { AiAnalysis, Quotation, Supplier } from '../types/procurement';
import { formatDateTime, formatVnd, percent } from '../utils/format';

const CRITERIA: Array<{key: 'price' | 'leadTime' | 'reliability' | 'terms';label: string;}> = [
{ key: 'price', label: 'Landed price' },
{ key: 'leadTime', label: 'Lead time' },
{ key: 'reliability', label: 'Reliability' },
{ key: 'terms', label: 'Commercial terms' }];


export function AiAnalysisPanel({
  analysis,
  quotations,
  supplierOf




}: {analysis: AiAnalysis;quotations: Quotation[];supplierOf: (quotationId: string) => Supplier | undefined;}) {
  const ordered = [...analysis.scores].sort((a, b) => b.total - a.total);

  return (
    <AssistantCard
      title="Assistant analysis"
      subtitle={`Generated ${formatDateTime(analysis.generatedAt)} · confidence ${percent(analysis.confidence)}`}
      footer="This is a recommendation, not a decision. Procurement selects the supplier and may choose any quotation regardless of these scores.">
      
      <p className="text-xs text-ink-muted">
        Weighted on landed price {percent(analysis.weights.price)}, lead time {percent(analysis.weights.leadTime)},
        reliability {percent(analysis.weights.reliability)}, terms {percent(analysis.weights.terms)}.
      </p>

      <ul className="mt-3 space-y-2.5">
        {ordered.map((score) => {
          const quote = quotations.find((q) => q.id === score.quotationId);
          const supplier = supplierOf(score.quotationId);
          const recommended = analysis.recommendedQuotationId === score.quotationId;
          if (!quote || !supplier) return null;
          return (
            <li
              key={score.quotationId}
              className={`rounded border p-3 ${
              recommended ? 'border-brand-500 bg-surface' : 'border-line bg-surface/70'}`
              }>
              
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  {recommended ? <TrophyIcon className="h-3.5 w-3.5 text-brand-600" /> : null}
                  <span className="text-sm font-semibold">{supplier.name}</span>
                  {recommended ?
                  <span className="rounded bg-brand-500 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-ink-invert">
                      Recommended
                    </span> :
                  null}
                </div>
                <span className="tabular text-sm font-semibold">{score.total.toFixed(1)}</span>
              </div>
              <p className="tabular mt-0.5 text-2xs text-ink-subtle">
                {quote.id} · {formatVnd(quote.total)} landed · {quote.leadTimeDays} days
              </p>
              <dl className="mt-2 space-y-1">
                {CRITERIA.map((c) =>
                <div key={c.key} className="flex items-center gap-2">
                    <dt className="w-28 shrink-0 text-2xs text-ink-subtle">{c.label}</dt>
                    <dd className="flex flex-1 items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                        <span
                        className={`block h-full ${recommended ? 'bg-brand-500' : 'bg-ink-subtle'}`}
                        style={{ width: `${score[c.key]}%` }} />
                      
                      </span>
                      <span className="tabular w-7 text-right text-2xs text-ink-muted">{score[c.key]}</span>
                    </dd>
                  </div>
                )}
              </dl>
            </li>);

        })}
      </ul>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">Why</h4>
          <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-ink-muted">
            {analysis.rationale.map((r) =>
            <li key={r}>· {r}</li>
            )}
          </ul>
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-warn-700">
              <AlertTriangleIcon className="h-3 w-3" /> Risks
            </h4>
            <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-ink-muted">
              {analysis.risks.map((r) =>
              <li key={r}>· {r}</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
              <HelpCircleIcon className="h-3 w-3" /> Missing data
            </h4>
            <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-ink-muted">
              {analysis.dataGaps.map((r) =>
              <li key={r}>· {r}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AssistantCard>);

}