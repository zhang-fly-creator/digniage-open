[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老不是传统养老管理系统，也不是普通的 AI 聊天工具。

它是一套围绕长者关怀卡、温情服务机会、服务记录与持续跟进建立的开源工具，帮助家属、志愿者、公益组织、社区团队、养老机构在照护前先理解长者。

## Core Workflow

填写长者事实信息  
→ 生成 AI 辅助关怀卡  
→ 发现温情服务机会  
→ 记录探访或活动  
→ 更新下一步跟进建议

## Who is it for?

- 家属
- 志愿者
- 养老机构
- 社区照护团队
- 公益组织
- 开发者
- 研究者
- 城市级公益发起者

## Core Features

- 长者关怀卡 / 知老卡
- AI 辅助沟通建议
- 温情服务机会
- 服务记录
- 机构与活动协作流程
- Supabase Demo 支持
- 多语言社区协作

## What it is NOT

- 不是医疗诊断工具
- 不是心理诊断工具
- 不是护理等级评估系统
- 不是应急响应系统
- 不能替代医生、护士、社工或专业评估人员
- 在没有充分授权和安全措施前，不适合存储真实敏感长者数据

## Privacy and Data Notice

- Demo 数据必须全部虚构。
- 不要录入身份证号、详细病历、家庭纠纷、财产信息、住址、真实手机号等敏感信息。
- 真实部署方需自行负责授权、隐私、安全以及当地法律法规合规。
- 对外展示内容必须脱敏。
- AI 生成内容必须由人工确认后再使用。

## 开发需求与合作

DigniAge · 知老是一个面向真实公益养老服务场景的开源项目。如果你是公益机构、志愿者团队、养老服务机构、社区组织、开发者、研究者，或者正在探索长者关怀数字化工具，欢迎通过 GitHub Issue 联系维护者。

我们欢迎功能建议、部署反馈、本地化需求、真实养老服务流程建议和公益试点需求。对于具有公共价值、机构实践价值或能帮助更多长者的需求，维护者会积极沟通、尽快响应，并在条件允许时配合及时升级。

如果你有知老相关的开发需求、机构试点需求、功能建议或本地化适配需求，欢迎提出。我们愿意贴近真实公益与养老服务场景，尽量及时响应并持续改进。

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- 执行 `supabase/demo/001_schema.sql`
- 执行 `supabase/demo/002_seed_demo_data.sql`
- 使用本地 `.env.local` 完成你自己的环境配置
- 公开仓库只提交 `.env.example`
- 不要提交 `.env.local`
- 不要提交 `service_role` key
- 不要提交真实数据库备份或导出文件

## Environment Variables

```env
VITE_DATA_PROVIDER=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_PUBLISHABLE_KEY=
AI_PROVIDER=
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=
AI_TIMEOUT_MS=
AI_FALLBACK_TO_MOCK=
```

## Collaboration

欢迎以下协作方式：

- 开源贡献
- 公益试点
- 机构合作
- 城市共创
- 基金会 / CSR 支持

## Brand and Trademark Notice

DigniAge、知老、元核知老、KnowElder 以及相关 Logo、口号、视觉识别、官方服务标识，不随源代码授权。

使用本项目代码，不代表获得官方合作、官方背书、品牌使用许可或商业授权。

## License

代码许可：Apache License 2.0  
详见 [LICENSE](LICENSE)

## Maintainer

项目发起方：Novonuc / 元盒数科
