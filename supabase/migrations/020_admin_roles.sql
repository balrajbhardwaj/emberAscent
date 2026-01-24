-- 020_admin_roles.sql
-- Adds admin roles support on profiles and introduces admin_audit_log table

begin;

alter table if exists profiles
  add column if not exists role text not null default 'user';

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  changes jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

alter table admin_audit_log enable row level security;

create index if not exists admin_audit_log_admin_idx on admin_audit_log (admin_id, created_at desc);
create index if not exists admin_audit_log_entity_idx on admin_audit_log (entity_type, entity_id);

create policy if not exists "Admins can view audit log"
  on admin_audit_log
  for select
  using (
    exists (
      select 1
      from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

create policy if not exists "Admins can insert audit log"
  on admin_audit_log
  for insert
  with check (
    exists (
      select 1
      from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

commit;
