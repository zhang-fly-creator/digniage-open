-- DigniAge / 知老 Demo schema
-- 目的：
-- 1. 仅提供当前前端代码需要的 public schema
-- 2. 不导入任何备份数据
-- 3. 不创建 auth.users，不写入真实用户或真实业务数据
--
-- 建议在全新 Supabase 项目的 SQL Editor 中执行

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  city text,
  contact_name text,
  contact_phone text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_unique_idx
on public.profiles (lower(email))
where email is not null;

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text,
  name text,
  role text not null default 'staff',
  role_name text,
  status text not null default 'active',
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_members_role_check
    check (role in ('org_admin', 'staff', 'volunteer')),
  constraint organization_members_status_check
    check (status in ('active', 'pending', 'removed'))
);

create unique index if not exists organization_members_unique_user_idx
on public.organization_members (organization_id, user_id)
where user_id is not null;

create unique index if not exists organization_members_unique_email_idx
on public.organization_members (organization_id, lower(email))
where email is not null and status <> 'removed';

create index if not exists organization_members_org_idx
on public.organization_members (organization_id);

create index if not exists organization_members_user_idx
on public.organization_members (user_id);

create index if not exists organization_members_org_status_idx
on public.organization_members (organization_id, status);

create table if not exists public.elders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  age integer,
  birth_date date,
  gender text,
  nickname text,
  birthday text,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  address text,
  store_name text,
  contact_note text,
  other_contact_info text,
  avatar_url text,
  avatar_data_url text,
  former_job text,
  life_experience text,
  interests text,
  favorite_topics jsonb not null default '[]'::jsonb,
  avoid_topics jsonb not null default '[]'::jsonb,
  communication_style text,
  family_note text,
  care_note_input text,
  staff_note text,
  summary text,
  tags jsonb not null default '[]'::jsonb,
  communication_advice text,
  care_note text,
  next_suggestion jsonb,
  health_condition text,
  care_notes_public text,
  private_notes text,
  status text not null default 'active',
  archived_at timestamptz,
  archived_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint elders_status_check check (status in ('active', 'archived'))
);

create index if not exists elders_org_status_idx
on public.elders (organization_id, status);

create table if not exists public.elder_sensitive_info (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  elder_id uuid not null unique references public.elders(id) on delete cascade,
  id_card_number text,
  id_card_last4 text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists elder_sensitive_info_org_idx
on public.elder_sensitive_info (organization_id);

create index if not exists elder_sensitive_info_elder_idx
on public.elder_sensitive_info (elder_id);

create table if not exists public.service_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  elder_id uuid references public.elders(id) on delete cascade,
  type text,
  title text not null,
  description text,
  status text not null default 'pending',
  due_date text,
  source text not null default 'rule',
  created_by_user_id uuid references public.profiles(id) on delete set null,
  created_by_name text,
  created_by_role text,
  assigned_to_user_id uuid references public.profiles(id) on delete set null,
  assigned_to_member_id uuid references public.organization_members(id) on delete set null,
  assigned_to_name text,
  assigned_role text,
  assigned_at timestamptz,
  assigned_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  related_record_id uuid,
  dismiss_reason text,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_opportunities_status_check
    check (status in ('pending', 'completed', 'dismissed')),
  constraint service_opportunities_source_check
    check (source in ('ai', 'rule', 'manual'))
);

create index if not exists service_opportunities_org_status_idx
on public.service_opportunities (organization_id, status);

create index if not exists service_opportunities_elder_idx
on public.service_opportunities (elder_id);

create index if not exists service_opportunities_source_idx
on public.service_opportunities (source);

create index if not exists service_opportunities_assigned_user_idx
on public.service_opportunities (assigned_to_user_id);

create index if not exists service_opportunities_assigned_member_idx
on public.service_opportunities (assigned_to_member_id);

create index if not exists service_opportunities_org_assigned_user_idx
on public.service_opportunities (organization_id, assigned_to_user_id);

create table if not exists public.service_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  elder_id uuid references public.elders(id) on delete set null,
  related_opportunity_id uuid references public.service_opportunities(id) on delete set null,
  service_type text,
  elder_status text,
  content text,
  new_info text,
  next_suggestion jsonb,
  generated_opportunities jsonb not null default '[]'::jsonb,
  duration_hours numeric not null default 0,
  duration_status text not null default 'confirmed',
  confirmed_by uuid,
  confirmed_at timestamptz,
  operator_name text,
  operator_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_records_duration_status_check
    check (duration_status in ('pending', 'confirmed'))
);

create index if not exists service_records_org_idx
on public.service_records (organization_id);

create index if not exists service_records_elder_idx
on public.service_records (elder_id);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  scope text not null default 'organization',
  title text not null,
  summary text,
  content text not null,
  category text default '动态',
  status text not null default 'published',
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_posts_scope_check check (scope in ('platform', 'organization')),
  constraint news_posts_status_check check (status in ('draft', 'published', 'archived')),
  constraint news_posts_org_scope_check check (
    (scope = 'platform' and organization_id is null)
    or (scope = 'organization' and organization_id is not null)
  )
);

create index if not exists news_posts_scope_status_idx
on public.news_posts (scope, status);

create index if not exists news_posts_org_status_idx
on public.news_posts (organization_id, status);

create index if not exists news_posts_published_at_idx
on public.news_posts (published_at desc nulls last, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_organizations_updated_at on public.organizations;
create trigger touch_organizations_updated_at
before update on public.organizations
for each row execute function public.touch_updated_at();

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_organization_members_updated_at on public.organization_members;
create trigger touch_organization_members_updated_at
before update on public.organization_members
for each row execute function public.touch_updated_at();

drop trigger if exists touch_elders_updated_at on public.elders;
create trigger touch_elders_updated_at
before update on public.elders
for each row execute function public.touch_updated_at();

drop trigger if exists touch_elder_sensitive_info_updated_at on public.elder_sensitive_info;
create trigger touch_elder_sensitive_info_updated_at
before update on public.elder_sensitive_info
for each row execute function public.touch_updated_at();

drop trigger if exists touch_service_opportunities_updated_at on public.service_opportunities;
create trigger touch_service_opportunities_updated_at
before update on public.service_opportunities
for each row execute function public.touch_updated_at();

drop trigger if exists touch_service_records_updated_at on public.service_records;
create trigger touch_service_records_updated_at
before update on public.service_records
for each row execute function public.touch_updated_at();

drop trigger if exists touch_news_posts_updated_at on public.news_posts;
create trigger touch_news_posts_updated_at
before update on public.news_posts
for each row execute function public.touch_updated_at();

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

create or replace function public.can_claim_pending_member(member_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select member_email is not null
    and lower(member_email) = lower(auth.jwt() ->> 'email');
$$;

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

drop trigger if exists prevent_last_org_admin_change_trigger on public.organization_members;
create trigger prevent_last_org_admin_change_trigger
before update or delete on public.organization_members
for each row
execute function public.prevent_last_org_admin_change();

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

drop trigger if exists prevent_unsafe_assigned_opportunity_update_trigger on public.service_opportunities;
create trigger prevent_unsafe_assigned_opportunity_update_trigger
before update on public.service_opportunities
for each row
execute function public.prevent_unsafe_assigned_opportunity_update();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.elders enable row level security;
alter table public.elder_sensitive_info enable row level security;
alter table public.service_opportunities enable row level security;
alter table public.service_records enable row level security;
alter table public.news_posts enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "org admins read member profiles" on public.profiles;
create policy "org admins read member profiles"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.organization_members target_member
    where target_member.user_id = public.profiles.id
      and target_member.status <> 'removed'
      and public.is_org_admin(target_member.organization_id)
  )
);

drop policy if exists "members read own pending or admin scoped members" on public.organization_members;
create policy "members read own pending or admin scoped members"
on public.organization_members
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

drop policy if exists "org admins and staff read active members" on public.organization_members;
create policy "org admins and staff read active members"
on public.organization_members
for select
to authenticated
using (
  status = 'active'
  and public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
);

drop policy if exists "users claim pending memberships by email" on public.organization_members;
create policy "users claim pending memberships by email"
on public.organization_members
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

drop policy if exists "org admins insert organization members" on public.organization_members;
create policy "org admins insert organization members"
on public.organization_members
for insert
to authenticated
with check (public.is_org_admin(organization_id));

drop policy if exists "org admins update organization members" on public.organization_members;
create policy "org admins update organization_members"
on public.organization_members
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "active members read organizations" on public.organizations;
create policy "active members read organizations"
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

drop policy if exists "org admins update organizations" on public.organizations;
create policy "org admins update organizations"
on public.organizations
for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

drop policy if exists "active members read elders" on public.elders;
create policy "active members read elders"
on public.elders
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "org admins and staff insert elders" on public.elders;
create policy "org admins and staff insert elders"
on public.elders
for insert
to authenticated
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "org admins and staff update elders" on public.elders;
create policy "org admins and staff update elders"
on public.elders
for update
to authenticated
using (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]))
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "staff and admins read elder sensitive info" on public.elder_sensitive_info;
create policy "staff and admins read elder sensitive info"
on public.elder_sensitive_info
for select
to authenticated
using (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "staff and admins insert elder sensitive info" on public.elder_sensitive_info;
create policy "staff and admins insert elder sensitive info"
on public.elder_sensitive_info
for insert
to authenticated
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "staff and admins update elder sensitive info" on public.elder_sensitive_info;
create policy "staff and admins update elder sensitive info"
on public.elder_sensitive_info
for update
to authenticated
using (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]))
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "active members read service opportunities" on public.service_opportunities;
create policy "active members read service opportunities"
on public.service_opportunities
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "org admins and staff insert service opportunities" on public.service_opportunities;
create policy "org admins and staff insert service opportunities"
on public.service_opportunities
for insert
to authenticated
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "org admins and staff update service opportunities" on public.service_opportunities;
create policy "org admins and staff update service opportunities"
on public.service_opportunities
for update
to authenticated
using (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]))
with check (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "assigned members complete own service opportunities" on public.service_opportunities;
create policy "assigned members complete own service opportunities"
on public.service_opportunities
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

drop policy if exists "active members read service records" on public.service_records;
create policy "active members read service records"
on public.service_records
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "active members insert service records" on public.service_records;
create policy "active members insert service records"
on public.service_records
for insert
to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists "active members update own service records" on public.service_records;
create policy "active members update own service records"
on public.service_records
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

drop policy if exists "org admins and staff delete service records" on public.service_records;
create policy "org admins and staff delete service records"
on public.service_records
for delete
to authenticated
using (public.has_org_role(organization_id, array['org_admin', 'staff']::text[]));

drop policy if exists "public read published platform news" on public.news_posts;
create policy "public read published platform news"
on public.news_posts
for select
using (
  scope = 'platform'
  and status = 'published'
);

drop policy if exists "public read published organization news" on public.news_posts;
create policy "public read published organization news"
on public.news_posts
for select
using (
  scope = 'organization'
  and status = 'published'
);

drop policy if exists "org admins and staff insert organization news" on public.news_posts;
create policy "org admins and staff insert organization news"
on public.news_posts
for insert
to authenticated
with check (
  scope = 'organization'
  and public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
);

drop policy if exists "org admins and staff update organization news" on public.news_posts;
create policy "org admins and staff update organization news"
on public.news_posts
for update
to authenticated
using (
  scope = 'organization'
  and public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
)
with check (
  scope = 'organization'
  and public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
);
