import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestForm, newLineItem } from '../components/RequestForm';
import { useProcurement } from '../contexts/ProcurementContext';

export function NewRequest() {
  const navigate = useNavigate();
  const { createRequest } = useProcurement();

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Employee · Flow A</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">New purchase request</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Describe what you need. The assistant can restructure your note and offer values for missing fields — you
        decide what goes on the request.
      </p>

      <RequestForm
        mode="create"
        initialValues={{
          title: '',
          category: '',
          department: 'Engineering',
          costCenter: '',
          neededBy: '',
          deliveryLocation: '',
          justification: '',
          items: [newLineItem()]
        }}
        primaryLabel="Submit for approval"
        secondaryLabel="Save as draft"
        onPrimary={async (payload) => {
          const id = await createRequest(payload, true);
          if (id) navigate(`/requests/${id}`);
        }}
        onSecondary={async (payload) => {
          const id = await createRequest(payload, false);
          if (id) navigate(`/requests/${id}`);
        }} />
      
    </div>);

}
