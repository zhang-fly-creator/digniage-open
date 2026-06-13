-- Zhilao v2.2 elder profile privacy fields.
-- Adds structured elder profile fields without deleting or clearing existing data.
-- Frontend must only use the anon / publishable key. Never expose service_role.

alter table elders
add column if not exists birth_date date;

alter table elders
add column if not exists phone text;

alter table elders
add column if not exists emergency_contact_name text;

alter table elders
add column if not exists emergency_contact_phone text;

alter table elders
add column if not exists emergency_contact_relationship text;

alter table elders
add column if not exists address text;

alter table elders
add column if not exists id_card_number text;

alter table elders
add column if not exists health_condition text;

alter table elders
add column if not exists care_notes_public text;

alter table elders
add column if not exists private_notes text;

drop policy if exists "org admins insert elders" on elders;
drop policy if exists "org admins update elders" on elders;
drop policy if exists "org admins and staff insert elders" on elders;
drop policy if exists "org admins and staff update elders" on elders;

create policy "org admins and staff insert elders"
on elders
for insert
to authenticated
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

create policy "org admins and staff update elders"
on elders
for update
to authenticated
using (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]))
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));
