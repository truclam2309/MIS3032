insert into purchase_requests (
    id,
    title,
    department,
    amount,
    category,
    justification,
    requester,
    created_by,
    created_role,
    status,
    created_at,
    budget_limit,
    budget_spent,
    budget_available,
    budget_remaining,
    is_within_budget
)
values (
    'PR-2026-0001',
    'Laptop cho nhân viên mới',
    'Engineering',
    25000000,
    'IT Equipment',
    'Trang bị laptop cho nhân viên mới.',
    'Nguyen Minh Anh',
    'employee@demo.com',
    'employee',
    'PENDING_APPROVAL',
    now(),
    500000000,
    318200000,
    181800000,
    156800000,
    true
)
on conflict (id) do nothing;