import React from 'react';
import type { RequestStatus } from '../types/procurement';

const MAP: Record<RequestStatus, {label: string;className: string;}> = {
  draft: { label: 'Draft', className: 'bg-canvas text-ink-muted border-line-strong' },
  submitted: { label: 'Submitted', className: 'bg-info-50 text-info-700 border-info-200' },
  'pending-approval': { label: 'Pending approval', className: 'bg-brand-50 text-brand-700 border-brand-200' },
  'revision-required': { label: 'Revision required', className: 'bg-warn-50 text-warn-700 border-warn-200' },
  approved: { label: 'Approved', className: 'bg-ok-50 text-ok-700 border-ok-200' },
  rejected: { label: 'Rejected', className: 'bg-danger-50 text-danger-700 border-danger-200' },
  'budget-warning': { label: 'Budget warning', className: 'bg-warn-50 text-warn-700 border-warn-200' },
  'quotation-comparison': { label: 'Quotation comparison', className: 'bg-info-50 text-info-700 border-info-200' },
  'ai-recommendation': { label: 'AI recommendation ready', className: 'bg-brand-50 text-brand-700 border-brand-200' },
  awarded: { label: 'Awarded', className: 'bg-ok-50 text-ok-700 border-ok-200' },
  'po-issued': { label: 'PO issued', className: 'bg-info-50 text-info-700 border-info-200' },
  received: { label: 'Received', className: 'bg-ok-50 text-ok-700 border-ok-200' },
  closed: { label: 'Closed', className: 'bg-canvas text-ink-muted border-line-strong' },
  error: { label: 'Error', className: 'bg-danger-50 text-danger-700 border-danger-200' }
};

export function StatusBadge({ status, size = 'md' }: {status: RequestStatus;size?: 'sm' | 'md';}) {
  const conf = MAP[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border font-medium ${conf.className} ${
      size === 'sm' ? 'px-1.5 py-0.5 text-2xs' : 'px-2 py-0.5 text-xs'}`
      }>
      
      {conf.label}
    </span>);

}

export const STATUS_LABELS = MAP;