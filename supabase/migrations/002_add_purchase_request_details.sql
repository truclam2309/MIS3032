alter table purchase_requests
    add column if not exists details jsonb not null default '{}'::jsonb;
