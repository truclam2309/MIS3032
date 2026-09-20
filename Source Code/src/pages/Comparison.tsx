import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  FileWarningIcon,
  SparklesIcon,
  XIcon } from
'lucide-react';
import { ConfirmDialog, type ConfirmDetail } from '../components/ConfirmDialog';
import { VALIDITY_BADGE, quoteValidity } from '../utils/quotes';
import { useProcurement } from '../contexts/ProcurementContext';
import { AiAnalysisPanel } from '../components/AiAnalysisPanel';
import { AnomalyAlerts } from '../components/AnomalyAlerts';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowProgress } from '../components/WorkflowProgress';
import type { Quotation, SupplierEvaluation } from '../types/procurement';
import { formatDate, formatOriginal, formatVnd } from '../utils/format';

const secondary =
'inline-flex items-center justify-center gap-1.5 rounded border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink';

/** Which sample price baselines apply to each request. */
const BASELINES: Record<string, string[]> = {
  'PR-2026-038': ['switch-48p'],
  'PR-2026-039': ['toner-hy'],
  'PR-2026-040': ['task-chair'],
  'PR-2026-032': ['webcam'],
  'PR-2026-031': ['paper-a4']
};

export function Comparison() {
  const { id = '' } = useParams();
  const {
    getRequest,
    quotationsFor,
    analysisFor,
    anomaliesFor,
    runAnalysis,
    getSupplier,
    setEvaluation,
    award,
    orderFor,
    createPurchaseOrder
  } = useProcurement();
  const request = getRequest(id);
  const quotes = quotationsFor(id);
  const analysis = analysisFor(id);

  const [selected, setSelected] = useState<string>('');
  const [awardNote, setAwardNote] = useState('');
  const [evalNotes, setEvalNotes] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<{
    title: string;
    description: string;
    details: ConfirmDetail[];
    confirmLabel: string;
    irreversibleNote?: string;
    run: () => void;
  } | null>(null);

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-line bg-surface p-10 text-center">
        <h1 className="text-lg font-semibold">Request not found</h1>
        <Link to="/sourcing" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          Back to sourcing
        </Link>
      </div>);

  }

  if (quotes.length < 2) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-line bg-surface p-8 text-center shadow-card sm:p-10">
        <h1 className="text-lg font-semibold">
          {quotes.length === 0 ? 'No quotations collected yet' : 'One quotation collected'}
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">
          A comparison is shown once at least two quotations are linked to {request.id}. Upload the next supplier
          quotation to continue.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to={`/sourcing/${request.id}/collect`}
            className="inline-flex items-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
            
            Collect quotations
          </Link>
          <Link
            to={`/requests/${request.id}`}
            className="inline-flex items-center gap-1.5 rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
            
            View request
          </Link>
        </div>
      </div>);

  }

  const bestTotal = Math.min(...quotes.map((q) => q.total));
  const bestLead = Math.min(...quotes.map((q) => q.leadTimeDays));
  const bestWarranty = Math.max(...quotes.map((q) => q.warrantyMonths));

  const expired = quotes.filter((q) => quoteValidity(q.validUntil).state === 'expired');
  const expiring = quotes.filter((q) => quoteValidity(q.validUntil).state === 'expiring');
  const recommendedExpired =
  analysis && expired.some((q) => q.id === analysis.recommendedQuotationId);

  const stanceOf = (quotationId: string) =>
  request.evaluations.find((e) => e.quotationId === quotationId)?.stance ?? 'undecided';

  const saveEvaluation = (quotationId: string, stance: SupplierEvaluation['stance']) => {
    setEvaluation(request.id, { quotationId, stance, note: evalNotes[quotationId] ?? '' });
  };

  const rows: Array<{label: string;render: (q: Quotation) => React.ReactNode;}> = [
  {
    label: 'Landed total (₫)',
    render: (q) =>
    <span className={`tabular font-semibold ${q.total === bestTotal ? 'text-ok-700' : ''}`}>
          {formatVnd(q.total)}
          {q.total === bestTotal ? <span className="ml-1.5 text-2xs font-normal">lowest</span> : null}
        </span>

  },
  { label: 'Unit price', render: (q) => <span className="tabular">{formatVnd(q.unitPrice)}</span> },
  { label: 'Subtotal', render: (q) => <span className="tabular text-ink-muted">{formatVnd(q.subtotal)}</span> },
  { label: 'Tax', render: (q) => <span className="tabular text-ink-muted">{formatVnd(q.tax)}</span> },
  {
    label: 'Shipping',
    render: (q) => <span className="tabular text-ink-muted">{q.shipping === 0 ? 'included' : formatVnd(q.shipping)}</span>
  },
  {
    label: 'Lead time',
    render: (q) =>
    <span className={`tabular ${q.leadTimeDays === bestLead ? 'font-semibold text-ok-700' : ''}`}>
          {q.leadTimeDays} days
          {q.leadTimeDays === bestLead ? <span className="ml-1.5 text-2xs font-normal">fastest</span> : null}
        </span>

  },
  {
    label: 'Warranty',
    render: (q) =>
    <span className={`tabular ${q.warrantyMonths === bestWarranty ? 'font-semibold text-ok-700' : ''}`}>
          {q.warrantyMonths} months
        </span>

  },
  { label: 'Payment terms', render: (q) => <span>{q.paymentTerms}</span> },
  {
    label: 'Quote valid until',
    render: (q) => {
      const validity = quoteValidity(q.validUntil);
      return (
        <span className="tabular block">
            {formatDate(q.validUntil)}
            <span
            className={`mt-1 block w-fit rounded border px-1.5 py-0.5 text-2xs font-medium ${
            VALIDITY_BADGE[validity.state]}`
            }>
            
              {validity.label}
            </span>
          </span>);

    }
  },
  {
    label: 'As quoted',
    render: (q) =>
    <span className="tabular text-ink-muted">
          {formatOriginal(q.originalCurrency, q.originalTotal)}
          <span className="ml-1 text-2xs">via {q.source}</span>
        </span>

  },
  {
    label: 'Data gaps',
    render: (q) =>
    q.missingFields.length === 0 ?
    <span className="text-xs text-ok-700">none</span> :

    <span className="text-xs text-warn-700">{q.missingFields.join('; ')}</span>

  }];


  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/sourcing"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> Sourcing
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <span className="tabular text-xs text-ink-subtle">{request.id}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{request.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {quotes.length} quotations normalised to one comparable landed total · approved estimate{' '}
            {formatVnd(request.estimatedTotal)} · needed by {formatDate(request.neededBy)}
          </p>
        </div>
        <Link to={`/requests/${request.id}`} className={secondary}>
          View request
        </Link>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-surface p-4 shadow-card">
        <WorkflowProgress status={request.status} />
      </div>

      {expired.length > 0 || expiring.length > 0 ?
      <section
        className={`mt-5 rounded-lg border p-4 shadow-card ${
        expired.length > 0 ? 'border-danger-200 bg-danger-50' : 'border-warn-200 bg-warn-50'}`
        }
        aria-label="Quotation validity">
        
          <h2
          className={`flex items-center gap-2 text-sm font-semibold ${
          expired.length > 0 ? 'text-danger-700' : 'text-warn-700'}`
          }>
          
            <ClockIcon className="h-4 w-4" />
            {expired.length > 0 ?
          `${expired.length} quotation${expired.length === 1 ? ' has' : 's have'} expired` :
          `${expiring.length} quotation${expiring.length === 1 ? '' : 's'} expiring soon`}
          </h2>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-ink">
            {[...expired, ...expiring].map((q) =>
          <li key={q.id} className="tabular">
                {q.id} · {getSupplier(q.supplierId)?.name} — {quoteValidity(q.validUntil).label} (
                {formatDate(q.validUntil)})
              </li>
          )}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Expired quotations stay in the comparison for reference but cannot be awarded and cannot back a purchase
            order. Ask the supplier for a refreshed quotation to bring one back into play.
            {recommendedExpired ?
          ' The assistant recommendation points at an expired quotation — treat it as out of date.' :
          ''}
          </p>
        </section> :
      null}

      <section className="mt-6 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <header className="border-b border-line px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold">Quotation comparison</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Currency, tax and shipping aligned across all quotes. Green marks the best value in a row.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <caption className="sr-only">Normalised quotation comparison for {request.id}</caption>
            <thead>
              <tr className="border-b border-line bg-raised text-left align-bottom">
                <th scope="col" className="w-40 px-4 py-3 text-2xs font-semibold uppercase tracking-wide text-ink-subtle sm:px-5">
                  Attribute
                </th>
                {quotes.map((q) => {
                  const supplier = getSupplier(q.supplierId);
                  const recommended = analysis?.recommendedQuotationId === q.id;
                  return (
                    <th key={q.id} scope="col" className="px-4 py-3 align-bottom">
                      <span className="block text-sm font-semibold">{supplier?.name}</span>
                      <span className="tabular mt-0.5 block text-2xs font-normal text-ink-subtle">
                        {q.id} · rating {supplier?.rating} · on time {Math.round((supplier?.onTimeRate ?? 0) * 100)}%
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-2xs font-medium ${
                          supplier?.contracted ?
                          'border-ok-200 bg-ok-50 text-ok-700' :
                          'border-warn-200 bg-warn-50 text-warn-700'}`
                          }>
                          
                          {supplier?.contracted ? 'Contracted' : 'New vendor'}
                        </span>
                        {recommended ?
                        <span className="rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-2xs font-semibold text-brand-700">
                            AI recommended
                          </span> :
                        null}
                        {stanceOf(q.id) !== 'undecided' ?
                        <span
                          className={`rounded border px-1.5 py-0.5 text-2xs font-medium ${
                          stanceOf(q.id) === 'shortlisted' ?
                          'border-info-200 bg-info-50 text-info-700' :
                          'border-line bg-canvas text-ink-muted'}`
                          }>
                          
                            {stanceOf(q.id) === 'shortlisted' ? 'Shortlisted' : 'Excluded'}
                          </span> :
                        null}
                      </span>
                    </th>);

                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
              <tr key={row.label} className="border-b border-line/70 last:border-0">
                  <th scope="row" className="px-4 py-2.5 text-left text-xs font-medium text-ink-muted sm:px-5">
                    {row.label}
                  </th>
                  {quotes.map((q) =>
                <td key={q.id} className="px-4 py-2.5 align-top">
                      {row.render(q)}
                    </td>
                )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <FileWarningIcon className="h-4 w-4 text-ink-subtle" /> Normalisation log
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Every adjustment made to make these quotes comparable, so a figure can be traced back to its source.
          </p>
          <ul className="mt-3 space-y-3">
            {quotes.map((q) =>
            <li key={q.id}>
                <p className="tabular text-xs font-semibold">
                  {q.id} · {getSupplier(q.supplierId)?.name}
                </p>
                <ul className="mt-1 space-y-1 text-xs leading-relaxed text-ink-muted">
                  {q.normalizationNotes.map((n) =>
                <li key={n}>· {n}</li>
                )}
                </ul>
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-semibold">Procurement evaluation</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Your own read on each supplier, recorded before or after any assistant analysis.
          </p>
          <ul className="mt-3 space-y-3">
            {quotes.map((q) => {
              const supplier = getSupplier(q.supplierId);
              const stance = stanceOf(q.id);
              const saved = request.evaluations.find((e) => e.quotationId === q.id);
              return (
                <li key={q.id} className="rounded border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{supplier?.name}</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => saveEvaluation(q.id, 'shortlisted')}
                        aria-pressed={stance === 'shortlisted'}
                        className={`rounded border px-2 py-1 text-2xs font-semibold transition-colors duration-150 ease-exp ${
                        stance === 'shortlisted' ?
                        'border-info-200 bg-info-50 text-info-700' :
                        'border-line bg-surface text-ink-muted hover:bg-canvas'}`
                        }>
                        
                        <CheckIcon className="mr-1 inline h-3 w-3" />
                        Shortlist
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEvaluation(q.id, 'excluded')}
                        aria-pressed={stance === 'excluded'}
                        className={`rounded border px-2 py-1 text-2xs font-semibold transition-colors duration-150 ease-exp ${
                        stance === 'excluded' ?
                        'border-danger-200 bg-danger-50 text-danger-600' :
                        'border-line bg-surface text-ink-muted hover:bg-canvas'}`
                        }>
                        
                        <XIcon className="mr-1 inline h-3 w-3" />
                        Exclude
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-2xs text-ink-subtle">{supplier?.note}</p>
                  <label htmlFor={`eval-${q.id}`} className="sr-only">
                    Evaluation note for {supplier?.name}
                  </label>
                  <input
                    id={`eval-${q.id}`}
                    type="text"
                    value={evalNotes[q.id] ?? saved?.note ?? ''}
                    onChange={(e) => setEvalNotes((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Your assessment"
                    className="mt-2 w-full rounded border border-line bg-surface px-2 py-1.5 text-xs placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500" />
                  
                </li>);

            })}
          </ul>
        </section>
      </div>

      <div className="mt-6">
        {analysis ?
        <AiAnalysisPanel
          analysis={analysis}
          quotations={quotes}
          supplierOf={(quotationId) => {
            const q = quotes.find((x) => x.id === quotationId);
            return q ? getSupplier(q.supplierId) : undefined;
          }} /> :


        <section className="rounded-lg border border-dashed border-brand-200 bg-brand-50/40 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-700">
              <SparklesIcon className="h-4 w-4" /> Assistant analysis not requested
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
              You can compare and award without it. If you ask for an analysis, the assistant scores the quotations on
              price, lead time, reliability and terms, and names a recommendation with its reasoning, risks and the
              data it is missing. It cannot select a supplier.
            </p>
            <button
            type="button"
            onClick={() => runAnalysis(request.id)}
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
            
              <SparklesIcon className="h-4 w-4" /> Ask the assistant to analyse
            </button>
          </section>
        }
      </div>

      <div className="mt-6">
        <AnomalyAlerts
          alerts={anomaliesFor(request.id)}
          baselineKeys={BASELINES[request.id] ?? []}
          supplierOf={(quotationId) => {
            const q = quotes.find((x) => x.id === quotationId);
            return q ? getSupplier(q.supplierId) : undefined;
          }} />
        
      </div>

      <section className="mt-6 rounded-lg border border-line bg-surface shadow-card">
        <header className="border-b border-line px-4 py-3 sm:px-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Procurement</p>
          <h2 className="mt-0.5 text-sm font-semibold">Supplier selection</h2>
        </header>

        {request.award ?
        <div className="px-4 py-4 sm:px-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ok-700">
              <CheckCircle2Icon className="h-4 w-4" />
              {getSupplier(quotes.find((q) => q.id === request.award?.quotationId)?.supplierId ?? '')?.name} selected
            </p>
            <p className="mt-1 text-xs text-ink-subtle">
              {request.award.by} · {request.award.quotationId}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{request.award.note}</p>
            {analysis ?
          <p
            className={`mt-3 inline-block rounded border px-2 py-1 text-xs ${
            request.award.matchesAiRecommendation ?
            'border-line bg-canvas text-ink-muted' :
            'border-brand-200 bg-brand-50 text-brand-700'}`
            }>
            
                {request.award.matchesAiRecommendation ?
            'Matches the assistant recommendation.' :
            'Differs from the assistant recommendation — the override is recorded, not blocked.'}
              </p> :

          <p className="mt-3 inline-block rounded border border-line bg-canvas px-2 py-1 text-xs text-ink-muted">
                No assistant analysis was requested for this request.
              </p>
          }

            <div className="mt-4 border-t border-line/70 pt-4">
              {orderFor(request.id) ?
            <Link
              to={`/orders/${orderFor(request.id)?.id}`}
              className="inline-flex items-center gap-1.5 rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
              
                  Open purchase order {orderFor(request.id)?.id}
                </Link> :

            <>
                  <h3 className="text-sm font-semibold">Next step: purchase order</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    The order is raised from the awarded quotation, so its value, terms and lead time come straight
                    from {request.award.quotationId}.
                  </p>
                  {(() => {
                const awardedQuote = quotes.find((q) => q.id === request.award?.quotationId);
                const awardedValidity = awardedQuote ? quoteValidity(awardedQuote.validUntil) : null;
                const lapsed = awardedValidity?.state === 'expired';
                return (
                  <>
                        {lapsed ?
                    <p className="mt-2 rounded border border-danger-200 bg-danger-50 px-3 py-2 text-xs leading-relaxed text-danger-700">
                            {awardedQuote?.id} lapsed on {formatDate(awardedQuote?.validUntil ?? '')}. A purchase
                            order cannot be raised against an expired quotation — request a refreshed quote first.
                          </p> :
                    null}
                        <button
                      type="button"
                      disabled={lapsed}
                      onClick={() =>
                      setPending({
                        title: 'Raise the purchase order?',
                        description:
                        'The order is created from the awarded quotation and sent to the supplier. Value, terms and lead time are copied across unchanged.',
                        details: [
                        {
                          label: 'Supplier',
                          value: getSupplier(awardedQuote?.supplierId ?? '')?.name ?? '—'
                        },
                        { label: 'From quotation', value: awardedQuote?.id ?? '—' },
                        { label: 'Order value', value: awardedQuote ? formatVnd(awardedQuote.total) : '—' },
                        { label: 'Payment terms', value: awardedQuote?.paymentTerms ?? '—' }],

                        confirmLabel: 'Create purchase order',
                        irreversibleNote: 'The order cannot be cancelled in this prototype once raised.',
                        run: () => createPurchaseOrder(request.id)
                      })
                      }
                      className="mt-3 inline-flex items-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-subtle">
                      
                          <CheckIcon className="h-4 w-4" /> Create purchase order
                        </button>
                      </>);

              })()}
                </>
            }
            </div>
          </div> :

        <div className="px-4 py-4 sm:px-5">
            <fieldset>
              <legend className="text-xs font-semibold">Choose the supplier to award</legend>
              <div className="mt-2 space-y-2">
                {quotes.map((q) => {
                const supplier = getSupplier(q.supplierId);
                const recommended = analysis?.recommendedQuotationId === q.id;
                const validity = quoteValidity(q.validUntil);
                const lapsed = validity.state === 'expired';
                return (
                  <label
                    key={q.id}
                    className={`flex items-start gap-2.5 rounded border p-3 transition-colors duration-150 ease-exp ${
                    lapsed ?
                    'cursor-not-allowed border-line bg-canvas' :
                    selected === q.id ?
                    'cursor-pointer border-brand-500 bg-brand-50/50' :
                    'cursor-pointer border-line hover:bg-raised'}`
                    }>
                    
                      <input
                      type="radio"
                      name="award"
                      value={q.id}
                      disabled={lapsed}
                      checked={selected === q.id}
                      onChange={() => setSelected(q.id)}
                      className="mt-1" />
                    
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-medium ${lapsed ? 'text-ink-subtle' : ''}`}>
                            {supplier?.name}
                          </span>
                          {recommended ?
                        <span className="rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-2xs font-semibold text-brand-700">
                              AI recommended
                            </span> :
                        null}
                          {validity.state !== 'valid' ?
                        <span
                          className={`rounded border px-1.5 py-0.5 text-2xs font-medium ${
                          VALIDITY_BADGE[validity.state]}`
                          }>
                          
                              {validity.label}
                            </span> :
                        null}
                        </span>
                        <span className="tabular mt-0.5 block text-xs text-ink-muted">
                          {formatVnd(q.total)} landed · {q.leadTimeDays} days · {q.paymentTerms}
                        </span>
                        {lapsed ?
                      <span className="mt-1 block text-2xs text-danger-600">
                            Cannot be awarded — request a refreshed quotation from {supplier?.name}.
                          </span> :
                      null}
                      </span>
                    </label>);

              })}
              </div>
            </fieldset>

            <label htmlFor="award-note" className="mt-4 block text-xs font-semibold">
              Reason for this selection <span className="font-normal text-ink-subtle">(required)</span>
            </label>
            <textarea
            id="award-note"
            rows={3}
            value={awardNote}
            onChange={(e) => setAwardNote(e.target.value)}
            placeholder="Chosen for the 9-day lead time against a 20 Sep deadline, despite the higher landed cost."
            className="mt-1 w-full resize-y rounded border border-line bg-surface px-2.5 py-2 text-sm leading-relaxed placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500" />
          

            {selected && analysis && analysis.recommendedQuotationId !== selected ?
          <p className="mt-2 rounded border border-brand-200 bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-700">
                This differs from the assistant recommendation. That is allowed — your reason is recorded alongside the
                decision.
              </p> :
          null}

            <button
            type="button"
            onClick={() => {
              const chosen = quotes.find((q) => q.id === selected);
              const supplier = chosen ? getSupplier(chosen.supplierId) : undefined;
              setPending({
                title: 'Record this supplier selection?',
                description:
                'This is the final supplier decision for the request. It is recorded against your name and the purchase order is raised from this quotation.',
                details: [
                { label: 'Supplier', value: supplier?.name ?? '—' },
                { label: 'Quotation', value: selected },
                { label: 'Landed total', value: chosen ? formatVnd(chosen.total) : '—' },
                {
                  label: 'Assistant',
                  value: !analysis ?
                  'No analysis requested' :
                  analysis.recommendedQuotationId === selected ?
                  'Matches the recommendation' :
                  'Differs from the recommendation'
                },
                { label: 'Your reason', value: awardNote }],

                confirmLabel: 'Select supplier',
                irreversibleNote: 'A selection cannot be changed once recorded in this prototype.',
                run: () => award(request.id, selected, awardNote)
              });
            }}
            disabled={!selected || awardNote.trim().length < 3}
            className="mt-3 inline-flex items-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-subtle">
            
              <CheckIcon className="h-4 w-4" /> Record supplier selection
            </button>
            <p className="mt-2 text-xs text-ink-subtle">
              Only a person can complete this step. The assistant has no ability to award a request.
            </p>
          </div>
        }
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.title ?? ''}
        description={pending?.description ?? ''}
        details={pending?.details}
        confirmLabel={pending?.confirmLabel ?? 'Confirm'}
        irreversibleNote={pending?.irreversibleNote}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          pending?.run();
          setPending(null);
        }} />
      
    </div>);

}