-- Zhilao v1.8 minimal organization member management migration.
-- Run after supabase/schema.sql and v1.7 auth policies.
-- Frontend continues to use anon / publishable key only.

alter table profiles
add column if not exists email text;

create unique index if not exists unique_profiles_email
on profiles(lower(email))
where email is not null;

alter table organization_members
alter column user_id drop not null;

alter table organization_members
add column if not exists email text;

alter table organization_members
add column if not exists invited_by uuid references profiles(id) on delete set null;

alter table organization_members
add column if not exists invited_at timestamptz;

alter table organization_members
add column if not exists joined_at timestamptz;

create index if not exists idx_organization_members_org_email
on organization_members(organization_id, email);

create index if not exists idx_organization_members_org_status
on organization_members(organization_id, status);

create unique index if not exists unique_org_member_email
on organization_members(organization_id, lower(email))
where email is not null and status <> 'removed';

-- Keep email in sync for existing active rows when matching profile data exists.
update organization_members m
set email = p.email
from profiles p
where m.user_id = p.id
  and m.email is null
  and p.email is not null;
