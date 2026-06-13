-- 知老 v1.4 Supabase 数据库准备脚本
-- 本脚本用于准备表结构，不代表 v1.4 已切换到 Supabase。
-- 当前应用默认仍使用 localStorage 数据源：zhilao_app_data。

create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  city text,
  contact_name text,
  contact_phone text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key,
  name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table profiles is '用户基础资料表，id 未来对应 auth.users.id。';

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null default 'staff',
  role_name text,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint organization_members_role_check check (role in ('org_admin', 'staff', 'volunteer')),
  constraint organization_members_status_check check (status in ('active', 'pending', 'removed')),
  constraint organization_members_unique_user unique (organization_id, user_id)
);

create table if not exists elders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,

  name text not null,
  age int,
  gender text,
  nickname text,
  birthday text,
  store_name text,
  contact_note text,
  other_contact_info text,

  avatar_url text,
  avatar_data_url text,

  former_job text,
  life_experience text,
  interests text,
  favorite_topics jsonb default '[]'::jsonb,
  avoid_topics jsonb default '[]'::jsonb,

  communication_style text,
  family_note text,
  care_note_input text,
  staff_note text,

  summary text,
  tags jsonb default '[]'::jsonb,
  communication_advice text,
  care_note text,
  next_suggestion jsonb,

  status text not null default 'active',
  archived_at timestamptz,
  archived_reason text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint elders_status_check check (status in ('active', 'archived'))
);

create table if not exists elder_sensitive_info (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  elder_id uuid not null unique references elders(id) on delete cascade,
  id_card_number text,
  id_card_last4 text,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on column elders.avatar_data_url is '仅用于兼容当前 localStorage 阶段；正式云端后应优先使用 avatar_url。';

create table if not exists service_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  elder_id uuid references elders(id) on delete cascade,

  type text,
  title text not null,
  description text,
  status text not null default 'pending',
  due_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  completed_at timestamptz,
  related_record_id uuid,

  dismiss_reason text,
  dismissed_at timestamptz,
  constraint service_opportunities_status_check check (status in ('pending', 'completed', 'dismissed'))
);

comment on column service_opportunities.related_record_id is '后续可添加到 service_records(id) 的外键；当前先不做外键，避免循环依赖复杂化。';

create table if not exists service_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  elder_id uuid references elders(id) on delete set null,
  related_opportunity_id uuid references service_opportunities(id) on delete set null,

  service_type text,
  elder_status text,
  content text,
  new_info text,
  next_suggestion text,
  generated_opportunities jsonb default '[]'::jsonb,
  duration_hours numeric default 0,
  duration_status text default 'confirmed',
  confirmed_by uuid null,
  confirmed_at timestamptz null,
  operator_name text,
  operator_id uuid references profiles(id) on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists organization_members_organization_id_idx on organization_members(organization_id);
create index if not exists organization_members_user_id_idx on organization_members(user_id);
create index if not exists elders_organization_id_status_idx on elders(organization_id, status);
create index if not exists service_opportunities_organization_status_idx on service_opportunities(organization_id, status);
create index if not exists service_opportunities_elder_id_idx on service_opportunities(elder_id);
create index if not exists service_records_organization_id_idx on service_records(organization_id);
create index if not exists service_records_elder_id_idx on service_records(elder_id);
create index if not exists elder_sensitive_info_organization_id_idx on elder_sensitive_info(organization_id);
create index if not exists elder_sensitive_info_elder_id_idx on elder_sensitive_info(elder_id);

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table elders enable row level security;
alter table elder_sensitive_info enable row level security;
alter table service_opportunities enable row level security;
alter table service_records enable row level security;

-- RLS 草案说明：
-- 当前 v1.4 仅准备 RLS 草案，正式启用需配合 Supabase Auth。
-- 后续策略原则：
-- 1. 用户只能访问自己所属 organization 的 elders、service_opportunities、service_records。
-- 2. org_admin 可以编辑机构设置和管理成员权限。
-- 3. staff / volunteer 权限后续按试点机构需求细分。
-- 4. 开发阶段不要贸然添加过严 policy，避免未接 Auth 前无法访问。
--
-- 示例策略草案（正式启用前需结合 auth.uid() 测试）：
-- create policy "members can read organization elders"
-- on elders for select
-- using (
--   exists (
--     select 1 from organization_members m
--     where m.organization_id = elders.organization_id
--       and m.user_id = auth.uid()
--       and m.status = 'active'
--   )
-- );
