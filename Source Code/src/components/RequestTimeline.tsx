import React from 'react';
import type { ActorRole, TimelineEvent } from '../types/procurement';
import { formatDateTime } from '../utils/format';

const ROLE_STYLE: Record<ActorRole, string> = {
  employee: 'bg-info-600',
  manager: 'bg-brand-500',
  finance: 'bg-warn-600',
  procurement: 'bg-ok-600',
  system: 'bg-ink-subtle',
  ai: 'bg-brand-700'
};

const ROLE_LABEL: Record<ActorRole, string> = {
  employee: 'Employee',
  manager: 'Manager',
  finance: 'Finance',
  procurement: 'Procurement',
  system: 'System',
  ai: 'Assistant'
};

export function RequestTimeline({ events }: {events: TimelineEvent[];}) {
  return (
    <ol className="relative space-y-4 pl-5">
      <span aria-hidden className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-line" />
      {events.map((e) =>
      <li key={e.id} className="relative">
          <span
          aria-hidden
          className={`absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full ring-2 ring-surface ${ROLE_STYLE[e.role]}`} />
        
          <p className="text-sm font-medium leading-snug">{e.label}</p>
          <p className="mt-0.5 text-xs text-ink-subtle">
            {ROLE_LABEL[e.role]} · {e.actor} · {formatDateTime(e.at)}
          </p>
          {e.detail ? <p className="mt-1 text-xs leading-relaxed text-ink-muted">{e.detail}</p> : null}
        </li>
      )}
    </ol>);

}