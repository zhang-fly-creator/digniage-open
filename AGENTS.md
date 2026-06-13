# 项目指导

## 项目定位

KnowElder 是一个移动端优先的 React Web App，用于养老机构、社区养老中心、公益组织和志愿服务团队管理“知老卡”和服务记录。核心业务闭环是：创建或编辑长者档案，生成 AI 辅助内容，查看知老卡，记录服务活动，并更新下一步陪伴建议。项目当前同时保留本地演示数据、Supabase 数据接入和服务端 AI 中转能力。

## 当前阶段

当前项目属于 MVP 验证版 / 演示版，并预留 Supabase 数据接入、Netlify Functions 和 Cloudflare Pages Functions 部署能力。不要把 mock 数据、演示流程或预留能力描述成完整生产能力。

## 技术栈

* Vite 5
* React 18
* React Router 6
* Tailwind CSS 3
* Supabase JS
* localStorage / mock 数据
* Netlify Functions
* Cloudflare Pages Functions

## 关键文件

* `package.json`：项目脚本和依赖声明。
* `vite.config.js`：Vite 构建配置。
* `src/App.jsx`：应用路由入口。
* `src/main.jsx`：React 应用挂载入口。
* `src/index.css`：全局样式和 Tailwind 入口。
* `src/pages/ElderFormPage.jsx`：创建和编辑长者知老卡的核心页面。
* `src/pages/ElderDetailPage.jsx`：长者知老卡详情页。
* `src/pages/ElderListPage.jsx`：长者列表页。
* `src/pages/RecordsPage.jsx`：服务记录页。
* `src/pages/OpportunitiesPage.jsx`：服务机会页。
* `src/pages/MyServicePage.jsx`：我的服务相关页面。
* `src/pages/org/OrgHomePage.jsx`：机构工作台首页。
* `src/components/AppLayout.jsx`：前台页面布局。
* `src/components/BottomNav.jsx`：移动端底部导航。
* `src/components/ElderCard.jsx`：长者卡片展示组件。
* `src/components/RouteAccess.jsx`：登录、成员状态和权限路由保护。
* `src/services/aiService.js`：前端 AI 服务入口，页面应通过这里调用 AI。
* `src/utils/mockAI.js`：AI mock 和 fallback 逻辑来源之一。
* `src/services/dataProvider.js`：localStorage / Supabase 数据源选择入口。
* `src/services/storageService.js`：业务存储服务。
* `src/services/providers/localStorageProvider.js`：本地存储数据提供者。
* `src/services/providers/supabaseProvider.js`：Supabase 数据提供者。
* `src/lib/supabaseClient.js`：Supabase 客户端初始化。
* `src/data/defaultData.js`：默认演示数据。
* `src/data/orgMockData.js`：机构相关 mock 数据。
* `functions/api/ai/generate-elder-card.js`：Cloudflare Pages 的知老卡 AI 生成接口。
* `functions/api/ai/analyze-service-record.js`：Cloudflare Pages 的服务记录 AI 分析接口。
* `netlify/functions/generate-elder-card.js`：Netlify 的知老卡 AI 生成函数。
* `supabase/schema.sql`：Supabase 基础 schema。
* `docs/NETLIFY_DEPLOY.md`：Netlify 部署说明。
* `docs/SUPABASE_PREP.md`：Supabase 准备说明。
* `.env.example`：环境变量示例，不包含真实密钥。

## 开发原则

1. 保持当前项目主线，不要随意扩展到无关版本。
2. 优先小范围修改，不要大规模重构。
3. 修改前先说明计划。
4. 不要随意改路由、导航、全局数据结构和核心页面结构。
5. 不要整体覆盖核心文件。
6. 不要把 mock 能力写成真实生产能力。
7. 不要在前端保存任何 API Key、Secret Key、Access Token。
8. 涉及第三方接口时，真实密钥必须放在后端或服务端中转层。
9. 涉及 AI 输出时，要保留人工确认或审核机制。
10. 涉及医疗、金融、法律等高风险场景时，不得生成越界判断、诊断、投资建议或法律结论。
11. AI 相关页面应调用 `src/services/aiService.js`，不要在页面组件中直连模型供应商。
12. 修改 AI 生成行为时，保留 mock fallback，保持 `ElderFormPage` 兼容的返回结构。
13. 敏感身份信息不要发送给 AI。
14. 不要随意改变持久化数据结构、Supabase 策略或保存流程。

## 当前禁止事项

* 不修改与当前任务无关的 `src` 业务代码。
* 不修改路由。
* 不修改 `package.json`。
* 不修改构建配置。
* 不改变现有页面主结构。
* 不删除现有 mock 数据。
* 不引入新的大型依赖。
* 不把真实密钥写入前端代码、日志或文档。
* 不新增 `VITE_AI_API_KEY`。
* 不在未明确要求时接入真实第三方 API 或真实后端写入。
* 不在 AI-only 任务中顺手改持久化、权限、导航或页面结构。

## 常用命令

* `npm install`
* `npm run dev`
* `npm run build`
* `npm run preview`

默认本地开发地址：

* `http://localhost:5174`

## 验收标准

1. 构建命令通过。
2. 现有首页、核心页面、导航和主要流程不被破坏。
3. 当前主业务闭环可以正常演示。
4. 页面文案不夸大、不越界。
5. 移动端或目标端显示正常。
6. 新增说明能帮助 Codex 后续快速理解项目。
