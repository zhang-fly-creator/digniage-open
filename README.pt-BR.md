[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老 não é um sistema tradicional de gestão do cuidado ao idoso, nem uma ferramenta comum de chat com IA.

É um fluxo open source construído em torno do Elder Care Card, de Warm Service Opportunities, de registros de atendimento e de acompanhamento contínuo. O objetivo é ajudar famílias, voluntários, organizações de cuidado, equipes comunitárias e grupos de interesse público a compreender melhor a pessoa idosa antes de cuidar.

## Core Workflow

Registrar fatos sobre a pessoa idosa  
→ Gerar um cartão de cuidado com apoio de IA  
→ Identificar oportunidades de cuidado acolhedor  
→ Registrar visitas ou atividades  
→ Atualizar as próximas ações de acompanhamento

## Who is it for?

- Famílias
- Voluntários
- Organizações de cuidado ao idoso
- Equipes de cuidado comunitário
- Grupos de interesse público
- Desenvolvedores
- Pesquisadores
- Iniciadores de ações públicas em nível de cidade

## Core Features

- Elder Care Card
- Sugestões de comunicação com apoio de IA
- Warm Service Opportunities
- Service Records
- Fluxo de trabalho para organizações e atividades
- Suporte a Supabase Demo
- Colaboração comunitária multilíngue

## What it is NOT

- Não é uma ferramenta de diagnóstico médico
- Não é uma ferramenta de diagnóstico psicológico
- Não é um sistema de avaliação de nível de cuidados
- Não é um sistema de resposta a emergências
- Não substitui médicos, enfermeiros, assistentes sociais ou avaliadores profissionais
- Não é adequado para armazenar dados sensíveis reais de pessoas idosas sem autorização adequada e medidas de segurança

## Privacy and Data Notice

- Os dados de demo devem ser totalmente fictícios.
- Não insira número de documento, histórico médico detalhado, conflitos familiares, patrimônio, endereço ou telefone real.
- Quem fizer uma implantação real é responsável por consentimento, privacidade, segurança e conformidade com as leis locais.
- Todo conteúdo exibido publicamente deve ser devidamente anonimizado.
- Conteúdo gerado por IA deve sempre ser revisado e confirmado por pessoas.

## Necessidades de desenvolvimento e colaboração (Development Needs & Collaboration)

DigniAge · 知老 é um projeto de código aberto pensado para cenários reais de cuidado solidário com pessoas idosas. Se você faz parte de uma organização social, equipe de voluntariado, instituição de cuidado, organização comunitária, ou se é desenvolvedor, pesquisador ou está explorando ferramentas digitais para o cuidado de pessoas idosas, fique à vontade para entrar em contato com o mantenedor por meio de uma GitHub Issue.

Recebemos com interesse sugestões de funcionalidades, feedback de implantação, necessidades de localização, recomendações baseadas em fluxos reais de atendimento e demandas por pilotos de interesse público. Quando uma demanda tiver valor público claro, utilidade prática para instituições ou potencial para beneficiar mais pessoas idosas, o mantenedor buscará dialogar de forma ativa, responder com rapidez e apoiar melhorias no que for viável.

Se você tiver necessidades de desenvolvimento relacionadas ao DigniAge, interesse em pilotos institucionais, sugestões de funcionalidades ou pedidos de adaptação local, abra uma issue. A proposta é colaborar de perto com contextos reais do cuidado social e do atendimento à pessoa idosa, respondendo e evoluindo o projeto da forma mais ágil possível.

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- Execute `supabase/demo/001_schema.sql`
- Execute `supabase/demo/002_seed_demo_data.sql`
- Configure `.env.local` apenas na sua máquina
- No repositório público, mantenha somente `.env.example`
- Não faça commit de `.env.local`
- Não faça commit de `service_role` key
- Não faça commit de backups ou exportações reais de banco de dados

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

São bem-vindos:

- Contribuições open source
- Pilotos de interesse público
- Parcerias com organizações
- Cocriação em nível de cidade
- Apoio empresarial / fundações / CSR

## Brand and Trademark Notice

Os nomes DigniAge, 知老, 元核知老, KnowElder, assim como logotipos, slogans, identidade visual e sinais oficiais de serviço relacionados, não são licenciados junto com o código-fonte.

Usar este código não significa obter parceria oficial, endosso oficial, autorização de uso de marca ou licença comercial.

## License

Code: Apache License 2.0  
See [LICENSE](LICENSE)

## Maintainer

Initiated by Novonuc / 元盒数科
