import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, PackageCheckIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { ConfirmDialog, type ConfirmDetail } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { formatDate, formatDateTime, formatVnd } from '../utils/format';

const primary =
'inline-flex items-center justify-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-subtle';

export function OrderDetail() {
  const { id = '' } = useParams();
  const { getOrder, getRequest, getSupplier, quotationsFor, receiveGoods, closeOrder } = useProcurement();
  const order = getOrder(id);
  const [condition, setCondition] = useState<'complete' | 'partial'>('complete');
  const [receiptNote, setReceiptNote] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [pending, setPending] = useState<{
    title: string;
    description: string;
    details: ConfirmDetail[];
    confirmLabel: string;
    irreversibleNote?: string;
    run: () => void;
  } | null>(null);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-line bg-surface p-10 text-center">
        <h1 className="text-lg font-semibold">Purchase order not found</h1>
        <Link to="/orders" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          Back to purchase orders
        </Link>
      </div>);

  }

  const request = getRequest(order.requestId);
  const supplier = getSupplier(order.supplierId);
  const quote = quotationsFor(order.requestId).find((q) => q.id === order.quotationId);

  const facts: Array<{label: string;value: string;}> = [
  { label: 'Supplier', value: supplier?.name ?? '—' },
  { label: 'Payment terms', value: quote?.paymentTerms ?? '—' },
  { label: 'From quotation', value: order.quotationId },
  { label: 'Lead time quoted', value: quote ? `${quote.leadTimeDays} days` : '—' },
  { label: 'Expected delivery', value: formatDate(order.expectedDelivery) },
  { label: 'Issued', value: `${formatDateTime(order.issuedAt)} · ${order.issuedBy}` }];


  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> Purchase orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {request ? <StatusBadge status={request.status} /> : null}
            <span className="tabular text-xs text-ink-subtle">{order.id}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{request?.title ?? order.requestId}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Raised from {order.requestId} ·{' '}
            <Link to={`/sourcing/${order.requestId}`} className="font-medium text-brand-600 hover:underline">
              view comparison
            </Link>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xs uppercase tracking-wider text-ink-subtle">Order value</p>
          <p className="tabular mt-0.5 text-2xl font-semibold">{formatVnd(order.total)}</p>
        </div>
      </div>

      {request ?
      <div className="mt-5 rounded-lg border border-line bg-surface p-4 shadow-card">
          <WorkflowProgress status={request.status} />
        </div> :
      null}

      <section className="mt-6 rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-semibold">Order details</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-3">
          {facts.map((f) =>
          <div key={f.label}>
              <dt className="text-2xs uppercase tracking-wide text-ink-subtle">{f.label}</dt>
              <dd className="mt-0.5 text-sm">{f.value}</dd>
            </div>
          )}
        </dl>
        {request?.award ?
        <p className="mt-4 border-t border-line/70 pt-3 text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">Why this supplier: </span>
            {request.award.note}
          </p> :
        null}
      </section>

      {order.status === 'issued' ?
      <section className="mt-6 rounded-lg border border-brand-200 bg-surface shadow-card">
          <header className="border-b border-brand-200 bg-brand-50 px-4 py-3 sm:px-5">
            <p className="text-2xs font-semibold uppercase tracking-wider text-brand-700">Receiving</p>
            <h2 className="mt-0.5 text-sm font-semibold text-brand-700">Record goods received</h2>
          </header>
          <div className="px-4 py-4 sm:px-5">
            <fieldset>
              <legend className="text-xs font-semibold">Delivery condition</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['complete', 'partial'] as const).map((c) =>
              <label
                key={c}
                className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm transition-colors duration-150 ease-exp ${
                condition === c ? 'border-brand-500 bg-brand-50/60' : 'border-line hover:bg-raised'}`
                }>
                
                    <input
                  type="radio"
                  name="condition"
                  value={c}
                  checked={condition === c}
                  onChange={() => setCondition(c)} />
                
                    {c === 'complete' ? 'Received in full' : 'Received in part'}
                  </label>
              )}
              </div>
            </fieldset>
            <label htmlFor="receipt-note" className="mt-4 block text-xs font-semibold">
              Receipt note <span className="font-normal text-ink-subtle">(required)</span>
            </label>
            <textarea
            id="receipt-note"
            rows={3}
            value={receiptNote}
            onChange={(e) => setReceiptNote(e.target.value)}
            placeholder="All 10 units delivered, serial numbers logged at goods-in."
            className="mt-1 w-full resize-y rounded border border-line bg-surface px-2.5 py-2 text-sm leading-relaxed placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500" />
          
            <button
            type="button"
            onClick={() =>
            setPending({
              title: condition === 'complete' ? 'Record the delivery as complete?' : 'Record a partial delivery?',
              description:
              condition === 'complete' ?
              'The order moves to received and can then be closed by Procurement.' :
              'The order moves to received and is flagged as a partial delivery in the note.',
              details: [
              { label: 'Purchase order', value: order.id },
              { label: 'Supplier', value: supplier?.name ?? '—' },
              { label: 'Condition', value: condition === 'complete' ? 'Received in full' : 'Received in part' },
              { label: 'Your note', value: receiptNote }],

              confirmLabel: 'Record receipt',
              run: () => receiveGoods(order.id, condition, receiptNote)
            })
            }
            disabled={receiptNote.trim().length < 3}
            className={`${primary} mt-3`}>
            
              <PackageCheckIcon className="h-4 w-4" /> Record receipt
            </button>
            <p className="mt-2 text-xs text-ink-subtle">
              Receiving is recorded at order level only. Inventory and invoice matching are out of scope for this
              prototype.
            </p>
          </div>
        </section> :
      null}

      {order.receipt ?
      <section className="mt-6 rounded-lg border border-ok-200 bg-ok-50/60 p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-semibold text-ok-700">
            {order.receipt.condition === 'complete' ? 'Received in full' : 'Received in part'}
          </h2>
          <p className="mt-1 text-xs text-ink-subtle">
            {formatDateTime(order.receipt.receivedAt)} · {order.receipt.receivedBy}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{order.receipt.note}</p>
        </section> :
      null}

      {order.status === 'received' ?
      <section className="mt-6 rounded-lg border border-line bg-surface shadow-card">
          <header className="border-b border-line px-4 py-3 sm:px-5">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Procurement</p>
            <h2 className="mt-0.5 text-sm font-semibold">Close the order</h2>
          </header>
          <div className="px-4 py-4 sm:px-5">
            <label htmlFor="close-note" className="block text-xs font-semibold">
              Closing note <span className="font-normal text-ink-subtle">(required)</span>
            </label>
            <textarea
            id="close-note"
            rows={3}
            value={closeNote}
            onChange={(e) => setCloseNote(e.target.value)}
            placeholder="Delivery matched the quotation. Nothing outstanding."
            className="mt-1 w-full resize-y rounded border border-line bg-surface px-2.5 py-2 text-sm leading-relaxed placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500" />
          
            <button
            type="button"
            onClick={() =>
            setPending({
              title: 'Close this purchase order?',
              description:
              'Closing ends the workflow for this request. No further receiving or changes are possible afterwards.',
              details: [
              { label: 'Purchase order', value: order.id },
              { label: 'Request', value: order.requestId },
              {
                label: 'Delivery',
                value: order.receipt?.condition === 'partial' ? 'Received in part' : 'Received in full'
              },
              { label: 'Closing note', value: closeNote }],

              confirmLabel: 'Close order',
              irreversibleNote:
              order.receipt?.condition === 'partial' ?
              'This delivery was only partial. Closing it leaves the outstanding items unresolved.' :
              'A closed order cannot be reopened in this prototype.',
              run: () => closeOrder(order.id, closeNote)
            })
            }
            disabled={closeNote.trim().length < 3}
            className={`${primary} mt-3`}>
            
              <CheckIcon className="h-4 w-4" /> Close purchase order
            </button>
          </div>
        </section> :
      null}

      {order.status === 'closed' ?
      <section className="mt-6 rounded-lg border border-line bg-raised p-4 sm:p-5">
          <h2 className="text-sm font-semibold">Order closed</h2>
          <p className="mt-1 text-xs text-ink-subtle">
            {order.closedAt ? formatDateTime(order.closedAt) : ''} · {order.closedBy}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{order.closeNote}</p>
        </section> :
      null}

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