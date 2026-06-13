# 知老 v1.8 Supabase 数据源与成员权限说明

v1.4-v1.6 完成 Supabase 数据库准备与业务表迁移，v1.7 接入 Supabase Auth 与机构成员权限，v1.8 增加最小机构成员管理、待加入成员认领，以及 `organization_members` RLS 递归修复。v1.9 增加人工创建服务提醒。

## 当前默认数据源

默认仍使用 localStorage：

```text
VITE_DATA_PROVIDER=localStorage
```

切换 Supabase 测试时使用：

```text
VITE_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon key
```

不要把真实密钥提交到仓库。前端只能使用 anon / publishable key，不要使用 `service_role` key。

## Supabase 接入范围

当 `VITE_DATA_PROVIDER=supabase` 时：

- `/auth` 使用 Supabase Auth 邮箱密码登录 / 注册。
- 当前用户资料来自 `profiles`，其中 `profiles.id = auth.users.id`。
- 当前机构身份来自 `organization_members`。
- `organizations`、`elders`、`service_opportunities`、`service_records` 从 Supabase 读写。
- `/members` 和 `/org/members` 提供最小机构成员管理。
- `/opportunities/new` 和 `/org/opportunities/new` 支持 org_admin / staff 人工创建服务提醒。
- localStorage fallback 继续使用 `zhilao_app_data` 与 mock 身份。

当前仍不接入：

- Supabase Storage 头像上传。
- 邮件邀请发送 / Edge Functions。
- AI 总结、真实 AI 服务、硬件推送、SMS / 微信登录、多机构切换。

## SQL 执行顺序

新环境建议按顺序执行：

```text
supabase/schema.sql
supabase/v1.7-auth-policies.sql
supabase/v1.8-members.sql
supabase/v1.8-rls-recursion-fix.sql
supabase/v1.9-manual-opportunities.sql
```

如果已经执行过旧的 v1.8 policy，请再次执行：

```text
supabase/v1.8-rls-recursion-fix.sql
```

先把 `supabase/v1.8-rls-recursion-fix.sql` 作为 v1.8 的最终修复脚本执行，再执行 `supabase/v1.9-manual-opportunities.sql`。v1.8 修复会安装 non-recursive helper functions、重建核心 RLS policies、允许机构管理员读取成员 profile 名称，并用数据库 trigger 防止移除 / 降级最后一名 active `org_admin`。v1.9 脚本会新增 `service_opportunities.source`，并允许 org_admin / staff 插入人工服务提醒。

## 成员管理规则

- `org_admin` 可以查看成员列表、新增 pending 成员、调整角色、移除成员。
- `staff` 和 `volunteer` 不能进入成员管理。
- 新增成员时只保存 email、role 和 pending 状态，不发送真实邮件。
- 用户使用相同 email 注册 / 登录后，会自动认领 pending membership，变为 active。
- 移除成员是把 `organization_members.status` 更新为 `removed`，不硬删除历史行。
- 数据库 trigger 会阻止最后一名 active `org_admin` 被降级、移除或删除。

## 字段映射

字段映射在 provider 层处理，不扩散到页面组件。

### organizations

| 前端字段 | Supabase 字段 |
| --- | --- |
| `contactName` | `contact_name` |
| `contactPhone` | `contact_phone` |

### organization_members

| 前端字段 | Supabase 字段 |
| --- | --- |
| `userId` | `user_id` |
| `organizationId` | `organization_id` |
| `roleName` | `role_name` |
| `invitedBy` | `invited_by` |
| `invitedAt` | `invited_at` |
| `joinedAt` | `joined_at` |

### service_opportunities

| 前端字段 | Supabase 字段 |
| --- | --- |
| `organizationId` | `organization_id` |
| `elderId` | `elder_id` |
| `dueDate` | `due_date` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `completedAt` | `completed_at` |
| `relatedRecordId` | `related_record_id` |
| `dismissReason` | `dismiss_reason` |
| `dismissedAt` | `dismissed_at` |
| `source` | `source` |

### elders

| 前端字段 | Supabase 字段 |
| --- | --- |
| `organizationId` | `organization_id` |
| `avatarUrl` | `avatar_url` |
| `avatarDataUrl` | `avatar_data_url` |
| `formerJob` | `former_job` |
| `lifeExperience` | `life_experience` |
| `favoriteTopics` | `favorite_topics` |
| `avoidTopics` | `avoid_topics` |
| `communicationStyle` | `communication_style` |
| `familyNote` | `family_note` |
| `careNoteInput` | `care_note_input` |
| `staffNote` | `staff_note` |
| `communicationAdvice` | `communication_advice` |
| `careNote` | `care_note` |
| `nextSuggestion` | `next_suggestion` |
| `archivedAt` | `archived_at` |
| `archivedReason` | `archived_reason` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

## Verification Checklist

- `admin@test.com` 的 `auth.users.id`、`profiles.id`、`organization_members.user_id` 一致。
- 该成员 `role = org_admin` 且 `status = active`。
- 登录后 `/my`、`/org`、`/elders`、`/opportunities`、`/records`、`/members` 都能加载。
- 新增 pending 成员后，用相同 email 注册 / 登录可以自动变为 active。
- 被移除成员不能继续读取机构数据。
- localStorage fallback 在 `VITE_DATA_PROVIDER=localStorage` 下仍能正常运行。
