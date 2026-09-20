import React from 'react';

const ASSUMPTIONS: Array<{topic: string;assumption: string;confirm: string;}> = [
{
  topic: 'Currency',
  assumption: 'All amounts are VND. Quotations received in USD are converted at one fixed sample rate.',
  confirm: 'Which FX rate source and date applies, and whether multi-currency purchase orders are allowed.'
},
{
  topic: 'Approval levels',
  assumption:
  'One approval level: the department manager. Finance only joins when a request exceeds the remaining budget.',
  confirm: 'Whether approval thresholds by amount exist, and who approves above the manager.'
},
{
  topic: 'Budget model',
  assumption: 'Budget is held per category per quarter, and available = allocated − spent − committed.',
  confirm: 'Whether budget is held by department, project or cost centre instead of category.'
},
{
  topic: 'Roles and access',
  assumption:
  'Employee, Manager, Finance and Procurement are shown as queues in one workspace, with no authentication.',
  confirm: 'The real permission model, delegation and out-of-office cover.'
},
{
  topic: 'Terminal state',
  assumption: 'An awarded state was added after supplier selection, because the required state list has no end state.',
  confirm: 'What follows selection: purchase order, contract, goods receipt, invoice matching.'
},
{
  topic: 'Quotation intake',
  assumption:
  'Procurement picks a supplier and uploads one quotation file (PDF, PNG or JPEG, up to 10 MB). One quotation per supplier per request.',
  confirm: 'Whether quotations also arrive by email or portal, and whether a supplier may submit a revised quote.'
},
{
  topic: 'File reading',
  assumption:
  'There is no real OCR or document parsing. The upload is matched to the sample quotation on file for that supplier and request; if none exists, the upload fails rather than inventing figures.',
  confirm: 'How extraction will really work, and who reviews extracted figures before they are trusted.'
},
{
  topic: 'Comparison threshold',
  assumption: 'A comparison table is shown once at least two quotations are linked to a request.',
  confirm: 'The real minimum number of quotations, and whether it varies by request value.'
},
{
  topic: 'File storage',
  assumption:
  'Uploaded files are held in the browser session only — file name, type and size are recorded for traceability, and the file itself is not stored or re-openable.',
  confirm: 'Where quotation documents must be stored, and for how long.'
},
{
  topic: 'Assistant behaviour',
  assumption:
  'Analyses and recommendations are fixed sample results with fixed scoring weights, not live model output.',
  confirm: 'Whether weights are configurable per category, and what evidence must be shown with a recommendation.'
},
{
  topic: 'Error handling',
  assumption: 'The error state is modelled as a failed ERP posting during submit, with a retry action.',
  confirm: 'The real failure modes to design for, and whether retries are automatic.'
},
{
  topic: 'Editing a request',
  assumption:
  'A request can only be edited while it is a draft, after a revision is requested, or after a failed submission. Once it is with an approver it is locked, and the fields that changed are listed on the timeline when it is resubmitted.',
  confirm: 'Whether an approver may edit a request directly, and whether resubmission always returns to the same approver.'
},
{
  topic: 'Quotation validity',
  assumption:
  'A quotation lapses after its stated valid-until date. Expired quotations stay visible in the comparison for reference but cannot be awarded and cannot back a purchase order. A quote within 7 days of lapsing is flagged as expiring.',
  confirm: 'The real grace period, and whether a supplier can extend a quote without reissuing it.'
},
{
  topic: 'Confirmation steps',
  assumption:
  'Approve, reject, request revision, budget decisions, supplier selection, purchase order creation, receiving and closing all require a confirmation step. None of them can be undone afterwards.',
  confirm: 'Which actions genuinely need to be reversible, and who is allowed to reverse them.'
},
{
  topic: 'Purchase order',
  assumption:
  'One purchase order per request, raised from a single awarded quotation and numbered PO-2026-0xx in sequence.',
  confirm: 'Whether a request can be split across several suppliers or several orders.'
},
{
  topic: 'Receiving',
  assumption:
  'Receiving is recorded at order level as complete or partial with a note. There is no line-item receiving and no invoice matching.',
  confirm: 'Who is allowed to record receipt, and what happens after a partial delivery.'
},
{
  topic: 'Closing an order',
  assumption:
  'Procurement closes an order once goods are recorded as received. No invoice or payment is required first.',
  confirm: 'The real condition for closing, and whether a partial delivery can be closed.'
},
{
  topic: 'Anomaly alerts',
  assumption:
  'Alerts are derived from the sample price baselines shown with each alert. An alert never removes or blocks a quotation.',
  confirm: 'The real baseline source, the deviation threshold, and who must respond to a high-severity alert.'
},
{
  topic: 'Supplier management',
  assumption:
  'Supplier records are read-only reference data with their quotation and award history. No onboarding or editing.',
  confirm: 'Who owns supplier records, and what approval a new supplier needs before a quote counts.'
},
{
  topic: 'Out of scope',
  assumption:
  'No notifications, attachments, audit export, contract terms or localisation are included.',
  confirm: 'Which of these belong in the first release.'
}];


const EXCLUDED = [
'Inventory management',
'Supplier payment',
'Contract management',
'ERP / accounting integration',
'Mobile app',
'Supplier portal',
'Demand forecasting'];


export function Assumptions() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Prototype</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Assumptions to confirm</h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        These are decisions the prototype had to make that the requirements do not cover. They are recorded here
        rather than folded into the requirements, and none of them should be treated as agreed.
      </p>

      <ol className="mt-6 space-y-3">
        {ASSUMPTIONS.map((a, index) =>
        <li key={a.topic} className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <div className="flex items-baseline gap-3">
              <span className="tabular text-xs font-semibold text-ink-subtle">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="text-sm font-semibold">{a.topic}</h2>
            </div>
            <p className="mt-2 pl-8 text-sm leading-relaxed">{a.assumption}</p>
            <p className="mt-1.5 pl-8 text-xs leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">Needs confirmation:</span> {a.confirm}
            </p>
          </li>
        )}
      </ol>

      <section className="mt-8 rounded-lg border border-line bg-surface p-4 shadow-card">
        <h2 className="text-sm font-semibold">Deliberately not built</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Named as outside the MVP, so nothing in this prototype implies them.
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {EXCLUDED.map((x) =>
          <li
            key={x}
            className="rounded border border-line bg-canvas px-2 py-1 text-xs text-ink-muted line-through decoration-line-strong">
            
              {x}
            </li>
          )}
        </ul>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-raised p-4">
        <h2 className="text-sm font-semibold">Guardrails held throughout</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-muted">
          <li>· The assistant never approves, rejects or awards. Every decision is recorded against a named person.</li>
          <li>· Supplier, quotation and budget figures come only from the supplied sample data.</li>
          <li>· Suggested field values must be accepted by the requester before they appear on a request.</li>
          <li>· A recommendation always shows its weights, its risks and the data it is missing.</li>
          <li>
            · Anomaly alerts explain the baseline they came from and never remove a quotation from the comparison.
          </li>
          <li>
            · The workflow runs in one direction only: request → approve → quotations → compare → purchase order →
            receive → close.
          </li>
        </ul>
      </section>
    </div>);

}