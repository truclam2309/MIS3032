
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import type { RequestStatus } from '../types/procurement';
import { formatDate, formatVnd } from '../utils/format';

const FILTERS: Array<{
  key: string;
  label: string;
  match: (s: RequestStatus) => boolean;
}> = [
  {
    key: 'all',
    label: 'All',
    match: () => true,
  },
  {
    key: 'open',
    label: 'In flight',
    match: (s) =>
      ['submitted', 'pending-approval', 'budget-warning'].includes(s),
  },
  {
    key: 'attention',
    label: 'Needs me',
    match: (s) =>
      ['draft', 'revision-required', 'error'].includes(s),
  },
  {
    key: 'sourcing',
    label: 'Sourcing',
    match: (s) =>
      ['approved', 'quotation-comparison', 'ai-recommendation', 'awarded'].includes(s),
  },
  {
    key: 'fulfilment',
    label: 'Fulfilment',
    match: (s) => ['po-issued', 'received'].includes(s),
  },
  {
    key: 'closed',
    label: 'Closed',
    match: (s) => ['rejected', 'closed'].includes(s),
  },
];

export function Requests() {
  const { requests, budgetFor } = useProcurement();
  const { user } = useAuth();

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0];

    return requests
      .filter(
        (r) =>
          f.match(r.status) &&
          (
            query.trim() === '' ||
            `${r.id} ${r.title} ${r.category} ${r.requester}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )
      )
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [requests, filter, query]);

  const attention = requests.filter((r) =>
    ['error', 'revision-required'].includes(r.status)
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">
            Employee
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Purchase requests
          </h1>

          <p className="mt-1 text-sm text-ink-muted">
            Everything you raised, and where each one currently sits.
          </p>
        </div>

        <Link
          to="/requests/new"
          className="inline-flex items-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600"
        >
          <PlusIcon className="h-4 w-4" />
          New request
        </Link>
      </div>

      {attention.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {attention.map((r) => (
            <Link
              key={r.id}
              to={`/requests/${r.id}`}
              className={`group block rounded-lg border p-4 shadow-card transition-colors duration-150 ease-exp ${
                r.status === 'error'
                  ? 'border-danger-200 bg-danger-50 hover:bg-danger-50/70'
                  : 'border-warn-200 bg-warn-50 hover:bg-warn-50/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangleIcon
                  className={`h-4 w-4 ${
                    r.status === 'error'
                      ? 'text-danger-600'
                      : 'text-warn-600'
                  }`}
                />

                <StatusBadge status={r.status} size="sm" />

                <span className="tabular text-2xs text-ink-subtle">
                  {r.id}
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold">
                {r.title}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {r.status === 'error'
                  ? r.errorNote
                  : r.decision?.note}
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Filter requests"
          className="flex flex-wrap gap-1 rounded border border-line bg-surface p-1"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors duration-150 ease-exp ${
                filter === f.key
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-muted hover:bg-canvas'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink-subtle" />

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search requests"
            placeholder="Search by id, title, category"
            className="w-full rounded border border-line bg-surface py-2 pl-8 pr-2.5 text-sm placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500"
          />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Purchase requests
          </caption>

          <thead>
            <tr className="border-b border-line bg-raised text-left text-2xs uppercase tracking-wide text-ink-subtle">
              <th scope="col" className="px-4 py-2 font-semibold">
                Request
              </th>

              <th
                scope="col"
                className="hidden px-4 py-2 font-semibold md:table-cell"
              >
                Category
              </th>

              <th
                scope="col"
                className="px-4 py-2 text-right font-semibold"
              >
                Estimated
              </th>

              <th
                scope="col"
                className="hidden px-4 py-2 font-semibold sm:table-cell"
              >
                Needed by
              </th>

              <th scope="col" className="px-4 py-2 font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.map((r) => {
              const snapshot = budgetFor(r);
              const over =
                snapshot?.isOver &&
                r.budgetCheck.state !== 'cleared';

              /*
               * BUG-001:
               * Only Manager can open a PR while it is
               * pending-approval.
               *
               * Other roles can still see the PR in the list,
               * but the PR title is not clickable.
               */
              const canOpenPendingApproval =
                r.status !== 'pending-approval' ||
                user?.role === 'manager';

              return (
                <tr
                  key={r.id}
                  className="border-b border-line/70 last:border-0 hover:bg-raised"
                >
                  <td className="px-4 py-3">
                    {canOpenPendingApproval ? (
                      <Link
                        to={`/requests/${r.id}`}
                        className="font-medium text-ink hover:text-brand-600"
                      >
                        {r.title}
                      </Link>
                    ) : (
                      <span
                        className="font-medium text-ink"
                        aria-label="Purchase request đang chờ Manager phê duyệt"
                      >
                        {r.title}
                      </span>
                    )}

                    <p className="tabular mt-0.5 text-2xs text-ink-subtle">
                      {r.id} · {r.requester} · {r.department}
                    </p>
                  </td>

                  <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                    {r.category}
                  </td>

                  <td className="tabular px-4 py-3 text-right font-medium">
                    {formatVnd(r.estimatedTotal)}

                    {over ? (
                      <span className="mt-0.5 block text-2xs font-normal text-warn-700">
                        over remaining budget
                      </span>
                    ) : null}
                  </td>

                  <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">
                    {formatDate(r.neededBy)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      status={r.status}
                      size="sm"
                    />
                  </td>
                </tr>
              );
            })}

            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-ink-muted"
                >
                  No requests match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}