[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老 no es un sistema tradicional de gestión del cuidado de mayores ni una herramienta genérica de chat con IA.

Es una herramienta de código abierto construida alrededor de la Elder Care Card, las Warm Service Opportunities, los registros de servicio y el seguimiento continuo. Ayuda a familias, voluntariado, organizaciones sociales, equipos comunitarios y entidades de cuidado a comprender mejor a cada persona mayor antes de acompañarla.

## Core Workflow

Introducir los datos básicos de la persona mayor  
→ Generar una tarjeta de cuidado asistida por IA  
→ Identificar oportunidades de cuidado cercano  
→ Registrar visitas o actividades  
→ Actualizar las siguientes acciones de seguimiento

## Who is it for?

- Familias
- Voluntariado
- Organizaciones de cuidado de mayores
- Equipos de cuidado comunitario
- Grupos de interés público
- Desarrolladores
- Investigadores
- Impulsores de iniciativas públicas a nivel de ciudad

## Core Features

- Elder Care Card
- Sugerencias de comunicación asistidas por IA
- Warm Service Opportunities
- Service Records
- Flujo de trabajo para organizaciones y actividades
- Soporte para Supabase Demo
- Colaboración comunitaria multilingüe

## What it is NOT

- No es una herramienta de diagnóstico médico
- No es una herramienta de diagnóstico psicológico
- No es un sistema de evaluación de cuidados o dependencia
- No es un sistema de respuesta ante emergencias
- No sustituye a médicos, enfermeras, trabajadores sociales ni evaluadores profesionales
- No es adecuado para almacenar datos sensibles reales de personas mayores sin autorización y medidas de seguridad adecuadas

## Privacy and Data Notice

- Los datos de demostración deben ser completamente ficticios.
- No introduzcas números de identificación, historiales médicos detallados, conflictos familiares, información patrimonial, domicilios ni números de teléfono reales.
- Quien despliegue el sistema en entornos reales es responsable del consentimiento, la privacidad, la seguridad y el cumplimiento de la normativa local.
- Todo contenido mostrado al público debe estar debidamente anonimizado.
- El contenido generado por IA debe ser revisado y confirmado por personas.

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- Ejecuta `supabase/demo/001_schema.sql`
- Ejecuta `supabase/demo/002_seed_demo_data.sql`
- Configura `.env.local` solo en tu entorno local
- En el repositorio público, sube únicamente `.env.example`
- No subas `.env.local`
- No subas ninguna `service_role` key
- No subas copias de seguridad ni exportaciones reales de base de datos

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

Damos la bienvenida a:

- Contribuciones open source
- Pilotos de interés público
- Colaboración con organizaciones
- Co-creación a nivel de ciudad
- Apoyo de fundaciones / CSR

## Brand and Trademark Notice

Los nombres DigniAge, 知老, 元核知老, KnowElder, así como los logotipos, eslóganes, identidad visual y distintivos oficiales de servicio relacionados, no se licencian junto con el código fuente.

Usar este código no significa obtener colaboración oficial, respaldo oficial, autorización de marca ni licencia comercial.

## License

Code: Apache License 2.0  
See [LICENSE](LICENSE)

## Maintainer

Initiated by Novonuc / 元盒数科
