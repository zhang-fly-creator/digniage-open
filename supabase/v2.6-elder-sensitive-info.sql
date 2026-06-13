-- Zhilao v2.6 elder sensitive identity info.
-- Stores ID card number outside the public elder profile surface.

create table if not exists public.elder_sensitive_info (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  elder_id uuid not null unique references public.elders(id) on delete cascade,
  id_card_number text,
  id_card_last4 text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists elder_sensitive_info_organization_id_idx
on public.elder_sensitive_info(organization_id);

create index if not exists elder_sensitive_info_elder_id_idx
on public.elder_sensitive_info(elder_id);

alter table public.elder_sensitive_info enable row level security;

drop policy if exists "staff and admins read elder sensitive info" on public.elder_sensitive_info;
create policy "staff and admins read elder sensitive info"
on public.elder_sensitive_info
for select
using (
  exists (
    select 1
    from public.organization_members m
    where m.organization_id = elder_sensitive_info.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('org_admin', 'staff')
  )
);

drop policy if exists "staff and admins insert elder sensitive info" on public.elder_sensitive_info;
create policy "staff and admins insert elder sensitive info"
on public.elder_sensitive_info
for insert
with check (
  exists (
    select 1
    from public.organization_members m
    where m.organization_id = elder_sensitive_info.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('org_admin', 'staff')
  )
);

drop policy if exists "staff and admins update elder sensitive info" on public.elder_sensitive_info;
create policy "staff and admins update elder sensitive info"
on public.elder_sensitive_info
for update
using (
  exists (
    select 1
    from public.organization_members m
    where m.organization_id = elder_sensitive_info.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('org_admin', 'staff')
  )
)
with check (
  exists (
    select 1
    from public.organization_members m
    where m.organization_id = elder_sensitive_info.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('org_admin', 'staff')
  )
);
