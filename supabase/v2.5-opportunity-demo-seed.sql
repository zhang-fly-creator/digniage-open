-- Zhilao v2.5 demo service opportunities seed
-- Purpose:
--   Insert 15 demo service opportunities for the current organization:
--   - ai: 5
--   - rule: 5
--   - manual: 5
-- Safe to rerun:
--   Uses unique title checks to avoid duplicate inserts.
--
-- Current organization:
--   1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d

with target_elders as (
  select
    id,
    name,
    row_number() over (order by created_at asc, name asc) as rn
  from elders
  where organization_id = '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'
    and status = 'active'
),
seed_rows as (
  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid as organization_id,
    e.id as elder_id,
    '重点关注'::text as type,
    '建议安排一次温和回访'::text as title,
    format('%s最近服务记录里多次提到休息和情绪状态，建议本周安排一次温和回访，可从熟悉兴趣话题切入。', e.name) as description,
    'ai'::text as source,
    'pending'::text as status,
    (current_date + 1) as due_date,
    null::uuid as created_by_user_id,
    'AI助手'::text as created_by_name,
    'ai'::text as created_by_role
  from target_elders e
  where e.rn = 1

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '重点关注',
    '建议补充一次近况了解',
    format('建议联系%s家属补充近期生活变化，为下次陪伴准备更多背景信息。', e.name),
    'ai',
    'pending',
    (current_date + 2),
    null::uuid,
    'AI助手',
    'ai'
  from target_elders e
  where e.rn = 2

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '重点关注',
    '建议安排一次短时问候',
    format('建议先用电话或短探访方式关心%s的近期精神和睡眠情况，再决定是否安排现场探访。', e.name),
    'ai',
    'pending',
    (current_date + 3),
    null::uuid,
    'AI助手',
    'ai'
  from target_elders e
  where e.rn = 3

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '活动邀请',
    '建议安排一次轻活动陪伴',
    format('如果%s状态合适，可尝试以轻量活动作为切入，帮助观察近期状态与表达意愿。', e.name),
    'ai',
    'pending',
    (current_date + 4),
    null::uuid,
    'AI助手',
    'ai'
  from target_elders e
  where e.rn = 1

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '电话问候',
    '建议延续上次熟悉话题',
    format('建议下次继续从%s熟悉的话题进入，减少陌生提问带来的压力。', e.name),
    'ai',
    'pending',
    (current_date + 5),
    null::uuid,
    'AI助手',
    'ai'
  from target_elders e
  where e.rn = 2

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '长期未探访',
    '超过 7 天未形成服务记录',
    format('%s已有一段时间没有新的服务记录，建议安排一次电话问候或现场探访。', e.name),
    'rule',
    'pending',
    (current_date + 1),
    null::uuid,
    null::text,
    null::text
  from target_elders e
  where e.rn = 1

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '生日关怀',
    '生日关怀提醒',
    format('%s的关怀日期临近，建议提前准备一句祝福，或邀请家属录制语音问候。', e.name),
    'rule',
    'pending',
    (current_date + 6),
    null::uuid,
    null::text,
    null::text
  from target_elders e
  where e.rn = 2

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '画像待完善',
    '知老卡信息待完善',
    format('%s的知老卡中“需要避开的话题”或“家属提醒”信息较少，建议下次服务后补充完善。', e.name),
    'rule',
    'pending',
    (current_date + 7),
    null::uuid,
    null::text,
    null::text
  from target_elders e
  where e.rn = 3

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '电话问候',
    '本周应补一次近况回访',
    format('根据固定规则，本周建议完成一次对%s的近况回访。', e.name),
    'rule',
    'pending',
    (current_date + 8),
    null::uuid,
    null::text,
    null::text
  from target_elders e
  where e.rn = 1

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '画像待完善',
    '建议补充家属提醒信息',
    format('系统发现%s的家属协同信息较少，建议下次服务后补充。', e.name),
    'rule',
    'pending',
    (current_date + 9),
    null::uuid,
    null::text,
    null::text
  from target_elders e
  where e.rn = 2

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '探访安排',
    '本周五安排一次入户探访',
    format('工作人员手动创建：本周五下午安排志愿者探访%s，重点了解近期生活状态。', e.name),
    'manual',
    'pending',
    (current_date + 2),
    null::uuid,
    '王老师',
    'staff'
  from target_elders e
  where e.rn = 3

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '电话问候',
    '联系家属补充近况',
    format('工作人员手动创建：请联系家属了解%s最近饮食、睡眠和情绪情况。', e.name),
    'manual',
    'pending',
    (current_date + 3),
    null::uuid,
    '刘社工',
    'staff'
  from target_elders e
  where e.rn = 1

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '活动邀请',
    '邀请参加周末茶话会',
    format('工作人员手动创建：如果%s状态合适，可邀请参加周末社区茶话会。', e.name),
    'manual',
    'pending',
    (current_date + 4),
    null::uuid,
    '机构管理员',
    'org_admin'
  from target_elders e
  where e.rn = 2

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '电话问候',
    '周三上午安排一次电话关怀',
    format('工作人员手动创建：周三上午电话问候%s，重点了解本周精神和睡眠状态。', e.name),
    'manual',
    'pending',
    (current_date + 5),
    null::uuid,
    '王老师',
    'staff'
  from target_elders e
  where e.rn = 3

  union all

  select
    '1dcd4cb7-9667-4fad-a7d9-dbd48d574f3d'::uuid,
    e.id,
    '电话问候',
    '联系家属确认本周安排',
    format('工作人员手动创建：请与%s家属确认本周探访或语音祝福安排。', e.name),
    'manual',
    'pending',
    (current_date + 6),
    null::uuid,
    '刘社工',
    'staff'
  from target_elders e
  where e.rn = 1
)
insert into service_opportunities (
  organization_id,
  elder_id,
  type,
  title,
  description,
  source,
  status,
  due_date,
  created_at,
  updated_at,
  created_by_user_id,
  created_by_name,
  created_by_role
)
select
  seed_rows.organization_id,
  seed_rows.elder_id,
  seed_rows.type,
  seed_rows.title,
  seed_rows.description,
  seed_rows.source,
  seed_rows.status,
  seed_rows.due_date,
  now(),
  now(),
  seed_rows.created_by_user_id,
  seed_rows.created_by_name,
  seed_rows.created_by_role
from seed_rows
where not exists (
  select 1
  from service_opportunities existing
  where existing.organization_id = seed_rows.organization_id
    and existing.elder_id = seed_rows.elder_id
    and existing.title = seed_rows.title
);
