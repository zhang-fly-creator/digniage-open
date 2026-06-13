-- Zhilao v2.4 member permissions and lightweight preregistration support.
-- Frontend continues to use anon / publishable key only.

alter table organization_members
add column if not exists name text;
