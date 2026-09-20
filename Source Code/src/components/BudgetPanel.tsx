import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import type { BudgetSnapshot } from '../contexts/ProcurementContext';
import type { PurchaseRequest } from '../types/procurement';
import { formatVnd } from '../utils/format';

export function BudgetPanel({
  snapshot,
  request



}: {snapshot: BudgetSnapshot;request: PurchaseRequest;}) {
  const { line, available, overBy, isOver } = snapshot;
  const usedRatio = Math.min(1, (line.spent + line.committed) / line.allocated);
  const requestRatio = Math.min(1 - usedRatio, request.estimatedTotal / line.allocated);

  return (
    <section
      className={`rounded-lg border shadow-card ${
      isOver ? 'border-warn-200 bg-warn-50/60' : 'border-line bg-surface'}`
      }
      aria-label="Budget position">
      
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-line/70 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">
            {isOver ? 'Budget warning' : 'Budget position'}
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            {line.category} · {line.period} · owner {line.owner}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium ${
          isOver ? 'border-warn-200 bg-surface text-warn-700' : 'border-ok-200 bg-ok-50 text-ok-700'}`
          }>
          
          {isOver ? <AlertTriangleIcon className="h-3.5 w-3.5" /> : <CheckCircle2Icon className="h-3.5 w-3.5" />}
          {isOver ? `Over by ${formatVnd(overBy)}` : 'Within budget'}
        </span>
      </header>

      <div className="px-4 py-4">
        {isOver ?
        <p className="mb-4 text-sm leading-relaxed text-warn-700">
            This request is {formatVnd(overBy)} above the remaining {line.category} budget for {line.period}. It
            cannot be approved until Finance reviews the position.
          </p> :
        null}

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas" role="presentation">
          <div className="flex h-full w-full">
            <div className="h-full bg-ink/70" style={{ width: `${usedRatio * 100}%` }} />
            <div
              className={`h-full ${isOver ? 'bg-warn-600' : 'bg-brand-500'}`}
              style={{ width: `${Math.max(0, requestRatio) * 100}%` }} />
            
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-ink-subtle">Allocated</dt>
            <dd className="tabular mt-0.5 font-medium">{formatVnd(line.allocated)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-subtle">Spent</dt>
            <dd className="tabular mt-0.5 font-medium">{formatVnd(line.spent)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-subtle">Committed</dt>
            <dd className="tabular mt-0.5 font-medium">{formatVnd(line.committed)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-subtle">Available</dt>
            <dd className="tabular mt-0.5 font-semibold">{formatVnd(available)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-line/70 pt-3">
          <span className="text-sm text-ink-muted">This request</span>
          <span className="tabular text-base font-semibold">{formatVnd(request.estimatedTotal)}</span>
        </div>

        {request.budgetCheck.state !== 'not-requested' && request.budgetCheck.state !== 'not-required' ?
        <p className="mt-3 rounded border border-line bg-raised px-3 py-2 text-xs leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">
              {request.budgetCheck.state === 'pending' ?
            'Awaiting Finance review' :
            request.budgetCheck.state === 'cleared' ?
            'Cleared by Finance' :
            'Marked exceeded by Finance'}
            </span>
            {request.budgetCheck.checkedBy ? ` · ${request.budgetCheck.checkedBy}` : ''}
            {request.budgetCheck.note ? ` — ${request.budgetCheck.note}` : ''}
          </p> :
        null}
      </div>
    </section>);

}