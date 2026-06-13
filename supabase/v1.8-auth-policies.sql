-- Zhilao v1.8 member management RLS policies.
-- Run after supabase/v1.8-members.sql.
--
-- This file only installs the member-management policies added in v1.8.
-- For the full, safe policy set across all organization data tables, prefer
-- running supabase/v1.8-rls-recursion-fix.sql last.
--
-- Frontend must only use the anon / publishable key. Never expose service_role.

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

-- Profiles: users can read their own profile, and active org_admin users can
-- read profiles for visible members in their organization.
drop policy if exists "org admins read member profiles" on profiles;
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

-- Replace broad own-membership read with:
-- 1. users can read their own membership rows
-- 2. pending users can read pending rows matching their auth email
-- 3. active org_admin can read all members in their organization
drop policy if exists "users read own memberships" on organization_members;
drop policy if exists "users read own and pending memberships" on organization_members;
drop policy if exists "members read own pending or admin scoped members" on organization_members;
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

-- A logged-in user can claim a pending membership for their own email.
drop policy if exists "users claim pending memberships by email" on organization_members;
create policy "users claim pending memberships by email"
on organization_members
for update
to authenticated
using (
  status = 'pending'
  and user_id is null
  and public.can_claim_pending_member(email)
)
with check (
  status = 'active'
  and user_id = auth.uid()
  and public.can_claim_pending_member(email)
);

-- Active org_admin can add pending members for their organization.
drop policy if exists "org admins insert organization members" on organization_members;
create policy "org admins insert organization members"
on organization_members
for insert
to authenticated
with check (public.is_org_admin(organization_id));

-- Active org_admin can update member role/status in their organization.
drop policy if exists "org admins update organization members" on organization_members;
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

-- Removed members stop matching active-member policies because all organization
-- data access checks require m.status = 'active'.
