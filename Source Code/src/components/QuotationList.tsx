import React from 'react';
import { Link } from 'react-router-dom';
import { FileTextIcon, ImageIcon, MailIcon, PlusIcon } from 'lucide-react';
import type { Quotation, Supplier } from '../types/procurement';
import { formatDate, formatDateTime, formatOriginal, formatVnd } from '../utils/format';
import { VALIDITY_BADGE, quoteValidity } from '../utils/quotes';

const SOURCE_LABEL: Record<Quotation['source'], string> = {
  upload: 'Uploaded file',
  pdf: 'PDF on file',
  email: 'Email',
  portal: 'Supplier portal'
};

function SourceIcon({ quote }: {quote: Quotation;}) {
  if (quote.attachment?.mimeType.startsWith('image/')) return <ImageIcon className="h-3.5 w-3.5" />;
  if (quote.source === 'email') return <MailIcon className="h-3.5 w-3.5" />;
  return <FileTextIcon className="h-3.5 w-3.5" />;
}

export function QuotationList({
  quotes,
  supplierOf,
  collectHref,
  remaining





}: {quotes: Quotation[];supplierOf: (supplierId: string) => Supplier | undefined;collectHref?: string;remaining?: number;}) {
  return (
    <section className="rounded-lg border border-line bg-surface shadow-card" aria-label="Linked quotations">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold">Quotations linked to this request</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {quotes.length === 0 ?
            'None collected yet.' :
            `${quotes.length} collected${
            quotes.length < 2 ? ' — a comparison needs at least two' : ' and normalised'}.`
            }
            {typeof remaining === 'number' && remaining > 0 ?
            ` ${remaining} more quotation${remaining === 1 ? '' : 's'} on file to collect.` :
            ''}
          </p>
        </div>
        {collectHref ?
        <Link
          to={collectHref}
          className="inline-flex items-center gap-1.5 rounded bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
          
            <PlusIcon className="h-3.5 w-3.5" /> Collect quotation
          </Link> :
        null}
      </header>

      {quotes.length === 0 ?
      <p className="px-4 py-6 text-sm text-ink-muted sm:px-5">
          Upload a quotation file against a supplier to create the first linked quotation.
        </p> :

      <ul className="divide-y divide-line/70">
          {quotes.map((q) => {
          const supplier = supplierOf(q.supplierId);
          return (
            <li key={q.id} className="px-4 py-3.5 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{supplier?.name}</span>
                      <span className="tabular text-2xs text-ink-subtle">{q.id}</span>
                      <span
                      className={`rounded border px-1.5 py-0.5 text-2xs font-medium ${
                      supplier?.contracted ?
                      'border-ok-200 bg-ok-50 text-ok-700' :
                      'border-warn-200 bg-warn-50 text-warn-700'}`
                      }>
                      
                        {supplier?.contracted ? 'Contracted' : 'New vendor'}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                      <SourceIcon quote={q} />
                      <span className="font-medium">{SOURCE_LABEL[q.source]}</span>
                      {q.attachment ?
                    <>
                          <span className="tabular">
                            {q.attachment.fileName} · {q.attachment.sizeKb} KB
                          </span>
                          <span className="text-ink-subtle">{formatDateTime(q.attachment.uploadedAt)}</span>
                        </> :

                    <span className="text-ink-subtle">received {formatDate(q.receivedAt)}</span>
                    }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm font-semibold">{formatVnd(q.total)}</p>
                    <p className="tabular mt-0.5 text-2xs text-ink-subtle">
                      as quoted {formatOriginal(q.originalCurrency, q.originalTotal)}
                    </p>
                  </div>
                </div>

                <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
                  <div>
                    <dt className="text-ink-subtle">Unit price</dt>
                    <dd className="tabular mt-0.5">{formatVnd(q.unitPrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle">Lead time</dt>
                    <dd className="tabular mt-0.5">{q.leadTimeDays} days</dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle">Payment terms</dt>
                    <dd className="mt-0.5">{q.paymentTerms}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle">Valid until</dt>
                    <dd className="tabular mt-0.5">
                      {formatDate(q.validUntil)}
                      <span
                      className={`ml-1.5 rounded border px-1 py-0.5 text-2xs font-medium ${
                      VALIDITY_BADGE[quoteValidity(q.validUntil).state]}`
                      }>
                      
                        {quoteValidity(q.validUntil).label}
                      </span>
                    </dd>
                  </div>
                </dl>

                {q.normalizationNotes.length > 0 ?
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    <span className="font-semibold text-ink">Normalised: </span>
                    {q.normalizationNotes.join(' ')}
                  </p> :
              null}
                {q.missingFields.length > 0 ?
              <p className="mt-1 text-xs text-warn-700">Still missing: {q.missingFields.join('; ')}</p> :
              null}
              </li>);

        })}
        </ul>
      }
    </section>);

}