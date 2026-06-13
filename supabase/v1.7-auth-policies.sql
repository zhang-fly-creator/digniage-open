-- Zhilao v1.7 Supabase Auth + organization member RLS policies.
-- Run after supabase/schema.sql.
-- Frontend must only use the anon / publishable key. Never expose service_role.

-- Profiles: a logged-in user can read, create, and update only their own profile.
drop policy if exists "users read own profile" on profiles;
create policy "users read own profile"
on profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users insert own profile" on profiles;
create policy "users insert own profile"
on profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile"
on profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Organization membership: current user can read their own active/pending/removed membership rows.
drop policy if exists "users read own memberships" on organization_members;
create policy "users read own memberships"
on organization_members
for select
to authenticated
using (user_id = auth.uid());

-- Organizations: active members can read their organization; org_admin can update it.
drop policy if exists "active members read organizations" on organizations;
create policy "active members read organizations"
on organizations
for select
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists "org admins update organizations" on organizations;
create policy "org admins update organizations"
on organizations
for update
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'org_admin'
  )
)
with check (
  exists (
    select 1
    from organization_members m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'org_admin'
  )
);

-- Elders: active members can read; org_admin can create/update/archive/restore.
drop policy if exists "active members read elders" on elders;
create policy "active members read elders"
on elders
for select
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = elders.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists "org admins insert elders" on elders;
create policy "org admins insert elders"
on elders
for insert
to authenticated
with check (
  exists (
    select 1
    from organization_members m
    where m.organization_id = elders.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'org_admin'
  )
);

drop policy if exists "org admins update elders" on elders;
create policy "org admins update elders"
on elders
for update
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = elders.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'org_admin'
  )
)
with check (
  exists (
    select 1
    from organization_members m
    where m.organization_id = elders.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'org_admin'
  )
);

-- Service opportunities: active members can read; org_admin can close/complete/update.
drop policy if exists "active members read service opportunities" on service_opportunities;
create policy "active members read service opportunities"
on service_opportunities
for select
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = service_opportunities.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists "org admins update service opportunities" on service_opportunities;
create policy "org admins update service opportunities"
on service_opportunities
for update
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = service_opportunities.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'org_admin'
  )
)
with check (
  exists (
    select 1
    from organization_members m
    where m.organization_id = service_opportunities.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'org_admin'
  )
);

-- Service records: active members can read and create records for their organization.
drop policy if exists "active members read service records" on service_records;
create policy "active members read service records"
on service_records
for select
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = service_records.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists "active members insert service records" on service_records;
create policy "active members insert service records"
on service_records
for insert
to authenticated
with check (
  exists (
    select 1
    from organization_members m
    where m.organization_id = service_records.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists "active members update own service records" on service_records;
create policy "active members update own service records"
on service_records
for update
to authenticated
using (
  operator_id = auth.uid()
  and exists (
    select 1
    from organization_members m
    where m.organization_id = service_records.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
)
with check (
  operator_id = auth.uid()
  and exists (
    select 1
    from organization_members m
    where m.organization_id = service_records.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);
