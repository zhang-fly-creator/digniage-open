[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老 は、従来型の介護管理システムでも、一般的な AI チャットツールでもありません。

高齢者ケアカード、あたたかな支援機会、支援記録、継続フォローを軸にしたオープンソースのワークフローです。家族、ボランティア、公益団体、地域ケアチーム、介護事業者が、支援の前に高齢者をよりよく理解できるよう支援します。

## Core Workflow

高齢者の事実情報を入力  
→ AI 支援付きケアカードを生成  
→ あたたかな支援機会を見つける  
→ 訪問や活動を記録する  
→ 次のフォローアップを更新する

## Who is it for?

- 家族
- ボランティア
- 介護・高齢者支援団体
- 地域ケアチーム
- 公益団体
- 開発者
- 研究者
- 都市レベルの公益プロジェクト推進者

## Core Features

- Elder Care Card
- AI によるコミュニケーション提案
- Warm Service Opportunities
- 支援記録
- 組織と活動のワークフロー
- Supabase Demo 対応
- 多言語コミュニティ協働

## What it is NOT

- 医療診断ツールではありません
- 心理診断ツールではありません
- 介護度判定システムではありません
- 緊急対応システムではありません
- 医師、看護師、ソーシャルワーカー、専門評価者の代替ではありません
- 適切な許可と安全対策なしに、実在する高齢者の機微データを保存する用途には適していません

## Privacy and Data Notice

- Demo データは必ず架空の内容にしてください。
- 身分証番号、詳細な病歴、家族内トラブル、資産情報、住所、実在の電話番号などの機微情報は入力しないでください。
- 実運用する組織は、同意取得、プライバシー保護、セキュリティ、各地域の法令遵守を自ら負う必要があります。
- 外部公開する内容は必ず匿名化・非識別化してください。
- AI 生成内容は必ず人が確認してください。

## 実証拠点づくりと連携 (Demonstration Sites & Collaboration)

DigniAge · 知老は、単なるオープンソースソフトウェアではありません。実際の公益的な高齢者支援の現場に向けたアクションであり、実証拠点づくりのためのツールキットであり、世界に開かれたオープンソース共創ネットワークでもあります。

知老カード、サービス記録、ボランティア連携、AI による整理支援、あたたかな支援機会のリマインドを通じて、地域、公益団体、高齢者支援組織が再現可能で広げやすい「知老実証拠点」を育てられるようにしたいと考えています。すでにオフラインの公益的な高齢者支援の現場では数百人規模の高齢者に役立っており、今後 1 年でも、地域での採用と責任ある導入を通じてさらに多くの方を支えたいと考えています。

公益団体、ボランティアチーム、高齢者支援事業者、地域団体の方はもちろん、開発者、研究者、高齢者ケアのデジタルツールを探っている方も、GitHub Issue から気軽にメンテナーへご連絡ください。

機能提案、導入や運用のフィードバック、ローカライズ要望、実際の支援フローにもとづく改善提案、公益活動の設計、実証拠点づくりの相談を歓迎します。公共的な意義があるもの、現場での実践価値が高いもの、より多くの高齢者支援につながるものについては、可能な範囲で積極的に対話し、迅速に対応し、改善を進めます。

プロジェクトの境界は変わりません。DigniAge は医療診断ツールでも、心理診断ツールでも、緊急対応システムでもありません。AI 生成内容は、利用前に必ず人が確認してください。

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- `supabase/demo/001_schema.sql` を実行
- `supabase/demo/002_seed_demo_data.sql` を実行
- `.env.local` は各自のローカル環境用に設定
- 公開リポジトリには `.env.example` のみを含める
- `.env.local` はコミットしない
- `service_role` key はコミットしない
- 実データのバックアップやエクスポートは公開しない

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

歓迎する協力形態：

- オープンソース貢献
- 公益パイロット
- 組織連携
- 都市レベルの共創
- 財団 / CSR 支援

## Brand and Trademark Notice

DigniAge、知老、元核知老、KnowElder、および関連ロゴ、スローガン、ビジュアルアイデンティティ、公式サービス標章は、ソースコードのライセンスに含まれません。

このコードを利用しても、公式提携、公式承認、商標利用権、商用許諾を得たことにはなりません。

## License

Code: Apache License 2.0  
See [LICENSE](LICENSE)

## Maintainer

Initiated by Novonuc / 元盒数科
