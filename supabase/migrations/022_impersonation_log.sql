-- 022_impersonation_log.sql
-- Creates impersonation_sessions table for admin support tooling

begin;

alter table if exists profiles
  add column if not exists role text not null default 'user';

create table if not exists impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id) on delete cascade,
  target_user_id uuid not null references profiles(id) on delete cascade,
  reason text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impersonation_sessions_admin_target_chk check (admin_id <> target_user_id)
);

drop trigger if exists update_impersonation_sessions_updated_at on impersonation_sessions;

create trigger update_impersonation_sessions_updated_at
  before update on impersonation_sessions
  for each row
  execute function update_updated_at_column();

alter table impersonation_sessions enable row level security;

create index if not exists impersonation_sessions_admin_idx on impersonation_sessions (admin_id, started_at desc);
create index if not exists impersonation_sessions_target_idx on impersonation_sessions (target_user_id, started_at desc);
create unique index if not exists impersonation_sessions_admin_active_idx
  on impersonation_sessions(admin_id)
  where ended_at is null;

drop policy if exists "Admins can read impersonation sessions" on impersonation_sessions;

create policy "Admins can read impersonation sessions"
  on impersonation_sessions
  for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can log impersonation sessions" on impersonation_sessions;

create policy "Admins can log impersonation sessions"
  on impersonation_sessions
  for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
    and auth.uid() = admin_id
  );

drop policy if exists "Admins can end their impersonation sessions" on impersonation_sessions;

create policy "Admins can end their impersonation sessions"
  on impersonation_sessions
  for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
    and auth.uid() = admin_id
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
    and auth.uid() = admin_id
  );

commit;
