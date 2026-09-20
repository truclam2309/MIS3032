import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  FileTextIcon,
  Loader2Icon,
  UploadCloudIcon } from
'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowProgress } from '../components/WorkflowProgress';
import type { Quotation, QuotationAttachment } from '../types/procurement';
import { formatDate, formatOriginal, formatVnd, nowIso } from '../utils/format';

type Phase = 'idle' | 'uploading' | 'extracting' | 'review' | 'error';

const MAX_KB = 10_240;
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg'];

export function QuotationCollection() {
  const { id = '' } = useParams();
  const { getRequest, suppliers, quotationsFor, findInboundQuotation, linkQuotation, getSupplier } = useProcurement();
  const request = getRequest(id);
  const quotes = quotationsFor(id);

  const [supplierId, setSupplierId] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [fileName, setFileName] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState(0);
  const [fileType, setFileType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [candidate, setCandidate] = useState<Quotation | null>(null);
  const [justLinked, setJustLinked] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-line bg-surface p-10 text-center">
        <h1 className="text-lg font-semibold">Request not found</h1>
        <Link to="/sourcing" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          Back to sourcing
        </Link>
      </div>);

  }

  const linkedSupplierIds = quotes.map((q) => q.supplierId);
  const selectedSupplier = getSupplier(supplierId);

  const reset = () => {
    setPhase('idle');
    setCandidate(null);
    setErrorMessage('');
    setFileName('');
    setFileSizeKb(0);
    setFileType('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (file: File) => {
    setJustLinked('');
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    setFileName(file.name);
    setFileSizeKb(sizeKb);
    setFileType(file.type);

    if (!ACCEPTED.includes(file.type)) {
      setErrorMessage(
        `“${file.name}” is not a supported quotation file. Upload a PDF, PNG or JPEG of the supplier quotation.`
      );
      setPhase('error');
      return;
    }
    if (sizeKb > MAX_KB) {
      setErrorMessage(`“${file.name}” is ${Math.round(sizeKb / 1024)} MB. The limit for a quotation file is 10 MB.`);
      setPhase('error');
      return;
    }

    setPhase('uploading');
    window.setTimeout(() => {
      if (!mounted.current) return;
      setPhase('extracting');
      window.setTimeout(() => {
        if (!mounted.current) return;
        const found = findInboundQuotation(request.id, supplierId);
        if (!found) {
          setErrorMessage(
            `No quotation figures could be produced for ${
            selectedSupplier?.name ?? 'this supplier'} on ${
            request.id}. This prototype only uses the supplied sample quotations and will not invent prices, lead times or terms.`
          );
          setPhase('error');
          return;
        }
        setCandidate(found);
        setPhase('review');
      }, 900);
    }, 600);
  };

  const confirmLink = () => {
    if (!candidate) return;
    const attachment: QuotationAttachment = {
      fileName,
      mimeType: fileType,
      sizeKb: fileSizeKb,
      uploadedAt: nowIso(),
      uploadedBy: 'Trịnh Đức Kiên (Procurement)'
    };
    linkQuotation(request.id, candidate.id, attachment);
    setJustLinked(candidate.id);
    setSupplierId('');
    reset();
  };

  const busy = phase === 'uploading' || phase === 'extracting';
  const canCompare = quotes.length >= 2;

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to={`/requests/${request.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> {request.id}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <span className="tabular text-xs text-ink-subtle">{request.id}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Collect quotations</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {request.title} · approved estimate {formatVnd(request.estimatedTotal)} · needed by{' '}
            {formatDate(request.neededBy)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-surface p-4 shadow-card">
        <WorkflowProgress status={request.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-5">
          {justLinked ?
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-ok-200 bg-ok-50 px-4 py-3 text-sm text-ok-700">
            
              <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {justLinked} is linked to {request.id} and normalised. Collect another quotation, or open the
                comparison once at least two are in.
              </p>
            </div> :
          null}

          <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
            <div className="flex items-baseline gap-2">
              <span className="tabular text-xs font-semibold text-ink-subtle">01</span>
              <h2 className="text-sm font-semibold">Choose the supplier this quotation came from</h2>
            </div>
            <fieldset className="mt-3" disabled={busy}>
              <legend className="sr-only">Supplier</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {suppliers.map((s) => {
                  const already = linkedSupplierIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-start gap-2.5 rounded border p-3 transition-colors duration-150 ease-exp ${
                      already ?
                      'cursor-not-allowed border-line bg-canvas' :
                      supplierId === s.id ?
                      'cursor-pointer border-brand-500 bg-brand-50/50' :
                      'cursor-pointer border-line hover:bg-raised'}`
                      }>
                      
                      <input
                        type="radio"
                        name="supplier"
                        className="mt-1"
                        value={s.id}
                        disabled={already || busy}
                        checked={supplierId === s.id}
                        onChange={() => {
                          setSupplierId(s.id);
                          reset();
                        }} />
                      
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{s.name}</span>
                        <span className="tabular mt-0.5 block text-2xs text-ink-subtle">
                          {s.id} · rating {s.rating.toFixed(1)} · {s.defaultPaymentTerms}
                        </span>
                        {already ?
                        <span className="mt-1 block text-2xs font-semibold text-ok-700">
                            Quotation already linked
                          </span> :
                        null}
                      </span>
                    </label>);

                })}
              </div>
            </fieldset>
            <p className="mt-2.5 text-xs text-ink-subtle">
              One quotation per supplier per request. Supplier records are read-only.
            </p>
          </section>

          <section
            className={`rounded-lg border bg-surface p-4 shadow-card sm:p-5 ${
            supplierId ? 'border-line' : 'border-line opacity-60'}`
            }>
            
            <div className="flex items-baseline gap-2">
              <span className="tabular text-xs font-semibold text-ink-subtle">02</span>
              <h2 className="text-sm font-semibold">Upload the quotation file</h2>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (supplierId && !busy) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!supplierId || busy) return;
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`mt-3 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors duration-150 ease-exp ${
              dragging ? 'border-brand-500 bg-brand-50/60' : 'border-line-strong bg-raised'}`
              }>
              
              <UploadCloudIcon className="mx-auto h-6 w-6 text-ink-subtle" />
              <p className="mt-2 text-sm font-medium">Drop the quotation PDF or image here</p>
              <p className="mt-1 text-xs text-ink-muted">PDF, PNG or JPEG · up to 10 MB</p>
              <button
                type="button"
                disabled={!supplierId || busy}
                onClick={() => inputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-1.5 rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition-colors duration-150 ease-exp hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink-subtle">
                
                Choose file
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="sr-only"
                aria-label="Quotation file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }} />
              
              {!supplierId ?
              <p className="mt-3 text-xs text-warn-700">Choose a supplier first so the quotation can be linked.</p> :
              null}
            </div>

            {busy ?
            <div className="mt-3 flex items-center gap-2 rounded border border-brand-200 bg-brand-50/60 px-3 py-2.5 text-sm text-brand-700">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span className="tabular truncate">
                  {phase === 'uploading' ? 'Uploading' : 'Reading and normalising'} {fileName}…
                </span>
              </div> :
            null}

            {phase === 'error' ?
            <div
              role="alert"
              className="mt-3 rounded border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
              
                <p className="flex items-start gap-2 font-semibold">
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  Quotation could not be created
                </p>
                <p className="mt-1.5 leading-relaxed">{errorMessage}</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded border border-danger-200 bg-surface px-2.5 py-1.5 text-xs font-semibold text-danger-700 transition-colors duration-150 ease-exp hover:bg-danger-50">
                  
                    Try another file
                  </button>
                  <button
                  type="button"
                  onClick={reset}
                  className="rounded border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas">
                  
                    Dismiss
                  </button>
                </div>
              </div> :
            null}
          </section>

          {phase === 'review' && candidate ?
          <section className="rounded-lg border border-brand-200 bg-surface shadow-card">
              <header className="border-b border-brand-200 bg-brand-50 px-4 py-3 sm:px-5">
                <div className="flex items-baseline gap-2">
                  <span className="tabular text-xs font-semibold text-brand-700">03</span>
                  <h2 className="text-sm font-semibold text-brand-700">Check what was read from the file</h2>
                </div>
                <p className="tabular mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  {fileName} · {fileSizeKb} KB · {selectedSupplier?.name}
                </p>
              </header>
              <div className="px-4 py-4 sm:px-5">
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">As quoted</dt>
                    <dd className="tabular mt-0.5 text-sm">
                      {formatOriginal(candidate.originalCurrency, candidate.originalTotal)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Unit price</dt>
                    <dd className="tabular mt-0.5 text-sm">{formatVnd(candidate.unitPrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Quantity</dt>
                    <dd className="tabular mt-0.5 text-sm">{candidate.qty}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Tax</dt>
                    <dd className="tabular mt-0.5 text-sm">{formatVnd(candidate.tax)}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Shipping</dt>
                    <dd className="tabular mt-0.5 text-sm">
                      {candidate.shipping === 0 ? 'included' : formatVnd(candidate.shipping)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Landed total</dt>
                    <dd className="tabular mt-0.5 text-sm font-semibold">{formatVnd(candidate.total)}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Lead time</dt>
                    <dd className="tabular mt-0.5 text-sm">{candidate.leadTimeDays} days</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Warranty</dt>
                    <dd className="tabular mt-0.5 text-sm">{candidate.warrantyMonths} months</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Payment terms</dt>
                    <dd className="mt-0.5 text-sm">{candidate.paymentTerms}</dd>
                  </div>
                </dl>

                <div className="mt-4 border-t border-line/70 pt-3">
                  <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Normalisation applied
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-ink-muted">
                    {candidate.normalizationNotes.map((n) =>
                  <li key={n}>· {n}</li>
                  )}
                  </ul>
                  {candidate.missingFields.length > 0 ?
                <p className="mt-2 text-xs text-warn-700">
                      Not stated on the file: {candidate.missingFields.join('; ')}. These stay flagged in the
                      comparison.
                    </p> :
                null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                  type="button"
                  onClick={confirmLink}
                  className="inline-flex items-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
                  
                    <CheckIcon className="h-4 w-4" /> Link quotation to {request.id}
                  </button>
                  <button
                  type="button"
                  onClick={reset}
                  className="rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
                  
                    Discard
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink-subtle">
                  Figures come from the quotation on file. Nothing is written to the request until you link it.
                </p>
              </div>
            </section> :
          null}
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <h2 className="text-sm font-semibold">Collected so far</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {quotes.length} of {suppliers.length} suppliers
            </p>
            <ul className="mt-3 space-y-2">
              {quotes.map((q) =>
              <li key={q.id} className="rounded border border-line px-2.5 py-2">
                  <p className="text-xs font-semibold">{getSupplier(q.supplierId)?.name}</p>
                  <p className="tabular mt-0.5 text-2xs text-ink-subtle">
                    {q.id} · {formatVnd(q.total)}
                  </p>
                  {q.attachment ?
                <p className="tabular mt-0.5 truncate text-2xs text-ink-subtle">{q.attachment.fileName}</p> :
                null}
                </li>
              )}
              {quotes.length === 0 ? <li className="text-xs text-ink-muted">Nothing linked yet.</li> : null}
            </ul>

            <div className="mt-4 border-t border-line/70 pt-3">
              {canCompare ?
              <Link
                to={`/sourcing/${request.id}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp hover:bg-brand-600">
                
                  Open comparison <ArrowRightIcon className="h-4 w-4" />
                </Link> :

              <p className="text-xs leading-relaxed text-ink-muted">
                  A comparison is shown once at least two quotations are linked. {2 - quotes.length} more to go.
                </p>
              }
            </div>
          </section>

          <section className="rounded-lg border border-line bg-raised p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">How this works</h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-muted">
              <li>· The file is attached to the quotation record for traceability.</li>
              <li>· Currency, tax and shipping are aligned so totals are comparable.</li>
              <li>· Anything not stated on the file is flagged, never guessed.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>);

}