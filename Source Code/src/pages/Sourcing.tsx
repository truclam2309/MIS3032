import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, InboxIcon, UploadCloudIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatVnd } from '../utils/format';

export function Sourcing() {
  const { requests, quotationsFor, inboundFor, analysisFor, createPurchaseOrder } = useProcurement();

  const awaiting = requests.filter((r) => r.status === 'approved');
  const inComparison = requests.filter((r) => ['quotation-comparison', 'ai-recommendation'].includes(r.status));
  const awarded = requests.filter((r) => r.status === 'awarded');

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Procurement · Flows C &amp; D</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Sourcing</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Approved requests move here for quotations, comparison and supplier selection. The final award is always
        yours.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Awaiting quotations</h2>
        <ul className="mt-2 space-y-3">
          {awaiting.map((r) => {
            const inbound = inboundFor(r.id);
            return (
              <li
                key={r.id}
                className="rounded-lg border border-line bg-surface p-4 shadow-card">
                
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} size="sm" />
                      <span className="tabular text-2xs text-ink-subtle">{r.id}</span>
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold">{r.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {r.category} · {formatVnd(r.estimatedTotal)} estimated · needed by {formatDate(r.neededBy)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded border border-line bg-raised px-2 py-1 text-xs text-ink-muted">
                      <InboxIcon className="h-3.5 w-3.5" />
                      {quotationsFor(r.id).length} linked · {inbound.length} still to upload
                    </span>
                    <Link
                      to={`/sourcing/${r.id}/collect`}
                      className="inline-flex items-center gap-1.5 rounded bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
                      
                      <UploadCloudIcon className="h-3.5 w-3.5" />
                      Collect quotations
                    </Link>
                  </div>
                </div>
              </li>);

          })}
          {awaiting.length === 0 ?
          <li className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-ink-muted">
              No approved requests waiting for quotations.
            </li> :
          null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold">In comparison</h2>
        <ul className="mt-2 space-y-3">
          {inComparison.map((r) => {
            const quotes = quotationsFor(r.id);
            const analysis = analysisFor(r.id);
            return (
              <li key={r.id}>
                <Link
                  to={`/sourcing/${r.id}`}
                  className="block rounded-lg border border-line bg-surface p-4 shadow-card transition-colors duration-150 ease-exp hover:border-line-strong hover:bg-raised">
                  
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.status} size="sm" />
                        <span className="tabular text-2xs text-ink-subtle">{r.id}</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold">{r.title}</h3>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {quotes.length} normalised quotations ·{' '}
                        {analysis ? 'assistant analysis available' : 'no analysis requested yet'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                      Compare <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </li>);

          })}
          {inComparison.length === 0 ?
          <li className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-ink-muted">
              Nothing in comparison.
            </li> :
          null}
        </ul>
      </section>

      {awarded.length > 0 ?
      <section className="mt-10">
          <h2 className="text-sm font-semibold">Awarded — ready for a purchase order</h2>
          <ul className="mt-2 space-y-2">
            {awarded.map((r) =>
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-card">
            
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} size="sm" />
                    <span className="tabular text-2xs text-ink-subtle">{r.id}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{r.title}</p>
                  <p className="tabular mt-0.5 text-2xs text-ink-subtle">
                    {r.award?.quotationId} · {formatVnd(r.estimatedTotal)} estimated
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/sourcing/${r.id}`} className="text-xs font-semibold text-brand-600 hover:underline">
                    Comparison
                  </Link>
                  <button
                type="button"
                onClick={() => createPurchaseOrder(r.id)}
                className="inline-flex items-center gap-1.5 rounded bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
                
                    Create purchase order
                  </button>
                </div>
              </li>
          )}
          </ul>
        </section> :
      null}
    </div>);

}