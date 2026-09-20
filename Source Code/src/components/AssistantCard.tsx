import React from 'react';
import { SparklesIcon } from 'lucide-react';

export function AssistantCard({
  title,
  subtitle,
  children,
  footer





}: {title: string;subtitle?: string;children: React.ReactNode;footer?: React.ReactNode;}) {
  return (
    <section
      aria-label={title}
      className="rounded-lg border border-brand-200 bg-brand-50/50 shadow-card">
      
      <header className="flex items-start gap-2.5 border-b border-brand-200 px-4 py-3">
        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded bg-brand-500 text-ink-invert">
          <SparklesIcon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-brand-700">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p> : null}
        </div>
        <span className="shrink-0 rounded border border-brand-200 bg-surface px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-brand-700">
          Advisory
        </span>
      </header>
      <div className="px-4 py-3">{children}</div>
      {footer ? <div className="border-t border-brand-200 px-4 py-2.5 text-xs text-ink-muted">{footer}</div> : null}
    </section>);

}