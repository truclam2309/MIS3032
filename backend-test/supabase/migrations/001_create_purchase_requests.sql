create table if not exists purchase_requests (
    id text primary key,
    title varchar(120) not null,
    department text not null,
    amount numeric(15,2) not null check (amount > 0),
    category text not null,
    justification text not null,
    requester text not null default 'Nguyen Minh Anh',

    created_by text not null,
    created_role text not null,

    status text not null default 'PENDING_APPROVAL'
        check (
            status in (
                'PENDING_APPROVAL',
                'APPROVED',
                'REJECTED',
                'REVISION_REQUIRED'
            )
        ),

    created_at timestamptz not null default now(),

    approved_by text,
    approved_at timestamptz,
    approval_comment text,

    rejected_by text,
    rejected_at timestamptz,

    revision_requested_by text,
    revision_requested_at timestamptz,
    revision_comment text,

    next_approval_role text,

    budget_limit numeric(15,2),
    budget_spent numeric(15,2),
    budget_available numeric(15,2),
    budget_remaining numeric(15,2),
    is_within_budget boolean
);

create index if not exists idx_purchase_requests_status
    on purchase_requests(status);

create index if not exists idx_purchase_requests_created_by
    on purchase_requests(created_by);

create index if not exists idx_purchase_requests_created_at
    on purchase_requests(created_at);