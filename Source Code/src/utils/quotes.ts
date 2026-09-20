export type ValidityState = 'valid' | 'expiring' | 'expired';

export interface QuoteValidity {
  state: ValidityState;
  /** Whole days from today until the quote lapses. Negative once it has lapsed. */
  days: number;
  label: string;
}

const DAY = 86_400_000;
const EXPIRING_WINDOW_DAYS = 7;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function quoteValidity(validUntil: string, now: Date = new Date()): QuoteValidity {
  if (!validUntil) return { state: 'valid', days: Number.POSITIVE_INFINITY, label: 'No expiry stated' };
  const end = new Date(validUntil);
  const days = Math.round((startOfDay(end) - startOfDay(now)) / DAY);

  if (days < 0) {
    return {
      state: 'expired',
      days,
      label: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
    };
  }
  if (days === 0) return { state: 'expiring', days, label: 'Expires today' };
  if (days <= EXPIRING_WINDOW_DAYS) {
    return { state: 'expiring', days, label: `Expires in ${days} day${days === 1 ? '' : 's'}` };
  }
  return { state: 'valid', days, label: `Valid for ${days} more days` };
}

export function isExpired(validUntil: string, now: Date = new Date()): boolean {
  return quoteValidity(validUntil, now).state === 'expired';
}

export const VALIDITY_CLASS: Record<ValidityState, string> = {
  valid: 'text-ink-muted',
  expiring: 'text-warn-700',
  expired: 'text-danger-600'
};

export const VALIDITY_BADGE: Record<ValidityState, string> = {
  valid: 'border-line bg-canvas text-ink-muted',
  expiring: 'border-warn-200 bg-warn-50 text-warn-700',
  expired: 'border-danger-200 bg-danger-50 text-danger-700'
};