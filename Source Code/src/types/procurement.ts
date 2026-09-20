export type Role = 'employee' | 'manager' | 'finance' | 'procurement'|'admin';

export type ActorRole = Role | 'system' | 'ai';

export type RequestStatus =
'draft' |
'submitted' |
'pending-approval' |
'revision-required' |
'approved' |
'rejected' |
'budget-warning' |
'quotation-comparison' |
'ai-recommendation' |
'awarded' |
'po-issued' |
'received' |
'closed' |
'error';

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  uom: string;
  estUnitPrice: number;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  contracted: boolean;
  rating: number;
  onTimeRate: number;
  defaultPaymentTerms: string;
  certifications: string[];
  note: string;
}

export interface BudgetLine {
  id: string;
  category: string;
  period: string;
  owner: string;
  allocated: number;
  spent: number;
  committed: number;
}

export interface TimelineEvent {
  id: string;
  at: string;
  actor: string;
  role: ActorRole;
  label: string;
  detail?: string;
}

export type BudgetCheckState = 'not-required' | 'not-requested' | 'pending' | 'cleared' | 'exceeded';

export interface BudgetCheck {
  state: BudgetCheckState;
  checkedBy?: string;
  note?: string;
}

export interface QuotationAttachment {
  fileName: string;
  mimeType: string;
  sizeKb: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Quotation {
  id: string;
  requestId: string;
  supplierId: string;
  source: 'email' | 'pdf' | 'portal' | 'upload';
  receivedAt: string;
  attachment?: QuotationAttachment;
  originalCurrency: 'VND' | 'USD';
  originalTotal: number;
  unitPrice: number;
  qty: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  leadTimeDays: number;
  warrantyMonths: number;
  paymentTerms: string;
  validUntil: string;
  normalizationNotes: string[];
  missingFields: string[];
}

export interface AiScore {
  quotationId: string;
  price: number;
  leadTime: number;
  reliability: number;
  terms: number;
  total: number;
}

export interface AiAnalysis {
  requestId: string;
  generatedAt: string;
  confidence: number;
  weights: {price: number;leadTime: number;reliability: number;terms: number;};
  scores: AiScore[];
  recommendedQuotationId: string;
  rationale: string[];
  risks: string[];
  dataGaps: string[];
}

export interface PriceBaseline {
  key: string;
  label: string;
  average: number;
  unit: string;
  sampleSize: number;
  period: string;
}

export interface AnomalyAlert {
  id: string;
  requestId: string;
  quotationId: string;
  severity: 'high' | 'medium';
  kind: 'price-outlier' | 'incomplete-quote' | 'terms-outlier';
  title: string;
  detail: string;
  evidence: string;
}

export interface PurchaseOrder {
  id: string;
  requestId: string;
  quotationId: string;
  supplierId: string;
  issuedAt: string;
  issuedBy: string;
  expectedDelivery: string;
  total: number;
  status: 'issued' | 'received' | 'closed';
  receipt?: {
    receivedAt: string;
    receivedBy: string;
    condition: 'complete' | 'partial';
    note: string;
  };
  closedAt?: string;
  closedBy?: string;
  closeNote?: string;
}

export interface SupplierEvaluation {
  quotationId: string;
  stance: 'shortlisted' | 'excluded' | 'undecided';
  note: string;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  category: string;
  department: string;
  requester: string;
  costCenter: string;
  neededBy: string;
  deliveryLocation: string;
  justification: string;
  items: LineItem[];
  estimatedTotal: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  budgetLineId: string | null;
  budgetCheck: BudgetCheck;
  decision?: {
    outcome: 'approved' | 'rejected' | 'revision-required';
    by: string;
    note: string;
    at: string;
  };
  award?: {
    quotationId: string;
    by: string;
    note: string;
    at: string;
    matchesAiRecommendation: boolean;
  };
  evaluations: SupplierEvaluation[];
  aiSuggestionsApplied: string[];
  errorNote?: string;
  timeline: TimelineEvent[];
}

export interface AiFieldSuggestion {
  field: 'costCenter' | 'deliveryLocation' | 'category' | 'neededBy' | 'justification';
  label: string;
  value: string;
  basis: string;
}