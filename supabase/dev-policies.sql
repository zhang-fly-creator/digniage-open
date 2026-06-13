-- Zhilao v1.6B / v1.6C-D development test policies.
-- These policies are only for local or pilot development with the anon key.
-- After Supabase Auth is introduced, replace them with organization-scoped RLS:
-- users may only access elders, service opportunities, and service records
-- belonging to their organizations, and org_admin / staff / volunteer should
-- receive role-specific permissions.
-- Never use a service_role key in frontend code.

-- v1.6B development test: allow anon to read elders.
drop policy if exists "dev anon read elders" on elders;
create policy "dev anon read elders"
on elders
for select
to anon
using (true);

-- v1.6B development test: allow anon to insert elders.
drop policy if exists "dev anon insert elders" on elders;
create policy "dev anon insert elders"
on elders
for insert
to anon
with check (true);

-- v1.6B development test: allow anon to update elders.
drop policy if exists "dev anon update elders" on elders;
create policy "dev anon update elders"
on elders
for update
to anon
using (true)
with check (true);

-- v1.6C-D development test: allow anon to read service opportunities.
drop policy if exists "dev anon read service opportunities" on service_opportunities;
create policy "dev anon read service opportunities"
on service_opportunities
for select
to anon
using (true);

-- v1.6C-D development test: allow anon to insert service opportunities.
drop policy if exists "dev anon insert service opportunities" on service_opportunities;
create policy "dev anon insert service opportunities"
on service_opportunities
for insert
to anon
with check (true);

-- v1.6C-D development test: allow anon to update service opportunities.
drop policy if exists "dev anon update service opportunities" on service_opportunities;
create policy "dev anon update service opportunities"
on service_opportunities
for update
to anon
using (true)
with check (true);

-- v1.6C-D development test: allow anon to read service records.
drop policy if exists "dev anon read service records" on service_records;
create policy "dev anon read service records"
on service_records
for select
to anon
using (true);

-- v1.6C-D development test: allow anon to insert service records.
drop policy if exists "dev anon insert service records" on service_records;
create policy "dev anon insert service records"
on service_records
for insert
to anon
with check (true);

-- v1.6C-D development test: allow anon to update service records.
drop policy if exists "dev anon update service records" on service_records;
create policy "dev anon update service records"
on service_records
for update
to anon
using (true)
with check (true);
