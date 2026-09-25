import React, { useMemo, useState } from 'react';
import { CheckIcon, PlusIcon, SparklesIcon, Trash2Icon, XIcon } from 'lucide-react';
import { AssistantCard } from './AssistantCard';
import { SelectField, TextAreaField, TextField } from './Field';
import { CATEGORIES, DEPARTMENTS, aiFieldSuggestions, budgetLines } from '../data/seed';
import { useProcurement, type NewRequestPayload } from '../contexts/ProcurementContext';
import type { LineItem } from '../types/procurement';
import { formatVnd } from '../utils/format';
import { normalizeFreeText, type NormalizedDraft } from '../utils/normalize';

export interface RequestFormValues {
  title: string;
  category: string;
  department: string;
  costCenter: string;
  neededBy: string;
  deliveryLocation: string;
  justification: string;
  items: LineItem[];
}

type FieldState = Omit<RequestFormValues, 'items'>;

const REQUIRED: Array<{key: keyof FieldState;label: string;}> = [
{ key: 'title', label: 'Request title' },
{ key: 'category', label: 'Category' },
{ key: 'department', label: 'Department' },
{ key: 'costCenter', label: 'Cost centre' },
{ key: 'neededBy', label: 'Required-by date' },
{ key: 'deliveryLocation', label: 'Delivery location' },
{ key: 'justification', label: 'Business justification' }];


let itemSeq = 0;
export const newLineItem = (): LineItem => {
  itemSeq += 1;
  return { id: `li-new-${itemSeq}`, description: '', qty: 1, uom: 'unit', estUnitPrice: 0 };
};

export function RequestForm({
  mode,
  initialValues,
  showIntake = mode === 'create',
  banner,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onCancel










}: {mode: 'create' | 'edit';initialValues: RequestFormValues;showIntake?: boolean;banner?: React.ReactNode;primaryLabel: string;secondaryLabel: string;onPrimary: (payload: NewRequestPayload, changeSummary: string[]) => void;onSecondary: (payload: NewRequestPayload, changeSummary: string[]) => void;onCancel?: () => void;}) {
  const { aiAssistEnabled } = useProcurement();

  const [form, setForm] = useState<FieldState>({
    title: initialValues.title,
    category: initialValues.category,
    department: initialValues.department,
    costCenter: initialValues.costCenter,
    neededBy: initialValues.neededBy,
    deliveryLocation: initialValues.deliveryLocation,
    justification: initialValues.justification
  });
  const [items, setItems] = useState<LineItem[]>(
    initialValues.items.length > 0 ? initialValues.items : [newLineItem()]
  );
  const [note, setNote] = useState('');
  const [proposal, setProposal] = useState<NormalizedDraft | null>(null);
  const [applied, setApplied] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const set = (key: keyof FieldState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const estimatedTotal = items.reduce((sum, i) => sum + i.qty * i.estUnitPrice, 0);
  const itemErrors = items.some((i) => !i.description.trim() || i.qty <= 0 || i.estUnitPrice <= 0);
  const missing = REQUIRED.filter((r) => form[r.key].trim() === '');
  const canSubmit = missing.length === 0 && !itemErrors;

  const suggestions = useMemo(() => {
    if (!aiAssistEnabled) return [];
    const pool = aiFieldSuggestions[form.department] ?? [];
    return pool.filter(
      (s) => form[s.field as keyof FieldState] === '' && !dismissed.includes(s.field) && !applied.includes(s.field)
    );
  }, [aiAssistEnabled, form, dismissed, applied]);

  const unsuggestable = missing.filter(
    (m) => !(aiFieldSuggestions[form.department] ?? []).some((s) => s.field === m.key)
  );

  const budget = budgetLines.find((b) => b.category === form.category);
  const available = budget ? budget.allocated - budget.spent - budget.committed : null;
  const overBudget = available !== null && estimatedTotal > available;

  const changeSummary = useMemo(() => {
    const changes: string[] = [];
    REQUIRED.forEach((r) => {
      if (form[r.key].trim() !== (initialValues[r.key] ?? '').trim()) changes.push(r.label);
    });
    const before = initialValues.items;
    const itemsChanged =
    before.length !== items.length ||
    items.some((i, index) => {
      const b = before[index];
      return !b || b.description !== i.description || b.qty !== i.qty || b.estUnitPrice !== i.estUnitPrice;
    });
    if (itemsChanged) changes.push('Line items');
    return changes;
  }, [form, items, initialValues]);

  const buildPayload = (): NewRequestPayload => ({
    title: form.title || 'Untitled request',
    category: form.category,
    department: form.department,
    costCenter: form.costCenter,
    neededBy: form.neededBy,
    deliveryLocation: form.deliveryLocation,
    justification: form.justification,
    items,
    aiSuggestionsApplied: applied
  });

  const handlePrimary = () => {
    setSubmitAttempted(true);
    if (!canSubmit) return;
    onPrimary(buildPayload(), changeSummary);
  };

  const handleNormalize = () => {
    if (note.trim().length < 4) return;
    setProposal(normalizeFreeText(note));
  };

  const applyProposal = () => {
    if (!proposal) return;
    setForm((f) => ({
      ...f,
      title: proposal.title || f.title,
      category: proposal.category || f.category
    }));
    if (proposal.items.length > 0) setItems(proposal.items);
    setApplied((a) => a.includes('normalisation') ? a : [...a, 'normalisation']);
    setProposal(null);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        {banner}

        {showIntake && aiAssistEnabled ?
        <AssistantCard
          title="Start from a note"
          subtitle="Paste what you would have written in an email. Nothing is added that is not in your note."
          footer="The assistant only restructures your own words. It never fills in prices, dates or approvers on its own.">
          
            <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Free-text request note"
            placeholder="e.g. need 15 laptops 32gb ram at 18.5m each for eng onboarding, plus 15 usb-c docks at 1.5m"
            className="w-full resize-y rounded border border-brand-200 bg-surface px-2.5 py-2 text-sm leading-relaxed placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500" />
          
            <div className="mt-2 flex items-center gap-2">
              <button
              type="button"
              onClick={handleNormalize}
              disabled={note.trim().length < 4}
              className="inline-flex items-center gap-1.5 rounded bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-subtle">
              
                <SparklesIcon className="h-3.5 w-3.5" />
                Structure this note
              </button>
              {applied.includes('normalisation') ?
            <span className="text-xs text-ok-700">Applied to the form below.</span> :
            null}
            </div>

            {proposal ?
          <div className="mt-3 rounded border border-brand-200 bg-surface p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Proposed structure</p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-xs text-ink-subtle">Title</dt>
                    <dd className="font-medium">{proposal.title || '—'}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-xs text-ink-subtle">Category</dt>
                    <dd className="font-medium">{proposal.category || 'not determined'}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-xs text-ink-subtle">Items</dt>
                    <dd className="space-y-1">
                      {proposal.items.map((i) =>
                  <p key={i.id} className="tabular">
                          {i.qty} {i.uom} · {i.description} ·{' '}
                          {i.estUnitPrice > 0 ?
                    formatVnd(i.estUnitPrice) :

                    <span className="text-warn-700">price missing</span>
                    }
                        </p>
                  )}
                      {proposal.items.length === 0 ? <p className="text-ink-muted">none detected</p> : null}
                    </dd>
                  </div>
                </dl>
                {proposal.notes.length > 0 ?
            <ul className="mt-2.5 space-y-1 border-t border-line pt-2.5 text-xs text-ink-muted">
                    {proposal.notes.map((n) =>
              <li key={n}>· {n}</li>
              )}
                  </ul> :
            null}
                {proposal.unresolved.length > 0 ?
            <ul className="mt-2 space-y-1 text-xs text-warn-700">
                    {proposal.unresolved.map((n) =>
              <li key={n}>! Still needed from you: {n}</li>
              )}
                  </ul> :
            null}
                <div className="mt-3 flex gap-2">
                  <button
                type="button"
                onClick={applyProposal}
                className="inline-flex items-center gap-1.5 rounded border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
                
                    <CheckIcon className="h-3.5 w-3.5" /> Apply to form
                  </button>
                  <button
                type="button"
                onClick={() => setProposal(null)}
                className="rounded border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas">
                
                    Discard
                  </button>
                </div>
              </div> :
          null}
          </AssistantCard> :
        null}

        <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-semibold">Request details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                id="title"
                label="Request title"
                required
                value={form.title}
                onChange={(v) => set('title', v)}
                error={submitAttempted && !form.title ? 'Required before submitting.' : undefined}
                placeholder="Laptops for engineering onboarding" />
              
            </div>
            <SelectField
              id="category"
              label="Category"
              required
              value={form.category}
              onChange={(v) => set('category', v)}
              options={CATEGORIES}
              error={submitAttempted && !form.category ? 'Required before submitting.' : undefined} />
            
            <SelectField
              id="department"
              label="Department"
              required
              value={form.department}
              onChange={(v) => set('department', v)}
              options={DEPARTMENTS} />
            
            <TextField
              id="costCenter"
              label="Cost centre"
              required
              value={form.costCenter}
              onChange={(v) => set('costCenter', v)}
              error={submitAttempted && !form.costCenter ? 'Required before submitting.' : undefined}
              placeholder="CC-…" />
            
            <TextField
              id="neededBy"
              label="Required by"
              required
              type="date"
              value={form.neededBy}
              onChange={(v) => set('neededBy', v)}
              error={submitAttempted && !form.neededBy ? 'Required before submitting.' : undefined} />
            
            <div className="sm:col-span-2">
              <TextField
                id="deliveryLocation"
                label="Delivery location"
                required
                value={form.deliveryLocation}
                onChange={(v) => set('deliveryLocation', v)}
                error={submitAttempted && !form.deliveryLocation ? 'Required before submitting.' : undefined}
                placeholder="HQ Hanoi · Floor 6 · Goods-in" />
              
            </div>
            <div className="sm:col-span-2">
              <TextAreaField
                id="justification"
                label="Business justification"
                required
                value={form.justification}
                onChange={(v) => set('justification', v)}
                error={submitAttempted && !form.justification ? 'Required before submitting.' : undefined}
                hint="Approvers read this first"
                placeholder="Why this is needed, and what happens if it is not bought." />
              
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface shadow-card">
          <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold">Line items</h2>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, newLineItem()])}
              className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
              
              <PlusIcon className="h-3.5 w-3.5" /> Add item
            </button>
          </header>
          <div className="divide-y divide-line/70">
            {items.map((item, index) =>
            <div key={item.id} className="grid gap-3 px-4 py-3 sm:grid-cols-12 sm:px-5">
                <div className="sm:col-span-6">
                  <TextField
                  id={`desc-${item.id}`}
                  label={`Item ${index + 1} description`}
                  value={item.description}
                  onChange={(v) =>
                  setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, description: v } : i))
                  }
                  error={submitAttempted && !item.description.trim() ? 'Required.' : undefined} />
                
                </div>
                <div className="sm:col-span-2">
                  <TextField
                  id={`qty-${item.id}`}
                  label="Qty"
                  type="number"
                  value={String(item.qty)}
                  onChange={(v) =>
                  setItems((prev) =>
                  prev.map((i) => i.id === item.id ? { ...i, qty: Math.max(0, Number(v) || 0) } : i)
                  )
                  }
                  error={submitAttempted && item.qty <= 0 ? 'Min 1.' : undefined} />
                
                </div>
                <div className="sm:col-span-3">
                  <TextField
                  id={`price-${item.id}`}
                  label="Est. unit price (₫)"
                  type="number"
                  value={String(item.estUnitPrice)}
                  onChange={(v) =>
                  setItems((prev) =>
                  prev.map((i) => i.id === item.id ? { ...i, estUnitPrice: Math.max(0, Number(v) || 0) } : i)
                  )
                  }
                  error={submitAttempted && item.estUnitPrice <= 0 ? 'Required.' : undefined} />
                
                </div>
                <div className="flex items-end sm:col-span-1">
                  <button
                  type="button"
                  onClick={() => setItems((prev) => prev.length > 1 ? prev.filter((i) => i.id !== item.id) : prev)}
                  disabled={items.length === 1}
                  aria-label={`Remove item ${index + 1}`}
                  className="rounded border border-line p-2 text-ink-subtle transition-colors duration-150 ease-exp hover:bg-danger-50 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40">
                  
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <footer className="flex items-baseline justify-between border-t border-line px-4 py-3 sm:px-5">
            <span className="text-sm text-ink-muted">Estimated total</span>
            <span className="tabular text-lg font-semibold">{formatVnd(estimatedTotal)}</span>
          </footer>
        </section>
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-lg border border-line bg-surface p-4 shadow-card">
          <h2 className="text-sm font-semibold">Before you submit</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {REQUIRED.map((r) => {
              const ok = form[r.key].trim() !== '';
              return (
                <li key={r.key} className="flex items-center gap-2">
                  {ok ?
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-ok-600" /> :

                  <XIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                  }
                  <span className={ok ? 'text-ink-muted' : 'text-ink'}>{r.label}</span>
                </li>);

            })}
            <li className="flex items-center gap-2">
              {!itemErrors ?
              <CheckIcon className="h-3.5 w-3.5 shrink-0 text-ok-600" /> :

              <XIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
              }
              <span className={itemErrors ? 'text-ink' : 'text-ink-muted'}>Line items priced</span>
            </li>
          </ul>
        </section>

        {mode === 'edit' ?
        <section className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <h2 className="text-sm font-semibold">Changes on this edit</h2>
            {changeSummary.length === 0 ?
          <p className="mt-1.5 text-xs text-ink-muted">Nothing changed yet.</p> :

          <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                {changeSummary.map((c) =>
            <li key={c}>· {c}</li>
            )}
              </ul>
          }
            <p className="mt-2 text-xs text-ink-subtle">
              This list is recorded on the request so the approver can see what moved.
            </p>
          </section> :
        null}

        {aiAssistEnabled && (suggestions.length > 0 || unsuggestable.length > 0) ?
        <AssistantCard
          title="Missing information"
          subtitle={`${missing.length} required field${missing.length === 1 ? '' : 's'} still empty.`}>
          
            <ul className="space-y-2.5">
              {suggestions.map((s) =>
            <li key={s.field} className="rounded border border-brand-200 bg-surface p-2.5">
                  <p className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">{s.label}</p>
                  <p className="mt-0.5 text-sm font-medium">{s.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{s.basis}</p>
                  <div className="mt-2 flex gap-1.5">
                    <button
                  type="button"
                  onClick={() => {
                    set(s.field as keyof FieldState, s.value);
                    setApplied((a) => [...a, s.field]);
                  }}
                  className="rounded bg-brand-500 px-2 py-1 text-2xs font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
                  
                      Use this
                    </button>
                    <button
                  type="button"
                  onClick={() => setDismissed((d) => [...d, s.field])}
                  className="rounded border border-line bg-surface px-2 py-1 text-2xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas">
                  
                      Dismiss
                    </button>
                  </div>
                </li>
            )}
              {unsuggestable.map((m) =>
            <li key={m.key} className="flex gap-2 text-xs leading-relaxed text-ink-muted">
                  <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                  <span>
                    <span className="font-semibold text-ink">{m.label}</span> — no suggestion. Only you can decide
                    this.
                  </span>
                </li>
            )}
            </ul>
          </AssistantCard> :
        null}

        {budget && available !== null ?
        <section
          className={`rounded-lg border p-4 shadow-card ${
          overBudget ? 'border-warn-200 bg-warn-50' : 'border-line bg-surface'}`
          }>
          
            <h2 className="text-sm font-semibold">{overBudget ? 'Likely budget warning' : 'Budget check preview'}</h2>
            <dl className="mt-2.5 space-y-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-muted">{budget.category} available</dt>
                <dd className="tabular font-medium">{formatVnd(available)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-muted">This request</dt>
                <dd className="tabular font-medium">{formatVnd(estimatedTotal)}</dd>
              </div>
            </dl>
            {overBudget ?
          <p className="mt-2.5 text-xs leading-relaxed text-warn-700">
                Submitting will raise a budget warning and route the request to Finance before your manager can
                approve it.
              </p> :
          null}
          </section> :
        null}

        {submitAttempted && !canSubmit ?
        <div
          role="alert"
          className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-xs leading-relaxed text-danger-700">
          
            This request cannot be submitted yet. Fill the {missing.length} highlighted field
            {missing.length === 1 ? '' : 's'}
            {itemErrors ? ' and complete every line item' : ''}.
          </div> :
        null}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePrimary}
            className="rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
            
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={() => onSecondary(buildPayload(), changeSummary)}
            className="rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
            
            {secondaryLabel}
          </button>
          {onCancel ?
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-2 text-xs font-semibold text-ink-subtle transition-colors duration-150 ease-exp hover:text-ink">
            
              Cancel and go back
            </button> :
          null}
        </div>
      </div>
    </div>);

}