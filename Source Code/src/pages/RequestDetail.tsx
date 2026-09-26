import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { StatusBadge } from '../components/StatusBadge';
import { BudgetPanel } from '../components/BudgetPanel';
import { DecisionPanel } from '../components/DecisionPanel';
import { RequestTimeline } from '../components/RequestTimeline';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { QuotationList } from '../components/QuotationList';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDateTime, formatVnd } from '../utils/format';

export function RequestDetail() {
  const { id = '' } = useParams();
  const { getRequest, budgetFor, quotationsFor, inboundFor, getSupplier } = useProcurement();
  const { user } = useAuth();
  const request = getRequest(id);

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-line bg-surface p-10 text-center">
        <h1 className="text-lg font-semibold">Request not found</h1>
        <p className="mt-1 text-sm text-ink-muted">{id} does not exist in this prototype.</p>
        <Link to="/requests" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          Back to requests
        </Link>
      </div>);

  }

  if (request.status === 'pending-approval' && user?.role !== 'manager') {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-line bg-surface p-10 text-center">
        <h1 className="text-lg font-semibold">Manager approval in progress</h1>
        <p className="mt-1 text-sm text-ink-muted">
          This purchase request is only available to the Manager during approval.
        </p>
        <Link to="/requests" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          Back to requests
        </Link>
      </div>
    );
  }

  const snapshot = budgetFor(request);
  const showBudget =
  snapshot && (
  snapshot.isOver ||
  request.status === 'budget-warning' ||
  ['cleared', 'exceeded', 'pending'].includes(request.budgetCheck.state));

  const isEditable = ['draft', 'revision-required', 'error'].includes(request.status);
  const quotes = quotationsFor(request.id);
  const remainingInbound = inboundFor(request.id).length;
  const showQuotations =
  quotes.length > 0 ||
  ['approved', 'quotation-comparison', 'ai-recommendation'].includes(request.status);
  const canCollect =
  ['approved', 'quotation-comparison'].includes(request.status) && remainingInbound > 0;

  const details: Array<{label: string;value: string;}> = [
  { label: 'Requester', value: request.requester },
  { label: 'Department', value: request.department },
  { label: 'Category', value: request.category },
  { label: 'Cost centre', value: request.costCenter || '— not set' },
  { label: 'Required by', value: request.neededBy ? formatDate(request.neededBy) : '— not set' },
  { label: 'Delivery location', value: request.deliveryLocation || '— not set' },
  { label: 'Created', value: formatDateTime(request.createdAt) },
  { label: 'Last updated', value: formatDateTime(request.updatedAt) }];


  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/requests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> All requests
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <span className="tabular text-xs text-ink-subtle">{request.id}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{request.title}</h1>
        </div>
        <div className="flex items-start gap-4">
          {isEditable ?
          <Link
            to={`/requests/${request.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
            
              <PencilIcon className="h-4 w-4" /> Edit request
            </Link> :
          null}
          <div className="text-right">
            <p className="text-2xs uppercase tracking-wider text-ink-subtle">Estimated total</p>
            <p className="tabular mt-0.5 text-2xl font-semibold">{formatVnd(request.estimatedTotal)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-surface p-4 shadow-card">
        <WorkflowProgress status={request.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <DecisionPanel request={request} />

          {showBudget && snapshot ? <BudgetPanel snapshot={snapshot} request={request} /> : null}

          <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
            <h2 className="text-sm font-semibold">Justification</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              {request.justification || 'Not provided yet.'}
            </p>

            <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-line/70 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {details.map((d) =>
              <div key={d.label}>
                  <dt className="text-2xs uppercase tracking-wide text-ink-subtle">{d.label}</dt>
                  <dd className="mt-0.5 text-sm">{d.value}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
            <header className="border-b border-line px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold">Line items</h2>
            </header>
            <table className="w-full text-sm">
              <caption className="sr-only">Line items on {request.id}</caption>
              <thead>
                <tr className="border-b border-line bg-raised text-left text-2xs uppercase tracking-wide text-ink-subtle">
                  <th scope="col" className="px-4 py-2 font-semibold sm:px-5">Description</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Qty</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Est. unit</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold sm:px-5">Line total</th>
                </tr>
              </thead>
              <tbody>
                {request.items.map((i) =>
                <tr key={i.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-2.5 sm:px-5">{i.description}</td>
                    <td className="tabular px-4 py-2.5 text-right text-ink-muted">
                      {i.qty} {i.uom}
                    </td>
                    <td className="tabular px-4 py-2.5 text-right text-ink-muted">{formatVnd(i.estUnitPrice)}</td>
                    <td className="tabular px-4 py-2.5 text-right font-medium sm:px-5">
                      {formatVnd(i.qty * i.estUnitPrice)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {showQuotations ?
          <QuotationList
            quotes={quotes}
            supplierOf={getSupplier}
            remaining={remainingInbound}
            collectHref={canCollect ? `/sourcing/${request.id}/collect` : undefined} /> :

          null}
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <h2 className="text-sm font-semibold">Activity</h2>
            <div className="mt-4">
              <RequestTimeline events={request.timeline} />
            </div>
          </section>

          {request.aiSuggestionsApplied.length > 0 ?
          <section className="rounded-lg border border-line bg-raised p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Assistant involvement</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                {request.aiSuggestionsApplied.length} suggestion
                {request.aiSuggestionsApplied.length === 1 ? '' : 's'} were offered and accepted by the requester
                before submission. No field was written automatically.
              </p>
            </section> :
          null}
        </div>
      </div>
    </div>);

}
