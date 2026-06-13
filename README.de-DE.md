[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老 ist weder ein klassisches Pflegeverwaltungs-System noch ein gewöhnliches KI-Chat-Tool.

Es ist ein Open-Source-Workflow rund um Elder Care Cards, Warm Service Opportunities, Service Records und kontinuierliche Nachverfolgung. Das Projekt hilft Familien, Freiwilligen, gemeinnützigen Organisationen, Community-Care-Teams und Pflegeeinrichtungen dabei, ältere Menschen vor der Unterstützung besser zu verstehen.

## Core Workflow

Fakten zur älteren Person erfassen  
→ Eine KI-gestützte Care Card erzeugen  
→ Warmherzige Unterstützungsgelegenheiten erkennen  
→ Besuche oder Aktivitäten dokumentieren  
→ Nächste Follow-up-Schritte aktualisieren

## Who is it for?

- Familien
- Freiwillige
- Pflege- und Senioreneinrichtungen
- Community-Care-Teams
- Gemeinnützige Gruppen
- Entwicklerinnen und Entwickler
- Forschende
- Initiatorinnen und Initiatoren stadtweiter Gemeinwohlprojekte

## Core Features

- Elder Care Card
- KI-gestützte Kommunikationshinweise
- Warm Service Opportunities
- Service Records
- Organisations- und Aktivitätsabläufe
- Supabase-Demo-Unterstützung
- Mehrsprachige Community-Zusammenarbeit

## What it is NOT

- Kein medizinisches Diagnosetool
- Kein psychologisches Diagnosetool
- Kein System zur Pflegegradbewertung
- Kein Notfallreaktionssystem
- Kein Ersatz für Ärztinnen, Ärzte, Pflegekräfte, Sozialarbeiterinnen, Sozialarbeiter oder professionelle Gutachtende
- Nicht geeignet zur Speicherung realer sensibler Daten älterer Menschen ohne angemessene Einwilligung und Sicherheitsmaßnahmen

## Privacy and Data Notice

- Demo-Daten müssen vollständig fiktiv sein.
- Keine Ausweisnummern, detaillierten Krankenakten, familiären Konflikte, Vermögensinformationen, Wohnadressen oder echten Telefonnummern eintragen.
- Wer das System real einsetzt, ist selbst verantwortlich für Einwilligungen, Datenschutz, Sicherheit und die Einhaltung lokaler Gesetze.
- Inhalte für externe Darstellung müssen anonymisiert werden.
- KI-generierte Inhalte müssen immer von Menschen geprüft und bestätigt werden.

## Aufbau von Demonstrationsstandorten und Zusammenarbeit (Demonstration Sites & Collaboration)

DigniAge · 知老 ist nicht nur ein Open-Source-Softwareprojekt. Es ist eine gemeinwohlorientierte Initiative für die Begleitung älterer Menschen, ein Werkzeugkasten für den Aufbau von Demonstrationsstandorten und zugleich ein globales Netzwerk für offene Zusammenarbeit.

Mit DigniAge-Karten, Servicedokumentation, Freiwilligenkoordination, KI-gestützter Aufbereitung und Hinweisen auf passende Unterstützungsgelegenheiten möchten wir Gemeinden, gemeinnützigen Organisationen und Pflegeanbietern helfen, wiederholbare und übertragbare DigniAge-Demonstrationsstandorte aufzubauen. In gemeinwohlorientierten Offline-Einsatzszenarien konnten bereits Hunderte ältere Menschen davon profitieren; im kommenden Jahr möchten wir durch verantwortungsvolle Einführung in weiteren Communities noch mehr Menschen erreichen.

Wenn du zu einer gemeinnützigen Organisation, einem Freiwilligenteam, einem Pflegeanbieter, einer Nachbarschafts- oder Community-Initiative gehörst oder als Entwickler:in, Forscher:in oder Interessierte:r an digitalen Werkzeugen für die Begleitung älterer Menschen arbeitest, melde dich gern per GitHub Issue beim Maintainer.

Willkommen sind Funktionsvorschläge, Feedback zu Deployment und Nutzung, Lokalisierungswünsche, Empfehlungen aus echten Pflege- und Betreuungsabläufen, Ideen für gemeinwohlorientierte Aktivitäten sowie Anforderungen rund um den Aufbau von Demonstrationsstandorten. Wenn ein Bedarf klaren öffentlichen Nutzen hat, für Einrichtungen praktisch relevant ist oder mehr älteren Menschen helfen kann, wird der Maintainer aktiv das Gespräch suchen, zügig reagieren und Verbesserungen unterstützen, sobald es machbar ist.

Die Projektgrenzen bleiben bestehen: DigniAge ist kein medizinisches Diagnosetool, kein psychologisches Diagnosetool und kein Notfallreaktionssystem. KI-generierte Inhalte müssen vor jeder Nutzung von Menschen geprüft und bestätigt werden.

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- `supabase/demo/001_schema.sql` ausführen
- `supabase/demo/002_seed_demo_data.sql` ausführen
- `.env.local` nur lokal konfigurieren
- Im öffentlichen Repository nur `.env.example` committen
- `.env.local` nicht committen
- Keinen `service_role` key committen
- Keine echten Datenbank-Backups oder Exporte committen

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

Willkommen sind:

- Open-Source-Beiträge
- Gemeinwohl-Pilotprojekte
- Kooperationen mit Organisationen
- Stadtweite Co-Creation
- Unterstützung durch Stiftungen / CSR

## Brand and Trademark Notice

Die Namen DigniAge, 知老, 元核知老, KnowElder sowie zugehörige Logos, Slogans, visuelle Identität und offizielle Servicemarkierungen werden nicht zusammen mit dem Quellcode lizenziert.

Die Nutzung des Codes bedeutet nicht, dass eine offizielle Partnerschaft, Unterstützung, Markenfreigabe oder kommerzielle Autorisierung vorliegt.

## License

Code: Apache License 2.0  
Siehe [LICENSE](LICENSE)

## Maintainer

Initiiert von Novonuc / 元盒数科
