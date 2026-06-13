-- Zhilao v2.5 service opportunity source metadata.
-- Frontend continues to use anon / publishable key only.

alter table service_opportunities
add column if not exists source text default 'rule';

alter table service_opportunities
drop constraint if exists service_opportunities_source_check;

alter table service_opportunities
drop constraint if exists service_opportunities_source_v25_check;

update service_opportunities
set source = 'rule'
where source is null
   or source in ('system', 'AI发现')
   or source not in ('ai', 'rule', 'manual', 'AI建议');

update service_opportunities
set source = 'ai'
where source = 'AI建议';

alter table service_opportunities
alter column source set default 'rule';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_opportunities_source_v25_check'
  ) then
    alter table service_opportunities
    add constraint service_opportunities_source_v25_check
    check (source in ('ai', 'rule', 'manual'));
  end if;
end $$;

alter table service_opportunities
add column if not exists created_by_user_id uuid references profiles(id) on delete set null;

alter table service_opportunities
add column if not exists created_by_name text;

alter table service_opportunities
add column if not exists created_by_role text;
