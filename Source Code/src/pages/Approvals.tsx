import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowRightIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatVnd } from '../utils/format';

export function Approvals() {
  const { requests, budgetFor } = useProcurement();

  const queue = requests.filter((r) => ['submitted', 'pending-approval', 'budget-warning'].includes(r.status));
  const decided = requests.filter((r) => ['approved', 'rejected', 'revision-required'].includes(r.status)).slice(0, 5);
  const blocked = queue.filter((r) => r.status === 'budget-warning').length;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Manager · Flow B</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Approvals</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {queue.length} request{queue.length === 1 ? '' : 's'} in your queue
        {blocked > 0 ? ` · ${blocked} blocked pending a Finance budget review` : ''}.
      </p>

      <ul className="mt-6 space-y-3">
        {queue.map((r) => {
          const snapshot = budgetFor(r);
          const over = snapshot?.isOver && r.budgetCheck.state !== 'cleared';
          return (
            <li key={r.id}>
              <Link
                to={`/requests/${r.id}`}
                className="group block rounded-lg border border-line bg-surface p-4 shadow-card transition-colors duration-150 ease-exp hover:border-line-strong hover:bg-raised">
                
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} size="sm" />
                      <span className="tabular text-2xs text-ink-subtle">{r.id}</span>
                    </div>
                    <h2 className="mt-1.5 text-base font-semibold leading-snug">{r.title}</h2>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {r.requester} · {r.department} · {r.category} · needed by {formatDate(r.neededBy)}
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{r.justification}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-lg font-semibold">{formatVnd(r.estimatedTotal)}</p>
                    {snapshot ?
                    <p className="tabular mt-0.5 text-2xs text-ink-subtle">
                        {formatVnd(snapshot.available)} left in {snapshot.line.category}
                      </p> :
                    null}
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                      Review <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
                {over ?
                <p className="mt-3 flex items-start gap-1.5 rounded border border-warn-200 bg-warn-50 px-2.5 py-2 text-xs leading-relaxed text-warn-700">
                    <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Exceeds the remaining {snapshot?.line.category} budget by {formatVnd(snapshot?.overBy ?? 0)}.
                    Approval is blocked until Finance reviews it.
                  </p> :
                null}
              </Link>
            </li>);

        })}
        {queue.length === 0 ?
        <li className="rounded-lg border border-line bg-surface p-10 text-center text-sm text-ink-muted">
            Nothing waiting on you.
          </li> :
        null}
      </ul>

      <h2 className="mt-10 text-sm font-semibold">Recently decided</h2>
      <ul className="mt-2 divide-y divide-line/70 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        {decided.map((r) =>
        <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
            <StatusBadge status={r.status} size="sm" />
            <Link to={`/requests/${r.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-brand-600">
              {r.title}
            </Link>
            <span className="tabular text-xs text-ink-subtle">{formatVnd(r.estimatedTotal)}</span>
          </li>
        )}
      </ul>
    </div>);

}