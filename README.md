[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老 is not a traditional elder-care management system, and it is not a generic AI chat tool.

It is an open-source workflow built around elder care cards, warm service opportunities, service records, and ongoing follow-up. It helps families, volunteers, public welfare groups, community teams, and elder-care organizations understand an elder before providing care.

## Core Workflow

Enter elder facts  
→ Generate an AI-assisted care card  
→ Identify warm service opportunities  
→ Record visits or activities  
→ Update follow-up actions

## Who is it for?

- Families
- Volunteers
- Elder-care organizations
- Community care teams
- Public welfare groups
- Developers
- Researchers
- City-level public welfare initiators

## Core Features

- Elder Care Card
- AI-assisted communication suggestions
- Warm service opportunities
- Service records
- Organization and activity workflow
- Supabase Demo support
- Multilingual community collaboration

## What it is NOT

- Not a medical diagnosis tool
- Not a psychological diagnosis tool
- Not a nursing assessment system
- Not an emergency response system
- Not a replacement for doctors, nurses, social workers, or professional assessors
- Not suitable for storing real sensitive elder data without proper authorization and security measures

## Privacy and Data Notice

- Demo data must be fictional.
- Do not enter ID numbers, detailed medical histories, family conflict details, asset information, home addresses, or real phone numbers.
- Real-world deployers are responsible for consent, privacy, security, and compliance with local laws and regulations.
- Any public-facing content must be properly de-identified.
- AI-generated content must always be reviewed and confirmed by humans.

## Demonstration Sites & Collaboration

DigniAge · 知老 is not just an open-source software project. It is a public-good elder-care action, a toolkit for building demonstration sites, and a global open-source collaboration network for real community and nonprofit elder-care scenarios.

Through elder care cards, service records, volunteer coordination, AI-assisted organization, and reminders for warm service opportunities, we hope to help communities, nonprofits, and elder-care organizations build reproducible and shareable DigniAge demonstration sites. Offline public-interest elder-care practice has already benefited hundreds of older adults, and over the coming year we hope responsible community adoption and deployment can support many more.

If you are from a nonprofit, volunteer team, elder-care provider, community organization, or if you are a developer, researcher, or anyone exploring digital tools for elder support, you are welcome to reach the maintainer through GitHub Issues.

We welcome feature ideas, deployment feedback, localization requests, suggestions grounded in real elder-care workflows, public-interest activity design, and demonstration-site building needs. When a request has clear public value, practical value for service organizations, or the potential to help more older adults, the maintainer will actively communicate, respond quickly, and support timely improvements when feasible.

Project boundaries still apply: DigniAge is not a medical diagnosis tool, not a psychological diagnosis tool, and not an emergency response system. AI-generated content must always be reviewed and confirmed by humans before use.

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- Run `supabase/demo/001_schema.sql`
- Run `supabase/demo/002_seed_demo_data.sql`
- Configure local `.env.local` for your own machine
- Commit only `.env.example` to the public repository
- Do not commit `.env.local`
- Do not commit any `service_role` key
- Do not commit real database backups or exports

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

We welcome:

- Open-source contribution
- Public welfare pilot
- Organization partnership
- City-level co-creation
- Foundation / CSR support

## Brand and Trademark Notice

The names DigniAge, 知老, 元核知老, KnowElder, as well as related logos, slogans, visual identity, and official service marks, are not licensed with the source code.

Using this code does not mean you have official partnership status, endorsement, trademark permission, or commercial authorization.

## License

Code: Apache License 2.0  
See [LICENSE](LICENSE)

## Maintainer

Initiated by Novonuc / 元盒数科
