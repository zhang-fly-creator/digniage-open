-- Zhilao v2.0 assigned service opportunities policies.
-- Run after supabase/v2.0-assigned-opportunities.sql.
--
-- Goals:
--   - active organization members can read service opportunities in their org
--   - org_admin / staff can create and update service opportunities
--   - assigned volunteers can only complete their own pending opportunities
-- Frontend must only use the anon / publishable key. Never expose service_role.

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

create or replace function public.prevent_unsafe_assigned_opportunity_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.has_org_role(old.organization_id, array['org_admin', 'staff']::text[]) then
    return new;
  end if;

  if old.assigned_to_user_id = auth.uid()
    and new.assigned_to_user_id = old.assigned_to_user_id
    and new.assigned_to_member_id is not distinct from old.assigned_to_member_id
    and new.assigned_to_name is not distinct from old.assigned_to_name
    and new.assigned_role is not distinct from old.assigned_role
    and new.assigned_at is not distinct from old.assigned_at
    and new.assigned_by is not distinct from old.assigned_by
    and new.organization_id = old.organization_id
    and new.elder_id is not distinct from old.elder_id
    and new.type is not distinct from old.type
    and new.title is not distinct from old.title
    and new.description is not distinct from old.description
    and new.source is not distinct from old.source
    and new.due_date is not distinct from old.due_date
    and new.created_at is not distinct from old.created_at
    and old.status = 'pending'
    and new.status = 'completed'
    and new.related_record_id is not null
    and new.completed_at is not null
    and coalesce(new.dismiss_reason, '') = ''
    and new.dismissed_at is null
  then
    return new;
  end if;

  raise exception 'You can only complete service opportunities assigned to you.'
    using errcode = '42501';
end;
$$;

drop trigger if exists prevent_unsafe_assigned_opportunity_update_trigger on service_opportunities;
create trigger prevent_unsafe_assigned_opportunity_update_trigger
before update on service_opportunities
for each row
execute function public.prevent_unsafe_assigned_opportunity_update();

drop policy if exists "org admins insert service opportunities" on service_opportunities;
drop policy if exists "org admins and staff insert service opportunities" on service_opportunities;
drop policy if exists "org admins update service opportunities" on service_opportunities;
drop policy if exists "org admins and staff update service opportunities" on service_opportunities;
drop policy if exists "assigned members complete own service opportunities" on service_opportunities;
drop policy if exists "org admins and staff read active members" on organization_members;

create policy "org admins and staff insert service opportunities"
on service_opportunities
for insert
to authenticated
with check (
  public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
);

create policy "org admins and staff update service opportunities"
on service_opportunities
for update
to authenticated
using (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]))
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

create policy "assigned members complete own service opportunities"
on service_opportunities
for update
to authenticated
using (
  assigned_to_user_id = auth.uid()
  and status = 'pending'
  and public.is_org_member(organization_id)
)
with check (
  assigned_to_user_id = auth.uid()
  and status = 'completed'
  and public.is_org_member(organization_id)
);

create policy "org admins and staff read active members"
on organization_members
for select
to authenticated
using (
  status = 'active'
  and public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
);
