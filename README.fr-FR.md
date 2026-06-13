[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老 n'est ni un système classique de gestion gérontologique, ni un simple outil de conversation IA.

Il s'agit d'un outil open source centré sur la carte d'accompagnement des aînés, les opportunités de service bienveillant, les comptes rendus d'accompagnement et le suivi continu. Il aide les familles, les bénévoles, les organisations d'intérêt général, les équipes communautaires et les structures d'aide aux aînés à mieux comprendre une personne âgée avant d'intervenir.

## Core Workflow

Saisir les faits concernant la personne âgée  
→ Générer une carte d'accompagnement assistée par l'IA  
→ Identifier des opportunités de service bienveillant  
→ Enregistrer les visites ou activités  
→ Mettre à jour les actions de suivi

## Who is it for?

- Familles
- Bénévoles
- Organisations d'accompagnement des aînés
- Équipes de soin communautaire
- Groupes d'intérêt général
- Développeurs
- Chercheurs
- Initiateurs d'actions d'intérêt général à l'échelle d'une ville

## Core Features

- Elder Care Card
- Suggestions de communication assistées par l'IA
- Warm Service Opportunities
- Service Records
- Workflow d'organisation et d'activité
- Support de démo Supabase
- Collaboration multilingue de la communauté

## What it is NOT

- Ce n'est pas un outil de diagnostic médical
- Ce n'est pas un outil de diagnostic psychologique
- Ce n'est pas un système d'évaluation du niveau de dépendance
- Ce n'est pas un système de réponse d'urgence
- Ce n'est pas un remplacement pour les médecins, infirmiers, travailleurs sociaux ou évaluateurs professionnels
- Ce n'est pas adapté au stockage de données sensibles réelles sur des personnes âgées sans autorisation et mesures de sécurité appropriées

## Privacy and Data Notice

- Les données de démonstration doivent être entièrement fictives.
- N'entrez pas de numéro d'identité, dossier médical détaillé, conflit familial, information patrimoniale, adresse ou vrai numéro de téléphone.
- Les déployeurs réels sont responsables du consentement, de la confidentialité, de la sécurité et du respect des lois locales.
- Tout contenu présenté publiquement doit être désensibilisé.
- Les contenus générés par l'IA doivent toujours être vérifiés par un humain.

## Sites de démonstration et collaboration (Demonstration Sites & Collaboration)

DigniAge · 知老 n'est pas seulement un projet logiciel open source. C'est une action d'intérêt général pour l'accompagnement des aînés, une boîte à outils pour construire des sites de démonstration, et un réseau mondial de co-création open source.

Grâce aux cartes de connaissance des aînés, aux dossiers de service, à la coordination des bénévoles, à l'organisation assistée par l'IA et aux rappels d'opportunités de service attentionné, nous voulons aider les communautés, associations et structures d'accompagnement à mettre en place des sites de démonstration DigniAge, réplicables et transmissibles. Dans des contextes solidaires de terrain, cette démarche a déjà bénéficié à plusieurs centaines de personnes âgées, et nous espérons en soutenir davantage au cours de l'année à venir grâce à une adoption communautaire et à des déploiements responsables.

Si vous faites partie d'une association, d'une équipe de bénévoles, d'un organisme de services aux aînés, d'une structure de quartier, ou si vous êtes développeur, chercheur, ou simplement en exploration d'outils numériques pour le grand âge, vous pouvez contacter le mainteneur via une GitHub Issue.

Nous accueillons volontiers les idées de fonctionnalités, les retours de déploiement, les besoins de localisation, les suggestions issues de vrais parcours d'accompagnement, les idées d'actions solidaires et les besoins liés à la mise en place de sites de démonstration. Lorsqu'un besoin présente une réelle utilité publique, une valeur concrète pour les structures ou un potentiel d'aide pour davantage de personnes âgées, le mainteneur fera au mieux pour échanger rapidement, répondre avec attention et accompagner les évolutions dès que possible.

Les limites du projet restent les mêmes : DigniAge n'est ni un outil de diagnostic médical, ni un outil de diagnostic psychologique, ni un système de réponse d'urgence. Tout contenu généré par l'IA doit être vérifié et confirmé par une personne avant usage.

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- Exécuter `supabase/demo/001_schema.sql`
- Exécuter `supabase/demo/002_seed_demo_data.sql`
- Configurer `.env.local` uniquement en local
- Ne versionner que `.env.example` dans le dépôt public
- Ne pas versionner `.env.local`
- Ne pas versionner de clé `service_role`
- Ne pas versionner de sauvegardes ou exports de base de données réels

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

Nous accueillons :

- Les contributions open source
- Les pilotes d'intérêt général
- Les partenariats avec des organisations
- La co-création à l'échelle d'une ville
- Le soutien fondations / CSR

## Brand and Trademark Notice

Les noms DigniAge, 知老, 元核知老, KnowElder, ainsi que les logos, slogans, identités visuelles et marques de service officielles associées, ne sont pas concédés avec le code source.

L'utilisation du code ne signifie pas que vous bénéficiez d'un partenariat officiel, d'un soutien officiel, d'un droit d'usage de la marque ou d'une autorisation commerciale.

## License

Code : Apache License 2.0  
Voir [LICENSE](LICENSE)

## Maintainer

Projet initié par Novonuc / 元盒数科
