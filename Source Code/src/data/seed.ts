import type {
  AiAnalysis,
  AiFieldSuggestion,
  AnomalyAlert,
  BudgetLine,
  PriceBaseline,
  PurchaseOrder,
  PurchaseRequest,
  Quotation,
  Supplier } from
'../types/procurement';

export const USD_RATE = 25400;

export const CATEGORIES = [
'IT Equipment',
'Office Supplies',
'Facilities',
'Software & Licences'] as
const;

export const DEPARTMENTS = ['Engineering', 'Operations', 'Finance', 'People'] as const;

export const suppliers: Supplier[] = [
{
  id: 'SUP-001',
  name: 'Nam Việt Office Supplies',
  country: 'Vietnam',
  contracted: true,
  rating: 4.6,
  onTimeRate: 0.96,
  defaultPaymentTerms: 'Net 30',
  certifications: ['ISO 9001'],
  note: 'Framework agreement valid through Dec 2026.'
},
{
  id: 'SUP-002',
  name: 'TechSource Distribution',
  country: 'Vietnam',
  contracted: true,
  rating: 4.2,
  onTimeRate: 0.89,
  defaultPaymentTerms: 'Net 15',
  certifications: ['ISO 9001', 'ISO 27001'],
  note: 'Authorised reseller for network hardware.'
},
{
  id: 'SUP-003',
  name: 'Global Hardware Co.',
  country: 'Singapore',
  contracted: false,
  rating: 3.8,
  onTimeRate: 0.74,
  defaultPaymentTerms: '100% prepayment',
  certifications: [],
  note: 'New vendor — no delivery history with us.'
},
{
  id: 'SUP-004',
  name: 'Hanoi Furniture Works',
  country: 'Vietnam',
  contracted: true,
  rating: 4.4,
  onTimeRate: 0.91,
  defaultPaymentTerms: 'Net 45',
  certifications: ['ISO 9001', 'FSC'],
  note: 'Preferred for workplace furniture.'
}];


export const budgetLines: BudgetLine[] = [
{
  id: 'BL-IT-Q3',
  category: 'IT Equipment',
  period: 'Q3 2026',
  owner: 'Finance · Trần Mỹ Linh',
  allocated: 500_000_000,
  spent: 412_000_000,
  committed: 30_000_000
},
{
  id: 'BL-OFF-Q3',
  category: 'Office Supplies',
  period: 'Q3 2026',
  owner: 'Finance · Trần Mỹ Linh',
  allocated: 120_000_000,
  spent: 61_500_000,
  committed: 8_000_000
},
{
  id: 'BL-FAC-Q3',
  category: 'Facilities',
  period: 'Q3 2026',
  owner: 'Finance · Đỗ Quang Huy',
  allocated: 300_000_000,
  spent: 90_000_000,
  committed: 24_000_000
},
{
  id: 'BL-SW-Q3',
  category: 'Software & Licences',
  period: 'Q3 2026',
  owner: 'Finance · Đỗ Quang Huy',
  allocated: 260_000_000,
  spent: 118_000_000,
  committed: 0
}];


/** Sample suggestions the assistant may offer. Nothing outside this list is ever proposed. */
export const aiFieldSuggestions: Record<string, AiFieldSuggestion[]> = {
  Engineering: [
  {
    field: 'costCenter',
    label: 'Cost centre',
    value: 'CC-ENG-2200',
    basis: 'Used on 14 of the last 15 Engineering requests.'
  },
  {
    field: 'deliveryLocation',
    label: 'Delivery location',
    value: 'HQ Hanoi · Floor 6 · Goods-in',
    basis: 'Standing delivery point for Engineering hardware.'
  }],

  Operations: [
  { field: 'costCenter', label: 'Cost centre', value: 'CC-OPS-3100', basis: 'Default Operations cost centre.' },
  {
    field: 'deliveryLocation',
    label: 'Delivery location',
    value: 'HQ Hanoi · Floor 3 · Reception',
    basis: 'Standing delivery point for Operations.'
  }],

  Finance: [
  { field: 'costCenter', label: 'Cost centre', value: 'CC-FIN-1100', basis: 'Default Finance cost centre.' },
  {
    field: 'deliveryLocation',
    label: 'Delivery location',
    value: 'HQ Hanoi · Floor 4 · Reception',
    basis: 'Standing delivery point for Finance.'
  }],

  People: [
  { field: 'costCenter', label: 'Cost centre', value: 'CC-PPL-1400', basis: 'Default People cost centre.' },
  {
    field: 'deliveryLocation',
    label: 'Delivery location',
    value: 'HQ Hanoi · Floor 2 · Reception',
    basis: 'Standing delivery point for People.'
  }]

};

const t = (id: string, at: string, actor: string, role: 'employee' | 'manager' | 'finance' | 'procurement' | 'system' | 'ai', label: string, detail?: string) => ({
  id,
  at,
  actor,
  role,
  label,
  detail
});

export const purchaseRequests: PurchaseRequest[] = [
{
  id: 'PR-2026-041',
  title: 'Laptops for engineering onboarding (15 seats)',
  category: 'IT Equipment',
  department: 'Engineering',
  requester: 'Nguyễn Hoài An',
  costCenter: 'CC-ENG-2200',
  neededBy: '2026-09-15',
  deliveryLocation: 'HQ Hanoi · Floor 6 · Goods-in',
  justification: 'Fifteen engineers join in September; current spare pool is empty.',
  items: [
  { id: 'li-1', description: 'Developer laptop, 32GB RAM, 1TB SSD', qty: 15, uom: 'unit', estUnitPrice: 18_500_000 },
  { id: 'li-2', description: 'USB-C docking station', qty: 15, uom: 'unit', estUnitPrice: 1_500_000 }],

  estimatedTotal: 300_000_000,
  status: 'pending-approval',
  createdAt: '2026-08-20T09:12:00+07:00',
  updatedAt: '2026-08-24T10:05:00+07:00',
  budgetLineId: 'BL-IT-Q3',
  budgetCheck: { state: 'not-requested' },
  evaluations: [],
  aiSuggestionsApplied: ['costCenter'],
  timeline: [
  t('e1', '2026-08-20T09:12:00+07:00', 'Nguyễn Hoài An', 'employee', 'Draft created'),
  t('e2', '2026-08-20T09:31:00+07:00', 'Assistant', 'ai', 'Suggested 2 missing fields', 'Cost centre applied by requester; delivery location entered manually.'),
  t('e3', '2026-08-20T09:40:00+07:00', 'Nguyễn Hoài An', 'employee', 'Submitted for approval'),
  t('e4', '2026-08-20T09:40:05+07:00', 'System', 'system', 'Routed to Lê Thanh Bình (Engineering Manager)')]

},
{
  id: 'PR-2026-040',
  title: 'Ergonomic task chairs (20 units)',
  category: 'Facilities',
  department: 'Operations',
  requester: 'Phạm Thu Hà',
  costCenter: 'CC-OPS-3100',
  neededBy: '2026-09-30',
  deliveryLocation: 'HQ Hanoi · Floor 3 · Reception',
  justification: 'Replace 20 chairs flagged in the Q2 workplace safety review.',
  items: [{ id: 'li-1', description: 'Ergonomic task chair, adjustable lumbar', qty: 20, uom: 'unit', estUnitPrice: 4_200_000 }],
  estimatedTotal: 84_000_000,
  status: 'approved',
  createdAt: '2026-08-12T08:00:00+07:00',
  updatedAt: '2026-08-18T14:20:00+07:00',
  budgetLineId: 'BL-FAC-Q3',
  budgetCheck: { state: 'not-required' },
  decision: {
    outcome: 'approved',
    by: 'Vũ Minh Châu (Operations Manager)',
    note: 'Approved — covered by the safety remediation plan.',
    at: '2026-08-18T14:20:00+07:00'
  },
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-08-12T08:00:00+07:00', 'Phạm Thu Hà', 'employee', 'Draft created'),
  t('e2', '2026-08-12T08:22:00+07:00', 'Phạm Thu Hà', 'employee', 'Submitted for approval'),
  t('e3', '2026-08-18T14:20:00+07:00', 'Vũ Minh Châu', 'manager', 'Approved', 'Covered by the safety remediation plan.'),
  t('e4', '2026-08-18T14:21:00+07:00', 'System', 'system', 'Released to Procurement for sourcing')]

},
{
  id: 'PR-2026-039',
  title: 'Printer toner — bulk replenishment',
  category: 'Office Supplies',
  department: 'Operations',
  requester: 'Phạm Thu Hà',
  costCenter: 'CC-OPS-3100',
  neededBy: '2026-09-05',
  deliveryLocation: 'HQ Hanoi · Floor 3 · Reception',
  justification: 'Toner stock covers roughly two more weeks across all floors.',
  items: [{ id: 'li-1', description: 'Toner cartridge, high yield, black', qty: 120, uom: 'cartridge', estUnitPrice: 420_000 }],
  estimatedTotal: 50_400_000,
  status: 'quotation-comparison',
  createdAt: '2026-08-05T10:00:00+07:00',
  updatedAt: '2026-08-22T16:40:00+07:00',
  budgetLineId: 'BL-OFF-Q3',
  budgetCheck: { state: 'not-required' },
  decision: {
    outcome: 'approved',
    by: 'Vũ Minh Châu (Operations Manager)',
    note: 'Approved, routine replenishment.',
    at: '2026-08-08T11:00:00+07:00'
  },
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-08-05T10:00:00+07:00', 'Phạm Thu Hà', 'employee', 'Submitted for approval'),
  t('e2', '2026-08-08T11:00:00+07:00', 'Vũ Minh Châu', 'manager', 'Approved'),
  t('e3', '2026-08-22T16:40:00+07:00', 'Trịnh Đức Kiên', 'procurement', '3 quotations collected and normalised')]

},
{
  id: 'PR-2026-038',
  title: 'Access-layer network switches (8 units)',
  category: 'IT Equipment',
  department: 'Engineering',
  requester: 'Nguyễn Hoài An',
  costCenter: 'CC-ENG-2200',
  neededBy: '2026-09-20',
  deliveryLocation: 'HQ Hanoi · Floor 6 · Goods-in',
  justification: 'Floor 6 switches are end-of-support in October.',
  items: [{ id: 'li-1', description: '48-port managed switch, PoE+', qty: 8, uom: 'unit', estUnitPrice: 27_000_000 }],
  estimatedTotal: 216_000_000,
  status: 'ai-recommendation',
  createdAt: '2026-07-28T09:00:00+07:00',
  updatedAt: '2026-08-25T09:15:00+07:00',
  budgetLineId: 'BL-IT-Q3',
  budgetCheck: { state: 'cleared', checkedBy: 'Trần Mỹ Linh (Finance)', note: 'Reallocated from the deferred VPN project.' },
  decision: {
    outcome: 'approved',
    by: 'Lê Thanh Bình (Engineering Manager)',
    note: 'Approved after Finance confirmed the reallocation.',
    at: '2026-08-04T15:30:00+07:00'
  },
  evaluations: [
  { quotationId: 'Q-038-A', stance: 'shortlisted', note: 'Contracted vendor, spec matches exactly.' },
  { quotationId: 'Q-038-C', stance: 'excluded', note: 'Prepayment terms not acceptable for this value.' }],

  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-07-28T09:00:00+07:00', 'Nguyễn Hoài An', 'employee', 'Submitted for approval'),
  t('e2', '2026-07-30T10:00:00+07:00', 'System', 'system', 'Budget warning raised', 'Request exceeded remaining IT Equipment budget.'),
  t('e3', '2026-08-03T09:00:00+07:00', 'Trần Mỹ Linh', 'finance', 'Budget cleared', 'Reallocated from the deferred VPN project.'),
  t('e4', '2026-08-04T15:30:00+07:00', 'Lê Thanh Bình', 'manager', 'Approved'),
  t('e5', '2026-08-21T14:00:00+07:00', 'Trịnh Đức Kiên', 'procurement', '3 quotations collected and normalised'),
  t('e6', '2026-08-25T09:15:00+07:00', 'Assistant', 'ai', 'Analysis generated', 'Advisory only — award decision stays with Procurement.')]

},
{
  id: 'PR-2026-037',
  title: 'Standing desk converters (12 units)',
  category: 'Facilities',
  department: 'People',
  requester: 'Đặng Khánh Vy',
  costCenter: 'CC-PPL-1400',
  neededBy: '2026-10-01',
  deliveryLocation: 'HQ Hanoi · Floor 2 · Reception',
  justification: 'Requested through the wellbeing survey.',
  items: [{ id: 'li-1', description: 'Sit-stand desk converter', qty: 12, uom: 'unit', estUnitPrice: 3_100_000 }],
  estimatedTotal: 37_200_000,
  status: 'revision-required',
  createdAt: '2026-08-14T13:00:00+07:00',
  updatedAt: '2026-08-19T09:00:00+07:00',
  budgetLineId: 'BL-FAC-Q3',
  budgetCheck: { state: 'not-required' },
  decision: {
    outcome: 'revision-required',
    by: 'Hoàng Nhật Nam (People Manager)',
    note: 'Split into two phases and name the twelve recipients before resubmitting.',
    at: '2026-08-19T09:00:00+07:00'
  },
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-08-14T13:00:00+07:00', 'Đặng Khánh Vy', 'employee', 'Submitted for approval'),
  t('e2', '2026-08-19T09:00:00+07:00', 'Hoàng Nhật Nam', 'manager', 'Revision requested', 'Split into two phases and name the recipients.')]

},
{
  id: 'PR-2026-036',
  title: 'Conference room display, 86"',
  category: 'IT Equipment',
  department: 'Operations',
  requester: 'Phạm Thu Hà',
  costCenter: 'CC-OPS-3100',
  neededBy: '2026-09-10',
  deliveryLocation: 'HQ Hanoi · Floor 3 · Reception',
  justification: 'Existing display in Room 3.2 flickers during calls.',
  items: [{ id: 'li-1', description: '86" 4K conference display', qty: 1, uom: 'unit', estUnitPrice: 96_000_000 }],
  estimatedTotal: 96_000_000,
  status: 'rejected',
  createdAt: '2026-08-02T10:00:00+07:00',
  updatedAt: '2026-08-09T16:00:00+07:00',
  budgetLineId: 'BL-IT-Q3',
  budgetCheck: { state: 'exceeded', checkedBy: 'Trần Mỹ Linh (Finance)', note: 'No headroom left in Q3 IT Equipment.' },
  decision: {
    outcome: 'rejected',
    by: 'Vũ Minh Châu (Operations Manager)',
    note: 'Rejected for Q3. Repair the current unit and resubmit in Q4.',
    at: '2026-08-09T16:00:00+07:00'
  },
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-08-02T10:00:00+07:00', 'Phạm Thu Hà', 'employee', 'Submitted for approval'),
  t('e2', '2026-08-03T09:00:00+07:00', 'System', 'system', 'Budget warning raised'),
  t('e3', '2026-08-06T11:00:00+07:00', 'Trần Mỹ Linh', 'finance', 'Budget exceeded', 'No headroom left in Q3 IT Equipment.'),
  t('e4', '2026-08-09T16:00:00+07:00', 'Vũ Minh Châu', 'manager', 'Rejected', 'Repair the current unit and resubmit in Q4.')]

},
{
  id: 'PR-2026-035',
  title: 'Whiteboard markers and erasers',
  category: 'Office Supplies',
  department: 'People',
  requester: 'Đặng Khánh Vy',
  costCenter: '',
  neededBy: '',
  deliveryLocation: '',
  justification: 'Meeting rooms are out of markers.',
  items: [{ id: 'li-1', description: 'Whiteboard marker, assorted', qty: 60, uom: 'piece', estUnitPrice: 28_000 }],
  estimatedTotal: 1_680_000,
  status: 'draft',
  createdAt: '2026-08-25T15:30:00+07:00',
  updatedAt: '2026-08-25T15:30:00+07:00',
  budgetLineId: 'BL-OFF-Q3',
  budgetCheck: { state: 'not-required' },
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [t('e1', '2026-08-25T15:30:00+07:00', 'Đặng Khánh Vy', 'employee', 'Draft created')]
},
{
  id: 'PR-2026-034',
  title: 'Server rack rails and cable management',
  category: 'IT Equipment',
  department: 'Engineering',
  requester: 'Trương Bảo Long',
  costCenter: 'CC-ENG-2200',
  neededBy: '2026-09-25',
  deliveryLocation: 'HQ Hanoi · Floor 6 · Goods-in',
  justification: 'Required for the rack consolidation in September.',
  items: [{ id: 'li-1', description: 'Rack rail kit, 42U', qty: 6, uom: 'kit', estUnitPrice: 2_400_000 }],
  estimatedTotal: 14_400_000,
  status: 'error',
  createdAt: '2026-08-23T11:00:00+07:00',
  updatedAt: '2026-08-25T08:02:00+07:00',
  budgetLineId: 'BL-IT-Q3',
  budgetCheck: { state: 'not-requested' },
  errorNote: 'Submission could not be posted to the ERP (cost-centre service timed out). Nothing was sent for approval.',
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-08-23T11:00:00+07:00', 'Trương Bảo Long', 'employee', 'Submitted for approval'),
  t('e2', '2026-08-25T08:02:00+07:00', 'System', 'system', 'Submission failed', 'ERP cost-centre service timed out after 3 attempts.')]

},
{
  id: 'PR-2026-033',
  title: 'Monitor arms (10 units)',
  category: 'Office Supplies',
  department: 'Engineering',
  requester: 'Trương Bảo Long',
  costCenter: 'CC-ENG-2200',
  neededBy: '2026-09-18',
  deliveryLocation: 'HQ Hanoi · Floor 6 · Goods-in',
  justification: 'Desk setup for the new hires sharing Floor 6.',
  items: [{ id: 'li-1', description: 'Single monitor arm, clamp mount', qty: 10, uom: 'unit', estUnitPrice: 1_150_000 }],
  estimatedTotal: 11_500_000,
  status: 'submitted',
  createdAt: '2026-08-25T17:10:00+07:00',
  updatedAt: '2026-08-25T17:10:00+07:00',
  budgetLineId: 'BL-OFF-Q3',
  budgetCheck: { state: 'not-requested' },
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-08-25T17:10:00+07:00', 'Trương Bảo Long', 'employee', 'Submitted for approval'),
  t('e2', '2026-08-25T17:10:20+07:00', 'System', 'system', 'Queued for approver routing')]

},
{
  id: 'PR-2026-042',
  title: 'Data team workstations (4 units)',
  category: 'IT Equipment',
  department: 'Engineering',
  requester: 'Trương Bảo Long',
  costCenter: 'CC-ENG-2200',
  neededBy: '2026-10-05',
  deliveryLocation: 'HQ Hanoi · Floor 6 · Goods-in',
  justification:
  'Model training jobs currently run overnight on shared laptops; four workstations remove the queue.',
  items: [{ id: 'li-1', description: 'Workstation, 128GB RAM, RTX GPU', qty: 4, uom: 'unit', estUnitPrice: 45_000_000 }],
  estimatedTotal: 180_000_000,
  status: 'budget-warning',
  createdAt: '2026-09-02T08:30:00+07:00',
  updatedAt: '2026-09-08T09:10:00+07:00',
  budgetLineId: 'BL-IT-Q3',
  budgetCheck: { state: 'pending' },
  evaluations: [],
  aiSuggestionsApplied: ['costCenter', 'deliveryLocation'],
  timeline: [
  t('e1', '2026-09-02T08:30:00+07:00', 'Trương Bảo Long', 'employee', 'Submitted for approval'),
  t('e2', '2026-09-02T08:30:10+07:00', 'System', 'system', 'Routed to Lê Thanh Bình (Engineering Manager)'),
  t('e3', '2026-09-05T14:00:00+07:00', 'System', 'system', 'Budget warning raised', 'Request exceeds the remaining IT Equipment budget for Q3 2026.'),
  t('e4', '2026-09-08T09:10:00+07:00', 'Lê Thanh Bình', 'manager', 'Sent to Finance for budget review', 'Cannot approve until funding is confirmed.')]

},
{
  id: 'PR-2026-032',
  title: 'Meeting room webcams (10 units)',
  category: 'IT Equipment',
  department: 'Operations',
  requester: 'Phạm Thu Hà',
  costCenter: 'CC-OPS-3100',
  neededBy: '2026-08-30',
  deliveryLocation: 'HQ Hanoi · Floor 3 · Reception',
  justification: 'Ten meeting rooms still use built-in laptop cameras for client calls.',
  items: [{ id: 'li-1', description: '4K conference webcam with mic array', qty: 10, uom: 'unit', estUnitPrice: 4_500_000 }],
  estimatedTotal: 45_000_000,
  status: 'po-issued',
  createdAt: '2026-07-20T09:00:00+07:00',
  updatedAt: '2026-08-14T10:00:00+07:00',
  budgetLineId: 'BL-IT-Q3',
  budgetCheck: { state: 'not-required' },
  decision: {
    outcome: 'approved',
    by: 'Vũ Minh Châu (Operations Manager)',
    note: 'Approved for the client-facing rooms only.',
    at: '2026-07-24T11:00:00+07:00'
  },
  award: {
    quotationId: 'Q-032-A',
    by: 'Trịnh Đức Kiên (Procurement)',
    note: 'Authorised reseller, spec confirmed, and the only quote inside the 30 Aug deadline.',
    at: '2026-08-14T09:30:00+07:00',
    matchesAiRecommendation: true
  },
  evaluations: [{ quotationId: 'Q-032-A', stance: 'shortlisted', note: 'Spec confirmed against the room standard.' }],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-07-20T09:00:00+07:00', 'Phạm Thu Hà', 'employee', 'Submitted for approval'),
  t('e2', '2026-07-24T11:00:00+07:00', 'Vũ Minh Châu', 'manager', 'Approved'),
  t('e3', '2026-08-12T10:00:00+07:00', 'Trịnh Đức Kiên', 'procurement', '2 quotations collected and normalised'),
  t('e4', '2026-08-13T15:00:00+07:00', 'Assistant', 'ai', 'Analysis generated', 'Advisory only.'),
  t('e5', '2026-08-14T09:30:00+07:00', 'Trịnh Đức Kiên', 'procurement', 'Supplier selected', 'Selection matches the assistant recommendation.'),
  t('e6', '2026-08-14T10:00:00+07:00', 'Trịnh Đức Kiên', 'procurement', 'Purchase order PO-2026-018 issued')]

},
{
  id: 'PR-2026-031',
  title: 'Office paper A4 (200 reams)',
  category: 'Office Supplies',
  department: 'Operations',
  requester: 'Phạm Thu Hà',
  costCenter: 'CC-OPS-3100',
  neededBy: '2026-07-20',
  deliveryLocation: 'HQ Hanoi · Floor 3 · Reception',
  justification: 'Quarterly paper replenishment for all floors.',
  items: [{ id: 'li-1', description: 'A4 paper, 80gsm, 500 sheets', qty: 200, uom: 'ream', estUnitPrice: 124_000 }],
  estimatedTotal: 24_800_000,
  status: 'closed',
  createdAt: '2026-06-28T09:00:00+07:00',
  updatedAt: '2026-07-22T14:00:00+07:00',
  budgetLineId: 'BL-OFF-Q3',
  budgetCheck: { state: 'not-required' },
  decision: {
    outcome: 'approved',
    by: 'Vũ Minh Châu (Operations Manager)',
    note: 'Routine replenishment, approved.',
    at: '2026-07-01T09:00:00+07:00'
  },
  award: {
    quotationId: 'Q-031-A',
    by: 'Trịnh Đức Kiên (Procurement)',
    note: 'Five-day lead time was the deciding factor; stock was almost out.',
    at: '2026-07-09T16:00:00+07:00',
    matchesAiRecommendation: false
  },
  evaluations: [],
  aiSuggestionsApplied: [],
  timeline: [
  t('e1', '2026-06-28T09:00:00+07:00', 'Phạm Thu Hà', 'employee', 'Submitted for approval'),
  t('e2', '2026-07-01T09:00:00+07:00', 'Vũ Minh Châu', 'manager', 'Approved'),
  t('e3', '2026-07-08T10:00:00+07:00', 'Trịnh Đức Kiên', 'procurement', '2 quotations collected and normalised'),
  t('e4', '2026-07-09T16:00:00+07:00', 'Trịnh Đức Kiên', 'procurement', 'Supplier selected', 'No assistant analysis was requested for this request.'),
  t('e5', '2026-07-10T09:00:00+07:00', 'Trịnh Đức Kiên', 'procurement', 'Purchase order PO-2026-017 issued'),
  t('e6', '2026-07-18T11:00:00+07:00', 'Phạm Thu Hà', 'employee', 'Goods received in full'),
  t('e7', '2026-07-22T14:00:00+07:00', 'Trịnh Đức Kiên', 'procurement', 'Purchase order closed')]

}];


export const quotations: Quotation[] = [
// PR-2026-039 — toner
{
  id: 'Q-039-A',
  requestId: 'PR-2026-039',
  supplierId: 'SUP-001',
  source: 'portal',
  receivedAt: '2026-08-20T09:00:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 49_896_000,
  unitPrice: 396_000,
  qty: 120,
  subtotal: 47_520_000,
  tax: 4_752_000,
  shipping: 0,
  total: 52_272_000,
  leadTimeDays: 7,
  warrantyMonths: 12,
  paymentTerms: 'Net 30',
  validUntil: '2026-10-15',
  normalizationNotes: ['Unit price given per box of 1 — mapped to cartridge.', 'VAT 10% listed separately, folded into total.'],
  missingFields: []
},
{
  id: 'Q-039-B',
  requestId: 'PR-2026-039',
  supplierId: 'SUP-002',
  source: 'email',
  receivedAt: '2026-08-21T14:20:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 46_200_000,
  unitPrice: 385_000,
  qty: 120,
  subtotal: 46_200_000,
  tax: 4_620_000,
  shipping: 1_200_000,
  total: 52_020_000,
  leadTimeDays: 12,
  warrantyMonths: 12,
  paymentTerms: 'Net 15',
  validUntil: '2026-09-20',
  normalizationNotes: ['Shipping quoted in the email body, added as a line.', 'VAT assumed 10% — not stated on the quote.'],
  missingFields: ['VAT rate not stated']
},
{
  id: 'Q-039-C',
  requestId: 'PR-2026-039',
  supplierId: 'SUP-003',
  source: 'pdf',
  receivedAt: '2026-08-22T11:05:00+07:00',
  originalCurrency: 'USD',
  originalTotal: 1_760,
  unitPrice: 372_533,
  qty: 120,
  subtotal: 44_704_000,
  tax: 4_470_400,
  shipping: 3_800_000,
  total: 52_974_400,
  leadTimeDays: 24,
  warrantyMonths: 6,
  paymentTerms: '100% prepayment',
  validUntil: '2026-09-12',
  normalizationNotes: [`Converted from USD at the sample rate 1 USD = ${USD_RATE.toLocaleString('en-US')} ₫.`, 'Import duty not included by the supplier.'],
  missingFields: ['Import duty', 'Warranty terms document']
},
// PR-2026-038 — switches
{
  id: 'Q-038-A',
  requestId: 'PR-2026-038',
  supplierId: 'SUP-002',
  source: 'portal',
  receivedAt: '2026-08-19T10:00:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 206_400_000,
  unitPrice: 25_800_000,
  qty: 8,
  subtotal: 206_400_000,
  tax: 20_640_000,
  shipping: 0,
  total: 227_040_000,
  leadTimeDays: 14,
  warrantyMonths: 36,
  paymentTerms: 'Net 15',
  validUntil: '2026-10-10',
  normalizationNotes: ['Spec matched to the requested 48-port PoE+ model.'],
  missingFields: []
},
{
  id: 'Q-038-B',
  requestId: 'PR-2026-038',
  supplierId: 'SUP-001',
  source: 'email',
  receivedAt: '2026-08-20T16:30:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 212_000_000,
  unitPrice: 26_500_000,
  qty: 8,
  subtotal: 212_000_000,
  tax: 21_200_000,
  shipping: 900_000,
  total: 234_100_000,
  leadTimeDays: 9,
  warrantyMonths: 24,
  paymentTerms: 'Net 30',
  validUntil: '2026-10-20',
  normalizationNotes: ['Bundled installation quoted separately — excluded from the comparison.'],
  missingFields: ['Installation scope']
},
{
  id: 'Q-038-C',
  requestId: 'PR-2026-038',
  supplierId: 'SUP-003',
  source: 'pdf',
  receivedAt: '2026-08-21T09:45:00+07:00',
  originalCurrency: 'USD',
  originalTotal: 7_680,
  unitPrice: 24_384_000,
  qty: 8,
  subtotal: 195_072_000,
  tax: 19_507_200,
  shipping: 6_400_000,
  total: 220_979_200,
  leadTimeDays: 31,
  warrantyMonths: 12,
  paymentTerms: '100% prepayment',
  validUntil: '2026-09-30',
  normalizationNotes: [`Converted from USD at the sample rate 1 USD = ${USD_RATE.toLocaleString('en-US')} ₫.`, 'Lead time read from the shipping annex.'],
  missingFields: ['Local warranty service', 'Import duty']
},
// PR-2026-032 — webcams
{
  id: 'Q-032-A',
  requestId: 'PR-2026-032',
  supplierId: 'SUP-002',
  source: 'portal',
  receivedAt: '2026-08-10T10:00:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 42_000_000,
  unitPrice: 4_200_000,
  qty: 10,
  subtotal: 42_000_000,
  tax: 4_200_000,
  shipping: 0,
  total: 46_200_000,
  leadTimeDays: 10,
  warrantyMonths: 24,
  paymentTerms: 'Net 15',
  validUntil: '2026-09-09',
  normalizationNotes: ['Mic array spec matched to the room standard.'],
  missingFields: []
},
{
  id: 'Q-032-B',
  requestId: 'PR-2026-032',
  supplierId: 'SUP-001',
  source: 'email',
  receivedAt: '2026-08-11T14:00:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 43_500_000,
  unitPrice: 4_350_000,
  qty: 10,
  subtotal: 43_500_000,
  tax: 4_350_000,
  shipping: 0,
  total: 47_850_000,
  leadTimeDays: 8,
  warrantyMonths: 12,
  paymentTerms: 'Net 30',
  validUntil: '2026-09-11',
  normalizationNotes: ['Quote covered 12 units — rescaled to the requested 10.'],
  missingFields: []
},
// PR-2026-031 — A4 paper
{
  id: 'Q-031-A',
  requestId: 'PR-2026-031',
  supplierId: 'SUP-001',
  source: 'portal',
  receivedAt: '2026-07-06T09:00:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 23_000_000,
  unitPrice: 115_000,
  qty: 200,
  subtotal: 23_000_000,
  tax: 2_300_000,
  shipping: 0,
  total: 25_300_000,
  leadTimeDays: 5,
  warrantyMonths: 0,
  paymentTerms: 'Net 30',
  validUntil: '2026-08-05',
  normalizationNotes: ['Price per ream confirmed with the supplier.'],
  missingFields: []
},
{
  id: 'Q-031-B',
  requestId: 'PR-2026-031',
  supplierId: 'SUP-002',
  source: 'email',
  receivedAt: '2026-07-07T11:00:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 22_500_000,
  unitPrice: 112_500,
  qty: 200,
  subtotal: 22_500_000,
  tax: 2_250_000,
  shipping: 0,
  total: 24_750_000,
  leadTimeDays: 11,
  warrantyMonths: 0,
  paymentTerms: 'Net 15',
  validUntil: '2026-07-31',
  normalizationNotes: ['Pallet delivery included per the email.'],
  missingFields: []
}];


/** Quotations already received but not yet imported into a comparison. */
export const inboundQuotations: Quotation[] = [
{
  id: 'Q-040-A',
  requestId: 'PR-2026-040',
  supplierId: 'SUP-004',
  source: 'portal',
  receivedAt: '2026-08-23T09:00:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 78_000_000,
  unitPrice: 3_900_000,
  qty: 20,
  subtotal: 78_000_000,
  tax: 7_800_000,
  shipping: 0,
  total: 85_800_000,
  leadTimeDays: 18,
  warrantyMonths: 60,
  paymentTerms: 'Net 45',
  validUntil: '2026-10-22',
  normalizationNotes: ['Fabric grade normalised to the requested spec.'],
  missingFields: []
},
{
  id: 'Q-040-B',
  requestId: 'PR-2026-040',
  supplierId: 'SUP-001',
  source: 'email',
  receivedAt: '2026-08-24T13:40:00+07:00',
  originalCurrency: 'VND',
  originalTotal: 74_000_000,
  unitPrice: 3_700_000,
  qty: 20,
  subtotal: 74_000_000,
  tax: 7_400_000,
  shipping: 2_400_000,
  total: 83_800_000,
  leadTimeDays: 25,
  warrantyMonths: 24,
  paymentTerms: 'Net 30',
  validUntil: '2026-10-14',
  normalizationNotes: ['Delivery charge quoted per trip — assumed a single trip.'],
  missingFields: ['Number of delivery trips']
},
{
  id: 'Q-040-C',
  requestId: 'PR-2026-040',
  supplierId: 'SUP-003',
  source: 'pdf',
  receivedAt: '2026-08-24T18:10:00+07:00',
  originalCurrency: 'USD',
  originalTotal: 2_960,
  unitPrice: 3_759_200,
  qty: 20,
  subtotal: 75_184_000,
  tax: 7_518_400,
  shipping: 5_200_000,
  total: 87_902_400,
  leadTimeDays: 34,
  warrantyMonths: 12,
  paymentTerms: '100% prepayment',
  validUntil: '2026-10-04',
  normalizationNotes: [`Converted from USD at the sample rate 1 USD = ${USD_RATE.toLocaleString('en-US')} ₫.`],
  missingFields: ['Assembly service', 'Import duty']
}];


/** Pre-computed sample analyses. The assistant never produces anything outside this set. */
export const aiAnalyses: AiAnalysis[] = [
{
  requestId: 'PR-2026-038',
  generatedAt: '2026-08-25T09:15:00+07:00',
  confidence: 0.78,
  weights: { price: 0.4, leadTime: 0.25, reliability: 0.25, terms: 0.1 },
  scores: [
  { quotationId: 'Q-038-A', price: 82, leadTime: 74, reliability: 88, terms: 78, total: 81.3 },
  { quotationId: 'Q-038-B', price: 74, leadTime: 90, reliability: 94, terms: 86, total: 83.4 },
  { quotationId: 'Q-038-C', price: 95, leadTime: 32, reliability: 48, terms: 30, total: 61.0 }],

  recommendedQuotationId: 'Q-038-B',
  rationale: [
  'Nam Việt is 3.1% more expensive than the cheapest quote but delivers 22 days earlier than Global Hardware, ahead of the 20 Sep need-by date.',
  'On-time delivery history of 96% against 74% for the non-contracted vendor.',
  'Net 30 terms keep cash out of the business the longest of the three quotes.'],

  risks: [
  'Installation scope is quoted separately and is not part of this comparison.',
  'Global Hardware requires full prepayment and excludes import duty, so its landed cost is likely understated.'],

  dataGaps: ['Import duty on the Global Hardware quote', 'Local warranty service coverage for the imported units']
},
{
  requestId: 'PR-2026-039',
  generatedAt: '2026-08-26T08:30:00+07:00',
  confidence: 0.71,
  weights: { price: 0.4, leadTime: 0.25, reliability: 0.25, terms: 0.1 },
  scores: [
  { quotationId: 'Q-039-A', price: 84, leadTime: 92, reliability: 92, terms: 84, total: 88.0 },
  { quotationId: 'Q-039-B', price: 88, leadTime: 78, reliability: 82, terms: 72, total: 82.7 },
  { quotationId: 'Q-039-C', price: 82, leadTime: 40, reliability: 50, terms: 30, total: 58.3 }],

  recommendedQuotationId: 'Q-039-A',
  rationale: [
  'All three landed totals sit within 1.9% of each other, so lead time and reliability decide it.',
  'Nam Việt delivers in 7 days against a 5 Sep need-by date; the other two miss or barely meet it.',
  'Framework agreement already in place, so no new vendor onboarding is needed.'],

  risks: ['TechSource did not state a VAT rate; 10% was assumed during normalisation.'],
  dataGaps: ['Import duty on the Global Hardware quote', 'Confirmed VAT rate on the TechSource quote']
},
{
  requestId: 'PR-2026-040',
  generatedAt: '2026-08-26T08:30:00+07:00',
  confidence: 0.69,
  weights: { price: 0.4, leadTime: 0.25, reliability: 0.25, terms: 0.1 },
  scores: [
  { quotationId: 'Q-040-A', price: 78, leadTime: 82, reliability: 90, terms: 88, total: 83.4 },
  { quotationId: 'Q-040-B', price: 86, leadTime: 66, reliability: 94, terms: 80, total: 83.3 },
  { quotationId: 'Q-040-C', price: 74, leadTime: 38, reliability: 48, terms: 30, total: 54.1 }],

  recommendedQuotationId: 'Q-040-A',
  rationale: [
  'Hanoi Furniture Works carries a 60-month warranty against 24 and 12 months, the largest difference between the quotes.',
  'Landed total is 2.4% above the cheapest quote, which is within the 5% tolerance used on facilities purchases.',
  'Net 45 terms and an 18-day lead time both clear the 30 Sep need-by date.'],

  risks: ['The Nam Việt quote prices delivery per trip and assumes a single trip for 20 chairs.'],
  dataGaps: ['Assembly service on the Global Hardware quote', 'Confirmed number of delivery trips for Nam Việt']
},
{
  requestId: 'PR-2026-032',
  generatedAt: '2026-08-13T15:00:00+07:00',
  confidence: 0.74,
  weights: { price: 0.4, leadTime: 0.25, reliability: 0.25, terms: 0.1 },
  scores: [
  { quotationId: 'Q-032-A', price: 86, leadTime: 80, reliability: 84, terms: 78, total: 83.4 },
  { quotationId: 'Q-032-B', price: 78, leadTime: 88, reliability: 90, terms: 70, total: 82.6 }],

  recommendedQuotationId: 'Q-032-A',
  rationale: [
  'Both quotes clear the 30 Aug need-by date; the price gap is 3.6% in favour of TechSource.',
  'TechSource carries a 24-month warranty against 12 months from Nam Việt.'],

  risks: ['Nam Việt originally quoted 12 units, so the rescaled unit price may not hold at 10 units.'],
  dataGaps: ['Confirmation that the rescaled Nam Việt price is firm']
}];


/** Historical price references supplied with the sample data. Used only to explain anomaly alerts. */
export const priceBaselines: PriceBaseline[] = [
{ key: 'switch-48p', label: '48-port managed switch, PoE+', average: 26_600_000, unit: 'unit', sampleSize: 12, period: 'last 12 months' },
{ key: 'toner-hy', label: 'Toner cartridge, high yield', average: 415_000, unit: 'cartridge', sampleSize: 26, period: 'last 12 months' },
{ key: 'task-chair', label: 'Ergonomic task chair', average: 4_050_000, unit: 'unit', sampleSize: 9, period: 'last 18 months' },
{ key: 'webcam', label: '4K conference webcam', average: 4_500_000, unit: 'unit', sampleSize: 7, period: 'last 12 months' },
{ key: 'paper-a4', label: 'A4 paper, 80gsm', average: 124_000, unit: 'ream', sampleSize: 30, period: 'last 12 months' }];


/** Pre-computed sample anomaly findings. The assistant never invents a figure outside this set. */
export const anomalyAlerts: AnomalyAlert[] = [
{
  id: 'AN-1',
  requestId: 'PR-2026-038',
  quotationId: 'Q-038-C',
  severity: 'high',
  kind: 'price-outlier',
  title: 'Unit price 8.3% below the historical average, with costs excluded',
  detail:
  'Global Hardware quotes 24,384,000 ₫ per switch against a 26,600,000 ₫ average, while stating that import duty is not included and local warranty service is not offered.',
  evidence: 'Baseline: 48-port managed switch, PoE+ · 12 quotes · last 12 months.'
},
{
  id: 'AN-2',
  requestId: 'PR-2026-038',
  quotationId: 'Q-038-B',
  severity: 'medium',
  kind: 'incomplete-quote',
  title: 'Installation quoted separately and excluded from the comparison',
  detail:
  'Nam Việt bundled installation in a separate document with no scope attached, so the landed total shown here may rise once installation is priced.',
  evidence: 'Source: quotation email dated 20 Aug 2026.'
},
{
  id: 'AN-3',
  requestId: 'PR-2026-039',
  quotationId: 'Q-039-C',
  severity: 'high',
  kind: 'price-outlier',
  title: 'Unit price 10.2% below the historical average',
  detail:
  'Global Hardware quotes 372,533 ₫ per cartridge against a 415,000 ₫ average, requires full prepayment and excludes import duty. Either the specification differs or the landed cost is understated.',
  evidence: 'Baseline: toner cartridge, high yield · 26 quotes · last 12 months.'
},
{
  id: 'AN-4',
  requestId: 'PR-2026-039',
  quotationId: 'Q-039-B',
  severity: 'medium',
  kind: 'incomplete-quote',
  title: 'VAT rate not stated on the quotation',
  detail:
  'A 10% rate was assumed during normalisation. If the real rate differs, the landed total moves by up to 4,620,000 ₫.',
  evidence: 'Source: quotation email dated 21 Aug 2026, no tax line.'
},
{
  id: 'AN-5',
  requestId: 'PR-2026-040',
  quotationId: 'Q-040-C',
  severity: 'medium',
  kind: 'terms-outlier',
  title: 'Warranty far shorter than the other quotes, price 7.2% below average',
  detail:
  'Global Hardware offers 12 months against 60 and 24 months, at 3,759,200 ₫ per chair against a 4,050,000 ₫ average. The cheaper price may reflect a different build.',
  evidence: 'Baseline: ergonomic task chair · 9 quotes · last 18 months.'
},
{
  id: 'AN-6',
  requestId: 'PR-2026-032',
  quotationId: 'Q-032-B',
  severity: 'medium',
  kind: 'incomplete-quote',
  title: 'Quantity rescaled from the original quotation',
  detail:
  'The quote covered 12 units and was rescaled to 10. Volume pricing may not hold at the lower quantity.',
  evidence: 'Source: quotation email dated 11 Aug 2026.'
}];


export const purchaseOrders: PurchaseOrder[] = [
{
  id: 'PO-2026-018',
  requestId: 'PR-2026-032',
  quotationId: 'Q-032-A',
  supplierId: 'SUP-002',
  issuedAt: '2026-08-14T10:00:00+07:00',
  issuedBy: 'Trịnh Đức Kiên (Procurement)',
  expectedDelivery: '2026-08-24',
  total: 46_200_000,
  status: 'issued'
},
{
  id: 'PO-2026-017',
  requestId: 'PR-2026-031',
  quotationId: 'Q-031-A',
  supplierId: 'SUP-001',
  issuedAt: '2026-07-10T09:00:00+07:00',
  issuedBy: 'Trịnh Đức Kiên (Procurement)',
  expectedDelivery: '2026-07-15',
  total: 25_300_000,
  status: 'closed',
  receipt: {
    receivedAt: '2026-07-18T11:00:00+07:00',
    receivedBy: 'Phạm Thu Hà (Operations)',
    condition: 'complete',
    note: 'All 200 reams received, three days later than the expected date.'
  },
  closedAt: '2026-07-22T14:00:00+07:00',
  closedBy: 'Trịnh Đức Kiên (Procurement)',
  closeNote: 'Delivery complete and matched to the quotation. Nothing outstanding.'
}];