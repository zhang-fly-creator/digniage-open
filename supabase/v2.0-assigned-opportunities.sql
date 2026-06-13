-- Zhilao v2.0 assigned service opportunities.
-- Run after supabase/v1.9-manual-opportunities.sql.
--
-- Adds lightweight assignee fields to service_opportunities.
-- Frontend must only use the anon / publishable key. Never expose service_role.

alter table service_opportunities
add column if not exists assigned_to_user_id uuid references profiles(id) on delete set null;

alter table service_opportunities
add column if not exists assigned_to_member_id uuid references organization_members(id) on delete set null;

alter table service_opportunities
add column if not exists assigned_to_name text;

alter table service_opportunities
add column if not exists assigned_role text;

alter table service_opportunities
add column if not exists assigned_at timestamptz;

alter table service_opportunities
add column if not exists assigned_by uuid references profiles(id) on delete set null;

create index if not exists idx_service_opportunities_assigned_to_user
on service_opportunities(assigned_to_user_id);

create index if not exists idx_service_opportunities_assigned_to_member
on service_opportunities(assigned_to_member_id);

create index if not exists idx_service_opportunities_org_assigned
on service_opportunities(organization_id, assigned_to_user_id);
