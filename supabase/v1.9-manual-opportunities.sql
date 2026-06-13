-- Zhilao v1.9 manual service opportunities.
-- Run after supabase/v1.8-rls-recursion-fix.sql.
--
-- Adds source tracking for service_opportunities and allows org_admin/staff
-- members to create manual pending reminders in their own organization.
-- Frontend must only use the anon / publishable key. Never expose service_role.

alter table service_opportunities
add column if not exists source text not null default 'system';

update service_opportunities
set source = 'system'
where source is null or source not in ('system', 'manual');

alter table service_opportunities
alter column source set default 'system';

alter table service_opportunities
alter column source set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_opportunities_source_check'
  ) then
    alter table service_opportunities
    add constraint service_opportunities_source_check
    check (source in ('system', 'manual'));
  end if;
end $$;

create index if not exists idx_service_opportunities_source
on service_opportunities(source);

create or replace function public.has_org_role(target_org_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = target_org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any(allowed_roles)
  );
$$;

drop policy if exists "org admins insert service opportunities" on service_opportunities;
drop policy if exists "org admins and staff insert service opportunities" on service_opportunities;

create policy "org admins and staff insert service opportunities"
on service_opportunities
for insert
to authenticated
with check (
  public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
  and status = 'pending'
  and source = 'manual'
);
