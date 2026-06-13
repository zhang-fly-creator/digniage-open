# 知老 Netlify 上传 / 部署说明

本文档用于把「知老 / 元核知老」前端上传到 Netlify。当前项目是 Vite + React 应用，构建产物目录为 `dist`。

## 方式一：手动上传 dist

适合快速预览或临时演示。

1. 在项目根目录安装依赖：

```bash
npm install
```

2. 根据需要准备环境变量。

如果使用本地 fallback：

```text
VITE_DATA_PROVIDER=localStorage
```

如果使用 Supabase：

```text
VITE_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon key
```

3. 执行构建：

```bash
npm run build
```

4. 登录 Netlify，进入 Sites，选择手动上传，将项目根目录下生成的 `dist` 文件夹上传。

5. 上传完成后打开 Netlify 给出的站点地址检查：

- 首页是否可访问；
- `/my-service`、`/opportunities`、`/records` 等前端路由是否正常；
- 如使用 Supabase，确认登录、成员权限、服务机会和服务记录可用。

## 方式二：连接 Git 仓库自动部署

适合长期使用。

Netlify Build settings：

```text
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

环境变量在 Netlify Site configuration -> Environment variables 中配置。

localStorage 演示模式：

```text
VITE_DATA_PROVIDER=localStorage
```

Supabase 模式：

```text
VITE_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon key
```

可选 AI Function 环境变量：

```text
AI_API_KEY=你的模型服务密钥
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

注意：`VITE_SUPABASE_ANON_KEY` 是前端可公开 anon key，不要把 `service_role`、数据库密码或其他 secret key 写入代码或提交到仓库。

## 单页应用路由

本项目使用 React Router。部署后如果直接刷新 `/opportunities`、`/records`、`/my-service` 等页面出现 404，需要在 Netlify 增加 SPA fallback。

推荐在 Netlify redirect 配置中使用：

```text
/*    /index.html   200
```

如果使用 `netlify.toml` 管理配置，可以加入：

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Supabase 上线前检查

如果线上使用 Supabase 模式，请先在 Supabase SQL Editor 执行项目内对应 SQL：

- `supabase/schema.sql`
- `supabase/v1.7-auth-policies.sql`
- `supabase/v1.8-rls-recursion-fix.sql`
- `supabase/v1.9-manual-opportunities.sql`
- `supabase/v2.0-assigned-opportunities.sql`
- `supabase/v2.0-assigned-opportunities-policies.sql`

并确认至少有：

- 一个 `organizations` 机构；
- 测试账号对应的 `profiles`；
- active 状态的 `organization_members`；
- Supabase Auth 已启用邮箱密码登录。

## 本地预览

开发服务器：

```bash
npm run dev
```

当前项目开发端口固定为：

```text
http://localhost:5174
```

构建后本地预览：

```bash
npm run preview
```

## 常见问题

### 打开线上子页面 404

缺少 SPA fallback。按上面的“单页应用路由”增加 redirect。

### 线上 Supabase 登录后没有数据

检查 Netlify 环境变量是否设置为：

```text
VITE_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

同时确认 Supabase 里的 RLS SQL 已执行，当前用户在 `organization_members` 中是 `active` 成员。

### 不想接 Supabase，只想演示

使用：

```text
VITE_DATA_PROVIDER=localStorage
```

这样线上会使用浏览器 localStorage fallback，适合演示，但数据只保存在访问者自己的浏览器里。
