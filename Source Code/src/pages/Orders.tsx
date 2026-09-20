import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PackageCheckIcon, PackageIcon, ArchiveIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import type { PurchaseOrder } from '../types/procurement';
import { formatDate, formatVnd } from '../utils/format';

const GROUPS: Array<{
  status: PurchaseOrder['status'];
  title: string;
  blurb: string;
  icon: React.ComponentType<{className?: string;}>;
}> = [
{ status: 'issued', title: 'Issued — awaiting delivery', blurb: 'Sent to the supplier, goods not yet recorded.', icon: PackageIcon },
{ status: 'received', title: 'Received — awaiting close', blurb: 'Goods recorded; Procurement closes the order.', icon: PackageCheckIcon },
{ status: 'closed', title: 'Closed', blurb: 'Nothing outstanding.', icon: ArchiveIcon }];


export function Orders() {
  const { orders, getRequest, getSupplier } = useProcurement();

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Procurement</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Purchase orders</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        The last leg of the workflow: a purchase order is raised from the awarded quotation, goods are recorded as
        received, then the order is closed.
      </p>

      {GROUPS.map((group) => {
        const rows = orders.filter((o) => o.status === group.status);
        return (
          <section key={group.status} className="mt-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <group.icon className="h-4 w-4 text-ink-subtle" />
              {group.title}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">{group.blurb}</p>
            <ul className="mt-2 space-y-2">
              {rows.map((o) => {
                const request = getRequest(o.requestId);
                const supplier = getSupplier(o.supplierId);
                return (
                  <li key={o.id}>
                    <Link
                      to={`/orders/${o.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-card transition-colors duration-150 ease-exp hover:border-line-strong hover:bg-raised">
                      
                      <div className="min-w-0">
                        <p className="tabular text-sm font-semibold">{o.id}</p>
                        <p className="mt-0.5 truncate text-sm text-ink-muted">
                          {request?.title} · {supplier?.name}
                        </p>
                        <p className="tabular mt-0.5 text-2xs text-ink-subtle">
                          {o.requestId} · {o.quotationId} · expected {formatDate(o.expectedDelivery)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="tabular text-sm font-semibold">{formatVnd(o.total)}</span>
                        <ArrowRightIcon className="h-4 w-4 text-ink-subtle" />
                      </div>
                    </Link>
                  </li>);

              })}
              {rows.length === 0 ?
              <li className="rounded-lg border border-line bg-surface p-6 text-center text-sm text-ink-muted">
                  None.
                </li> :
              null}
            </ul>
          </section>);

      })}
    </div>);

}