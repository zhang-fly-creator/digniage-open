# 知老 v2.0 服务机会指派给成员

## 本版本完成内容
- 服务机会支持负责人字段
- org_admin / staff 可创建服务提醒并选择负责人
- org_admin / staff 可改派负责人
- volunteer 不能创建服务提醒
- volunteer 可查看分配给自己的服务机会
- volunteer 可从分配给自己的机会进入服务记录并完成机会
- 支持“我负责的”“未分配”筛选
- localStorage fallback 兼容 assigned 字段
- Supabase RLS / policy 已更新
- 保留 v1.9 source 字段与 system/manual 来源逻辑

## 未做内容
- 未做真实 AI
- 未做短信、邮件、微信、日历提醒
- 未做荣誉徽章
- 未做服务时长统计
- 未做活动管理
- 未做头像云存储
- 未做多机构切换

## 数据库 SQL
- supabase/v1.9-manual-opportunities.sql
- supabase/v2.0-assigned-opportunities.sql
- supabase/v2.0-assigned-opportunities-policies.sql

## 测试账号
- admin@test.com：机构管理员
- staff@test.com：服务人员
- volunteer@test.com：志愿者

## 下一步建议
v2.1：我的服务机会 / 我的服务记录
