-- Zhilao v2.3 news posts.
-- Frontend uses anon / publishable key only. Never expose service_role.

create table if not exists news_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  scope text not null default 'organization',
  title text not null,
  summary text,
  content text not null,
  category text default '动态',
  status text not null default 'published',
  cover_image_url text,
  author_id uuid references profiles(id) on delete set null,
  author_name text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint news_posts_scope_check check (scope in ('platform', 'organization')),
  constraint news_posts_status_check check (status in ('draft', 'published', 'archived')),
  constraint news_posts_org_scope_check check (
    (scope = 'platform' and organization_id is null)
    or (scope = 'organization' and organization_id is not null)
  )
);

create index if not exists idx_news_posts_scope_status
on news_posts(scope, status);

create index if not exists idx_news_posts_org_status
on news_posts(organization_id, status);

create index if not exists idx_news_posts_published_at
on news_posts(published_at desc nulls last, created_at desc);

create or replace function public.set_news_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_news_posts_updated_at_trigger on news_posts;
create trigger set_news_posts_updated_at_trigger
before update on news_posts
for each row
execute function public.set_news_posts_updated_at();

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

alter table news_posts enable row level security;

drop policy if exists "active members read published platform news" on news_posts;
drop policy if exists "active members read published organization news" on news_posts;
drop policy if exists "public read published platform news" on news_posts;
drop policy if exists "public read published organization news" on news_posts;
drop policy if exists "org admins and staff insert organization news" on news_posts;
drop policy if exists "org admins and staff update organization news" on news_posts;

create policy "public read published platform news"
on news_posts
for select
using (
  scope = 'platform'
  and status = 'published'
);

create policy "public read published organization news"
on news_posts
for select
using (
  scope = 'organization'
  and status = 'published'
);

create policy "org admins and staff insert organization news"
on news_posts
for insert
to authenticated
with check (
  scope = 'organization'
  and public.has_org_role(organization_id, array['org_admin', 'staff']::text[])
);

create policy "org admins and staff update organization news"
on news_posts
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

-- Sample seed posts for demos / QA.
-- Current organization id:
--   1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d
-- Safe to rerun due to ON CONFLICT DO NOTHING.

insert into news_posts (
  id,
  organization_id,
  scope,
  title,
  summary,
  content,
  category,
  status,
  author_name,
  published_at,
  created_at,
  updated_at
)
values
(
  '6ecb9d4c-8a71-4d03-b7c3-6fe2dfb0f101',
  null,
  'platform',
  '知老平台试点进展更新',
  '本周继续完善长者档案、服务提醒与成员协作能力。',
  '知老平台本周继续完善长者档案、服务机会、服务记录和成员协作流程。动态内容如涉及长者个人信息，请注意脱敏处理，避免公开详细住址、完整电话、身份证号和病历信息。',
  '系统',
  'published',
  '知老平台',
  '2026-05-10T09:00:00+08:00',
  '2026-05-10T09:00:00+08:00',
  '2026-05-10T09:00:00+08:00'
),
(
  '2b81f5b9-1d40-44d3-86ac-6b7b9243f102',
  null,
  'platform',
  '陪伴记录填写提醒',
  '建议在探访结束后尽快补充服务记录，帮助机构形成连续陪伴线索。',
  '平台提醒各试点机构在完成电话问候、入户探访和活动陪伴后，尽量在当天补充服务记录。这样可以帮助后续成员更快了解长者近况，也便于机构形成连续服务线索。',
  '通知',
  'published',
  '知老平台',
  '2026-05-09T18:30:00+08:00',
  '2026-05-09T18:30:00+08:00',
  '2026-05-09T18:30:00+08:00'
),
(
  '8d63fa4d-bc9e-4b6e-a832-7397c6dbf103',
  '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d',
  'organization',
  '本周电话问候优先安排',
  '本周优先联系长期未探访和近期情绪波动较明显的长者。',
  '请本周优先完成长期未探访长者的电话问候，并特别关注近期情绪波动较明显的服务对象。记录内容请尽量脱敏，如需联系家属，请通过机构统一方式进行。',
  '通知',
  'published',
  '张晓明',
  '2026-05-10T08:30:00+08:00',
  '2026-05-10T08:30:00+08:00',
  '2026-05-10T08:30:00+08:00'
),
(
  '44b5b3c7-9dc5-4b64-9e98-1d4a1e71f104',
  '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d',
  'organization',
  '周五小组手工活动预告',
  '本周五下午将开展轻量手工活动，欢迎服务人员提前邀请合适长者参加。',
  '本周五下午两点，活动室将开展轻量手工活动。请服务人员结合长者兴趣和身体情况，提前邀请适合参与的老人参加。活动中注意节奏温和，避免长时间站立。',
  '活动',
  'published',
  '测试服务人员',
  '2026-05-09T14:00:00+08:00',
  '2026-05-09T14:00:00+08:00',
  '2026-05-09T14:00:00+08:00'
),
(
  'f4d06054-8f5e-4d55-8355-f091a3f3f105',
  '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d',
  'organization',
  '探访陪伴小结：一起做手工更自然',
  '近期几次陪伴显示，边做简单手工边聊天，更容易帮助部分长者放松。',
  '近期几次陪伴中，服务人员发现边做简单手工边聊天，比连续提问更容易帮助部分长者放松，也更利于自然观察情绪和表达状态。后续可继续尝试这类轻量互动方式。',
  '案例',
  'published',
  '张晓明',
  '2026-05-08T16:20:00+08:00',
  '2026-05-08T16:20:00+08:00',
  '2026-05-08T16:20:00+08:00'
),
(
  '907482bf-577c-48d5-9da1-47f77d5ef106',
  '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d',
  'organization',
  '五月服务排班提醒',
  '请大家在处理服务提醒前先确认负责人和可用时间。',
  '进入五月后，请大家在处理服务提醒前先确认负责人、长者当前状态和可用时间。若需改派，请在服务机会详情中更新负责人，避免重复联系。',
  '动态',
  'published',
  '测试服务人员',
  '2026-05-07T11:10:00+08:00',
  '2026-05-07T11:10:00+08:00',
  '2026-05-07T11:10:00+08:00'
)
on conflict (id) do nothing;
