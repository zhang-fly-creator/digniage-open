-- Zhilao v1.8 RLS recursion fix.
-- Purpose:
--   Fix organization_members RLS self-reference recursion that can cause
--   app-wide read failures after login.
--
-- Run this file in Supabase SQL Editor after:
--   1. supabase/schema.sql
--   2. supabase/v1.8-members.sql
--   3. supabase/v1.7-auth-policies.sql / supabase/v1.8-auth-policies.sql
--
-- Safety:
--   - Do not use service_role in frontend code.
--   - Do not disable RLS.
--   - These helper functions are SECURITY DEFINER so policies can check
--     membership without recursively applying organization_members RLS.

create or replace function public.is_org_member(target_org_id uuid)
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
  );
$$;

create or replace function public.is_org_admin(target_org_id uuid)
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
      and m.role = 'org_admin'
  );
$$;

create or replace function public.can_claim_pending_member(member_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select member_email is not null
    and lower(member_email) = lower(auth.jwt() ->> 'email');
$$;

-- Profiles: keep minimal self-profile policies first.
drop policy if exists "users read own profile" on profiles;
drop policy if exists "users insert own profile" on profiles;
drop policy if exists "users update own profile" on profiles;
drop policy if exists "org admins read member profiles" on profiles;

create policy "users read own profile"
on profiles
for select
to authenticated
using (id = auth.uid());

create policy "users insert own profile"
on profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "users update own profile"
on profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "org admins read member profiles"
on profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.organization_members target_member
    where target_member.user_id = profiles.id
      and target_member.status <> 'removed'
      and public.is_org_admin(target_member.organization_id)
  )
);

-- organization_members: remove policies that directly self-query the table.
drop policy if exists "users read own memberships" on organization_members;
drop policy if exists "users read own and pending memberships" on organization_members;
drop policy if exists "members read own pending or admin scoped members" on organization_members;
drop policy if exists "users claim pending memberships by email" on organization_members;
drop policy if exists "org admins insert organization members" on organization_members;
drop policy if exists "org admins update organization members" on organization_members;

create policy "members read own pending or admin scoped members"
on organization_members
for select
to authenticated
using (
  user_id = auth.uid()
  or (
    status = 'pending'
    and user_id is null
    and public.can_claim_pending_member(email)
  )
  or public.is_org_admin(organization_id)
);

create policy "users claim pending memberships by email"
on organization_members
for update
to authenticated
using (
  status in ('pending', 'active')
  and user_id is null
  and public.can_claim_pending_member(email)
)
with check (
  status = 'active'
  and user_id = auth.uid()
  and public.can_claim_pending_member(email)
);

create policy "org admins insert organization members"
on organization_members
for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy "org admins update organization members"
on organization_members
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create or replace function public.prevent_last_org_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  other_admin_count integer;
begin
  if tg_op = 'DELETE' and old.status = 'active' and old.role = 'org_admin' then
    select count(*)
    into other_admin_count
    from public.organization_members m
    where m.organization_id = old.organization_id
      and m.id <> old.id
      and m.status = 'active'
      and m.role = 'org_admin';

    if other_admin_count = 0 then
      raise exception 'At least one active org_admin must remain in each organization.'
        using errcode = '23514';
    end if;

    return old;
  end if;

  if old.status = 'active'
    and old.role = 'org_admin'
    and (
      new.status <> 'active'
      or new.role <> 'org_admin'
      or new.organization_id is distinct from old.organization_id
    )
  then
    select count(*)
    into other_admin_count
    from public.organization_members m
    where m.organization_id = old.organization_id
      and m.id <> old.id
      and m.status = 'active'
      and m.role = 'org_admin';

    if other_admin_count = 0 then
      raise exception 'At least one active org_admin must remain in each organization.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_last_org_admin_change_trigger on organization_members;
create trigger prevent_last_org_admin_change_trigger
before update or delete on organization_members
for each row
execute function public.prevent_last_org_admin_change();

-- organizations: active members can read; org_admin can update.
drop policy if exists "active members read organizations" on organizations;
drop policy if exists "org admins update organizations" on organizations;

create policy "active members read organizations"
on organizations
for select
to authenticated
using (public.is_org_member(id));

create policy "org admins update organizations"
on organizations
for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

-- elders: active members can read; org_admin can insert/update.
drop policy if exists "active members read elders" on elders;
drop policy if exists "org admins insert elders" on elders;
drop policy if exists "org admins update elders" on elders;

create policy "active members read elders"
on elders
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "org admins insert elders"
on elders
for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy "org admins update elders"
on elders
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- service_opportunities: active members can read; org_admin can update.
drop policy if exists "active members read service opportunities" on service_opportunities;
drop policy if exists "org admins update service opportunities" on service_opportunities;

create policy "active members read service opportunities"
on service_opportunities
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "org admins update service opportunities"
on service_opportunities
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- service_records: active members can read and insert records.
drop policy if exists "active members read service records" on service_records;
drop policy if exists "active members insert service records" on service_records;
drop policy if exists "active members update own service records" on service_records;

create policy "active members read service records"
on service_records
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "active members insert service records"
on service_records
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "active members update own service records"
on service_records
for update
to authenticated
using (
  operator_id = auth.uid()
  and public.is_org_member(organization_id)
)
with check (
  operator_id = auth.uid()
  and public.is_org_member(organization_id)
);
