import React from 'react';
import { Link } from 'react-router-dom';
import { AwardIcon, ShieldCheckIcon } from 'lucide-react';
import { anomalyAlerts, inboundQuotations, quotations as filedQuotations } from '../data/seed';
import { useProcurement } from '../contexts/ProcurementContext';
import { formatVnd, percent } from '../utils/format';

const allQuotations = [...filedQuotations, ...inboundQuotations];

export function Suppliers() {
  const { suppliers, requests, orders } = useProcurement();

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Procurement · Flow C</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Suppliers</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Reference data for the suppliers in this prototype, with the quotations and awards linked to each one. Nothing
        here can be edited — supplier onboarding is out of scope.
      </p>

      <ul className="mt-6 space-y-4">
        {suppliers.map((s) => {
          const quotes = allQuotations.filter((q) => q.supplierId === s.id);
          const awarded = requests.filter((r) =>
          quotes.some((q) => q.id === r.award?.quotationId)
          );
          const flags = anomalyAlerts.filter((a) => quotes.some((q) => q.id === a.quotationId));
          const openOrders = orders.filter((o) => o.supplierId === s.id && o.status !== 'closed');

          return (
            <li key={s.id} className="rounded-lg border border-line bg-surface shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{s.name}</h2>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-2xs font-medium ${
                      s.contracted ?
                      'border-ok-200 bg-ok-50 text-ok-700' :
                      'border-warn-200 bg-warn-50 text-warn-700'}`
                      }>
                      
                      {s.contracted ? 'Contracted' : 'New vendor'}
                    </span>
                    <span className="tabular text-2xs text-ink-subtle">{s.id}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{s.note}</p>
                  {s.certifications.length > 0 ?
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
                      <ShieldCheckIcon className="h-3.5 w-3.5 text-ink-subtle" />
                      {s.certifications.join(' · ')}
                    </p> :

                  <p className="mt-1.5 text-xs text-warn-700">No certifications on file.</p>
                  }
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Rating</dt>
                    <dd className="tabular mt-0.5 font-semibold">{s.rating.toFixed(1)}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">On time</dt>
                    <dd
                      className={`tabular mt-0.5 font-semibold ${s.onTimeRate < 0.85 ? 'text-warn-700' : ''}`}>
                      
                      {percent(s.onTimeRate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Country</dt>
                    <dd className="mt-0.5">{s.country}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Terms</dt>
                    <dd className="mt-0.5">{s.defaultPaymentTerms}</dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-4 px-4 py-4 sm:grid-cols-3 sm:px-5">
                <div>
                  <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Quotations on file ({quotes.length})
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-ink-muted">
                    {quotes.map((q) =>
                    <li key={q.id} className="tabular">
                        <Link to={`/sourcing/${q.requestId}`} className="hover:text-brand-600">
                          {q.id} · {q.requestId} · {formatVnd(q.total)}
                        </Link>
                      </li>
                    )}
                    {quotes.length === 0 ? <li>None.</li> : null}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                    <AwardIcon className="h-3 w-3" /> Awarded ({awarded.length})
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-ink-muted">
                    {awarded.map((r) =>
                    <li key={r.id}>
                        <Link to={`/requests/${r.id}`} className="hover:text-brand-600">
                          {r.id} · {r.title}
                        </Link>
                      </li>
                    )}
                    {awarded.length === 0 ? <li>None.</li> : null}
                  </ul>
                  {openOrders.length > 0 ?
                  <p className="mt-1.5 text-xs text-info-700">
                      {openOrders.length} open purchase order{openOrders.length === 1 ? '' : 's'}
                    </p> :
                  null}
                </div>
                <div>
                  <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Anomaly flags ({flags.length})
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    {flags.map((f) =>
                    <li key={f.id} className={f.severity === 'high' ? 'text-danger-600' : 'text-warn-700'}>
                        {f.title}
                      </li>
                    )}
                    {flags.length === 0 ? <li className="text-ink-muted">None.</li> : null}
                  </ul>
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}