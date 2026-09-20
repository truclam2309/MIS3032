import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SendIcon,
  XIcon } from
'lucide-react';
import { ConfirmDialog, type ConfirmDetail } from './ConfirmDialog';
import { useProcurement } from '../contexts/ProcurementContext';
import type { PurchaseRequest } from '../types/procurement';
import { formatVnd } from '../utils/format';

const panel = 'rounded-lg border border-line bg-surface shadow-card';
const primary =
'inline-flex items-center justify-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-subtle';
const secondary =
'inline-flex items-center justify-center gap-1.5 rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:text-ink-subtle';
const noteInput =
'mt-1 w-full resize-y rounded border border-line bg-surface px-2.5 py-2 text-sm leading-relaxed placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500';

interface Pending {
  title: string;
  description: string;
  details?: ConfirmDetail[];
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  irreversibleNote?: string;
  run: () => void;
}

export function DecisionPanel({ request }: {request: PurchaseRequest;}) {
  const {
    decide,
    sendToFinance,
    resolveBudgetCheck,
    routeForApproval,
    retrySubmission,
    resubmit,
    budgetFor,
    orderFor
  } = useProcurement();
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);

  const snapshot = budgetFor(request);
  const blockedByBudget = Boolean(snapshot?.isOver) && request.budgetCheck.state !== 'cleared';

  const baseDetails: ConfirmDetail[] = [
  { label: 'Request', value: `${request.id} · ${request.title}` },
  { label: 'Value', value: formatVnd(request.estimatedTotal) }];


  const dialog =
  <ConfirmDialog
    open={pending !== null}
    title={pending?.title ?? ''}
    description={pending?.description ?? ''}
    details={pending?.details}
    confirmLabel={pending?.confirmLabel ?? 'Confirm'}
    tone={pending?.tone}
    irreversibleNote={pending?.irreversibleNote}
    onCancel={() => setPending(null)}
    onConfirm={() => {
      pending?.run();
      setPending(null);
    }} />;



  if (request.status === 'error') {
    return (
      <>
        <section className={`${panel} border-danger-200`} aria-label="Submission error">
          <header className="flex items-center gap-2 border-b border-danger-200 bg-danger-50 px-4 py-3">
            <AlertTriangleIcon className="h-4 w-4 text-danger-600" />
            <h2 className="text-sm font-semibold text-danger-700">Submission failed</h2>
          </header>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-ink-muted">{request.errorNote}</p>
            <p className="mt-2 text-xs text-ink-subtle">
              No approver has seen this request. Retrying resubmits exactly what you see below — nothing was changed.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => retrySubmission(request.id)} className={primary}>
                <RefreshCwIcon className="h-4 w-4" /> Retry submission
              </button>
              <Link to={`/requests/${request.id}/edit`} className={secondary}>
                <PencilIcon className="h-4 w-4" /> Edit before retrying
              </Link>
            </div>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (request.status === 'draft') {
    return (
      <>
        <section className={panel} aria-label="Draft">
          <div className="px-4 py-4">
            <h2 className="text-sm font-semibold">Draft — not submitted</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Nobody is waiting on this. Finish the required fields, then submit it from the edit screen.
            </p>
            <Link to={`/requests/${request.id}/edit`} className={`${primary} mt-4`}>
              <PencilIcon className="h-4 w-4" /> Continue editing
            </Link>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (request.status === 'submitted') {
    return (
      <>
        <section className={panel} aria-label="Routing">
          <div className="px-4 py-4">
            <h2 className="text-sm font-semibold">Queued for routing</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              The request has been submitted and is waiting to be assigned to the department approver.
            </p>
            <button type="button" onClick={() => routeForApproval(request.id)} className={`${primary} mt-4`}>
              <SendIcon className="h-4 w-4" /> Route to approver
            </button>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (request.status === 'revision-required') {
    return (
      <>
        <section className={`${panel} border-warn-200`} aria-label="Revision requested">
          <header className="border-b border-warn-200 bg-warn-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-warn-700">Revision requested</h2>
            <p className="mt-0.5 text-xs text-warn-700">{request.decision?.by}</p>
          </header>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-ink">{request.decision?.note}</p>

            <Link to={`/requests/${request.id}/edit`} className={`${primary} mt-4`}>
              <PencilIcon className="h-4 w-4" /> Edit and resubmit
            </Link>

            <div className="mt-5 border-t border-line/70 pt-4">
              <h3 className="text-xs font-semibold">Nothing to change?</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                If the approver only needed an explanation, answer here and send it back unchanged.
              </p>
              <label htmlFor="revision-note" className="mt-3 block text-xs font-semibold">
                Reply to the approver
              </label>
              <textarea
                id="revision-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="The twelve recipients are listed in the justification; no split is needed."
                className={noteInput} />
              
              <button
                type="button"
                disabled={note.trim().length < 3}
                onClick={() =>
                setPending({
                  title: 'Resubmit without changes?',
                  description:
                  'The request goes back to the same approver exactly as it is, with your reply attached.',
                  details: [...baseDetails, { label: 'Your reply', value: note }],
                  confirmLabel: 'Resubmit',
                  run: () => {
                    resubmit(request.id, note);
                    setNote('');
                  }
                })
                }
                className={`${secondary} mt-3`}>
                
                <RotateCcwIcon className="h-4 w-4" /> Resubmit unchanged
              </button>
            </div>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (request.status === 'budget-warning') {
    return (
      <>
        <section className={`${panel} border-warn-200`} aria-label="Finance budget review">
          <header className="border-b border-warn-200 bg-warn-50 px-4 py-3">
            <p className="text-2xs font-semibold uppercase tracking-wider text-warn-700">Finance</p>
            <h2 className="mt-0.5 text-sm font-semibold text-warn-700">Budget review</h2>
          </header>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-ink-muted">
              {snapshot ?
              `The request is ${formatVnd(Math.max(0, snapshot.overBy))} above the remaining ${
              snapshot.line.category} budget. Confirm whether funding can be found, or mark the line exceeded and send it back to the manager.` :

              'No budget line is attached to this request.'}
            </p>
            <label htmlFor="finance-note" className="mt-4 block text-xs font-semibold">
              Finance note <span className="font-normal text-ink-subtle">(required)</span>
            </label>
            <textarea
              id="finance-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reallocating from the deferred VPN project."
              className={noteInput} />
            
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={note.trim().length < 3}
                onClick={() =>
                setPending({
                  title: 'Confirm funding is available?',
                  description:
                  'The budget warning is cleared and the request returns to the manager for an approval decision. Finance does not approve the purchase itself.',
                  details: [
                  ...baseDetails,
                  { label: 'Budget line', value: `${snapshot?.line.category} · ${snapshot?.line.period}` },
                  { label: 'Available', value: formatVnd(snapshot?.available ?? 0) },
                  { label: 'Your note', value: note }],

                  confirmLabel: 'Confirm funding',
                  run: () => {
                    resolveBudgetCheck(request.id, 'cleared', note);
                    setNote('');
                  }
                })
                }
                className={primary}>
                
                <CheckIcon className="h-4 w-4" /> Funding confirmed
              </button>
              <button
                type="button"
                disabled={note.trim().length < 3}
                onClick={() =>
                setPending({
                  title: 'Mark the budget as exceeded?',
                  description:
                  'The request stays on budget warning and goes back to the manager, who can reject it or ask for a revision.',
                  details: [...baseDetails, { label: 'Your note', value: note }],
                  confirmLabel: 'Mark exceeded',
                  tone: 'danger',
                  run: () => {
                    resolveBudgetCheck(request.id, 'exceeded', note);
                    setNote('');
                  }
                })
                }
                className={`${secondary} border-danger-200 text-danger-600 hover:bg-danger-50`}>
                
                <XIcon className="h-4 w-4" /> Mark exceeded
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-subtle">
              Finance confirms funding only. The approval decision stays with the department manager.
            </p>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (request.status === 'pending-approval') {
    return (
      <>
        <section className={`${panel} border-brand-200`} aria-label="Approval decision">
          <header className="border-b border-brand-200 bg-brand-50 px-4 py-3">
            <p className="text-2xs font-semibold uppercase tracking-wider text-brand-700">Manager</p>
            <h2 className="mt-0.5 text-sm font-semibold text-brand-700">Approval decision</h2>
          </header>
          <div className="px-4 py-4">
            {blockedByBudget ?
            <p className="mb-4 flex items-start gap-2 rounded border border-warn-200 bg-warn-50 px-3 py-2.5 text-sm leading-relaxed text-warn-700">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Approval is blocked: this request exceeds the remaining {snapshot?.line.category} budget by{' '}
                {formatVnd(snapshot?.overBy ?? 0)}. Send it to Finance, or reject / request a revision.
              </p> :
            null}

            <label htmlFor="decision-note" className="block text-xs font-semibold">
              Decision note <span className="font-normal text-ink-subtle">(required)</span>
            </label>
            <textarea
              id="decision-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Approved — covered by the September onboarding plan."
              className={noteInput} />
            

            <div className="mt-3 flex flex-wrap gap-2">
              {blockedByBudget ?
              <button
                type="button"
                onClick={() =>
                setPending({
                  title: 'Send to Finance for budget review?',
                  description:
                  'Finance checks whether funding exists before you can approve. The request moves to budget warning until they respond.',
                  details: [
                  ...baseDetails,
                  { label: 'Over budget by', value: formatVnd(snapshot?.overBy ?? 0) }],

                  confirmLabel: 'Send to Finance',
                  run: () => sendToFinance(request.id)
                })
                }
                className={primary}>
                
                  <SendIcon className="h-4 w-4" /> Send to Finance for budget review
                </button> :

              <button
                type="button"
                disabled={note.trim().length < 3}
                onClick={() =>
                setPending({
                  title: 'Approve this request?',
                  description:
                  'Approving releases the request to Procurement to start collecting quotations. Your name and note are recorded on it.',
                  details: [...baseDetails, { label: 'Your note', value: note }],
                  confirmLabel: 'Approve request',
                  irreversibleNote: 'An approval cannot be withdrawn in this prototype.',
                  run: () => {
                    decide(request.id, 'approved', note);
                    setNote('');
                  }
                })
                }
                className={primary}>
                
                  <CheckIcon className="h-4 w-4" /> Approve
                </button>
              }
              <button
                type="button"
                disabled={note.trim().length < 3}
                onClick={() =>
                setPending({
                  title: 'Send back for revision?',
                  description:
                  'The requester can edit the request and resubmit it to you. Nothing is rejected.',
                  details: [...baseDetails, { label: 'What to change', value: note }],
                  confirmLabel: 'Request revision',
                  run: () => {
                    decide(request.id, 'revision-required', note);
                    setNote('');
                  }
                })
                }
                className={secondary}>
                
                Request revision
              </button>
              <button
                type="button"
                disabled={note.trim().length < 3}
                onClick={() =>
                setPending({
                  title: 'Reject this request?',
                  description:
                  'Rejecting closes the request. The requester would have to raise a new one to pursue this purchase.',
                  details: [...baseDetails, { label: 'Reason', value: note }],
                  confirmLabel: 'Reject request',
                  tone: 'danger',
                  irreversibleNote: 'A rejection cannot be reversed in this prototype.',
                  run: () => {
                    decide(request.id, 'rejected', note);
                    setNote('');
                  }
                })
                }
                className={`${secondary} border-danger-200 text-danger-600 hover:bg-danger-50`}>
                
                <XIcon className="h-4 w-4" /> Reject
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-subtle">
              Every outcome here is recorded against a named person. The assistant cannot approve or reject a request.
            </p>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (request.status === 'approved') {
    return (
      <>
        <section className={`${panel} border-ok-200`} aria-label="Approved">
          <header className="border-b border-ok-200 bg-ok-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-ok-700">Approved</h2>
            <p className="mt-0.5 text-xs text-ok-700">{request.decision?.by}</p>
          </header>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-ink">{request.decision?.note}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Next, Procurement collects quotations against this request by uploading each supplier's quotation file.
            </p>
            <Link to={`/sourcing/${request.id}/collect`} className={`${primary} mt-4`}>
              Collect quotations <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (request.status === 'rejected') {
    return (
      <>
        <section className={`${panel} border-danger-200`} aria-label="Rejected">
          <header className="border-b border-danger-200 bg-danger-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-danger-700">Rejected</h2>
            <p className="mt-0.5 text-xs text-danger-700">{request.decision?.by}</p>
          </header>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-ink">{request.decision?.note}</p>
          </div>
        </section>
        {dialog}
      </>);

  }

  if (['po-issued', 'received', 'closed'].includes(request.status)) {
    const order = orderFor(request.id);
    return (
      <>
        <section className={panel} aria-label="Fulfilment">
          <div className="px-4 py-4">
            <h2 className="text-sm font-semibold">
              {request.status === 'po-issued' ?
              'Purchase order issued' :
              request.status === 'received' ?
              'Goods received' :
              'Closed'}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              {request.status === 'po-issued' ?
              `${order?.id} is with the supplier. Receiving is recorded against the order.` :
              request.status === 'received' ?
              `${order?.id} has been delivered and is waiting for Procurement to close it.` :
              `${order?.id} was received and closed. Nothing outstanding.`}
            </p>
            {order ?
            <Link to={`/orders/${order.id}`} className={`${primary} mt-4`}>
                Open purchase order <ArrowRightIcon className="h-4 w-4" />
              </Link> :
            null}
          </div>
        </section>
        {dialog}
      </>);

  }

  return (
    <>
      <section className={panel} aria-label="Sourcing">
        <div className="px-4 py-4">
          <h2 className="text-sm font-semibold">
            {request.status === 'awarded' ? 'Supplier selected' : 'In sourcing'}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {request.status === 'awarded' ?
            'Procurement has selected a supplier for this request.' :
            'Procurement is comparing quotations for this request.'}
          </p>
          <Link to={`/sourcing/${request.id}`} className={`${primary} mt-4`}>
            Open comparison <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
      {dialog}
    </>);

}