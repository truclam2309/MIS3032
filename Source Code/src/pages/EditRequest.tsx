import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, LockIcon, RotateCcwIcon } from 'lucide-react';
import { RequestForm } from '../components/RequestForm';
import { StatusBadge } from '../components/StatusBadge';
import { useProcurement } from '../contexts/ProcurementContext';
import { formatDateTime } from '../utils/format';

const EDITABLE = ['draft', 'revision-required', 'error'];

export function EditRequest() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getRequest, updateRequest } = useProcurement();
  const request = getRequest(id);

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-line bg-surface p-10 text-center">
        <h1 className="text-lg font-semibold">Request not found</h1>
        <Link to="/requests" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          Back to requests
        </Link>
      </div>);

  }

  if (!EDITABLE.includes(request.status)) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-line bg-surface p-8 text-center shadow-card">
        <LockIcon className="mx-auto h-5 w-5 text-ink-subtle" />
        <h1 className="mt-2 text-lg font-semibold">This request is locked</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">
          {request.id} is <span className="font-medium text-ink">{request.status.replace('-', ' ')}</span>. A request
          can only be edited while it is a draft, after a revision is requested, or after a failed submission — so
          that what an approver reviewed cannot change underneath them.
        </p>
        <Link
          to={`/requests/${request.id}`}
          className="mt-5 inline-flex items-center gap-1.5 rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
          
          Back to the request
        </Link>
      </div>);

  }

  const isRevision = request.status === 'revision-required';
  const isError = request.status === 'error';

  const banner = isRevision ?
  <section className="rounded-lg border border-warn-200 bg-warn-50 p-4 shadow-card sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-warn-700">
        <RotateCcwIcon className="h-4 w-4" /> What the approver asked for
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink">{request.decision?.note}</p>
      <p className="mt-1.5 text-xs text-ink-muted">
        {request.decision?.by} · {request.decision ? formatDateTime(request.decision.at) : ''}
      </p>
    </section> :
  isError ?
  <section className="rounded-lg border border-danger-200 bg-danger-50 p-4 shadow-card sm:p-5">
      <h2 className="text-sm font-semibold text-danger-700">Previous submission failed</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink">{request.errorNote}</p>
      <p className="mt-1.5 text-xs text-ink-muted">
        Nothing reached an approver. Correct anything that needs correcting, then submit again.
      </p>
    </section> :
  undefined;

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to={`/requests/${request.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> {request.id}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={request.status} />
        <span className="tabular text-xs text-ink-subtle">{request.id}</span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit purchase request</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        {isRevision ?
        'Make the changes the approver asked for. Resubmitting sends it back to the same approver with a note on what moved.' :
        isError ?
        'Fix anything that needs fixing and submit again. The earlier attempt never reached an approver.' :
        'Keep working on this draft. Nobody sees it until you submit.'}
      </p>

      <RequestForm
        mode="edit"
        initialValues={{
          title: request.title,
          category: request.category,
          department: request.department,
          costCenter: request.costCenter,
          neededBy: request.neededBy,
          deliveryLocation: request.deliveryLocation,
          justification: request.justification,
          items: request.items
        }}
        banner={banner}
        primaryLabel={isRevision ? 'Resubmit for approval' : 'Submit for approval'}
        secondaryLabel="Save changes"
        onPrimary={(payload, changes) => {
          updateRequest(
            request.id,
            payload,
            'submit',
            changes.length > 0 ? `Changed: ${changes.join(', ')}.` : 'Resubmitted with no field changes.'
          );
          navigate(`/requests/${request.id}`);
        }}
        onSecondary={(payload, changes) => {
          updateRequest(
            request.id,
            payload,
            'save',
            changes.length > 0 ? `Changed: ${changes.join(', ')}.` : undefined
          );
          navigate(`/requests/${request.id}`);
        }}
        onCancel={() => navigate(`/requests/${request.id}`)} />
      
    </div>);

}