import React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import type { RequestStatus } from '../types/procurement';

const STEPS = ['Request', 'Approval', 'Quotations', 'Comparison', 'Purchase order', 'Received', 'Closed'] as const;

const STAGE: Record<RequestStatus, number> = {
  draft: 0,
  error: 0,
  submitted: 1,
  'pending-approval': 1,
  'budget-warning': 1,
  'revision-required': 1,
  rejected: 1,
  approved: 2,
  'quotation-comparison': 3,
  'ai-recommendation': 3,
  awarded: 3,
  'po-issued': 4,
  received: 5,
  closed: 6
};

export function WorkflowProgress({ status }: {status: RequestStatus;}) {
  const current = STAGE[status];
  const halted = status === 'rejected';

  return (
    <nav aria-label="Workflow progress" className="overflow-x-auto">
      <ol className="flex min-w-[34rem] items-center gap-1.5">
        {STEPS.map((step, index) => {
          const done = index < current || status === 'closed';
          const isCurrent = index === current && status !== 'closed';
          return (
            <li key={step} className="flex min-w-0 flex-1 items-center gap-1.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-2xs font-semibold ${
                halted && isCurrent ?
                'border-danger-200 bg-danger-50 text-danger-600' :
                done ?
                'border-ok-200 bg-ok-50 text-ok-700' :
                isCurrent ?
                'border-brand-500 bg-brand-500 text-ink-invert' :
                'border-line bg-surface text-ink-subtle'}`
                }>
                
                {halted && isCurrent ?
                <XIcon className="h-3 w-3" /> :
                done ?
                <CheckIcon className="h-3 w-3" /> :

                index + 1
                }
              </span>
              <span
                className={`truncate text-2xs ${
                isCurrent ? 'font-semibold text-ink' : done ? 'text-ink-muted' : 'text-ink-subtle'}`
                }>
                
                {step}
              </span>
              {index < STEPS.length - 1 ?
              <span aria-hidden className={`h-px flex-1 ${done ? 'bg-ok-200' : 'bg-line'}`} /> :
              null}
            </li>);

        })}
      </ol>
    </nav>);

}