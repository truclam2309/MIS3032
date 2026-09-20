import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatVnd } from '../utils/format';

export function BudgetReview() {
  const { requests, budgetLines, budgetFor } = useProcurement();
  const queue = requests.filter((r) => r.status === 'budget-warning' || r.budgetCheck.state === 'pending');

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Finance · Flow B</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Budget review</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Requests a manager escalated because they exceed the remaining budget on their category.
      </p>

      <ul className="mt-6 space-y-3">
        {queue.map((r) => {
          const snapshot = budgetFor(r);
          return (
            <li key={r.id}>
              <Link
                to={`/requests/${r.id}`}
                className="block rounded-lg border border-warn-200 bg-warn-50 p-4 shadow-card transition-colors duration-150 ease-exp hover:bg-warn-50/70">
                
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} size="sm" />
                      <span className="tabular text-2xs text-ink-subtle">{r.id}</span>
                    </div>
                    <h2 className="mt-1.5 text-base font-semibold">{r.title}</h2>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {r.requester} · {r.department} · needed by {formatDate(r.neededBy)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-lg font-semibold">{formatVnd(r.estimatedTotal)}</p>
                    {snapshot ?
                    <p className="tabular mt-0.5 text-xs text-warn-700">
                        over by {formatVnd(Math.max(0, snapshot.overBy))}
                      </p> :
                    null}
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                      Review budget <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>);

        })}
        {queue.length === 0 ?
        <li className="rounded-lg border border-line bg-surface p-10 text-center text-sm text-ink-muted">
            No budget escalations open.
          </li> :
        null}
      </ul>

      <h2 className="mt-10 text-sm font-semibold">Q3 2026 budget lines</h2>
      <div className="mt-2 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <table className="w-full text-sm">
          <caption className="sr-only">Budget lines for Q3 2026</caption>
          <thead>
            <tr className="border-b border-line bg-raised text-left text-2xs uppercase tracking-wide text-ink-subtle">
              <th scope="col" className="px-4 py-2 font-semibold">Category</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Allocated</th>
              <th scope="col" className="hidden px-4 py-2 text-right font-semibold sm:table-cell">Spent</th>
              <th scope="col" className="hidden px-4 py-2 text-right font-semibold sm:table-cell">Committed</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Available</th>
              <th scope="col" className="w-32 px-4 py-2 font-semibold">Used</th>
            </tr>
          </thead>
          <tbody>
            {budgetLines.map((b) => {
              const available = b.allocated - b.spent - b.committed;
              const used = (b.spent + b.committed) / b.allocated;
              return (
                <tr key={b.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{b.category}</span>
                    <p className="mt-0.5 text-2xs text-ink-subtle">{b.owner}</p>
                  </td>
                  <td className="tabular px-4 py-3 text-right">{formatVnd(b.allocated)}</td>
                  <td className="tabular hidden px-4 py-3 text-right text-ink-muted sm:table-cell">{formatVnd(b.spent)}</td>
                  <td className="tabular hidden px-4 py-3 text-right text-ink-muted sm:table-cell">
                    {formatVnd(b.committed)}
                  </td>
                  <td
                    className={`tabular px-4 py-3 text-right font-semibold ${
                    used > 0.85 ? 'text-warn-700' : 'text-ink'}`
                    }>
                    
                    {formatVnd(available)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                      <div
                        className={`h-full ${used > 0.85 ? 'bg-warn-600' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(100, used * 100)}%` }} />
                      
                    </div>
                    <span className="tabular mt-1 block text-2xs text-ink-subtle">{Math.round(used * 100)}%</span>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}