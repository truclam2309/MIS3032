import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  aiAnalyses,
  anomalyAlerts,
  budgetLines as seedBudgetLines,
  inboundQuotations,
  purchaseOrders as seedOrders,
  purchaseRequests as seedRequests,
  quotations as seedQuotations,
  suppliers as seedSuppliers } from
'../data/seed';
import type {
  AiAnalysis,
  AnomalyAlert,
  BudgetLine,
  LineItem,
  PurchaseOrder,
  PurchaseRequest,
  Quotation,
  QuotationAttachment,
  RequestStatus,
  Supplier,
  SupplierEvaluation,
  TimelineEvent } from
'../types/procurement';
import { nowIso } from '../utils/format';
import { isExpired } from '../utils/quotes';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface ApiPurchaseRequest {
  id: string;
  title: string;
  category: string;
  department: string;
  requester: string;
  justification: string;
  amount: number | string;
  status: string;
  created_at?: string;
  updated_at?: string;
  is_within_budget?: boolean | null;
  details?: Partial<Pick<NewRequestPayload, 'costCenter' | 'neededBy' | 'deliveryLocation' | 'items' | 'aiSuggestionsApplied'>>;
}

export interface BudgetSnapshot {
  line: BudgetLine;
  available: number;
  overBy: number;
  isOver: boolean;
}

export interface NewRequestPayload {
  title: string;
  category: string;
  department: string;
  costCenter: string;
  neededBy: string;
  deliveryLocation: string;
  justification: string;
  items: LineItem[];
  aiSuggestionsApplied: string[];
}

interface ProcurementValue {
  requests: PurchaseRequest[];
  suppliers: Supplier[];
  budgetLines: BudgetLine[];
  aiAssistEnabled: boolean;
  getRequest: (id: string) => PurchaseRequest | undefined;
  getSupplier: (id: string) => Supplier | undefined;
  quotationsFor: (requestId: string) => Quotation[];
  inboundFor: (requestId: string) => Quotation[];
  analysisFor: (requestId: string) => AiAnalysis | undefined;
  anomaliesFor: (requestId: string) => AnomalyAlert[];
  budgetFor: (request: PurchaseRequest) => BudgetSnapshot | null;
  orders: PurchaseOrder[];
  getOrder: (id: string) => PurchaseOrder | undefined;
  orderFor: (requestId: string) => PurchaseOrder | undefined;
  createPurchaseOrder: (requestId: string) => void;
  receiveGoods: (orderId: string, condition: 'complete' | 'partial', note: string) => void;
  closeOrder: (orderId: string, note: string) => void;
  createRequest: (payload: NewRequestPayload, submit: boolean) => Promise<string>;
  updateRequest: (
  id: string,
  payload: NewRequestPayload,
  action: 'save' | 'submit',
  changeNote?: string)
  => void;
  routeForApproval: (id: string) => void;
  retrySubmission: (id: string) => void;
  resubmit: (id: string, note: string) => void;
  sendToFinance: (id: string) => void;
  resolveBudgetCheck: (id: string, outcome: 'cleared' | 'exceeded', note: string) => void;
  decide: (id: string, outcome: 'approved' | 'rejected' | 'revision-required', note: string) => void;
  findInboundQuotation: (requestId: string, supplierId: string) => Quotation | undefined;
  linkQuotation: (requestId: string, quotationId: string, attachment: QuotationAttachment) => void;
  runAnalysis: (id: string) => void;
  setEvaluation: (id: string, evaluation: SupplierEvaluation) => void;
  award: (id: string, quotationId: string, note: string) => void;
  lastError: string | null;
  clearError: () => void;
}

const ProcurementContext = createContext<ProcurementValue | null>(null);

const APPROVERS: Record<string, string> = {
  Engineering: 'Lê Thanh Bình (Engineering Manager)',
  Operations: 'Vũ Minh Châu (Operations Manager)',
  Finance: 'Đỗ Quang Huy (Finance Manager)',
  People: 'Hoàng Nhật Nam (People Manager)'
};

let eventSeq = 0;
function evt(
actor: string,
role: TimelineEvent['role'],
label: string,
detail?: string)
: TimelineEvent {
  eventSeq += 1;
  return { id: `ev-${eventSeq}`, at: nowIso(), actor, role, label, detail };
}

export function ProcurementProvider({
  children,
  aiAssistEnabled = true



}: {children: React.ReactNode;aiAssistEnabled?: boolean;}) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequest[]>(seedRequests);
  const [liveQuotations, setLiveQuotations] = useState<Quotation[]>(seedQuotations);
  const [revealedAnalyses, setRevealedAnalyses] = useState<string[]>(['PR-2026-038', 'PR-2026-032']);
  const [orders, setOrders] = useState<PurchaseOrder[]>(seedOrders);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('procurement-token');
    if (!user || !token) return;

    let cancelled = false;
    fetch(`${API_URL}/purchase-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) throw new Error('Could not load purchase requests from the server.');
      const rows: ApiPurchaseRequest[] = await response.json();
      if (cancelled) return;

      const persisted = rows.map((row): PurchaseRequest => {
        const details = row.details ?? {};
        const createdAt = row.created_at ?? nowIso();
        return {
          id: row.id,
          title: row.title,
          category: row.category,
          department: row.department,
          requester: row.requester,
          costCenter: details.costCenter ?? '',
          neededBy: details.neededBy ?? '',
          deliveryLocation: details.deliveryLocation ?? '',
          justification: row.justification,
          items: details.items ?? [],
          estimatedTotal: Number(row.amount),
          status: row.status === 'PENDING_APPROVAL' ? 'pending-approval'
            : row.status === 'APPROVED' ? 'approved'
              : row.status === 'REJECTED' ? 'rejected'
                : row.status === 'REVISION_REQUIRED' ? 'revision-required' : 'submitted',
          createdAt,
          updatedAt: row.updated_at ?? createdAt,
          budgetLineId: seedBudgetLines.find((line) => line.category === row.category)?.id ?? null,
          budgetCheck: { state: row.is_within_budget === false ? 'exceeded' : 'pending' },
          evaluations: [],
          aiSuggestionsApplied: details.aiSuggestionsApplied ?? [],
          timeline: [{
            id: `server-${row.id}`,
            at: createdAt,
            actor: row.requester,
            role: 'employee',
            label: 'Submitted for approval',
          }],
        };
      });
      setRequests((current) => {
        const byId = new Map(current.map((request) => [request.id, request]));
        persisted.forEach((request) => byId.set(request.id, request));
        return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
    }).catch((error: unknown) => {
      if (!cancelled) setLastError(error instanceof Error ? error.message : 'Could not load purchase requests.');
    });

    return () => { cancelled = true; };
  }, [user]);

  const patch = useCallback(
    (id: string, updater: (r: PurchaseRequest) => PurchaseRequest) => {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...updater(r), updatedAt: nowIso() } : r));
    },
    []
  );

  const getRequest = useCallback((id: string) => requests.find((r) => r.id === id), [requests]);
  const getSupplier = useCallback((id: string) => seedSuppliers.find((s) => s.id === id), []);
  const quotationsFor = useCallback(
    (requestId: string) => liveQuotations.filter((q) => q.requestId === requestId),
    [liveQuotations]
  );
  const inboundFor = useCallback(
    (requestId: string) =>
    inboundQuotations.filter(
      (q) => q.requestId === requestId && !liveQuotations.some((lq) => lq.id === q.id)
    ),
    [liveQuotations]
  );
  const analysisFor = useCallback(
    (requestId: string) =>
    revealedAnalyses.includes(requestId) ? aiAnalyses.find((a) => a.requestId === requestId) : undefined,
    [revealedAnalyses]
  );
  const anomaliesFor = useCallback(
    (requestId: string) => anomalyAlerts.filter((a) => a.requestId === requestId),
    []
  );
  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);
  const orderFor = useCallback((requestId: string) => orders.find((o) => o.requestId === requestId), [orders]);

  const budgetFor = useCallback((request: PurchaseRequest): BudgetSnapshot | null => {
    const line = seedBudgetLines.find((b) => b.id === request.budgetLineId);
    if (!line) return null;
    const available = line.allocated - line.spent - line.committed;
    const overBy = request.estimatedTotal - available;
    return { line, available, overBy, isOver: overBy > 0 };
  }, []);

  const createRequest = useCallback(
    async (payload: NewRequestPayload, submit: boolean) => {
      if (submit) {
        const token = localStorage.getItem('procurement-token');
        if (!token) {
          const message = 'Your session is missing an API token. Sign in again before submitting.';
          setLastError(message);
          throw new Error(message);
        }

        const amount = payload.items.reduce((sum, item) => sum + item.qty * item.estUnitPrice, 0);
        try {
          const response = await fetch(`${API_URL}/purchase-requests`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: payload.title,
              department: payload.department,
              amount,
              category: payload.category,
              justification: payload.justification,
              requester: user?.name,
              costCenter: payload.costCenter,
              neededBy: payload.neededBy,
              deliveryLocation: payload.deliveryLocation,
              items: payload.items,
              aiSuggestionsApplied: payload.aiSuggestionsApplied,
            }),
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.detail ?? 'Could not save purchase request.');
          }

          const createdAt = result.created_at ?? nowIso();
          const persisted: PurchaseRequest = {
            id: result.id,
            title: result.title,
            category: result.category,
            department: result.department,
            requester: result.requester,
            costCenter: result.details?.costCenter ?? payload.costCenter,
            neededBy: result.details?.neededBy ?? payload.neededBy,
            deliveryLocation: result.details?.deliveryLocation ?? payload.deliveryLocation,
            justification: result.justification,
            items: result.details?.items ?? payload.items,
            estimatedTotal: Number(result.amount),
            status: 'pending-approval',
            createdAt,
            updatedAt: result.updated_at ?? createdAt,
            budgetLineId: seedBudgetLines.find((line) => line.category === result.category)?.id ?? null,
            budgetCheck: { state: result.is_within_budget === false ? 'exceeded' : 'pending' },
            evaluations: [],
            aiSuggestionsApplied: payload.aiSuggestionsApplied,
            timeline: [{ id: `server-${result.id}`, at: createdAt, actor: user?.name ?? 'Employee', role: 'employee', label: 'Submitted for approval' }],
          };
          setRequests((previous) => [persisted, ...previous.filter((request) => request.id !== persisted.id)]);
          setLastError(null);
          return persisted.id;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not save purchase request.';
          setLastError(message);
          throw error;
        }
      }

      const highest = requests.reduce((max, r) => {
        const match = r.id.match(/PR-2026-(\d+)/);
        return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
      }, 0);
      const id = `PR-2026-${String(highest + 1).padStart(3, '0')}`;
      const estimatedTotal = payload.items.reduce((sum, i) => sum + i.qty * i.estUnitPrice, 0);
      const line = seedBudgetLines.find((b) => b.category === payload.category);
      const status: RequestStatus = submit ? 'submitted' : 'draft';
      const timeline: TimelineEvent[] = [evt('Nguyễn Hoài An', 'employee', 'Draft created')];
      if (payload.aiSuggestionsApplied.length > 0) {
        timeline.push(
          evt(
            'Assistant',
            'ai',
            `${payload.aiSuggestionsApplied.length} suggestion(s) accepted by requester`,
            'Suggestions were applied by the requester, not automatically.'
          )
        );
      }
      if (submit) {
        timeline.push(evt('Nguyễn Hoài An', 'employee', 'Submitted for approval'));
        timeline.push(evt('System', 'system', 'Queued for approver routing'));
      }
      const request: PurchaseRequest = {
        id,
        title: payload.title,
        category: payload.category,
        department: payload.department,
        requester: 'Nguyễn Hoài An',
        costCenter: payload.costCenter,
        neededBy: payload.neededBy,
        deliveryLocation: payload.deliveryLocation,
        justification: payload.justification,
        items: payload.items,
        estimatedTotal,
        status,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        budgetLineId: line ? line.id : null,
        budgetCheck: { state: 'not-requested' },
        evaluations: [],
        aiSuggestionsApplied: payload.aiSuggestionsApplied,
        timeline
      };
      setRequests((prev) => [request, ...prev]);
      return id;
    },
    [requests, user]
  );

  const updateRequest = useCallback(
    (id: string, payload: NewRequestPayload, action: 'save' | 'submit', changeNote?: string) => {
      patch(id, (r) => {
        const estimatedTotal = payload.items.reduce((sum, i) => sum + i.qty * i.estUnitPrice, 0);
        const line = seedBudgetLines.find((b) => b.category === payload.category);
        const wasRevision = r.status === 'revision-required';
        const status: RequestStatus =
        action === 'save' ? r.status : wasRevision ? 'pending-approval' : 'submitted';

        const timeline = [...r.timeline];
        if (action === 'save') {
          timeline.push(evt(r.requester, 'employee', 'Request edited', changeNote || undefined));
        } else if (wasRevision) {
          timeline.push(evt(r.requester, 'employee', 'Resubmitted after revision', changeNote || undefined));
          timeline.push(
            evt('System', 'system', `Routed to ${APPROVERS[payload.department] ?? 'the department manager'}`)
          );
        } else {
          timeline.push(evt(r.requester, 'employee', 'Submitted for approval', changeNote || undefined));
          timeline.push(evt('System', 'system', 'Queued for approver routing'));
        }

        return {
          ...r,
          title: payload.title,
          category: payload.category,
          department: payload.department,
          costCenter: payload.costCenter,
          neededBy: payload.neededBy,
          deliveryLocation: payload.deliveryLocation,
          justification: payload.justification,
          items: payload.items,
          estimatedTotal,
          budgetLineId: line ? line.id : r.budgetLineId,
          status,
          decision: action === 'submit' ? undefined : r.decision,
          errorNote: action === 'submit' ? undefined : r.errorNote,
          aiSuggestionsApplied: Array.from(new Set([...r.aiSuggestionsApplied, ...payload.aiSuggestionsApplied])),
          timeline
        };
      });
    },
    [patch]
  );

  const routeForApproval = useCallback(
    (id: string) => {
      patch(id, (r) => ({
        ...r,
        status: 'pending-approval',
        timeline: [
        ...r.timeline,
        evt('System', 'system', `Routed to ${APPROVERS[r.department] ?? 'the department manager'}`)]

      }));
    },
    [patch]
  );

  const retrySubmission = useCallback(
    (id: string) => {
      patch(id, (r) => ({
        ...r,
        status: 'submitted',
        errorNote: undefined,
        timeline: [...r.timeline, evt('Trương Bảo Long', 'employee', 'Submission retried', 'ERP posting succeeded.')]
      }));
    },
    [patch]
  );

  const resubmit = useCallback(
    (id: string, note: string) => {
      patch(id, (r) => ({
        ...r,
        status: 'pending-approval',
        decision: undefined,
        timeline: [
        ...r.timeline,
        evt(r.requester, 'employee', 'Resubmitted after revision', note || undefined),
        evt('System', 'system', `Routed to ${APPROVERS[r.department] ?? 'the department manager'}`)]

      }));
    },
    [patch]
  );

  const sendToFinance = useCallback(
    (id: string) => {
      patch(id, (r) => ({
        ...r,
        status: 'budget-warning',
        budgetCheck: { state: 'pending' },
        timeline: [
        ...r.timeline,
        evt(APPROVERS[r.department] ?? 'Manager', 'manager', 'Sent to Finance for budget review')]

      }));
    },
    [patch]
  );

  const resolveBudgetCheck = useCallback(
    (id: string, outcome: 'cleared' | 'exceeded', note: string) => {
      patch(id, (r) => ({
        ...r,
        status: outcome === 'cleared' ? 'pending-approval' : 'budget-warning',
        budgetCheck: { state: outcome, checkedBy: 'Trần Mỹ Linh (Finance)', note },
        timeline: [
        ...r.timeline,
        evt('Trần Mỹ Linh', 'finance', outcome === 'cleared' ? 'Budget cleared' : 'Budget exceeded', note)]

      }));
    },
    [patch]
  );

  const decide = useCallback(
    (id: string, outcome: 'approved' | 'rejected' | 'revision-required', note: string) => {
      patch(id, (r) => {
        const by = APPROVERS[r.department] ?? 'Department Manager';
        const status: RequestStatus =
        outcome === 'approved' ? 'approved' : outcome === 'rejected' ? 'rejected' : 'revision-required';
        const label =
        outcome === 'approved' ? 'Approved' : outcome === 'rejected' ? 'Rejected' : 'Revision requested';
        const timeline = [...r.timeline, evt(by, 'manager', label, note || undefined)];
        if (outcome === 'approved') {
          timeline.push(evt('System', 'system', 'Released to Procurement for sourcing'));
        }
        return { ...r, status, decision: { outcome, by, note, at: nowIso() }, timeline };
      });
    },
    [patch]
  );

  const findInboundQuotation = useCallback(
    (requestId: string, supplierId: string) =>
    inboundQuotations.find(
      (q) =>
      q.requestId === requestId &&
      q.supplierId === supplierId &&
      !liveQuotations.some((lq) => lq.id === q.id)
    ),
    [liveQuotations]
  );

  const linkQuotation = useCallback(
    (requestId: string, quotationId: string, attachment: QuotationAttachment) => {
      const source = inboundQuotations.find((q) => q.id === quotationId);
      if (!source) {
        setLastError(`Quotation ${quotationId} is not on file, so nothing was linked.`);
        return;
      }
      const linked: Quotation = { ...source, source: 'upload', attachment, receivedAt: attachment.uploadedAt };
      setLiveQuotations((prev) => prev.some((p) => p.id === linked.id) ? prev : [...prev, linked]);

      const alreadyLinked = liveQuotations.filter((q) => q.requestId === requestId).length + 1;
      const supplierName = seedSuppliers.find((s) => s.id === source.supplierId)?.name ?? source.supplierId;

      patch(requestId, (r) => ({
        ...r,
        status: alreadyLinked >= 2 && r.status === 'approved' ? 'quotation-comparison' : r.status,
        timeline: [
        ...r.timeline,
        evt(
          'Trịnh Đức Kiên',
          'procurement',
          `Quotation ${linked.id} linked from ${attachment.fileName}`,
          `${supplierName} · figures normalised to one comparable landed total.`
        ),
        ...(alreadyLinked >= 2 && r.status === 'approved' ?
        [evt('System', 'system', 'Quotation comparison available', 'Two or more quotations are linked.')] :
        [])]

      }));
    },
    [liveQuotations, patch]
  );

  const runAnalysis = useCallback(
    (id: string) => {
      const analysis = aiAnalyses.find((a) => a.requestId === id);
      if (!analysis) {
        setLastError(`No sample analysis exists for ${id}. The assistant will not generate figures of its own.`);
        return;
      }
      setRevealedAnalyses((prev) => prev.includes(id) ? prev : [...prev, id]);
      patch(id, (r) => ({
        ...r,
        status: r.status === 'awarded' ? r.status : 'ai-recommendation',
        timeline: [
        ...r.timeline,
        evt('Assistant', 'ai', 'Analysis generated', 'Advisory only — the award decision stays with Procurement.')]

      }));
    },
    [patch]
  );

  const setEvaluation = useCallback(
    (id: string, evaluation: SupplierEvaluation) => {
      patch(id, (r) => ({
        ...r,
        evaluations: [
        ...r.evaluations.filter((e) => e.quotationId !== evaluation.quotationId),
        evaluation]

      }));
    },
    [patch]
  );

  const award = useCallback(
    (id: string, quotationId: string, note: string) => {
      const quote = liveQuotations.find((q) => q.id === quotationId);
      if (quote && isExpired(quote.validUntil)) {
        setLastError(
          `${quotationId} lapsed on ${quote.validUntil} and cannot be awarded. Ask the supplier for a refreshed quotation.`
        );
        return;
      }
      const analysis = aiAnalyses.find((a) => a.requestId === id);
      const matches = analysis ? analysis.recommendedQuotationId === quotationId : false;
      patch(id, (r) => ({
        ...r,
        status: 'awarded',
        award: {
          quotationId,
          by: 'Trịnh Đức Kiên (Procurement)',
          note,
          at: nowIso(),
          matchesAiRecommendation: matches
        },
        timeline: [
        ...r.timeline,
        evt(
          'Trịnh Đức Kiên',
          'procurement',
          'Supplier selected',
          matches ?
          'Selection matches the assistant recommendation.' :
          'Selection differs from the assistant recommendation.'
        )]

      }));
    },
    [patch]
  );

  const createPurchaseOrder = useCallback(
    (requestId: string) => {
      const request = requests.find((r) => r.id === requestId);
      const quotationId = request?.award?.quotationId;
      const quote = liveQuotations.find((q) => q.id === quotationId);
      if (!request || !quote) {
        setLastError(`No awarded quotation on ${requestId}, so no purchase order can be raised.`);
        return;
      }
      if (orders.some((o) => o.requestId === requestId)) {
        setLastError(`${requestId} already has a purchase order. Only one order per request is supported.`);
        return;
      }
      if (isExpired(quote.validUntil)) {
        setLastError(
          `${quote.id} lapsed on ${quote.validUntil}. A purchase order cannot be raised against an expired quotation.`
        );
        return;
      }
      const seq = 19 + orders.length - seedOrders.length;
      const id = `PO-2026-0${seq}`;
      const expected = new Date(Date.now() + quote.leadTimeDays * 86_400_000).toISOString().slice(0, 10);
      const order: PurchaseOrder = {
        id,
        requestId,
        quotationId: quote.id,
        supplierId: quote.supplierId,
        issuedAt: nowIso(),
        issuedBy: 'Trịnh Đức Kiên (Procurement)',
        expectedDelivery: expected,
        total: quote.total,
        status: 'issued'
      };
      setOrders((prev) => [order, ...prev]);
      patch(requestId, (r) => ({
        ...r,
        status: 'po-issued',
        timeline: [
        ...r.timeline,
        evt('Trịnh Đức Kiên', 'procurement', `Purchase order ${id} issued`, `Raised from ${quote.id}.`)]

      }));
    },
    [requests, liveQuotations, orders, patch]
  );

  const receiveGoods = useCallback(
    (orderId: string, condition: 'complete' | 'partial', note: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      setOrders((prev) =>
      prev.map((o) =>
      o.id === orderId ?
      {
        ...o,
        status: 'received',
        receipt: {
          receivedAt: nowIso(),
          receivedBy: 'Phạm Thu Hà (Operations)',
          condition,
          note
        }
      } :
      o
      )
      );
      patch(order.requestId, (r) => ({
        ...r,
        status: 'received',
        timeline: [
        ...r.timeline,
        evt(
          'Phạm Thu Hà',
          'employee',
          condition === 'complete' ? 'Goods received in full' : 'Goods received in part',
          note || undefined
        )]

      }));
    },
    [orders, patch]
  );

  const closeOrder = useCallback(
    (orderId: string, note: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      if (order.status !== 'received') {
        setLastError(`${orderId} cannot be closed before the goods are recorded as received.`);
        return;
      }
      setOrders((prev) =>
      prev.map((o) =>
      o.id === orderId ?
      { ...o, status: 'closed', closedAt: nowIso(), closedBy: 'Trịnh Đức Kiên (Procurement)', closeNote: note } :
      o
      )
      );
      patch(order.requestId, (r) => ({
        ...r,
        status: 'closed',
        timeline: [...r.timeline, evt('Trịnh Đức Kiên', 'procurement', 'Purchase order closed', note || undefined)]
      }));
    },
    [orders, patch]
  );

  const value = useMemo<ProcurementValue>(
    () => ({
      requests,
      suppliers: seedSuppliers,
      budgetLines: seedBudgetLines,
      aiAssistEnabled,
      getRequest,
      getSupplier,
      quotationsFor,
      inboundFor,
      analysisFor,
      budgetFor,
      createRequest,
      updateRequest,
      routeForApproval,
      retrySubmission,
      sendToFinance,
      resolveBudgetCheck,
      decide,
      findInboundQuotation,
      linkQuotation,
      runAnalysis,
      setEvaluation,
      resubmit,
      award,
      anomaliesFor,
      orders,
      getOrder,
      orderFor,
      createPurchaseOrder,
      receiveGoods,
      closeOrder,
      lastError,
      clearError: () => setLastError(null)
    }),
    [
    requests,
    aiAssistEnabled,
    getRequest,
    getSupplier,
    quotationsFor,
    inboundFor,
    analysisFor,
    budgetFor,
    createRequest,
    updateRequest,
    routeForApproval,
    retrySubmission,
    sendToFinance,
    resolveBudgetCheck,
    decide,
    findInboundQuotation,
    linkQuotation,
    runAnalysis,
    setEvaluation,
    resubmit,
    award,
    anomaliesFor,
    orders,
    getOrder,
    orderFor,
    createPurchaseOrder,
    receiveGoods,
    closeOrder,
    lastError]

  );

  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>;
}

export function useProcurement(): ProcurementValue {
  const ctx = useContext(ProcurementContext);
  if (!ctx) throw new Error('useProcurement must be used inside ProcurementProvider');
  return ctx;
}
