import React from 'react';
import { AlertOctagonIcon, AlertTriangleIcon } from 'lucide-react';
import { priceBaselines } from '../data/seed';
import type { AnomalyAlert, Supplier } from '../types/procurement';
import { formatVnd } from '../utils/format';

const KIND_LABEL: Record<AnomalyAlert['kind'], string> = {
  'price-outlier': 'Price outlier',
  'incomplete-quote': 'Incomplete quote',
  'terms-outlier': 'Terms outlier'
};

export function AnomalyAlerts({
  alerts,
  supplierOf,
  baselineKeys




}: {alerts: AnomalyAlert[];supplierOf: (quotationId: string) => Supplier | undefined;baselineKeys: string[];}) {
  const baselines = priceBaselines.filter((b) => baselineKeys.includes(b.key));

  if (alerts.length === 0) {
    return (
      <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-semibold">Anomaly alerts</h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Nothing flagged against the sample price baselines for these quotations.
        </p>
      </section>);

  }

  const high = alerts.filter((a) => a.severity === 'high').length;

  return (
    <section className="rounded-lg border border-warn-200 bg-warn-50/60 shadow-card" aria-label="Anomaly alerts">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-warn-200 px-4 py-3 sm:px-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-warn-700">
            <AlertTriangleIcon className="h-4 w-4" /> Anomaly alerts
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {alerts.length} flagged · {high} needs a decision before award
          </p>
        </div>
        <span className="rounded border border-warn-200 bg-surface px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-warn-700">
          Advisory
        </span>
      </header>

      <ul className="divide-y divide-warn-200/70">
        {alerts.map((a) => {
          const supplier = supplierOf(a.quotationId);
          return (
            <li key={a.id} className="px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                {a.severity === 'high' ?
                <AlertOctagonIcon className="h-3.5 w-3.5 text-danger-600" /> :

                <AlertTriangleIcon className="h-3.5 w-3.5 text-warn-600" />
                }
                <span
                  className={`rounded border px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide ${
                  a.severity === 'high' ?
                  'border-danger-200 bg-danger-50 text-danger-700' :
                  'border-warn-200 bg-surface text-warn-700'}`
                  }>
                  
                  {a.severity}
                </span>
                <span className="text-2xs text-ink-subtle">{KIND_LABEL[a.kind]}</span>
                <span className="tabular text-2xs text-ink-subtle">
                  {a.quotationId} · {supplier?.name}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-semibold">{a.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{a.detail}</p>
              <p className="mt-1 text-xs text-ink-subtle">{a.evidence}</p>
            </li>);

        })}
      </ul>

      {baselines.length > 0 ?
      <div className="border-t border-warn-200 px-4 py-3 sm:px-5">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">Baselines used</h3>
          <ul className="mt-1.5 space-y-1 text-xs text-ink-muted">
            {baselines.map((b) =>
          <li key={b.key} className="tabular">
                {b.label} — {formatVnd(b.average)} per {b.unit} · {b.sampleSize} quotes · {b.period}
              </li>
          )}
          </ul>
        </div> :
      null}

      <p className="border-t border-warn-200 px-4 py-2.5 text-xs text-ink-muted sm:px-5">
        An alert never removes a quotation from the comparison. Procurement decides whether to challenge the supplier,
        request missing figures, or award anyway.
      </p>
    </section>);

}