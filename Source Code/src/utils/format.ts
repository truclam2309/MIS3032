export function formatVnd(value: number): string {
  return `${new Intl.NumberFormat('en-US').format(Math.round(value))} ₫`;
}

export function formatCompactVnd(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B ₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₫`;
  return formatVnd(value);
}

export function formatOriginal(currency: 'VND' | 'USD', value: number): string {
  if (currency === 'USD') return `$${new Intl.NumberFormat('en-US').format(value)}`;
  return formatVnd(value);
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString(
    'en-GB',
    { hour: '2-digit', minute: '2-digit' }
  )}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}