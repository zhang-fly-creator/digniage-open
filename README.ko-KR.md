[English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [Deutsch](README.de-DE.md) | [Français](README.fr-FR.md) | [한국어](README.ko-KR.md) | [ไทย](README.th-TH.md) | [Português](README.pt-BR.md) | [Español](README.es-ES.md)

# DigniAge · 知老
## Global Open-Source Elder Care Tool
### Open-source AI elder care card and warm service opportunity system

Let every elder be not only cared for, but truly understood.  
让每一位老人，不只是被照顾，更是被理解。

## What is DigniAge?

DigniAge · 知老는 전통적인 요양 관리 시스템도 아니고, 일반적인 AI 채팅 도구도 아닙니다.

이 프로젝트는 Elder Care Card, Warm Service Opportunities, 서비스 기록, 지속적인 후속 조치를 중심으로 설계된 오픈소스 도구입니다. 가족, 자원봉사자, 공익 단체, 지역 돌봄 팀, 노인 돌봄 기관이 돌봄을 시작하기 전에 어르신을 더 잘 이해할 수 있도록 돕습니다.

## Core Workflow

어르신의 사실 정보를 입력  
→ AI 보조 돌봄 카드를 생성  
→ 따뜻한 서비스 기회를 발견  
→ 방문 또는 활동을 기록  
→ 다음 후속 조치를 업데이트

## Who is it for?

- 가족
- 자원봉사자
- 노인 돌봄 기관
- 지역 돌봄 팀
- 공익 단체
- 개발자
- 연구자
- 도시 단위 공익 프로젝트 기획자

## Core Features

- Elder Care Card
- AI 보조 소통 제안
- Warm Service Opportunities
- Service Records
- 기관 및 활동 워크플로
- Supabase Demo 지원
- 다국어 커뮤니티 협업

## What it is NOT

- 의료 진단 도구가 아닙니다
- 심리 진단 도구가 아닙니다
- 요양 등급 평가 시스템이 아닙니다
- 응급 대응 시스템이 아닙니다
- 의사, 간호사, 사회복지사, 전문 평가자를 대체하지 않습니다
- 적절한 승인과 보안 조치 없이 실제 민감한 노인 데이터를 저장하는 용도로 적합하지 않습니다

## Privacy and Data Notice

- Demo 데이터는 반드시 모두 허구여야 합니다.
- 주민등록번호, 상세 병력, 가족 갈등, 재산 정보, 주소, 실제 전화번호 같은 민감 정보는 입력하지 마세요.
- 실제 배포 주체는 동의, 개인정보 보호, 보안, 현지 법규 준수에 대한 책임을 스스로 져야 합니다.
- 외부 공개 내용은 반드시 비식별화해야 합니다.
- AI 생성 내용은 반드시 사람이 확인해야 합니다.

## 개발 수요 및 협업 (Development Needs & Collaboration)

DigniAge · 知老는 실제 공익 기반의 노인 돌봄 현장을 염두에 두고 만든 오픈소스 프로젝트입니다. 공익 단체, 자원봉사 팀, 요양·돌봄 기관, 지역 커뮤니티 조직은 물론이고, 개발자, 연구자, 혹은 어르신 돌봄을 위한 디지털 도구를 탐색하는 분이라면 GitHub Issue를 통해 유지관리자에게 편하게 연락해 주세요.

기능 제안, 배포 경험에 대한 피드백, 현지화 요청, 실제 돌봄 운영 흐름에 기반한 개선 의견, 공익 시범사업 수요를 모두 환영합니다. 공공적 가치가 분명하거나 현장 적용 가치가 높거나 더 많은 어르신에게 도움이 될 수 있는 요청이라면, 유지관리자가 적극적으로 소통하고 가능한 범위에서 빠르게 대응하며 개선을 함께 추진하겠습니다.

DigniAge 관련 개발 요청, 기관 시범 도입 논의, 기능 제안, 지역·언어별 적응 요청이 있다면 언제든 이슈를 열어 주세요. 실제 공익 및 노인 돌봄 현장과 맞닿은 방향으로 최대한 빠르게 응답하고 계속 발전시켜 나가고자 합니다.

## Quick Start

```bash
git clone https://github.com/your-org/digniage.git
cd digniage
npm install
npm run dev
```

## Supabase Demo Setup

- `supabase/demo/001_schema.sql` 실행
- `supabase/demo/002_seed_demo_data.sql` 실행
- `.env.local` 은 로컬 환경에서만 설정
- 공개 저장소에는 `.env.example` 만 커밋
- `.env.local` 은 커밋하지 않기
- `service_role` key 는 커밋하지 않기
- 실제 데이터베이스 백업이나 내보내기 파일은 커밋하지 않기

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

다음과 같은 협업을 환영합니다:

- 오픈소스 기여
- 공익 파일럿
- 기관 파트너십
- 도시 단위 공동 창작
- 기업 / 재단 지원

## Brand and Trademark Notice

DigniAge, 知老, 元核知老, KnowElder 및 관련 로고, 슬로건, 시각 아이덴티티, 공식 서비스 표지는 소스 코드 라이선스에 포함되지 않습니다.

이 코드를 사용한다고 해서 공식 협력, 공식 보증, 브랜드 사용 권한 또는 상업적 사용 허가를 얻는 것은 아닙니다.

## License

Code: Apache License 2.0  
See [LICENSE](LICENSE)

## Maintainer

Initiated by Novonuc / 元盒数科
